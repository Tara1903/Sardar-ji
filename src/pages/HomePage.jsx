import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  MessageCircleMore,
  Search,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { SkeletonGrid } from '../components/common/Loader';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { VisitUsSection } from '../components/home/VisitUsSection';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { ProductCard } from '../components/menu/ProductCard';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import {
  MONTHLY_SUBSCRIPTION_BENEFITS,
  MONTHLY_SUBSCRIPTION_PLAN_NAME,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../utils/subscription';
import { createGeneralOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import {
  STORE_AVERAGE_RATING,
  STORE_CITY,
  STORE_ORDER_SOCIAL_PROOF,
  sortProductsByCategoryAndPrice,
} from '../utils/catalog';

const scrollToCatalog = () => {
  document.getElementById('home-catalog')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

export const HomePage = () => {
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { items, itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const deferredSearch = useDeferredValue(search);
  const liveCartState = getCartOfferState(items, products, settings?.deliveryRules);
  const sections = appConfig.sections || {};
  const showHero = sections.hero !== false;
  const showCategories = sections.categories !== false;
  const showReviews = sections.reviews !== false;
  const showVisit = sections.visit !== false;
  const offerCards = appConfig.offers?.cards || settings?.offers || [];

  const filteredProducts = useMemo(() => {
    const searchable = sortProductsByCategoryAndPrice(
      products.filter((product) => product.isAvailable),
      appConfig.categories?.length ? appConfig.categories : categories,
    );

    return searchable.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) {
        return false;
      }

      if (!deferredSearch) {
        return true;
      }

      return `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());
    });
  }, [activeCategory, appConfig.categories, categories, deferredSearch, products]);

  const topFoldProducts = filteredProducts.slice(0, 4);
  const featuredProducts = filteredProducts.slice(0, 8);
  const heroConfig = appConfig.hero;
  const dynamicHeroLine = itemCount
    ? liveCartState.offerMessage
    : 'Add your favourites and unlock the best delivery reward automatically.';

  return (
    <PageTransition>
      {showHero ? (
        <section
          className="landing-stage premium-home-hero first-section"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(17, 24, 39, 0.82), rgba(17, 24, 39, 0.42)), url('${heroConfig.backgroundImage}')`,
          }}
        >
          <div className="container premium-home-grid">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="premium-home-copy"
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.36 }}
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

              <span className="offer-badge">{heroConfig.offerText}</span>
              <h1 className="premium-home-title">{heroConfig.headline}</h1>
              <p className="premium-home-subtitle">{heroConfig.subtext}</p>

              <label className="search-bar landing-search-bar premium-search-bar">
                <Search size={18} />
                <input
                  onChange={(event) => startTransition(() => setSearch(event.target.value))}
                  placeholder="Search Paneer, Thali..."
                  value={search}
                />
              </label>

              <p className="landing-dynamic-line">{dynamicHeroLine}</p>

              <div className="landing-actions">
                <button className="btn btn-primary" onClick={scrollToCatalog} type="button">
                  <ShoppingBag size={16} />
                  {heroConfig.primaryCta}
                </button>
                <Link className="btn btn-secondary" to="/menu">
                  {heroConfig.secondaryCta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="premium-home-sidecar"
              initial={{ opacity: 0, y: 24 }}
              transition={{ delay: 0.08, duration: 0.34 }}
            >
              <div className="premium-home-sidecar-card">
                <p className="eyebrow">Trending right now</p>
                <strong>{settings?.businessName || 'Sardar Ji Food Corner'}</strong>
                <p>Order homestyle thalis, parathas, chaat, snacks, and beverages in a few taps.</p>
                <Link className="btn btn-primary full-width" to="/my-subscription?checkout=1">
                  Buy Monthly Plan
                </Link>
                <a
                  className="btn btn-secondary full-width"
                  href={createWhatsAppLink(settings?.whatsappNumber, createGeneralOrderMessage())}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircleMore size={16} />
                  Order on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      ) : null}

      {showCategories ? (
        <section className={`section category-section ${showHero ? '' : 'first-section'}`.trim()}>
          <div className="container">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Browse by category</p>
                <h2>Pick the mood, then order fast</h2>
              </div>
            </div>

            <CategoryShowcase
              activeCategory={activeCategory}
              categories={appConfig.categories}
              onSelectCategory={setActiveCategory}
            />
          </div>
        </section>
      ) : null}

      <section className={`section top-picks-section ${!showHero && !showCategories ? 'first-section' : ''}`.trim()}>
        <div className="container">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Top food items</p>
              <h2>Best sellers customers add first</h2>
            </div>
            <span className="hero-chip">{topFoldProducts.length} quick picks</span>
          </div>

          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid quick-picks-grid">
              {topFoldProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  whatsappNumber={settings?.whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section storefront-section" id="home-catalog">
        <div className="container storefront-layout">
          <aside className="storefront-sidebar">
            <div className="panel-card storefront-sidebar-card">
              <p className="eyebrow">{appConfig.offers?.spotlightEyebrow || 'Today’s highlights'}</p>
              <h3>{appConfig.offers?.spotlightTitle || 'Offers and quick reassurance that help people order faster'}</h3>
              <div className="storefront-offer-stack">
                {offerCards.map((offer) => (
                  <div className="storefront-offer-row" key={offer.id}>
                    <strong>{offer.title}</strong>
                    <span>{offer.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="storefront-feed">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Menu spotlight</p>
                <h2>Freshly arranged for fast ordering</h2>
              </div>
              <Link className="text-link" to="/menu">
                Open full menu
              </Link>
            </div>

            {loading ? (
              <SkeletonGrid count={8} />
            ) : (
              <div className="grid storefront-grid">
                {featuredProducts.map((product) => (
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
            <div className="summary-line total">
              <span>Estimated total</span>
              <strong>{formatCurrency(liveCartState.total)}</strong>
            </div>
            <PromoBanner
              description={liveCartState.deliveryMessage}
              eyebrow="Live reward tracker"
              title={liveCartState.offerMessage}
              tone={
                liveCartState.freebieUnlocked || liveCartState.deliveryFee === 0 ? 'success' : 'warning'
              }
            />
            <Link className="btn btn-primary full-width" to={itemCount ? '/cart' : '/menu'}>
              {itemCount ? 'Open cart' : 'Start adding items'}
            </Link>
          </aside>
        </div>
      </section>

      <section className="section subscription-highlight-section">
        <div className="container">
          <div className="panel-card subscription-highlight-card">
            <div>
              <p className="eyebrow">Monthly Plan</p>
              <h2>{MONTHLY_SUBSCRIPTION_PLAN_NAME}</h2>
              <p>
                A dedicated monthly thali subscription for regular veg meals, tracked separately from your
                normal food orders.
              </p>
            </div>
            <div className="subscription-highlight-side">
              <strong>{formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)}</strong>
              <span>30-day plan</span>
            </div>
            <div className="subscription-benefit-list">
              {MONTHLY_SUBSCRIPTION_BENEFITS.map((benefit) => (
                <div className="subscription-benefit-row" key={benefit}>
                  <Star fill="currentColor" size={16} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="subscription-action-row">
              <Link className="btn btn-primary" to="/my-subscription?checkout=1">
                Subscribe Now
              </Link>
              <Link className="btn btn-secondary" to="/auth?redirect=%2Fmy-subscription%3Fcheckout%3D1">
                Login to Buy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showReviews ? <ReviewsSection /> : null}
      {showVisit ? <VisitUsSection /> : null}

      <div className="home-primary-cta">
        <button className="btn btn-primary home-primary-cta-button" onClick={scrollToCatalog} type="button">
          <ShoppingBag size={18} />
          {itemCount ? `Continue Order • ${formatCurrency(liveCartState.total)}` : 'Order Now'}
        </button>
      </div>
    </PageTransition>
  );
};
