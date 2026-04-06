import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Search, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Loader';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { ProductCard } from '../components/menu/ProductCard';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { createComboOffers, sortProductsByCategoryAndPrice } from '../utils/catalog';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import { useStoreDistance } from '../hooks/useStoreDistance';
import { createBreadcrumbSchema, createFaqSchema } from '../seo/siteSeo';
import { STAGGER_CONTAINER_VARIANTS } from '../motion/variants';

const priceFilters = [
  { label: 'All prices', value: 'all' },
  { label: 'Under ₹100', value: 'under100' },
  { label: '₹100 to ₹300', value: '100to300' },
  { label: 'Above ₹300', value: 'above300' },
];

export const MenuPage = () => {
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { isAuthenticated } = useAuth();
  const { addItemsToCart, itemCount, items } = useCart();
  const { distanceKm, locationStatus, isLocating } = useStoreDistance();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const deferredSearch = useDeferredValue(search);
  const offersConfig = appConfig.offers || {};
  const comboOffers = useMemo(() => createComboOffers(products), [products]);
  const faqItems = [
    {
      question: 'Is the full menu pure veg?',
      answer:
        'Yes, the menu is organized as a pure veg food delivery menu for Indore customers, including thalis, parathas, snacks, and beverages.',
    },
    {
      question: 'Can I get free delivery in Indore?',
      answer:
        'Orders above ₹299 can unlock free or discounted delivery depending on your distance, and orders above ₹499 unlock free delivery plus a free mango juice.',
    },
    {
      question: 'Can I order on WhatsApp if I do not want to finish checkout online?',
      answer:
        'Yes, every major order flow includes a WhatsApp fallback so customers can continue ordering even if they prefer chat support.',
    },
  ];

  const filteredProducts = useMemo(() => {
    const matchingProducts = products.filter((product) => {
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

    return sortProductsByCategoryAndPrice(
      matchingProducts,
      appConfig.categories?.length ? appConfig.categories : categories,
    );
  }, [activeCategory, appConfig.categories, categories, deferredSearch, priceFilter, products]);

  const cartOfferState = getCartOfferState(items, products, settings?.deliveryRules, 0, distanceKm);

  return (
    <PageTransition>
      <SeoMeta
        description="Browse the pure veg menu from Sardar Ji Food Corner for food delivery in Indore, thalis, parathas, snacks, drinks, and quick ordering."
        includeLocalBusiness
        keywords={[
          'food delivery in Indore',
          'veg menu Indore',
          'tiffin service menu Indore',
          'pure veg food delivery Indore',
        ]}
        path="/menu"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Menu', path: '/menu' },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Food Delivery Menu in Indore"
      />
      <section className="section first-section menu-page-shell">
        <div className="container menu-experience-layout">
          <aside className="panel-card menu-sidebar">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Browse with ease</p>
                <h2>Categories & filters</h2>
                <p className="menu-sidebar-intro">
                  Narrow down the menu quickly, then use the featured search banner to jump to your
                  next craving.
                </p>
              </div>
            </div>

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
                <h1>Pure Veg Food Delivery Menu in Indore</h1>
                <p className="section-heading-note">
                  Fresh thalis, parathas, snacks, and drinks from Sardar Ji Food Corner.
                </p>
              </div>
              <span className="hero-chip">Veg only</span>
            </div>

            <PromoBanner
              actions={
                <>
                  <Link className="btn btn-primary" to="/my-subscription?checkout=1">
                    Buy Monthly Plan
                  </Link>
                  <Link className="btn btn-secondary" to="/tiffin-service-indore">
                    Tiffin service in Indore
                  </Link>
                </>
              }
              className="menu-offer-banner"
              description={
                offersConfig.bannerDescription ||
                '₹299 = Free Delivery (≤5km) | ₹499 = Free Delivery + FREE Mango Juice 🥭'
              }
              eyebrow={offersConfig.bannerEyebrow || 'Offer of the day'}
              extraContent={
                <div className="promo-banner-search-wrap">
                  <label className="search-bar promo-banner-search-bar">
                    <Search size={18} />
                    <input
                      onChange={(event) => startTransition(() => setSearch(event.target.value))}
                      placeholder="Search Paneer, Thali..."
                      value={search}
                    />
                  </label>
                  <div className="promo-banner-search-meta">
                    <span className="promo-banner-search-chip">{filteredProducts.length} dishes visible</span>
                    <span className="promo-banner-search-chip">
                      {activeCategory === 'All' ? 'All categories' : activeCategory}
                    </span>
                  </div>
                </div>
              }
              title={offersConfig.bannerTitle || appConfig.hero.offerText}
              tone="accent"
            />

            {!isAuthenticated ? (
              <PromoBanner
                className="first-order-banner"
                description="Create an account once, save your address, and make repeat orders much faster from cart, checkout, and WhatsApp."
                eyebrow="First order perk"
                title="New customer? Start with our fastest-moving veg dishes"
                tone="success"
              />
            ) : null}

            {loading ? (
              <SkeletonGrid count={8} />
            ) : filteredProducts.length ? (
              <motion.div
                animate="show"
                className="grid storefront-grid"
                initial="hidden"
                variants={STAGGER_CONTAINER_VARIANTS}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    motionIndex={index}
                    product={product}
                    whatsappNumber={settings?.whatsappNumber}
                  />
                ))}
              </motion.div>
            ) : (
              <EmptyState
                title="No items found"
                description="Try another search term or reset the category and price filters."
              />
            )}

            {comboOffers.length ? (
              <div className="combo-offer-grid">
                {comboOffers.map((combo) => (
                  <article className="panel-card combo-offer-card" key={combo.id}>
                    <p className="eyebrow">Combo pick</p>
                    <h3>{combo.title}</h3>
                    <p>{combo.description}</p>
                    <strong>{formatCurrency(combo.total)}</strong>
                    <div className="subscription-action-row">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          addItemsToCart(
                            combo.items.map((item) => ({
                              ...item,
                              quantity: 1,
                            })),
                          )
                        }
                        type="button"
                      >
                        Add combo
                      </button>
                      <Link className="btn btn-secondary" to="/cart">
                        Open cart
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
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

    </PageTransition>
  );
};
