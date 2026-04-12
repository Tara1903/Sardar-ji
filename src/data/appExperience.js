import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  HandPlatter,
  IndianRupee,
  Leaf,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

const getSearchableText = (product = {}) =>
  `${product.name || ''} ${product.description || ''} ${product.category || ''} ${product.badge || ''}`.toLowerCase();

const matchProduct = (product, matcher) => {
  if (typeof matcher === 'function') {
    return matcher(product);
  }

  return matcher.test(getSearchableText(product));
};

const pickWithFallback = (products = [], matcher, count = 8) => {
  const matched = products.filter((product) => matchProduct(product, matcher));

  if (matched.length) {
    return matched.slice(0, count);
  }

  return products.slice(0, count);
};

export const APP_QUICK_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Veg Only' },
  { id: 'thali', label: 'Thali' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'combos', label: 'Combos' },
  { id: 'bestseller', label: 'Bestseller' },
  { id: 'special', label: "Today's Special" },
];

export const filterProductsByQuickChip = (products = [], chipId = 'all') => {
  if (!products.length || chipId === 'all' || chipId === 'veg') {
    return products;
  }

  const matchers = {
    thali: /thali|tiffin|meal/i,
    breakfast: /breakfast|poha|paratha|tea|chai|upma|idli/i,
    lunch: /lunch|thali|combo|meal|paneer|dal/i,
    dinner: /dinner|thali|combo|meal|paneer|sabzi/i,
    combos: /combo|family|meal/i,
    bestseller: (product) => /best|top|popular|trending/i.test(`${product.badge || ''} ${product.name || ''}`),
    special: (product) => /special|new|chef|today/i.test(`${product.badge || ''} ${product.name || ''}`),
  };

  const matcher = matchers[chipId];

  if (!matcher) {
    return products;
  }

  const matched = products.filter((product) => matchProduct(product, matcher));
  return matched.length ? matched : products;
};

export const buildHomeProductRails = (products = []) => {
  const availableProducts = products.filter((product) => product.isAvailable !== false);

  return [
    {
      id: 'best-sellers',
      eyebrow: 'Quick order',
      title: 'Best Sellers',
      description: 'The dishes customers usually add first.',
      items: pickWithFallback(
        availableProducts,
        (product) =>
          /best|popular|trending/i.test(`${product.badge || ''}`) || Number(product.price || 0) >= 120,
      ),
    },
    {
      id: 'todays-specials',
      eyebrow: 'Fresh today',
      title: "Today's Specials",
      description: 'Limited picks worth noticing right away.',
      items: pickWithFallback(
        availableProducts,
        (product) => /special|new|chef|today/i.test(`${product.badge || ''} ${product.name || ''}`),
      ),
    },
    {
      id: 'daily-plans',
      eyebrow: 'Daily meals',
      title: 'Daily Plans',
      description: 'Thali and tiffin picks for repeat ordering.',
      items: pickWithFallback(availableProducts, /thali|tiffin|meal/i),
    },
    {
      id: 'family-meals',
      eyebrow: 'Group friendly',
      title: 'Family Meals',
      description: 'Higher-value plates and combos for bigger appetites.',
      items: pickWithFallback(
        availableProducts,
        (product) => Number(product.price || 0) >= 180 || /family|combo|meal/i.test(getSearchableText(product)),
      ),
    },
    {
      id: 'budget-meals',
      eyebrow: 'Pocket friendly',
      title: 'Budget Meals',
      description: 'Fast, affordable choices under control.',
      items: pickWithFallback(
        availableProducts,
        (product) => Number(product.price || 0) <= 120,
      ),
    },
    {
      id: 'pure-veg-favorites',
      eyebrow: 'Always veg',
      title: 'Pure Veg Favorites',
      description: 'Reliable comfort food from the core catalog.',
      items: availableProducts.slice(0, 8),
    },
  ].filter((rail) => rail.items.length);
};

export const createCategoryGridItems = (categories = []) => [
  ...categories.map((category) => ({
    id: category.id || category.name,
    title: category.name,
    image: category.image,
    to: `/menu?category=${encodeURIComponent(category.name)}`,
    meta: 'Browse',
  })),
  {
    id: 'plans',
    title: 'Plans',
    image: '/brand-logo-light.png',
    to: '/my-subscription',
    meta: 'Monthly',
  },
];

export const APP_PLAN_CARDS = [
  {
    id: 'daily-meal-card',
    eyebrow: 'Daily plan',
    title: 'Daily meal rotation',
    description: 'Fast thali and tiffin picks when you just want to order again quickly.',
    ctaLabel: 'Browse daily meals',
    ctaTo: '/menu?chip=thali',
  },
  {
    id: 'combo-meal-card',
    eyebrow: 'Combo offer',
    title: 'Meals that feel complete',
    description: 'Pair mains, sides, and drinks without hunting through the whole menu.',
    ctaLabel: 'See combo-friendly dishes',
    ctaTo: '/menu?chip=combos',
  },
  {
    id: 'monthly-plan-card',
    eyebrow: 'Monthly plan',
    title: 'Subscribe to Monthly Thali',
    description: 'A dedicated 30-day meal plan with its own app-style purchase flow and status view.',
    ctaLabel: 'Open monthly plan',
    ctaTo: '/my-subscription?checkout=1',
  },
];

export const APP_TRUST_BADGES = [
  {
    id: 'freshly-prepared',
    title: 'Freshly Prepared',
    description: 'Cooked for real meal-time orders, not shelf time.',
    icon: HandPlatter,
  },
  {
    id: 'hygienic-packaging',
    title: 'Hygienic Packaging',
    description: 'Packed cleanly for travel-ready delivery.',
    icon: ShieldCheck,
  },
  {
    id: 'pure-veg',
    title: 'Pure Veg',
    description: 'Built around vegetarian comfort food only.',
    icon: Leaf,
  },
  {
    id: 'on-time',
    title: 'On-Time Delivery',
    description: 'Fast-moving local delivery flow for repeat customers.',
    icon: Clock3,
  },
  {
    id: 'affordable',
    title: 'Affordable Pricing',
    description: 'Budget-friendly picks stay easy to spot.',
    icon: IndianRupee,
  },
  {
    id: 'homemade-taste',
    title: 'Homemade Taste',
    description: 'Meal-first flavors that feel familiar and comforting.',
    icon: UtensilsCrossed,
  },
];

export const APP_HOME_VALUE_PILLS = [
  {
    id: 'pure-veg',
    label: 'Pure Veg',
    icon: Leaf,
  },
  {
    id: 'fresh',
    label: 'Fresh Daily',
    icon: Sparkles,
  },
  {
    id: 'trusted',
    label: 'Trusted Locally',
    icon: BadgeCheck,
  },
  {
    id: 'plans',
    label: 'Meal Plans',
    icon: CalendarDays,
  },
];
