import { getFallbackImage } from '../data/fallbackImages';
import { DEFAULT_OFFERS, SPECIAL_OFFER_SUBTITLE, SPECIAL_OFFER_TITLE } from '../utils/storefront';

export const designTokens = {
  colors: {
    primary: '#e23744',
    secondary: '#16a34a',
    background: '#f8fafc',
    card: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    highlight: '#facc15',
  },
  typography: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  radii: {
    sm: '16px',
    md: '18px',
    lg: '20px',
    xl: '28px',
    pill: '999px',
  },
  spacing: 8,
  shadows: {
    soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
    medium: '0 22px 50px rgba(15, 23, 42, 0.12)',
  },
};

export const defaultHeroConfig = {
  headline: 'Hot, Fresh & Delicious Food Delivered Fast',
  subtext: 'Enjoy premium taste from Sardar Ji Food Corner',
  offerText: '₹299 = Free Delivery | ₹499 = Free Delivery + Free 🥭',
  backgroundImage:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80',
  primaryCta: 'Order Now',
  secondaryCta: 'View Menu',
};

export const defaultPopupConfig = {
  enabled: true,
  title: '🔥 Special Offer',
  subtitle: '₹299 = Free Delivery (≤5km)',
  body: '₹499 = Free Delivery + FREE Mango Juice 🥭',
  note: 'Stay above the threshold that fits your order and we apply the best reward automatically.',
  primaryCta: 'Order Now',
  secondaryCta: 'Maybe Later',
  delayMs: 5000,
};

export const defaultOffersConfig = {
  spotlightEyebrow: 'Today’s highlights',
  spotlightTitle: 'Offers and quick reassurance that help people order faster',
  bannerEyebrow: 'Offer of the day',
  bannerTitle: SPECIAL_OFFER_TITLE,
  bannerDescription: SPECIAL_OFFER_SUBTITLE,
  cardTitle299: '₹299 = Free Delivery (≤5km)',
  cardDescription299: 'Stay above ₹299 and we waive delivery charges within 5 km of the store.',
  cardTitle499: '₹499 = Free Delivery + FREE Mango Juice 🥭',
  cardDescription499:
    'Cross ₹499 and your order unlocks both free delivery and a complimentary mango juice.',
  deliveryMessage: 'Delivery pricing updates automatically with distance and cart value.',
};

export const defaultSectionVisibility = {
  hero: true,
  categories: true,
  reviews: true,
  popup: true,
  visit: true,
};

export const defaultReviews = [
  {
    id: 'review-fast',
    author: 'Neha S.',
    quote: 'Amazing food and fast delivery!',
    rating: 5,
  },
  {
    id: 'review-taste',
    author: 'Amit R.',
    quote: 'Best taste in town!',
    rating: 5,
  },
  {
    id: 'review-offer',
    author: 'Pooja M.',
    quote: 'Loved the mango juice offer!',
    rating: 5,
  },
];

export const defaultStorefrontConfig = {
  theme: {
    ...designTokens.colors,
  },
  logoUrl: '/brand-logo-light.png',
  logoLightUrl: '/brand-logo-light.png',
  logoDarkUrl: '/brand-logo-dark.png',
  hero: defaultHeroConfig,
  offers: defaultOffersConfig,
  popup: defaultPopupConfig,
  reviews: defaultReviews,
  sections: defaultSectionVisibility,
  categoryImages: {},
  productAvailabilitySchedules: {},
  productAddonGroups: {},
  comboOffers: [],
  googleBusinessProfile: {
    menuUrl: '/menu',
    orderUrl: '/menu',
    photosUrl: '',
    postsUrl: '',
    reviewUrl: '',
  },
};

const clamp = (value) => Math.max(0, Math.min(255, value));

const hexToRgb = (hex = '') => {
  const normalized = String(hex).trim().replace('#', '');

  if (![3, 6].includes(normalized.length)) {
    return null;
  }

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalized;

  const parsed = Number.parseInt(expanded, 16);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const rgba = (hex, alpha) => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return `rgba(17, 24, 39, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const darkenHex = (hex, factor = 0.14) => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return hex;
  }

  const channel = (value) => clamp(Math.round(value * (1 - factor)));

  return `#${[channel(rgb.r), channel(rgb.g), channel(rgb.b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
};

const mixHex = (sourceHex, targetHex, weight = 0.5) => {
  const source = hexToRgb(sourceHex);
  const target = hexToRgb(targetHex);

  if (!source || !target) {
    return sourceHex;
  }

  const mix = (from, to) => clamp(Math.round(from * (1 - weight) + to * weight));

  return `#${[mix(source.r, target.r), mix(source.g, target.g), mix(source.b, target.b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
};

const lightenHex = (hex, factor = 0.14) => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return hex;
  }

  const channel = (value) => clamp(Math.round(value + (255 - value) * factor));

  return `#${[channel(rgb.r), channel(rgb.g), channel(rgb.b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
};

const createDarkPalette = (theme) => ({
  background: mixHex(theme.background, '#0b120f', 0.88),
  card: mixHex(theme.card, '#131d19', 0.9),
  textPrimary: '#f4f7f2',
  textSecondary: '#a8b4aa',
  line: 'rgba(244, 247, 242, 0.12)',
  primary: lightenHex(theme.primary, 0.08),
  primaryStrong: lightenHex(darkenHex(theme.primary, 0.1), 0.04),
  secondary: lightenHex(theme.secondary, 0.08),
  highlight: lightenHex(theme.highlight, 0.02),
});

export const mergeTheme = (theme = {}) => ({
  ...designTokens.colors,
  ...(theme || {}),
});

export const mergeStorefrontConfig = (storefront = {}) => {
  const mergedTheme = mergeTheme(storefront.theme);
  const legacyLogoUrl = storefront.logoUrl || defaultStorefrontConfig.logoUrl;
  const useThemeSpecificDefaults =
    !storefront.logoLightUrl &&
    !storefront.logoDarkUrl &&
    (!storefront.logoUrl || storefront.logoUrl === '/brand-logo.png');

  return {
    theme: mergedTheme,
    logoUrl: legacyLogoUrl,
    logoLightUrl:
      storefront.logoLightUrl ||
      (useThemeSpecificDefaults ? defaultStorefrontConfig.logoLightUrl : legacyLogoUrl),
    logoDarkUrl:
      storefront.logoDarkUrl ||
      (useThemeSpecificDefaults ? defaultStorefrontConfig.logoDarkUrl : legacyLogoUrl),
    hero: {
      ...defaultHeroConfig,
      ...(storefront.hero || {}),
    },
    offers: {
      ...defaultOffersConfig,
      ...(storefront.offers || {}),
    },
    popup: {
      ...defaultPopupConfig,
      ...(storefront.popup || {}),
    },
    reviews:
      storefront.reviews?.length
        ? storefront.reviews.map((review, index) => ({
            id: review.id || `review-${index + 1}`,
            author: review.author || `Customer ${index + 1}`,
            quote: review.quote || '',
            rating: Number(review.rating || 5),
          }))
        : defaultReviews,
    sections: {
      ...defaultSectionVisibility,
      ...(storefront.sections || {}),
    },
    categoryImages: storefront.categoryImages || {},
    productAvailabilitySchedules: storefront.productAvailabilitySchedules || {},
    productAddonGroups: storefront.productAddonGroups || {},
    comboOffers: Array.isArray(storefront.comboOffers) ? storefront.comboOffers : [],
    googleBusinessProfile: {
      ...defaultStorefrontConfig.googleBusinessProfile,
      ...(storefront.googleBusinessProfile || {}),
    },
  };
};

export const getThemeCssVariables = (theme = designTokens.colors) => {
  const mergedTheme = mergeTheme(theme);
  const darkTheme = createDarkPalette(mergedTheme);

  return {
    '--theme-bg-light': mergedTheme.background,
    '--theme-surface-light': mergedTheme.card,
    '--theme-surface-muted-light': rgba(mergedTheme.primary, 0.06),
    '--theme-surface-strong-light': mergedTheme.textPrimary,
    '--theme-text-light': mergedTheme.textPrimary,
    '--theme-muted-light': mergedTheme.textSecondary,
    '--theme-line-light': rgba(mergedTheme.textPrimary, 0.08),
    '--theme-brand-light': mergedTheme.primary,
    '--theme-brand-strong-light': darkenHex(mergedTheme.primary),
    '--theme-brand-secondary-light': mergedTheme.secondary,
    '--theme-accent-light': mergedTheme.highlight,
    '--theme-accent-soft-light': rgba(mergedTheme.highlight, 0.18),
    '--theme-danger-light': '#b91c1c',
    '--theme-bg-dark': darkTheme.background,
    '--theme-surface-dark': darkTheme.card,
    '--theme-surface-muted-dark': rgba(mergedTheme.primary, 0.18),
    '--theme-surface-strong-dark': darkTheme.textPrimary,
    '--theme-text-dark': darkTheme.textPrimary,
    '--theme-muted-dark': darkTheme.textSecondary,
    '--theme-line-dark': darkTheme.line,
    '--theme-brand-dark': darkTheme.primary,
    '--theme-brand-strong-dark': darkTheme.primaryStrong,
    '--theme-brand-secondary-dark': darkTheme.secondary,
    '--theme-accent-dark': darkTheme.highlight,
    '--theme-accent-soft-dark': rgba(darkTheme.highlight, 0.24),
    '--theme-danger-dark': '#f87171',
    '--shadow': designTokens.shadows.medium,
    '--shadow-soft': designTokens.shadows.soft,
    '--radius-xl': designTokens.radii.xl,
    '--radius-lg': designTokens.radii.lg,
    '--radius-md': designTokens.radii.md,
    '--radius-sm': designTokens.radii.sm,
    '--font-heading': designTokens.typography.heading,
    '--font-body': designTokens.typography.body,
  };
};

export const applyThemeToDocument = (theme = designTokens.colors) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const variables = getThemeCssVariables(theme);

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export const getCategoryImage = (category, storefront = defaultStorefrontConfig) => {
  const lookupKeys = [category?.id, category?.slug, category?.name]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const matchedKey = lookupKeys.find((key) => storefront.categoryImages?.[key]);

  return storefront.categoryImages?.[matchedKey] || getFallbackImage(category?.name);
};

export const createAppConfig = ({ categories = [], products = [], settings = null }) => {
  const storefront = mergeStorefrontConfig(settings?.storefront);
  const cards =
    settings?.offers?.length
      ? settings.offers
      : [
          {
            id: 'offer-delivery-299',
            title: storefront.offers.cardTitle299,
            description: storefront.offers.cardDescription299,
          },
          {
            id: 'offer-delivery-499',
            title: storefront.offers.cardTitle499,
            description: storefront.offers.cardDescription499,
          },
          {
            id: 'offer-delivery-note',
            title: 'Delivery updates',
            description: storefront.offers.deliveryMessage,
          },
          ...DEFAULT_OFFERS.slice(2),
        ];

  return {
    theme: storefront.theme,
    logoUrl: storefront.logoUrl,
    logoLightUrl: storefront.logoLightUrl,
    logoDarkUrl: storefront.logoDarkUrl,
    hero: storefront.hero,
    offers: {
      ...storefront.offers,
      cards,
    },
    categories: categories.map((category) => ({
      ...category,
      image: getCategoryImage(category, storefront),
    })),
    menu: products,
    popup: storefront.popup,
    reviews: storefront.reviews,
    sections: storefront.sections,
    productAddonGroups: storefront.productAddonGroups,
    comboOffers: storefront.comboOffers,
    googleBusinessProfile: storefront.googleBusinessProfile,
  };
};

export const createPopupStorageKey = (popup = defaultPopupConfig) => {
  const seed = `${popup.title || ''}-${popup.subtitle || ''}-${popup.body || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `sjfc-popup-${seed || 'default'}`;
};
