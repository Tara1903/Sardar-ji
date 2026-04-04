import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Filter, Search, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Loader';
import { ProductCard } from '../components/menu/ProductCard';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import { SPECIAL_OFFER_TITLE } from '../utils/storefront';

const priceFilters = [
  { label: 'All prices', value: 'all' },
  { label: 'Under ₹100', value: 'under100' },
  { label: '₹100 to ₹300', value: '100to300' },
  { label: 'Above ₹300', value: 'above300' },
];

export const MenuPage = () => {
  const { products, categories, settings, loading } = useAppData();
  const { itemCount, items } = useCart();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const deferredSearch = useDeferredValue(search);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) {
        return false;
      }

      if (deferredSearch) {
        const haystack = `${product.name} ${product.description}`.toLowerCase();
        if (!haystack.includes(deferredSearch.toLowerCase())) {
          return false;
        }
      }

      if (priceFilter === 'under100' && product.price >= 100) {
        return false;
      }
      if (priceFilter === '100to300' && (product.price < 100 || product.price > 300)) {
        return false;
      }
      if (priceFilter === 'above300' && product.price <= 300) {
        return false;
      }

      return product.isAvailable;
    });
  }, [activeCategory, deferredSearch, priceFilter, products]);

  const cartOfferState = getCartOfferState(items, products, settings?.deliveryRules);

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse the menu</p>
              <h1>Search, filter, and order in seconds</h1>
            </div>
          </div>

          <PromoBanner
            className="menu-offer-banner"
            description="₹299 = Free Delivery (≤5km) | ₹499 = Free Delivery + FREE Mango Juice 🥭"
            eyebrow="Offer of the day"
            title={SPECIAL_OFFER_TITLE}
            tone="accent"
          />

          <div className="toolbar">
            <label className="search-bar">
              <Search size={18} />
              <input
                onChange={(event) => startTransition(() => setSearch(event.target.value))}
                placeholder="Search by item name"
                value={search}
              />
            </label>

            <div className="filter-row">
              <span className="filter-chip active">
                <Filter size={14} />
                Veg only
              </span>
              <div className="chip-row">
                <button
                  className={`filter-chip ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('All')}
                  type="button"
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    className={`filter-chip ${activeCategory === category.name ? 'active' : ''}`}
                    key={category.id}
                    onClick={() => setActiveCategory(category.name)}
                    type="button"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="chip-row">
              {priceFilters.map((filter) => (
                <button
                  className={`filter-chip ${priceFilter === filter.value ? 'active' : ''}`}
                  key={filter.value}
                  onClick={() => setPriceFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : filteredProducts.length ? (
            <div className="grid cards-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} whatsappNumber={settings?.whatsappNumber} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No items found"
              description="Try another search term or reset the category and price filters."
            />
          )}
        </div>
      </section>

      {itemCount ? (
        <div className="mobile-order-bar">
          <div>
            <strong>{itemCount} items in cart</strong>
            <span>{formatCurrency(cartOfferState.total)}</span>
            <small>{cartOfferState.offerMessage}</small>
          </div>
          <Link className="btn btn-primary" to="/cart">
            <ShoppingBag size={16} />
            View cart
          </Link>
        </div>
      ) : null}
    </PageTransition>
  );
};
