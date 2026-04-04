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
  'Smart delivery pricing based on distance, with free delivery within 5 km above ₹299 and a free mango juice above ₹499.';
export const SPECIAL_OFFER_UNLOCKED_MESSAGE =
  '🎉 You unlocked FREE Delivery + FREE Mango Juice 🥭';
export const SPECIAL_OFFER_POPUP_STORAGE_KEY = 'sjfc-special-offer-popup-v2';
export const STORE_ADDRESS =
  'Silicon Road, Palm n Dine Market, Agra - Mumbai Hwy, near Chika Chik Hotel, Indore, Madhya Pradesh 452012';
export const STORE_ADDRESS_SHORT = 'Silicon Road, Palm n Dine Market, Indore';

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
    id: 'offer-budget',
    title: '₹70 se ₹149 tak Har Budget ki Thali',
    description: 'Daily budget-friendly veg meals built for office, hostel, and home delivery.',
  },
];
