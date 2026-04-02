const { getFallbackImageByCategory } = require('./fallbackImages');
const { createId, createReferralCode, slugify } = require('./helpers');

const now = new Date().toISOString();

const categories = [
  {
    id: 'cat-thali-specials',
    name: 'Thali Specials',
    slug: 'thali-specials',
    description: 'Budget to premium thalis cooked fresh every day.',
    createdAt: now,
  },
  {
    id: 'cat-paratha-specials',
    name: 'Paratha Specials',
    slug: 'paratha-specials',
    description: 'Fresh parathas served with dahi and salad.',
    createdAt: now,
  },
  {
    id: 'cat-chaat-items',
    name: 'Chaat Items',
    slug: 'chaat-items',
    description: 'Tangy street-style chaats and snacks.',
    createdAt: now,
  },
  {
    id: 'cat-snacks-more',
    name: 'Snacks & More',
    slug: 'snacks-more',
    description: 'Fast bites for quick cravings.',
    createdAt: now,
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Cool drinks to complete the meal.',
    createdAt: now,
  },
];

const makeProduct = (name, price, description, category, badge = '') => ({
  id: `prod-${slugify(name)}`,
  name,
  price,
  description,
  category,
  image: getFallbackImageByCategory(category),
  badge,
  isAvailable: true,
  createdAt: now,
});

const products = [
  makeProduct(
    'Regular Thali',
    70,
    '5 Roti, Dal, Sabzi, Rice OR Dahi, Pyaz, Chutni, Achar',
    'Thali Specials',
    'Best Seller',
  ),
  makeProduct(
    'Premium Thali',
    99,
    '5 Roti, Rice, Dal, Paneer Sabzi, Dahi, Salad & Sweet',
    'Thali Specials',
    'Popular',
  ),
  makeProduct('Super Veg Thali', 149, '6 Roti, Paneer, Seasonal Sabzi, Sweet', 'Thali Specials', 'Popular'),
  makeProduct(
    'Monthly Plan',
    1560,
    '₹60 x 26 days, Daily changing sabzi, Rice + Dahi included',
    'Thali Specials',
    'New',
  ),
  makeProduct('Aloo Paratha', 50, 'Stuffed aloo paratha served with dahi + salad FREE.', 'Paratha Specials', 'Popular'),
  makeProduct('Gobi Pyaz Paratha', 60, 'Stuffed gobi and onion paratha served with dahi + salad FREE.', 'Paratha Specials'),
  makeProduct(
    'Paneer Pyaz Paratha',
    70,
    'Stuffed paneer and onion paratha served with dahi + salad FREE.',
    'Paratha Specials',
    'Best Seller',
  ),
  makeProduct('Mooli Paratha', 60, 'Fresh mooli paratha served with dahi + salad FREE.', 'Paratha Specials'),
  makeProduct('Sev Pyaz Paratha', 60, 'Sev and onion paratha served with dahi + salad FREE.', 'Paratha Specials'),
  makeProduct('Methi Pyaz Paratha', 60, 'Methi and onion paratha served with dahi + salad FREE.', 'Paratha Specials'),
  makeProduct('Mix Special Paratha', 60, 'Mixed masala paratha served with dahi + salad FREE.', 'Paratha Specials', 'New'),
  makeProduct('Pani Puri (6 pcs)', 25, 'Classic pani puri with spicy and sweet water.', 'Chaat Items', 'Best Seller'),
  makeProduct('Dahi Papdi Chaat', 50, 'Crisp papdi topped with chilled dahi and chutneys.', 'Chaat Items'),
  makeProduct('Dahi Vada Papdi', 80, 'Soft vada and papdi with creamy dahi and spices.', 'Chaat Items', 'Popular'),
  makeProduct('Sev Puri', 60, 'Crunchy sev puri with tangy chutney mix.', 'Chaat Items'),
  makeProduct('Dahi Puri', 60, 'Sweet-spicy dahi puri with fresh toppings.', 'Chaat Items'),
  makeProduct('Bhel Puri', 40, 'Street-style bhel puri with chutney toss.', 'Chaat Items'),
  makeProduct('Dry Fruit Bhel / Bhel Special', 70, 'Premium dry fruit bhel for a richer crunch.', 'Chaat Items', 'New'),
  makeProduct('Veg Steam Momos', 50, 'Steamed veg momos with chutney.', 'Snacks & More', 'Popular'),
  makeProduct('Veg Fry Momos', 60, 'Crispy fried momos with chutney.', 'Snacks & More'),
  makeProduct('Spring Roll', 50, 'Golden spring rolls with flavorful filling.', 'Snacks & More'),
  makeProduct('Finger Chips', 50, 'Crispy finger chips for quick snacking.', 'Snacks & More'),
  makeProduct('Paneer Samosa', 40, 'Paneer-loaded samosa with crunchy shell.', 'Snacks & More', 'Best Seller'),
  makeProduct('Veg Puff', 60, 'Flaky veg puff fresh from the oven.', 'Snacks & More'),
  makeProduct('Thandi Lassi', 50, 'Refreshing chilled lassi.', 'Beverages', 'Popular'),
  makeProduct('Chaach', 25, 'Cooling chaach to complete the meal.', 'Beverages'),
];

const users = [
  {
    id: createId('user'),
    name: 'Sardar Ji Admin',
    email: 'admin@sardarji.local',
    phoneNumber: '9999999999',
    password: 'Admin@123',
    role: 'admin',
    referralCode: createReferralCode('Sardar Ji Admin'),
    referralApplied: '',
    successfulReferrals: [],
    addresses: [],
    createdAt: now,
  },
  {
    id: createId('user'),
    name: 'Delivery Partner',
    email: 'delivery@sardarji.local',
    phoneNumber: '8888888888',
    password: 'Delivery@123',
    role: 'delivery',
    referralCode: createReferralCode('Delivery Partner'),
    referralApplied: '',
    successfulReferrals: [],
    addresses: [],
    createdAt: now,
  },
  {
    id: createId('user'),
    name: 'Happy Customer',
    email: 'customer@sardarji.local',
    phoneNumber: '7777777777',
    password: 'Customer@123',
    role: 'customer',
    referralCode: createReferralCode('Happy Customer'),
    referralApplied: '',
    successfulReferrals: [],
    addresses: [
      {
        id: createId('address'),
        name: 'Happy Customer',
        phoneNumber: '7777777777',
        fullAddress: 'Near Main Market, Bhopal',
        landmark: 'Opposite Bus Stand',
        pincode: '462001',
      },
    ],
    createdAt: now,
  },
];

const settings = {
  id: 'business-settings',
  businessName: 'Sardar Ji Food Corner',
  tagline: 'Swad Bhi, Budget Bhi',
  whatsappNumber: '919999999999',
  phoneNumber: '+91 99999 99999',
  timings: 'Morning to Night',
  mapsEmbedUrl: '',
  trustPoints: ['Fresh homestyle veg meals', 'Fast local delivery', 'Clear pricing and offers'],
  deliveryRules: {
    freeDeliveryThreshold: 299,
    deliveryFeeBelowThreshold: 30,
    handlingFeeBelowThreshold: 9,
    estimatedDeliveryMinutes: 35,
  },
  offers: [
    {
      id: 'offer-budget',
      title: '₹70 se ₹149 tak Har Budget ki Thali',
      description: 'Daily budget-friendly thalis for office, hostel, and family meals.',
    },
    {
      id: 'offer-delivery',
      title: '₹299 Order = FREE Delivery',
      description: 'Cross the free delivery threshold and the delivery fee drops to zero.',
    },
    {
      id: 'offer-referral',
      title: '6 Referral = 1 Month FREE',
      description: 'Invite friends and unlock free meals plus milestone rewards.',
    },
    {
      id: 'offer-double',
      title: 'Missed thali = next day double',
      description: 'If a confirmed thali is missed, the next day is covered double.',
    },
  ],
  createdAt: now,
  updatedAt: now,
};

module.exports = {
  seedData: {
    categories,
    orders: [],
    products,
    settings,
    users,
  },
};
