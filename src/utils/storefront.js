export const RESTAURANT_LOCATION = {
  lat: 22.635280755003382,
  lng: 75.8351541995739,
};

export const FREE_DELIVERY_THRESHOLD = 299;
export const SPECIAL_OFFER_THRESHOLD = 499;
export const FREEBIE_SLUG = 'mango-juice-150ml-freebie';
export const FREEBIE_NAME = 'Mango Juice (150ml)';
export const FREEBIE_DESCRIPTION = 'Complimentary on orders above ₹499.';
export const DELIVERY_FEE_LABEL = 'Delivery + handling';
export const SPECIAL_OFFER_TITLE = '₹299 = Free Delivery (≤5km) | ₹499 = Free Delivery + FREE Mango Juice 🥭';
export const SPECIAL_OFFER_SUBTITLE =
  'Smart distance-based pricing built for quick local orders, with stronger rewards as the cart grows.';
export const SPECIAL_OFFER_UNLOCKED_MESSAGE =
  '🎉 You unlocked FREE Delivery + FREE Mango Juice 🥭';
export const SPECIAL_OFFER_POPUP_STORAGE_KEY = 'sjfc-special-offer-popup-v2';
export const STORE_ADDRESS =
  'Silicon Road, Palm n Dine Market, Agra - Mumbai Hwy, near Chika Chik Hotel, Indore, Madhya Pradesh 452012';
export const STORE_ADDRESS_SHORT = 'Silicon Road, Palm n Dine Market, Indore';
export const STORE_OPENING_HOURS_TEXT = 'Open daily from 8:00 AM to 11:00 PM';
export const STORE_OPENING_HOURS_SHORT = 'Daily · 8:00 AM - 11:00 PM';
export const STORE_PRIMARY_HEADLINE = 'Delicious Food Delivered Fast 🍽️';
export const STORE_PRIMARY_SUBTEXT =
  'Order from Sardar Ji Food Corner and enjoy fresh taste with exciting offers on every order.';
export const DELIVERY_RULE_BADGES = [
  'Free delivery within 5 km above ₹299',
  '₹10/km distance pricing with a ₹20 minimum',
  '50% OFF on delivery above ₹299',
];

const coordinateQuery = `${RESTAURANT_LOCATION.lat},${RESTAURANT_LOCATION.lng}`;

export const STORE_MAP_EMBED_URL = `https://www.google.com/maps?q=${coordinateQuery}&z=15&output=embed`;
export const STORE_MAP_URL = `https://www.google.com/maps?q=${coordinateQuery}`;

export const CUSTOMER_REVIEWS = [
  {
    id: 'review-fast',
    author: 'Neha S.',
    quote: 'Amazing food and fast delivery. The thali arrived hot and fresh.',
    rating: 5,
  },
  {
    id: 'review-taste',
    author: 'Amit R.',
    quote: 'Best taste in town. Clean packing and great value for daily orders.',
    rating: 5,
  },
  {
    id: 'review-offer',
    author: 'Pooja M.',
    quote: 'Loved the mango juice offer. The WhatsApp ordering flow is super easy.',
    rating: 5,
  },
];

export const DEFAULT_TRUST_POINTS = [
  'Fresh homestyle veg meals',
  'Fast local delivery',
  'Clear pricing and offers',
];

export const DEFAULT_OFFERS = [
  {
    id: 'offer-delivery-299',
    title: '₹299 = Free Delivery (≤5km)',
    description: 'Stay above ₹299 and we waive delivery charges within 5 km of the store.',
  },
  {
    id: 'offer-delivery-499',
    title: '₹499 = Free Delivery + FREE Mango Juice 🥭',
    description: 'Cross ₹499 and your order unlocks both free delivery and a complimentary mango juice.',
  },
  {
    id: 'offer-speed',
    title: 'Fresh meals for office, hostel, and home',
    description: 'Fast local delivery, clear pricing, and a menu designed for quick repeat orders.',
  },
];

export const resolveStoreTimings = (value) => {
  const current = String(value || '').trim();

  if (!current || /morning\s*to\s*night/i.test(current)) {
    return STORE_OPENING_HOURS_SHORT;
  }

  return current;
};
