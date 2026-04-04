do $$
declare
  v_beverage_category_id uuid;
begin
  select id
  into v_beverage_category_id
  from public.categories
  where slug = 'beverages'
  limit 1;

  if v_beverage_category_id is null then
    insert into public.categories (name, slug, description, sort_order, is_active)
    values ('Beverages', 'beverages', 'Cool lassi, chaach, and seasonal drinks.', 5, true)
    returning id into v_beverage_category_id;
  end if;

  update public.app_settings
  set
    phone_number = '+91 97791 95979',
    whatsapp_number = '919779195979',
    maps_embed_url = 'https://www.google.com/maps?q=Silicon%20Road%2C%20Palm%20n%20Dine%20Market%2C%20Agra%20-%20Mumbai%20Hwy%2C%20near%20Chika%20Chik%20Hotel%2C%20Indore%2C%20Madhya%20Pradesh%20452012&z=15&output=embed',
    trust_points = '["Fresh veg meals every day", "Fast delivery across the area", "Premium local service with clear offers"]'::jsonb,
    delivery_rules = '{
      "perKmRate": 10,
      "minDelivery": 20,
      "maxDistance": 10,
      "freeThreshold1": 299,
      "freeDistanceLimit": 5,
      "freeThreshold2": 499,
      "deliveryFeeLabel": "Delivery + handling",
      "freeItemSlug": "mango-juice-150ml-freebie",
      "freeItemName": "Mango Juice (150ml)",
      "freeItemDescription": "Complimentary on orders above ₹499.",
      "estimatedDeliveryMinutes": 35
    }'::jsonb,
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
      },
      {
        "id":"offer-referral",
        "title":"6 referrals = 1 month FREE",
        "description":"Invite your friends and unlock milestone rewards as the community grows."
      }
    ]'::jsonb
  where id = 1;

  insert into public.products (
    category_id,
    name,
    slug,
    price,
    description,
    image_url,
    badge,
    is_available,
    is_veg
  )
  values (
    v_beverage_category_id,
    'Mango Juice (150ml)',
    'mango-juice-150ml-freebie',
    0,
    'Complimentary on orders above ₹499.',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
    'FREE',
    false,
    true
  )
  on conflict (slug) do update
  set
    category_id = excluded.category_id,
    name = excluded.name,
    price = excluded.price,
    description = excluded.description,
    image_url = excluded.image_url,
    badge = excluded.badge,
    is_available = false,
    is_veg = true;
end $$;
