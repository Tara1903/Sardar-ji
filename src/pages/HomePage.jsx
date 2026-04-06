import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
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
import { HeroCarousel, createHeroSlides } from '../components/home/HeroCarousel';
import { LocalSeoSection } from '../components/home/LocalSeoSection';
import { ProductCard } from '../components/menu/ProductCard';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
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
  createComboOffers,
  sortProductsByCategoryAndPrice,
} from '../utils/catalog';
import { trackWhatsAppClick } from '../utils/analytics';
import { createBreadcrumbSchema, createFaqSchema } from '../seo/siteSeo';

const scrollToCatalog = () => {
  document.getElementById('home-catalog')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

export const HomePage = () => {
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { addItemsToCart, items, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
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
  const comboOffers = useMemo(() => createComboOffers(products), [products]);
  const heroSlides = useMemo(
    () => createHeroSlides({ heroConfig: appConfig.hero, products: filteredProducts.slice(0, 4) }),
    [appConfig.hero, filteredProducts],
  );
  const heroConfig = appConfig.hero;
  const dynamicHeroLine = itemCount
    ? liveCartState.offerMessage
    : 'Add your favourites and unlock the best delivery reward automatically.';
  const faqItems = [
    {
      question: 'Do you offer tiffin service in Indore for daily orders?',
      answer:
        'Yes, Sardar Ji Food Corner serves local customers in Indore with daily pure veg meals, fast ordering, and a dedicated monthly thali option.',
    },
    {
      question: 'How does delivery pricing work on the website?',
      answer:
        'Delivery pricing updates automatically using cart total and store distance. Orders above ₹299 can unlock free or discounted delivery, and orders above ₹499 unlock free delivery plus a free mango juice.',
    },
    {
      question: 'Can I buy the monthly thali plan online?',
      answer:
        'Yes, the Monthly Thali subscription has its own page where customers can activate the plan and track validity inside their account.',
    },
  ];

  return (
    <PageTransition>
      <SeoMeta
        description="Affordable tiffin service in Indore with monthly thali plans, pure veg meals, and fast local food delivery from Sardar Ji Food Corner."
        includeLocalBusiness
        includeWebsiteSchema
        keywords={[
          'tiffin service in Indore',
          'monthly thali plan Indore',
          'food delivery in Indore',
          'affordable tiffin near me',
          'pure veg meals Indore',
        ]}
        path="/"
        schema={[
          createBreadcrumbSchema([{ name: 'Home', path: '/' }]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Tiffin Service in Indore | Monthly Thali Plan"
      />
      {showHero ? (
        <section className="landing-stage premium-home-hero first-section">
          <div className="container">
            <div className="store-proof-row hero-proof-row">
              <span className="pure-veg-badge store-proof-pill">
                <span className="pure-veg-dot" aria-hidden="true" />
                Pure Veg
              </span>
              <span className="store-proof-pill">
                <MapPin size={14} />
                {STORE_CITY}
              </span>
              <span className="store-proof-pill">
                <Star fill="currentColor" size={14} />
                {STORE_AVERAGE_RATING.toFixed(1)} | {STORE_ORDER_SOCIAL_PROOF}
              </span>
              <span className="store-proof-pill">
                <Clock3 size={14} />
                Avg 25-35 min
              </span>
            </div>

            <div className="home-hero-search-bar">
              <label className="search-bar landing-search-bar premium-search-bar">
                <Search size={18} />
                <input
                  onChange={(event) => startTransition(() => setSearch(event.target.value))}
                  placeholder="Search Paneer, Thali..."
                  value={search}
                />
              </label>
            </div>

            <HeroCarousel
              onPrimaryAction={scrollToCatalog}
              primaryLabel={heroConfig.primaryCta}
              secondaryLabel={heroConfig.secondaryCta}
              slides={heroSlides}
            />

            <div className="hero-support-grid">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="hero-support-card hero-support-offer"
                initial={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.34 }}
              >
                <p className="eyebrow">Live reward tracker</p>
                <strong>{dynamicHeroLine}</strong>
                <span>{heroConfig.offerText}</span>
              </motion.div>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="hero-support-card hero-support-cta"
                initial={{ opacity: 0, y: 14 }}
                transition={{ delay: 0.08, duration: 0.34 }}
              >
                <div>
                  <p className="eyebrow">Quick actions</p>
                  <strong>{settings?.businessName || 'Sardar Ji Food Corner'}</strong>
                  <span>Fast ordering, cart sync, and WhatsApp fallback in one flow.</span>
                </div>
                <div className="hero-support-actions">
                  <Link className="btn btn-primary" to="/my-subscription?checkout=1">
                    Buy Monthly Plan
                  </Link>
                  <a
                    className="btn btn-secondary"
                    href={createWhatsAppLink(settings?.whatsappNumber, createGeneralOrderMessage())}
                    onClick={() =>
                      trackWhatsAppClick({
                        source: 'home-hero',
                        label: 'general-order',
                      })
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircleMore size={16} />
                    Order on WhatsApp
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section offer-rail-section">
        <div className="container">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Swipeable offers</p>
              <h2>Rewards, reassurance, and fast decisions</h2>
            </div>
            <Link className="text-link" to="/menu">
              Explore menu
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="offer-rail">
            {offerCards.map((offer, index) => (
              <motion.article
                className={`offer-rail-card offer-rail-card-${(index % 3) + 1}`.trim()}
                initial={{ opacity: 0, y: 14 }}
                key={offer.id}
                transition={{ delay: index * 0.05, duration: 0.24 }}
                viewport={{ once: true, amount: 0.3 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="eyebrow">Offer {String(index + 1).padStart(2, '0')}</p>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

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

            {!isAuthenticated ? (
              <PromoBanner
                className="first-order-banner"
                description="Create an account, save your address faster, and place your first order in a few taps."
                eyebrow="First order perk"
                title="New here? Start with our best-selling veg meals today"
                tone="success"
              />
            ) : null}

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
                        Quick combo
                      </button>
                      <Link className="btn btn-secondary" to="/menu">
                        View menu
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
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

      <LocalSeoSection />
      {showReviews ? <ReviewsSection /> : null}
      {showVisit ? <VisitUsSection /> : null}

      {!itemCount ? (
        <div className="home-primary-cta">
          <button className="btn btn-primary home-primary-cta-button" onClick={scrollToCatalog} type="button">
            <ShoppingBag size={18} />
            Order Now
          </button>
        </div>
      ) : null}
    </PageTransition>
  );
};
