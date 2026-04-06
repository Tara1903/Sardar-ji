import { DEFAULT_PHONE_NUMBER } from '../utils/contact';
import {
  RESTAURANT_LOCATION,
  STORE_ADDRESS,
  STORE_ADDRESS_SHORT,
  STORE_OPENING_HOURS_SHORT,
  STORE_MAP_URL,
  resolveStoreTimings,
} from '../utils/storefront';

export const SITE_URL = 'https://www.sardarjifoodcorner.shop';
export const SITE_NAME = 'Sardar Ji Food Corner';
export const SITE_DEFAULT_TITLE = 'Tiffin Service in Indore | Monthly Thali Plan | Sardar Ji Food Corner';
export const SITE_DEFAULT_DESCRIPTION =
  'Affordable tiffin service in Indore with a monthly thali plan, pure veg meals, and fast local food delivery near Palm n Dine Market.';
export const SITE_DEFAULT_KEYWORDS = [
  'tiffin service in Indore',
  'monthly thali plan Indore',
  'food delivery in Indore',
  'affordable tiffin near me',
  'pure veg food delivery Indore',
  'Sardar Ji Food Corner',
  'Palm n Dine Market Indore food',
].join(', ');
export const SITE_OG_IMAGE = `${SITE_URL}/brand-logo-light.png`;
export const SITE_LOCATION_LABEL = 'Located in Indore near Palm n Dine Market';
export const GOOGLE_MAPS_COORDINATES = '22.6351768,75.835004';

const buildCanonicalUrl = (path = '/') => new URL(path, SITE_URL).toString();

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const createLocalBusinessSchema = (settings = {}) => ({
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Restaurant'],
  '@id': `${SITE_URL}#localbusiness`,
  name: settings.businessName || SITE_NAME,
  image: SITE_OG_IMAGE,
  url: SITE_URL,
  telephone: settings.phoneNumber || DEFAULT_PHONE_NUMBER,
  priceRange: '₹₹',
  menu: `${SITE_URL}/menu`,
  currenciesAccepted: 'INR',
  paymentAccepted: ['Cash', 'UPI', 'Online Payment'],
  description:
    'Pure veg tiffin service in Indore with daily food delivery, monthly thali plans, and affordable home-style meals.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: STORE_ADDRESS,
    addressLocality: 'Indore',
    addressRegion: 'Madhya Pradesh',
    postalCode: '452012',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: RESTAURANT_LOCATION.lat,
    longitude: RESTAURANT_LOCATION.lng,
  },
  areaServed: {
    '@type': 'City',
    name: 'Indore',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 4.3,
    reviewCount: 500,
    bestRating: 5,
    worstRating: 1,
  },
  hasMap: STORE_MAP_URL,
  openingHours: resolveStoreTimings(settings.timings || STORE_OPENING_HOURS_SHORT),
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: daysOfWeek,
      opens: '08:00',
      closes: '23:00',
    },
  ],
  servesCuisine: ['North Indian', 'Vegetarian', 'Tiffin Service'],
  sameAs: [
    settings?.storefront?.googleBusinessProfile?.reviewUrl,
    settings?.storefront?.googleBusinessProfile?.photosUrl,
    settings?.storefront?.googleBusinessProfile?.postsUrl,
    STORE_MAP_URL,
  ].filter(Boolean),
});

export const createWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/menu?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const createBreadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: buildCanonicalUrl(item.path),
  })),
});

export const createFaqSchema = (questions = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((entry) => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: entry.answer,
    },
  })),
});

export const getCanonicalUrl = buildCanonicalUrl;

export const createSeoTitle = (title) => (title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);
