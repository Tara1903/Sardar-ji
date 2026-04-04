import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bike,
  MapPin,
  MessageCircleMore,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { SkeletonGrid } from '../components/common/Loader';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { VisitUsSection } from '../components/home/VisitUsSection';
import { SmartImage } from '../components/common/SmartImage';
import { ProductCard } from '../components/menu/ProductCard';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import { createGeneralOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import {
  HERO_FILTERS,
  STORE_AVERAGE_RATING,
  STORE_CITY,
  STORE_ORDER_SOCIAL_PROOF,
  matchesHeroFilter,
  matchesSearchQuery,
  sortFeaturedProducts,
} from '../utils/catalog';
import {
  DELIVERY_RULE_BADGES,
  FREE_DELIVERY_THRESHOLD,
  SPECIAL_OFFER_TITLE,
  STORE_PRIMARY_HEADLINE,
  STORE_PRIMARY_SUBTEXT,
} from '../utils/storefront';

const scrollToCatalog = () => {
  document.getElementById('home-catalog')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

export const HomePage = () => {
  const { products, settings, loading } = useAppData();
  const { items, itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const deferredSearch = useDeferredValue(search);

  const liveCartState = getCartOfferState(items, products, settings?.deliveryRules);

  const visibleProducts = useMemo(() => {
    const availableProducts = sortFeaturedProducts(products.filter((product) => product.isAvailable));

    return availableProducts.filter(
      (product) =>
        matchesHeroFilter(product, activeFilter) && matchesSearchQuery(product, deferredSearch),
    );
  }, [activeFilter, deferredSearch, products]);

  const topFoldProducts = visibleProducts.slice(0, 4);
  const menuProducts = visibleProducts.slice(0, 8);
  const dynamicHeroLine = itemCount
    ? liveCartState.offerMessage
    : `Start with a thali, paneer favourite, or snack and unlock delivery rewards from ₹${FREE_DELIVERY_THRESHOLD}.`;

  return (
    <PageTransition>
      <section className="landing-stage first-section">
        <div className="container landing-stage-shell">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="landing-copy-column"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.34 }}
          >
            <div className="store-proof-row">
              <span className="store-proof-pill">
                <MapPin size={14} />
                {STORE_CITY}
              </span>
              <span className="store-proof-pill">
                <Star fill="currentColor" size={14} />
                {STORE_AVERAGE_RATING.toFixed(1)} | {STORE_ORDER_SOCIAL_PROOF}
              </span>
            </div>

            <p className="eyebrow">Fresh veg comfort food</p>
            <h1 className="landing-title">
              {STORE_PRIMARY_HEADLINE}
              <span>{STORE_PRIMARY_SUBTEXT}</span>
            </h1>

            <div className="landing-offer-strip">
              {DELIVERY_RULE_BADGES.map((badge) => (
                <span className="landing-offer-pill" key={badge}>
                  <Sparkles size={14} />
                  {badge}
                </span>
              ))}
            </div>

            <label className="search-bar landing-search-bar">
              <Search size={18} />
              <input
                onChange={(event) => startTransition(() => setSearch(event.target.value))}
                placeholder="Search Paneer, Thali..."
                value={search}
              />
            </label>

            <div className="category-scroll" role="tablist" aria-label="Quick menu filters">
              {HERO_FILTERS.map((filter) => (
                <button
                  className={`category-scroll-chip ${activeFilter === filter.id ? 'active' : ''}`}
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <p className="landing-dynamic-line">{dynamicHeroLine}</p>

            <div className="landing-actions">
              <button className="btn btn-primary" onClick={scrollToCatalog} type="button">
                <ShoppingBag size={16} />
                Order Now
              </button>
              <Link className="btn btn-secondary" to="/menu">
                View Menu
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="landing-poster"
            initial={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: 0.06, duration: 0.42 }}
          >
            <SmartImage
              alt="Fresh thali and Indian food from Sardar Ji Food Corner"
              className="landing-poster-image"
              loading="eager"
              src="https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=1400&q=80"
            />
            <div className="landing-poster-card primary">
              <strong>{SPECIAL_OFFER_TITLE}</strong>
              <span>Best for office lunch, dinner cravings, and quick family orders.</span>
            </div>
            <div className="landing-poster-card secondary">
              <Bike size={16} />
              <span>Hot meals, fast local delivery, smooth reorder flow.</span>
            </div>
          </motion.div>
        </div>

        <div className="container landing-quick-items">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Top picks right now</p>
                  <h2>See food before you scroll</h2>
                </div>
              </div>

              <div className="quick-products-row">
                {topFoldProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="compact"
                    whatsappNumber={settings?.whatsappNumber}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section storefront-section" id="home-catalog">
        <div className="container storefront-layout">
          <aside className="storefront-sidebar">
            <div className="panel-card storefront-sidebar-card">
              <p className="eyebrow">Why customers convert fast</p>
              <h3>Built for hungry people ordering on busy phones</h3>
              <ul className="storefront-bullet-list">
                <li>See offers instantly before browsing.</li>
                <li>Search, filter, and add items without leaving the flow.</li>
                <li>Move to cart or checkout with one obvious next step.</li>
              </ul>
            </div>

            <PromoBanner
              className="storefront-promo"
              description={dynamicHeroLine}
              eyebrow="Live reward tracker"
              title={SPECIAL_OFFER_TITLE}
              tone={itemCount ? 'warning' : 'accent'}
            />
          </aside>

          <div className="storefront-feed">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Order in seconds</p>
                <h2>Filtered for speed, built for repeat orders</h2>
              </div>
              <Link className="text-link" to="/menu">
                Open full menu
              </Link>
            </div>

            {loading ? (
              <SkeletonGrid count={8} />
            ) : (
              <div className="grid storefront-grid">
                {menuProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={settings?.whatsappNumber}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="summary-card sticky storefront-cart-panel">
            <div className="space-between">
              <h3>Your live order</h3>
              <span className="hero-chip">{itemCount} items</span>
            </div>
            <div className="summary-line">
              <span>Items total</span>
              <strong>{formatCurrency(liveCartState.subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>{liveCartState.deliveryFeeLabel}</span>
              <strong>{liveCartState.deliveryFee ? formatCurrency(liveCartState.deliveryFee) : 'FREE'}</strong>
            </div>
            {liveCartState.deliveryDiscount > 0 ? (
              <div className="summary-line summary-line-discount">
                <span>Delivery discount</span>
                <strong>-{formatCurrency(liveCartState.deliveryDiscount)}</strong>
              </div>
            ) : null}
            <div className="summary-line total">
              <span>Estimated total</span>
              <strong>{formatCurrency(liveCartState.total)}</strong>
            </div>
            <p
              className={`hint cart-offer-hint ${
                liveCartState.freebieUnlocked || liveCartState.deliveryFee === 0
                  ? 'is-success'
                  : 'is-warning'
              }`}
            >
              {liveCartState.offerMessage}
            </p>
            <Link className="btn btn-primary full-width" to={itemCount ? '/cart' : '/menu'}>
              {itemCount ? 'Open cart' : 'Start adding items'}
            </Link>
            <a
              className="btn btn-secondary full-width"
              href={createWhatsAppLink(settings?.whatsappNumber, createGeneralOrderMessage())}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircleMore size={16} />
              WhatsApp support
            </a>
          </aside>
        </div>
      </section>

      <ReviewsSection />
      <VisitUsSection />

      <div className="home-primary-cta">
        <button className="btn btn-primary home-primary-cta-button" onClick={scrollToCatalog} type="button">
          <ShoppingBag size={18} />
          {itemCount ? `Continue Order • ${formatCurrency(liveCartState.total)}` : 'Order Now'}
        </button>
      </div>
    </PageTransition>
  );
};
