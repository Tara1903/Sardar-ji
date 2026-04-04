update public.app_settings
set
  delivery_rules = jsonb_build_object(
    'perKmRate', 10,
    'minDelivery', 20,
    'maxDistance', 10,
    'freeThreshold1', 299,
    'freeDistanceLimit', 5,
    'freeThreshold2', 499,
    'deliveryFeeLabel', 'Delivery + handling',
    'freeItemSlug', 'mango-juice-150ml-freebie',
    'freeItemName', 'Mango Juice (150ml)',
    'freeItemDescription', 'Complimentary on orders above ₹499.',
    'estimatedDeliveryMinutes', 35
  ),
  offers = '[
    {
      "id":"offer-delivery-299",
      "title":"₹299 = Free Delivery (≤5km)",
      "description":"Stay above ₹299 and we waive delivery charges within 5 km of the store."
    },
    {
      "id":"offer-delivery-499",
      "title":"₹499 = Free Delivery + FREE Mango Juice 🥭",
      "description":"Cross ₹499 and your order unlocks both free delivery and a complimentary mango juice."
    },
    {
      "id":"offer-budget",
      "title":"₹70 se ₹149 tak Har Budget ki Thali",
      "description":"Daily budget-friendly veg meals built for office, hostel, and home delivery."
    }
  ]'::jsonb
where id = 1;

create or replace function public.place_order(
  p_user_id uuid,
  p_address jsonb,
  p_payment_method text,
  p_items jsonb,
  p_note text default '',
  p_distance_km numeric default null
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
begin
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

  select coalesce(sum((item.value->>'quantity')::int * prod.price), 0)
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
