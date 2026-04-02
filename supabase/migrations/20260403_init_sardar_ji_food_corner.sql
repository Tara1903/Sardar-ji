create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone_number text,
  role text not null default 'customer' check (role in ('admin', 'customer', 'delivery')),
  referral_code text not null unique,
  referral_applied text not null default '',
  successful_referrals uuid[] not null default '{}'::uuid[],
  addresses jsonb not null default '[]'::jsonb,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.generate_referral_code(full_name text)
returns text
language plpgsql
as $$
declare
  base_code text;
  next_code text;
begin
  base_code := upper(substr(regexp_replace(coalesce(full_name, 'SARDAR'), '[^A-Za-z0-9]', '', 'g'), 1, 6));
  if base_code = '' then
    base_code := 'SARDAR';
  end if;

  loop
    next_code := base_code || lpad(((random() * 9000)::int + 1000)::text, 4, '0');
    exit when not exists (select 1 from public.users where referral_code = next_code);
  end loop;

  return next_code;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_delivery()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'delivery', false)
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null unique,
  slug text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  description text not null default '',
  image_url text not null default '',
  badge text not null default '',
  is_available boolean not null default true,
  is_veg boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default 'Sardar Ji Food Corner',
  tagline text not null default 'Swad Bhi, Budget Bhi',
  whatsapp_number text not null default '919999999999',
  phone_number text not null default '+91 99999 99999',
  timings text not null default 'Morning to Night',
  maps_embed_url text not null default '',
  trust_points jsonb not null default '[]'::jsonb,
  delivery_rules jsonb not null default '{}'::jsonb,
  offers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.users(id) on delete restrict,
  customer_name text not null,
  customer_phone text not null,
  items jsonb not null default '[]'::jsonb,
  address jsonb not null,
  payment_method text not null default 'COD' check (payment_method in ('COD', 'ONLINE')),
  note text not null default '',
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  handling_fee numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status text not null default 'Order Placed' check (status in ('Order Placed', 'Preparing', 'Out for Delivery', 'Delivered')),
  estimated_delivery_at timestamptz,
  delivered_at timestamptz,
  assigned_delivery_boy_id uuid references public.users(id) on delete set null,
  assigned_delivery_boy_name text not null default '',
  tracking jsonb not null default '{"timeline":[],"currentLocation":null}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  image_url text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'successful' check (status in ('pending', 'successful', 'rewarded')),
  reward_description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.delivery_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  delivery_user_id uuid references public.users(id) on delete set null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  eta_minutes integer,
  status_note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (status in ('Order Placed', 'Preparing', 'Out for Delivery', 'Delivered')),
  label text not null,
  changed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_referral_code on public.users(referral_code);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_available on public.products(is_available) where is_available = true;
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_assigned_delivery on public.orders(assigned_delivery_boy_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_delivery_tracking_order on public.delivery_tracking(order_id);
create index if not exists idx_order_status_history_order on public.order_status_history(order_id, created_at desc);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_referrals_updated_at on public.referrals;
create trigger set_referrals_updated_at
before update on public.referrals
for each row
execute function public.set_updated_at();

drop trigger if exists set_delivery_tracking_updated_at on public.delivery_tracking;
create trigger set_delivery_tracking_updated_at
before update on public.delivery_tracking
for each row
execute function public.set_updated_at();

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
before update on public.app_settings
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    name,
    email,
    phone_number,
    role,
    referral_code
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phoneNumber',
    case
      when coalesce(new.raw_user_meta_data->>'role', 'customer') in ('admin', 'customer', 'delivery') then new.raw_user_meta_data->>'role'
      else 'customer'
    end,
    public.generate_referral_code(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    phone_number = excluded.phone_number;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create or replace function public.protect_user_role_changes()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.email := old.email;
    new.referral_code := old.referral_code;
    new.successful_referrals := old.successful_referrals;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_user_role_changes on public.users;
create trigger protect_user_role_changes
before update on public.users
for each row
execute function public.protect_user_role_changes();

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'SJ' || to_char(timezone('utc', now()), 'DDHH24MISS') || upper(substr(md5(random()::text), 1, 4));
    exit when not exists (select 1 from public.orders where order_number = candidate);
  end loop;

  return candidate;
end;
$$;

create or replace function public.fetch_products(
  p_search text default null,
  p_category text default null,
  p_available boolean default true
)
returns table (
  id uuid,
  name text,
  price numeric,
  description text,
  category text,
  image text,
  badge text,
  is_available boolean,
  created_at timestamptz
)
language sql
stable
as $$
  select
    p.id,
    p.name,
    p.price,
    p.description,
    c.name as category,
    p.image_url as image,
    p.badge,
    p.is_available,
    p.created_at
  from public.products p
  join public.categories c on c.id = p.category_id
  where
    (p_available is null or p.is_available = p_available)
    and (p_category is null or lower(c.name) = lower(p_category) or lower(c.slug) = lower(p_category))
    and (
      p_search is null
      or p.name ilike '%' || p_search || '%'
      or p.description ilike '%' || p_search || '%'
    )
  order by c.sort_order asc, p.created_at desc;
$$;

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
  select * into v_user from public.users where id = p_user_id;
  if v_user.id is null then
    raise exception 'User not found';
  end if;

  select delivery_rules into v_delivery_rules from public.app_settings where id = 1;
  v_threshold := coalesce((v_delivery_rules->>'freeDeliveryThreshold')::numeric, 299);
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
    v_handling_fee := coalesce((v_delivery_rules->>'handlingFeeBelowThreshold')::numeric, 9);
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
  v_delivery_name text := '';
begin
  if p_status not in ('Order Placed', 'Preparing', 'Out for Delivery', 'Delivered') then
    raise exception 'Invalid order status';
  end if;

  if p_assigned_delivery_user_id is not null then
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
  values (p_order_id, p_status, p_status, p_actor_user_id);

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
  v_tracking jsonb;
begin
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
    p_delivery_user_id,
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

create or replace function public.get_delivery_tracking(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'orderId', o.id,
    'orderNumber', o.order_number,
    'status', o.status,
    'estimatedDeliveryAt', o.estimated_delivery_at,
    'currentLocation', o.tracking->'currentLocation',
    'timeline', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'status', osh.status,
            'label', osh.label,
            'timestamp', osh.created_at
          )
          order by osh.created_at asc
        ),
        '[]'::jsonb
      )
      from public.order_status_history osh
      where osh.order_id = o.id
    )
  )
  from public.orders o
  where o.id = p_order_id
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

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.app_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.referrals enable row level security;
alter table public.delivery_tracking enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "users select own or admin" on public.users;
create policy "users select own or admin"
on public.users
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "users update own or admin" on public.users;
create policy "users update own or admin"
on public.users
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "categories are viewable by everyone" on public.categories;
create policy "categories are viewable by everyone"
on public.categories
for select
to public
using (true);

drop policy if exists "categories write by admin" on public.categories;
create policy "categories write by admin"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products are viewable by everyone" on public.products;
create policy "products are viewable by everyone"
on public.products
for select
to public
using (true);

drop policy if exists "products write by admin" on public.products;
create policy "products write by admin"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "settings are viewable by everyone" on public.app_settings;
create policy "settings are viewable by everyone"
on public.app_settings
for select
to public
using (true);

drop policy if exists "settings write by admin" on public.app_settings;
create policy "settings write by admin"
on public.app_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders select own assigned or admin" on public.orders;
create policy "orders select own assigned or admin"
on public.orders
for select
to authenticated
using (
  auth.uid() = user_id
  or assigned_delivery_boy_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "orders insert own or admin" on public.orders;
create policy "orders insert own or admin"
on public.orders
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin()
);

drop policy if exists "orders update assigned or admin" on public.orders;
create policy "orders update assigned or admin"
on public.orders
for update
to authenticated
using (
  assigned_delivery_boy_id = auth.uid()
  or public.is_admin()
)
with check (
  assigned_delivery_boy_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "order items follow order access" on public.order_items;
create policy "order items follow order access"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (
        o.user_id = auth.uid()
        or o.assigned_delivery_boy_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists "order items insert by admin" on public.order_items;
create policy "order items insert by admin"
on public.order_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "referrals select own or admin" on public.referrals;
create policy "referrals select own or admin"
on public.referrals
for select
to authenticated
using (
  referrer_user_id = auth.uid()
  or referred_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "referrals write by admin" on public.referrals;
create policy "referrals write by admin"
on public.referrals
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "delivery tracking select relevant users" on public.delivery_tracking;
create policy "delivery tracking select relevant users"
on public.delivery_tracking
for select
to authenticated
using (
  delivery_user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "delivery tracking write assigned or admin" on public.delivery_tracking;
create policy "delivery tracking write assigned or admin"
on public.delivery_tracking
for all
to authenticated
using (
  delivery_user_id = auth.uid()
  or public.is_admin()
)
with check (
  delivery_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "order history select relevant users" on public.order_status_history;
create policy "order history select relevant users"
on public.order_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (
        o.user_id = auth.uid()
        or o.assigned_delivery_boy_id = auth.uid()
        or public.is_admin()
      )
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('user-uploads', 'user-uploads', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "admin manage product images" on storage.objects;
create policy "admin manage product images"
on storage.objects
for all
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "users view own uploads" on storage.objects;
create policy "users view own uploads"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-uploads'
  and (
    public.is_admin()
    or owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "users upload own files" on storage.objects;
create policy "users upload own files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-uploads'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "users update own uploads" on storage.objects;
create policy "users update own uploads"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-uploads'
  and (
    public.is_admin()
    or owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id = 'user-uploads'
  and (
    public.is_admin()
    or owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "users delete own uploads" on storage.objects;
create policy "users delete own uploads"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-uploads'
  and (
    public.is_admin()
    or owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

insert into public.app_settings (
  id,
  business_name,
  tagline,
  whatsapp_number,
  phone_number,
  timings,
  maps_embed_url,
  trust_points,
  delivery_rules,
  offers
)
values (
  1,
  'Sardar Ji Food Corner',
  'Swad Bhi, Budget Bhi',
  '919999999999',
  '+91 99999 99999',
  'Morning to Night',
  '',
  '["Fresh homestyle veg meals", "Fast local delivery", "Clear pricing and offers"]'::jsonb,
  '{"freeDeliveryThreshold":299,"deliveryFeeBelowThreshold":30,"handlingFeeBelowThreshold":9,"estimatedDeliveryMinutes":35}'::jsonb,
  '[
    {"id":"offer-budget","title":"₹70 se ₹149 tak Har Budget ki Thali","description":"Daily budget-friendly thalis for office, hostel, and family meals."},
    {"id":"offer-delivery","title":"₹299 Order = FREE Delivery","description":"Cross the free delivery threshold and the delivery fee drops to zero."},
    {"id":"offer-referral","title":"6 Referral = 1 Month FREE","description":"Invite friends and unlock free meals plus milestone rewards."},
    {"id":"offer-double","title":"Missed thali = next day double","description":"If a confirmed thali is missed, the next day is covered double."}
  ]'::jsonb
)
on conflict (id) do update
set
  business_name = excluded.business_name,
  tagline = excluded.tagline,
  whatsapp_number = excluded.whatsapp_number,
  phone_number = excluded.phone_number,
  timings = excluded.timings,
  maps_embed_url = excluded.maps_embed_url,
  trust_points = excluded.trust_points,
  delivery_rules = excluded.delivery_rules,
  offers = excluded.offers;

insert into public.categories (name, slug, description, sort_order, is_active)
values
  ('Thali Specials', 'thali-specials', 'Budget to premium thalis cooked fresh every day.', 1, true),
  ('Paratha Specials', 'paratha-specials', 'Fresh parathas served with dahi and salad.', 2, true),
  ('Chaat Items', 'chaat-items', 'Tangy street-style chaats and snacks.', 3, true),
  ('Snacks & More', 'snacks-more', 'Fast bites for quick cravings.', 4, true),
  ('Beverages', 'beverages', 'Cool drinks to complete the meal.', 5, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.products (category_id, name, slug, price, description, image_url, badge, is_available, is_veg)
select c.id, v.name, v.slug, v.price, v.description, v.image_url, v.badge, true, true
from (
  values
    ('thali-specials', 'Regular Thali', 'regular-thali', 70, '5 Roti, Dal, Sabzi, Rice OR Dahi, Pyaz, Chutni, Achar', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'Best Seller'),
    ('thali-specials', 'Premium Thali', 'premium-thali', 99, '5 Roti, Rice, Dal, Paneer Sabzi, Dahi, Salad & Sweet', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'Popular'),
    ('thali-specials', 'Super Veg Thali', 'super-veg-thali', 149, '6 Roti, Paneer, Seasonal Sabzi, Sweet', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'Popular'),
    ('thali-specials', 'Monthly Plan', 'monthly-plan', 1560, '₹60 x 26 days, Daily changing sabzi, Rice + Dahi included', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'New'),
    ('paratha-specials', 'Aloo Paratha', 'aloo-paratha', 50, 'Stuffed aloo paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 'Popular'),
    ('paratha-specials', 'Gobi Pyaz Paratha', 'gobi-pyaz-paratha', 60, 'Stuffed gobi and onion paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', ''),
    ('paratha-specials', 'Paneer Pyaz Paratha', 'paneer-pyaz-paratha', 70, 'Stuffed paneer and onion paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 'Best Seller'),
    ('paratha-specials', 'Mooli Paratha', 'mooli-paratha', 60, 'Fresh mooli paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', ''),
    ('paratha-specials', 'Sev Pyaz Paratha', 'sev-pyaz-paratha', 60, 'Sev and onion paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', ''),
    ('paratha-specials', 'Methi Pyaz Paratha', 'methi-pyaz-paratha', 60, 'Methi and onion paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', ''),
    ('paratha-specials', 'Mix Special Paratha', 'mix-special-paratha', 60, 'Mixed masala paratha served with dahi + salad FREE.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 'New'),
    ('chaat-items', 'Pani Puri (6 pcs)', 'pani-puri-6-pcs', 25, 'Classic pani puri with spicy and sweet water.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 'Best Seller'),
    ('chaat-items', 'Dahi Papdi Chaat', 'dahi-papdi-chaat', 50, 'Crisp papdi topped with chilled dahi and chutneys.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', ''),
    ('chaat-items', 'Dahi Vada Papdi', 'dahi-vada-papdi', 80, 'Soft vada and papdi with creamy dahi and spices.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 'Popular'),
    ('chaat-items', 'Sev Puri', 'sev-puri', 60, 'Crunchy sev puri with tangy chutney mix.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', ''),
    ('chaat-items', 'Dahi Puri', 'dahi-puri', 60, 'Sweet-spicy dahi puri with fresh toppings.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', ''),
    ('chaat-items', 'Bhel Puri', 'bhel-puri', 40, 'Street-style bhel puri with chutney toss.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', ''),
    ('chaat-items', 'Dry Fruit Bhel / Bhel Special', 'dry-fruit-bhel-special', 70, 'Premium dry fruit bhel for a richer crunch.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 'New'),
    ('snacks-more', 'Veg Steam Momos', 'veg-steam-momos', 50, 'Steamed veg momos with chutney.', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80', 'Popular'),
    ('snacks-more', 'Veg Fry Momos', 'veg-fry-momos', 60, 'Crispy fried momos with chutney.', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80', ''),
    ('snacks-more', 'Spring Roll', 'spring-roll', 50, 'Golden spring rolls with flavorful filling.', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80', ''),
    ('snacks-more', 'Finger Chips', 'finger-chips', 50, 'Crispy finger chips for quick snacking.', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80', ''),
    ('snacks-more', 'Paneer Samosa', 'paneer-samosa', 40, 'Paneer-loaded samosa with crunchy shell.', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80', 'Best Seller'),
    ('snacks-more', 'Veg Puff', 'veg-puff', 60, 'Flaky veg puff fresh from the oven.', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80', ''),
    ('beverages', 'Thandi Lassi', 'thandi-lassi', 50, 'Refreshing chilled lassi.', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80', 'Popular'),
    ('beverages', 'Chaach', 'chaach', 25, 'Cooling chaach to complete the meal.', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80', '')
) as v(category_slug, name, slug, price, description, image_url, badge)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  price = excluded.price,
  description = excluded.description,
  image_url = excluded.image_url,
  badge = excluded.badge,
  is_available = excluded.is_available,
  is_veg = excluded.is_veg;
