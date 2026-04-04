import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Filter, MapPin, Search, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Loader';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { ProductCard } from '../components/menu/ProductCard';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import { useStoreDistance } from '../hooks/useStoreDistance';

const priceFilters = [
  { label: 'All prices', value: 'all' },
  { label: 'Under ₹100', value: 'under100' },
  { label: '₹100 to ₹300', value: '100to300' },
  { label: 'Above ₹300', value: 'above300' },
];

export const MenuPage = () => {
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { itemCount, items } = useCart();
  const { distanceKm, locationStatus, isLocating } = useStoreDistance();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const deferredSearch = useDeferredValue(search);
  const offersConfig = appConfig.offers || {};

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.isAvailable) {
        return false;
      }

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

      return true;
    });
  }, [activeCategory, deferredSearch, priceFilter, products]);

  const cartOfferState = getCartOfferState(items, products, settings?.deliveryRules, 0, distanceKm);

  return (
    <PageTransition>
      <section className="section first-section menu-page-shell">
        <div className="container menu-experience-layout">
          <aside className="panel-card menu-sidebar">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Find your meal</p>
                <h2>Search Paneer, Thali...</h2>
              </div>
            </div>

            <label className="search-bar landing-search-bar">
              <Search size={18} />
              <input
                onChange={(event) => startTransition(() => setSearch(event.target.value))}
                placeholder="Search Paneer, Thali..."
                value={search}
              />
            </label>

            <div className="menu-filter-block">
              <strong>Categories</strong>
              <CategoryShowcase
                activeCategory={activeCategory}
                categories={appConfig.categories}
                onSelectCategory={setActiveCategory}
              />
            </div>

            <div className="menu-filter-block">
              <strong>
                <Filter size={15} />
                Price filters
              </strong>
              <div className="menu-sidebar-list">
                {priceFilters.map((filter) => (
                  <button
                    className={`category-scroll-chip ${priceFilter === filter.value ? 'active' : ''}`}
                    key={filter.value}
                    onClick={() => setPriceFilter(filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="helper-note">
              <ShoppingBag size={16} />
              <span>100% veg menu with fast scanning and quick add buttons.</span>
            </div>
          </aside>

          <div className="menu-main-surface">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Browse the full menu</p>
                <h1>{appConfig.hero.offerText}</h1>
              </div>
              <span className="hero-chip">Veg only</span>
            </div>

            <PromoBanner
              className="menu-offer-banner"
              description={
                offersConfig.bannerDescription ||
                '₹299 = Free Delivery (≤5km) | ₹499 = Free Delivery + FREE Mango Juice 🥭'
              }
              eyebrow={offersConfig.bannerEyebrow || 'Offer of the day'}
              title={offersConfig.bannerTitle || appConfig.hero.offerText}
              tone="accent"
            />

            {loading ? (
              <SkeletonGrid count={8} />
            ) : filteredProducts.length ? (
              <div className="grid storefront-grid">
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

          <aside className="summary-card sticky menu-cart-panel">
            <div className="space-between">
              <h3>Sticky cart summary</h3>
              <span className="hero-chip">{itemCount} items</span>
            </div>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatCurrency(cartOfferState.subtotal)}</strong>
            </div>
            <div className="summary-line delivery-distance-line">
              <span>
                <MapPin size={14} />
                {isLocating ? 'Checking distance...' : locationStatus}
              </span>
              <strong>{distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'Manual'}</strong>
            </div>
            <div className="summary-line">
              <span>{cartOfferState.deliveryFeeLabel}</span>
              <strong>{cartOfferState.deliveryFee ? formatCurrency(cartOfferState.deliveryFee) : 'FREE'}</strong>
            </div>
            {cartOfferState.deliveryDiscount > 0 ? (
              <div className="summary-line summary-line-discount">
                <span>Delivery discount</span>
                <strong>-{formatCurrency(cartOfferState.deliveryDiscount)}</strong>
              </div>
            ) : null}
            <div className="summary-line total">
              <span>Current total</span>
              <strong>{formatCurrency(cartOfferState.total)}</strong>
            </div>
            <p
              className={`hint cart-offer-hint ${
                cartOfferState.notDeliverable
                  ? 'is-danger'
                  : cartOfferState.freebieUnlocked || cartOfferState.deliveryFee === 0
                    ? 'is-success'
                    : 'is-warning'
              }`}
            >
              {cartOfferState.offerMessage}
            </p>
            <Link className="btn btn-primary full-width" to={itemCount ? '/cart' : '/menu'}>
              {itemCount ? 'Open cart' : 'Add items to begin'}
            </Link>
          </aside>
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
