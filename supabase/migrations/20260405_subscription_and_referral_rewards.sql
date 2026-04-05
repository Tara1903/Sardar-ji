create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_subscriptions_active_user
  on public.subscriptions(user_id)
  where status = 'active';

create index if not exists idx_subscriptions_user_status_end_date
  on public.subscriptions(user_id, status, end_date desc);

create table if not exists public.reward_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  referral_id uuid references public.referrals(id) on delete set null,
  code text not null unique,
  amount numeric(10, 2) not null check (amount > 0),
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_reward_coupons_user_status_expires
  on public.reward_coupons(user_id, status, expires_at desc);

update public.products
set
  is_available = false,
  badge = 'Subscription',
  updated_at = timezone('utc', now())
where lower(coalesce(slug, '')) = 'monthly-plan'
   or lower(coalesce(name, '')) in ('monthly plan', 'monthly thali', 'monthly thali plan');

insert into public.subscriptions (
  user_id,
  plan_name,
  start_date,
  end_date,
  status,
  created_at,
  updated_at
)
select distinct on (orders.user_id)
  orders.user_id,
  'Monthly Thali',
  timezone('Asia/Calcutta', orders.created_at)::date,
  (timezone('Asia/Calcutta', orders.created_at)::date + 30),
  case
    when (timezone('Asia/Calcutta', orders.created_at)::date + 30) > current_date then 'active'
    else 'expired'
  end,
  orders.created_at,
  coalesce(orders.updated_at, orders.created_at)
from public.orders
join public.order_items on public.order_items.order_id = public.orders.id
left join public.products on public.products.id = public.order_items.product_id
where (
    lower(coalesce(public.products.slug, '')) = 'monthly-plan'
    or lower(coalesce(public.products.name, '')) in ('monthly plan', 'monthly thali', 'monthly thali plan')
  )
  and not exists (
    select 1
    from public.subscriptions
    where public.subscriptions.user_id = public.orders.user_id
  )
order by public.orders.user_id, public.orders.created_at desc;

alter table public.referrals
  add column if not exists referral_reward_given boolean not null default false,
  add column if not exists reward_type text not null default '',
  add column if not exists reward_value numeric(10, 2) not null default 0,
  add column if not exists reward_coupon_id uuid references public.reward_coupons(id) on delete set null;

alter table public.referrals drop constraint if exists referrals_status_check;

update public.referrals
set status = case
  when coalesce(referral_reward_given, false) then 'order_rewarded'
  else 'pending'
end;

alter table public.referrals
  add constraint referrals_status_check
  check (status in ('pending', 'active_plan', 'order_rewarded', 'rewarded'));

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

drop trigger if exists set_reward_coupons_updated_at on public.reward_coupons;
create trigger set_reward_coupons_updated_at
before update on public.reward_coupons
for each row
execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.reward_coupons enable row level security;

drop policy if exists "subscriptions select own or admin" on public.subscriptions;
create policy "subscriptions select own or admin"
on public.subscriptions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "reward coupons select own or admin" on public.reward_coupons;
create policy "reward coupons select own or admin"
on public.reward_coupons
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace function public.sync_active_plan_referral_arrays(p_referrer_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.allow_referral_counter_update', '1', true);

  with computed_referrals as (
    select
      u.id,
      coalesce(
        array_agg(r.referred_user_id order by r.updated_at desc, r.created_at desc) filter (
          where r.referred_user_id is not null
            and r.status = 'active_plan'
        ),
        '{}'::uuid[]
      ) as successful_referrals
    from public.users u
    left join public.referrals r
      on r.referrer_user_id = u.id
    where p_referrer_user_id is null or u.id = p_referrer_user_id
    group by u.id
  )
  update public.users u
  set successful_referrals = computed_referrals.successful_referrals
  from computed_referrals
  where u.id = computed_referrals.id
    and u.successful_referrals is distinct from computed_referrals.successful_referrals;
end;
$$;

create or replace function public.refresh_subscription_statuses(p_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
begin
  update public.subscriptions
  set
    status = 'expired',
    updated_at = timezone('utc', now())
  where status = 'active'
    and end_date <= current_date
    and (p_user_id is null or user_id = p_user_id);

  update public.referrals r
  set
    status = 'active_plan',
    reward_type = case
      when coalesce(r.reward_type, '') = '' then 'subscription_plan'
      else r.reward_type
    end,
    updated_at = timezone('utc', now())
  where coalesce(r.referral_reward_given, false) = false
    and r.status <> 'order_rewarded'
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = r.referred_user_id
        and s.status = 'active'
    )
    and (p_user_id is null or r.referred_user_id = p_user_id);

  update public.referrals r
  set
    status = 'pending',
    updated_at = timezone('utc', now())
  where r.status = 'active_plan'
    and coalesce(r.referral_reward_given, false) = false
    and not exists (
      select 1
      from public.subscriptions s
      where s.user_id = r.referred_user_id
        and s.status = 'active'
    )
    and (p_user_id is null or r.referred_user_id = p_user_id);

  if p_user_id is null then
    perform public.sync_active_plan_referral_arrays();
  else
    for v_referrer_id in
      select distinct referrer_user_id
      from public.referrals
      where referred_user_id = p_user_id
        and referrer_user_id is not null
    loop
      perform public.sync_active_plan_referral_arrays(v_referrer_id);
    end loop;
  end if;
end;
$$;

create or replace function public.refresh_reward_coupon_statuses(p_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reward_coupons
  set
    status = 'expired',
    updated_at = timezone('utc', now())
  where status = 'active'
    and expires_at <= timezone('utc', now())
    and (p_user_id is null or user_id = p_user_id);
end;
$$;

create or replace function public.generate_reward_coupon_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := 'SJFC' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.reward_coupons where code = candidate);
  end loop;

  return candidate;
end;
$$;

create or replace function public.get_my_subscription(p_user_id uuid default auth.uid())
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription public.subscriptions%rowtype;
  v_days_left integer := 0;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'You can only access your own subscription';
  end if;

  perform public.refresh_subscription_statuses(p_user_id);

  select *
  into v_subscription
  from public.subscriptions
  where user_id = p_user_id
  order by
    case when status = 'active' then 0 else 1 end,
    end_date desc,
    created_at desc
  limit 1;

  if v_subscription.id is null then
    return null;
  end if;

  v_days_left := greatest((v_subscription.end_date - current_date), 0);

  return jsonb_build_object(
    'id', v_subscription.id,
    'userId', v_subscription.user_id,
    'planName', v_subscription.plan_name,
    'startDate', v_subscription.start_date,
    'endDate', v_subscription.end_date,
    'status', v_subscription.status,
    'daysLeft', v_days_left,
    'createdAt', v_subscription.created_at,
    'updatedAt', v_subscription.updated_at
  );
end;
$$;

create or replace function public.subscribe_monthly_plan(p_user_id uuid default auth.uid())
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users%rowtype;
  v_referrer public.users%rowtype;
  v_existing public.subscriptions%rowtype;
  v_subscription public.subscriptions%rowtype;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'You can only activate your own subscription';
  end if;

  perform public.refresh_subscription_statuses(p_user_id);

  select *
  into v_user
  from public.users
  where id = p_user_id;

  if v_user.id is null then
    raise exception 'User not found';
  end if;

  if v_user.role <> 'customer' then
    raise exception 'Only customers can subscribe';
  end if;

  select *
  into v_existing
  from public.subscriptions
  where user_id = p_user_id
    and status = 'active'
  order by end_date desc
  limit 1;

  if v_existing.id is not null then
    return public.get_my_subscription(p_user_id);
  end if;

  insert into public.subscriptions (
    user_id,
    plan_name,
    start_date,
    end_date,
    status
  )
  values (
    p_user_id,
    'Monthly Thali',
    current_date,
    current_date + 30,
    'active'
  )
  returning * into v_subscription;

  if coalesce(v_user.referral_applied, '') <> '' then
    select *
    into v_referrer
    from public.users
    where referral_code = v_user.referral_applied
      and id <> p_user_id
    limit 1;

    if v_referrer.id is not null then
      insert into public.referrals (
        referrer_user_id,
        referred_user_id,
        referral_code,
        status,
        referral_reward_given,
        reward_type,
        reward_value
      )
      values (
        v_referrer.id,
        p_user_id,
        v_user.referral_applied,
        'pending',
        false,
        '',
        0
      )
      on conflict (referred_user_id) do update
        set referrer_user_id = excluded.referrer_user_id,
            referral_code = excluded.referral_code,
            updated_at = timezone('utc', now());
    end if;
  end if;

  perform public.refresh_subscription_statuses(p_user_id);

  return public.get_my_subscription(p_user_id);
end;
$$;

create or replace function public.apply_referral_code(
  p_user_id uuid,
  p_referral_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users%rowtype;
  v_referrer public.users%rowtype;
  v_active_plan_referral_count integer;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'You can only apply a referral to your own account';
  end if;

  select *
  into v_user
  from public.users
  where id = p_user_id;

  if v_user.id is null or v_user.referral_applied <> '' then
    raise exception 'Referral code cannot be applied';
  end if;

  select *
  into v_referrer
  from public.users
  where referral_code = trim(p_referral_code)
    and id <> p_user_id;

  if v_referrer.id is null then
    raise exception 'Referral code not found';
  end if;

  update public.users
  set referral_applied = trim(p_referral_code)
  where id = p_user_id;

  insert into public.referrals (
    referrer_user_id,
    referred_user_id,
    referral_code,
    status,
    referral_reward_given,
    reward_type,
    reward_value
  )
  values (
    v_referrer.id,
    p_user_id,
    trim(p_referral_code),
    'pending',
    false,
    '',
    0
  )
  on conflict (referred_user_id) do update
    set referrer_user_id = excluded.referrer_user_id,
        referral_code = excluded.referral_code,
        status = case
          when public.referrals.referral_reward_given then public.referrals.status
          else 'pending'
        end,
        updated_at = timezone('utc', now());

  perform public.refresh_subscription_statuses(p_user_id);

  select count(*)
  into v_active_plan_referral_count
  from public.referrals
  where referrer_user_id = v_referrer.id
    and status = 'active_plan';

  return jsonb_build_object(
    'referralCode', v_user.referral_code,
    'appliedReferralCode', trim(p_referral_code),
    'successfulReferralCount', v_active_plan_referral_count
  );
end;
$$;

create or replace function public.maybe_issue_first_order_referral_reward(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_referral public.referrals%rowtype;
  v_coupon_id uuid;
  v_coupon_code text;
  v_reward_amount numeric(10, 2);
  v_delivered_order_count integer;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id;

  if v_order.id is null or v_order.status <> 'Delivered' then
    return;
  end if;

  perform public.refresh_subscription_statuses(v_order.user_id);

  select *
  into v_referral
  from public.referrals
  where referred_user_id = v_order.user_id
  limit 1;

  if v_referral.id is null
    or coalesce(v_referral.referral_reward_given, false)
    or v_referral.status <> 'pending' then
    return;
  end if;

  if exists (
    select 1
    from public.subscriptions
    where user_id = v_order.user_id
  ) then
    return;
  end if;

  select count(*)
  into v_delivered_order_count
  from public.orders
  where user_id = v_order.user_id
    and status = 'Delivered';

  if v_delivered_order_count <> 1 then
    return;
  end if;

  v_reward_amount := least(50, round(coalesce(v_order.total, 0) * 0.08));

  if v_reward_amount <= 0 then
    return;
  end if;

  v_coupon_code := public.generate_reward_coupon_code();

  insert into public.reward_coupons (
    user_id,
    referral_id,
    code,
    amount,
    status,
    expires_at
  )
  values (
    v_referral.referrer_user_id,
    v_referral.id,
    v_coupon_code,
    v_reward_amount,
    'active',
    timezone('utc', now()) + interval '10 days'
  )
  returning id into v_coupon_id;

  update public.referrals
  set
    status = 'order_rewarded',
    referral_reward_given = true,
    reward_type = 'first_order_coupon',
    reward_value = v_reward_amount,
    reward_coupon_id = v_coupon_id,
    updated_at = timezone('utc', now())
  where id = v_referral.id;

  perform public.sync_active_plan_referral_arrays(v_referral.referrer_user_id);
end;
$$;

create or replace function public.place_order(
  p_user_id uuid,
  p_address jsonb,
  p_payment_method text,
  p_items jsonb,
  p_note text default '',
  p_distance_km numeric default null,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10, 2);
  v_delivery_fee numeric(10, 2);
  v_handling_fee numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_delivery_rules jsonb;
  v_eta_minutes integer;
  v_tracking jsonb;
  v_per_km_rate numeric(10, 2);
  v_min_delivery numeric(10, 2);
  v_max_distance numeric(10, 2);
  v_free_threshold_1 numeric(10, 2);
  v_free_distance_limit numeric(10, 2);
  v_free_threshold_2 numeric(10, 2);
  v_base_delivery numeric(10, 2);
  v_coupon public.reward_coupons%rowtype;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'You cannot place an order for another user';
  end if;

  select * into v_user from public.users where id = p_user_id;
  if v_user.id is null then
    raise exception 'User not found';
  end if;

  select delivery_rules into v_delivery_rules from public.app_settings where id = 1;
  v_per_km_rate := coalesce((v_delivery_rules->>'perKmRate')::numeric, 10);
  v_min_delivery := coalesce((v_delivery_rules->>'minDelivery')::numeric, 20);
  v_max_distance := coalesce((v_delivery_rules->>'maxDistance')::numeric, 10);
  v_free_threshold_1 := coalesce((v_delivery_rules->>'freeThreshold1')::numeric, 299);
  v_free_distance_limit := coalesce((v_delivery_rules->>'freeDistanceLimit')::numeric, 5);
  v_free_threshold_2 := coalesce((v_delivery_rules->>'freeThreshold2')::numeric, 499);
  v_eta_minutes := coalesce((v_delivery_rules->>'estimatedDeliveryMinutes')::integer, 35);

  select coalesce(sum(
    case
      when coalesce((item.value->>'isFreebie')::boolean, false) then 0
      else (item.value->>'quantity')::int * prod.price
    end
  ), 0)
  into v_subtotal
  from jsonb_array_elements(p_items) item
  join public.products prod on prod.id = (item.value->>'id')::uuid;

  if v_subtotal <= 0 then
    raise exception 'Order must contain valid items';
  end if;

  if p_distance_km is not null and p_distance_km > v_max_distance then
    raise exception 'Order is outside the delivery zone';
  end if;

  v_base_delivery := round(greatest(v_min_delivery, coalesce(p_distance_km, 0) * v_per_km_rate));
  if p_distance_km is null then
    v_base_delivery := round(v_min_delivery);
  end if;

  if v_subtotal >= v_free_threshold_2 then
    v_delivery_fee := 0;
  elsif v_subtotal >= v_free_threshold_1 then
    if p_distance_km is not null and p_distance_km <= v_free_distance_limit then
      v_delivery_fee := 0;
    else
      v_delivery_fee := round(v_base_delivery / 2);
    end if;
  else
    v_delivery_fee := v_base_delivery;
  end if;

  perform public.refresh_reward_coupon_statuses(p_user_id);

  if coalesce(trim(p_coupon_code), '') <> '' then
    select *
    into v_coupon
    from public.reward_coupons
    where user_id = p_user_id
      and code = trim(p_coupon_code)
      and status = 'active'
      and expires_at > timezone('utc', now())
    limit 1;

    if v_coupon.id is null then
      raise exception 'Referral coupon is invalid or expired';
    end if;

    v_discount := least(v_coupon.amount, v_subtotal + v_delivery_fee + v_handling_fee);
  end if;

  v_total := greatest(0, v_subtotal + v_delivery_fee + v_handling_fee - v_discount);
  v_order_number := public.generate_order_number();
  v_order_id := gen_random_uuid();
  v_tracking := jsonb_build_object(
    'timeline', jsonb_build_array(
      jsonb_build_object(
        'status', 'Order Placed',
        'label', 'Order received',
        'timestamp', timezone('utc', now())
      )
    ),
    'currentLocation', null
  );

  insert into public.orders (
    id,
    order_number,
    user_id,
    customer_name,
    customer_phone,
    items,
    address,
    payment_method,
    note,
    subtotal,
    delivery_fee,
    handling_fee,
    discount,
    total,
    status,
    estimated_delivery_at,
    tracking
  )
  values (
    v_order_id,
    v_order_number,
    p_user_id,
    v_user.name,
    coalesce(v_user.phone_number, p_address->>'phoneNumber', ''),
    p_items,
    p_address,
    case when p_payment_method in ('COD', 'ONLINE') then p_payment_method else 'COD' end,
    coalesce(p_note, ''),
    v_subtotal,
    v_delivery_fee,
    v_handling_fee,
    v_discount,
    v_total,
    'Order Placed',
    timezone('utc', now()) + make_interval(mins => v_eta_minutes),
    v_tracking
  );

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, image_url)
  select
    v_order_id,
    prod.id,
    prod.name,
    case
      when coalesce((item.value->>'isFreebie')::boolean, false) then 0
      else prod.price
    end,
    (item.value->>'quantity')::int,
    prod.image_url
  from jsonb_array_elements(p_items) item
  join public.products prod on prod.id = (item.value->>'id')::uuid;

  if v_coupon.id is not null then
    update public.reward_coupons
    set
      status = 'used',
      used_at = timezone('utc', now()),
      used_order_id = v_order_id,
      updated_at = timezone('utc', now())
    where id = v_coupon.id;
  end if;

  insert into public.order_status_history (order_id, status, label, changed_by)
  values (v_order_id, 'Order Placed', 'Order received', p_user_id);

  return jsonb_build_object(
    'id', v_order_id,
    'orderNumber', v_order_number,
    'status', 'Order Placed',
    'subtotal', v_subtotal,
    'deliveryFee', v_delivery_fee,
    'handlingFee', v_handling_fee,
    'discount', v_discount,
    'total', v_total
  );
end;
$$;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status text,
  p_assigned_delivery_user_id uuid default null,
  p_actor_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.users%rowtype;
  v_order public.orders%rowtype;
  v_delivery_name text := '';
begin
  if p_status not in ('Order Placed', 'Preparing', 'Out for Delivery', 'Delivered') then
    raise exception 'Invalid order status';
  end if;

  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  select *
  into v_actor
  from public.users
  where id = coalesce(p_actor_user_id, auth.uid());

  if v_actor.id is null then
    raise exception 'Actor not found';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> v_actor.id and not public.is_admin() then
    raise exception 'Actor mismatch';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order not found';
  end if;

  if v_actor.role not in ('admin', 'delivery') then
    raise exception 'Not authorized to update orders';
  end if;

  if v_actor.role = 'delivery' and v_order.assigned_delivery_boy_id is distinct from v_actor.id then
    raise exception 'This order is not assigned to you';
  end if;

  if p_assigned_delivery_user_id is not null then
    if v_actor.role <> 'admin' and p_assigned_delivery_user_id is distinct from v_order.assigned_delivery_boy_id then
      raise exception 'Only admin can assign delivery partners';
    end if;

    select name into v_delivery_name from public.users where id = p_assigned_delivery_user_id;
  end if;

  update public.orders
  set
    status = p_status,
    assigned_delivery_boy_id = coalesce(p_assigned_delivery_user_id, assigned_delivery_boy_id),
    assigned_delivery_boy_name = case
      when p_assigned_delivery_user_id is not null then coalesce(v_delivery_name, '')
      else assigned_delivery_boy_name
    end,
    delivered_at = case when p_status = 'Delivered' then timezone('utc', now()) else delivered_at end,
    tracking = jsonb_set(
      tracking,
      '{timeline}',
      coalesce(tracking->'timeline', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'status', p_status,
          'label', p_status,
          'timestamp', timezone('utc', now())
        )
      )
    )
  where id = p_order_id;

  insert into public.order_status_history (order_id, status, label, changed_by)
  values (p_order_id, p_status, p_status, v_actor.id);

  if p_status = 'Delivered' and v_order.status is distinct from 'Delivered' then
    perform public.maybe_issue_first_order_referral_reward(p_order_id);
  end if;

  return (
    select jsonb_build_object(
      'id', id,
      'status', status,
      'assignedDeliveryBoyId', assigned_delivery_boy_id,
      'assignedDeliveryBoyName', assigned_delivery_boy_name
    )
    from public.orders
    where id = p_order_id
  );
end;
$$;

update public.app_settings
set offers = (
  select jsonb_agg(
    case
      when offer->>'id' = 'offer-referral' then jsonb_build_object(
        'id', 'offer-referral',
        'title', '6 active monthly plan referrals = 1 Month FREE',
        'description', 'A referred customer counts only after their Monthly Thali subscription becomes active.'
      )
      else offer
    end
  )
  from jsonb_array_elements(coalesce(offers, '[]'::jsonb)) as offer
)
where id = 1;

select public.refresh_subscription_statuses();
select public.refresh_reward_coupon_statuses();

grant execute on function public.get_my_subscription(uuid) to authenticated, service_role;
grant execute on function public.subscribe_monthly_plan(uuid) to authenticated, service_role;
grant execute on function public.apply_referral_code(uuid, text) to authenticated, service_role;
grant execute on function public.place_order(uuid, jsonb, text, jsonb, text, numeric, text) to authenticated, service_role;
grant execute on function public.update_order_status(uuid, text, uuid, uuid) to authenticated, service_role;
grant select on table public.subscriptions to authenticated, service_role;
grant select on table public.reward_coupons to authenticated, service_role;
