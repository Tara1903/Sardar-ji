export const STORE_AVERAGE_RATING = 4.3;
export const STORE_ORDER_SOCIAL_PROOF = '500+ orders';
export const STORE_CITY = 'Indore';

export const HERO_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'paneer', label: 'Paneer' },
  { id: 'thali', label: 'Thali' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'drinks', label: 'Drinks' },
];

const matchByText = (product, pattern) => pattern.test(`${product.name} ${product.description} ${product.category}`);

export const matchesHeroFilter = (product, filterId = 'all') => {
  if (filterId === 'all') {
    return true;
  }

  if (filterId === 'paneer') {
    return matchByText(product, /paneer/i);
  }

  if (filterId === 'thali') {
    return matchByText(product, /thali/i);
  }

  if (filterId === 'snacks') {
    return matchByText(product, /snack|chaat|momos|roll|chips|samosa|puff|puri|bhel/i);
  }

  if (filterId === 'drinks') {
    return matchByText(product, /lassi|chaach|juice|drink|beverage/i);
  }

  return true;
};

export const matchesSearchQuery = (product, search = '') => {
  const query = String(search || '').trim().toLowerCase();

  if (!query) {
    return true;
  }

  return `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
};

export const sortFeaturedProducts = (products = []) =>
  [...products].sort((left, right) => {
    if (Boolean(right.badge) !== Boolean(left.badge)) {
      return Number(Boolean(right.badge)) - Number(Boolean(left.badge));
    }

    return Number(left.price || 0) - Number(right.price || 0);
  });
