create or replace function public.place_order(
  p_user_id uuid,
  p_address jsonb,
  p_payment_method text,
  p_items jsonb,
  p_note text default ''
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
  v_handling_fee numeric(10, 2);
  v_discount numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_delivery_rules jsonb;
  v_threshold numeric(10, 2);
  v_eta_minutes integer;
  v_tracking jsonb;
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
  v_threshold := coalesce((v_delivery_rules->>'freeDeliveryThreshold')::numeric, 499);
  v_eta_minutes := coalesce((v_delivery_rules->>'estimatedDeliveryMinutes')::integer, 35);

  select coalesce(sum((item.value->>'quantity')::int * prod.price), 0)
  into v_subtotal
  from jsonb_array_elements(p_items) item
  join public.products prod on prod.id = (item.value->>'id')::uuid;

  if v_subtotal <= 0 then
    raise exception 'Order must contain valid items';
  end if;

  if v_subtotal >= v_threshold then
    v_delivery_fee := 0;
    v_handling_fee := 0;
  else
    v_delivery_fee := coalesce((v_delivery_rules->>'deliveryFeeBelowThreshold')::numeric, 30);
    v_handling_fee := coalesce((v_delivery_rules->>'handlingFeeBelowThreshold')::numeric, 0);
  end if;

  v_total := v_subtotal + v_delivery_fee + v_handling_fee - v_discount;
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
    prod.price,
    (item.value->>'quantity')::int,
    prod.image_url
  from jsonb_array_elements(p_items) item
  join public.products prod on prod.id = (item.value->>'id')::uuid;

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

  select * into v_actor
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

create or replace function public.track_delivery(
  p_order_id uuid,
  p_delivery_user_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_eta_minutes integer default null,
  p_status_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.users%rowtype;
  v_order public.orders%rowtype;
  v_tracking jsonb;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  select * into v_actor
  from public.users
  where id = coalesce(p_delivery_user_id, auth.uid());

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
    raise exception 'Not authorized to update delivery tracking';
  end if;

  if v_actor.role = 'delivery' and v_order.assigned_delivery_boy_id is distinct from v_actor.id then
    raise exception 'This order is not assigned to you';
  end if;

  insert into public.delivery_tracking (
    order_id,
    delivery_user_id,
    latitude,
    longitude,
    eta_minutes,
    status_note
  )
  values (
    p_order_id,
    v_actor.id,
    p_latitude,
    p_longitude,
    p_eta_minutes,
    coalesce(p_status_note, '')
  )
  on conflict (order_id) do update
  set
    delivery_user_id = excluded.delivery_user_id,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    eta_minutes = excluded.eta_minutes,
    status_note = excluded.status_note,
    updated_at = timezone('utc', now());

  v_tracking := jsonb_build_object(
    'latitude', p_latitude,
    'longitude', p_longitude,
    'timestamp', timezone('utc', now())
  );

  update public.orders
  set tracking = jsonb_set(tracking, '{currentLocation}', v_tracking)
  where id = p_order_id;

  return (
    select jsonb_build_object(
      'orderId', order_id,
      'latitude', latitude,
      'longitude', longitude,
      'etaMinutes', eta_minutes,
      'statusNote', status_note,
      'updatedAt', updated_at
    )
    from public.delivery_tracking
    where order_id = p_order_id
  );
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
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'You can only apply a referral to your own account';
  end if;

  select * into v_user from public.users where id = p_user_id;
  if v_user.id is null or v_user.referral_applied <> '' then
    raise exception 'Referral code cannot be applied';
  end if;

  select * into v_referrer from public.users where referral_code = p_referral_code and id <> p_user_id;
  if v_referrer.id is null then
    raise exception 'Referral code not found';
  end if;

  update public.users
  set referral_applied = p_referral_code
  where id = p_user_id;

  update public.users
  set successful_referrals = array_append(successful_referrals, p_user_id)
  where id = v_referrer.id
    and not successful_referrals @> array[p_user_id]::uuid[];

  insert into public.referrals (referrer_user_id, referred_user_id, referral_code, status)
  values (v_referrer.id, p_user_id, p_referral_code, 'successful')
  on conflict (referred_user_id) do nothing;

  return jsonb_build_object(
    'referralCode', v_user.referral_code,
    'successfulReferralCount', coalesce(array_length(v_user.successful_referrals, 1), 0)
  );
end;
$$;
