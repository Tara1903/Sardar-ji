import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock3, Download, History, MapPin, ShoppingBag, Smartphone, Star, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedProductsGrid } from '../components/home/FeaturedProductsGrid';
import { HeroCarousel, createHeroSlides } from '../components/home/HeroCarousel';
import { HorizontalProductRow } from '../components/home/HorizontalProductRow';
import { QuickChips } from '../components/home/QuickChips';
import { TrustBadges } from '../components/home/TrustBadges';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { createCategoryGridItems, APP_HOME_VALUE_PILLS, APP_PLAN_CARDS, APP_QUICK_CHIPS, APP_TRUST_BADGES, buildHomeProductRails, filterProductsByQuickChip } from '../data/appExperience';
import { isNativeAppShell } from '../lib/nativeApp';
import { triggerNativeHaptic } from '../lib/nativeFeatures';
import { trackAppDownloadClick } from '../utils/analytics';
import {
  APP_DOWNLOAD_FILE_NAME,
  APP_DOWNLOAD_LABEL,
  APP_DOWNLOAD_PAGE_PATH,
  APP_DOWNLOAD_SUPPORT_NOTE,
  APP_LATEST_VERSION,
  APP_RELEASE_DATE,
  getAppDownloadUrl,
} from '../utils/appDownload';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import {
  MONTHLY_SUBSCRIPTION_PLAN_NAME,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../utils/subscription';
import {
  STORE_AVERAGE_RATING,
  STORE_CITY,
  STORE_ORDER_SOCIAL_PROOF,
  sortProductsByCategoryAndPrice,
} from '../utils/catalog';
import { createBreadcrumbSchema, createFaqSchema } from '../seo/siteSeo';

const ACTIVE_ORDER_STATUSES = new Set([
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'On the way',
  'Out for Delivery',
]);

const readProfileSnapshot = (userId) => {
  if (typeof window === 'undefined' || !userId) {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(`sjfc-profile-cache:${userId}`) || 'null');
  } catch {
    return null;
  }
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { user } = useAuth();
  const { items, itemCount, addItemsToCart } = useCart();
  const [activeChip, setActiveChip] = useState('all');
  const nativeAppShell = isNativeAppShell();
  const liveCartState = getCartOfferState(items, products, settings?.deliveryRules);
  const heroConfig = appConfig.hero;
  const heroMedia = appConfig.heroMedia || {};
  const premiumCopy = appConfig.copy || {};
  const railCategories = appConfig.categories?.length ? appConfig.categories : categories;
  const profileSnapshot = useMemo(() => readProfileSnapshot(user?.id), [user?.id]);
  const availableProducts = useMemo(
    () =>
      sortProductsByCategoryAndPrice(
        products.filter((product) => product.isAvailable),
        railCategories,
      ),
    [products, railCategories],
  );
  const chipFilteredProducts = useMemo(
    () => filterProductsByQuickChip(availableProducts, activeChip),
    [activeChip, availableProducts],
  );
  const featuredProducts = chipFilteredProducts.slice(0, 4);
  const heroSlides = useMemo(
    () =>
      createHeroSlides({
        heroConfig,
        heroMedia,
        copy: premiumCopy,
        products: availableProducts.slice(0, 4),
      }),
    [availableProducts, heroConfig, heroMedia, premiumCopy],
  );
  const productRails = useMemo(
    () => buildHomeProductRails(chipFilteredProducts).slice(0, 3),
    [chipFilteredProducts],
  );
  const categoryGridItems = useMemo(
    () => createCategoryGridItems(railCategories.slice(0, 9)),
    [railCategories],
  );
  const offerCards = (appConfig.offers?.cards || settings?.offers || []).slice(0, 3);
  const latestOrder = profileSnapshot?.orders?.[0] || null;
  const activeOrder =
    profileSnapshot?.orders?.find((order) => ACTIVE_ORDER_STATUSES.has(order.status)) || null;
  const businessName = settings?.businessName || 'Sardar Ji Food Corner';
  const appDownloadUrl = getAppDownloadUrl();
  const activeSubscription =
    profileSnapshot?.subscription?.status === 'active' &&
    Number(profileSnapshot?.subscription?.daysLeft || 0) > 0;
  const faqItems = [
    {
      question: 'Can I order food quickly from the home screen?',
      answer:
        'Yes, the home screen brings featured dishes, categories, quick filters, and fast add-to-cart actions right into the first browsing flow.',
    },
    {
      question: 'Do you offer monthly meal plans in Indore?',
      answer:
        'Yes, the Monthly Thali plan has its own dedicated purchase flow and profile tracking, separate from regular menu items.',
    },
    {
      question: 'Is the menu pure veg?',
      answer:
        'Yes, Sardar Ji Food Corner is positioned as a pure veg ordering experience with thalis, snacks, drinks, and meal plans.',
    },
  ];

  const handleQuickReorder = () => {
    if (!latestOrder) {
      navigate('/menu');
      return;
    }

    const nextItems = (latestOrder.items || [])
      .filter((item) => !item.isFreebie)
      .map((item) => {
        const matchedProduct = products.find((product) => product.id === item.id || product.name === item.name);

        return {
          ...(matchedProduct || item),
          ...item,
          image: matchedProduct?.image || item.image,
          category: matchedProduct?.category || item.category,
          quantity: item.quantity || 1,
        };
      });

    if (!nextItems.length) {
      navigate('/menu');
      return;
    }

    addItemsToCart(nextItems, { replace: true });
    void triggerNativeHaptic('success');
    navigate('/cart');
  };

  if (nativeAppShell) {
    return (
      <PageTransition>
        <SeoMeta
          description="Order pure veg meals, thalis, combos, and monthly plans from Sardar Ji Food Corner with an app-like food ordering experience in Indore."
          includeLocalBusiness
          includeWebsiteSchema
          keywords={[
            'tiffin service in Indore',
            'monthly thali plan Indore',
            'food delivery in Indore',
            'pure veg meals Indore',
            'food ordering app Indore',
          ]}
          path="/"
          schema={[
            createBreadcrumbSchema([{ name: 'Home', path: '/' }]),
            createFaqSchema(faqItems),
          ]}
          settings={settings}
          title="Order Pure Veg Food in Indore | Sardar Ji Food Corner"
        />

        <section className="section first-section native-home-screen">
          <div className="container native-screen-stack">
            <div className="native-screen-hero">
              <div>
                <p className="eyebrow">Order fast</p>
                <h1>Food first, browsing first, checkout in a few taps.</h1>
              </div>
              <div className="native-screen-hero-meta">
                <span className="hero-chip">
                  <MapPin size={14} />
                  {STORE_CITY}
                </span>
                <span className="hero-chip">
                  <Star fill="currentColor" size={14} />
                  {STORE_AVERAGE_RATING.toFixed(1)} • {STORE_ORDER_SOCIAL_PROOF}
                </span>
                <span className="hero-chip">
                  <Clock3 size={14} />
                  Avg 25-35 min
                </span>
              </div>
            </div>

            <HeroCarousel onPrimaryAction={() => navigate('/menu')} primaryLabel="Order Now" slides={heroSlides} />

            <div className="native-home-summary-grid">
              <article className="native-home-summary-card">
                <p className="eyebrow">Cart</p>
                <h3>
                  {itemCount
                    ? `${itemCount} item${itemCount > 1 ? 's' : ''} ready`
                    : 'Start with quick picks'}
                </h3>
                <p>
                  {itemCount
                    ? `${liveCartState.offerMessage} Total ${formatCurrency(liveCartState.total)}.`
                    : 'Jump into best sellers, daily plans, and category shortcuts immediately.'}
                </p>
                <Link className="btn btn-primary" to={itemCount ? '/cart' : '/menu'}>
                  {itemCount ? 'Open cart' : 'Browse menu'}
                </Link>
              </article>

              <article className="native-home-summary-card is-highlighted">
                <p className="eyebrow">Plans</p>
                <h3>
                  {activeSubscription
                    ? `${profileSnapshot.subscription.daysLeft} days left`
                    : MONTHLY_SUBSCRIPTION_PLAN_NAME}
                </h3>
                <p>
                  {activeSubscription
                    ? 'Your monthly plan is active. Open it to pause, skip, or review delivery days.'
                    : `Meal planning starts at ${formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)} with a dedicated flow.`}
                </p>
                <Link className="btn btn-secondary" to="/my-subscription">
                  <CalendarDays size={16} />
                  {activeSubscription ? 'Open plan' : 'Explore plans'}
                </Link>
              </article>

              <article className="native-home-summary-card">
                <p className="eyebrow">{activeOrder ? 'Live order' : 'Reorder fast'}</p>
                <h3>
                  {activeOrder
                    ? `${activeOrder.orderNumber} is ${activeOrder.status}`
                    : latestOrder
                      ? latestOrder.orderNumber
                      : 'Your next meal shortcut'}
                </h3>
                <p>
                  {activeOrder
                    ? 'Jump straight back into live tracking, ETA, and delivery progress.'
                    : latestOrder
                      ? 'Bring your last order back into the cart without rebuilding it manually.'
                      : 'Once you order, we will keep active tracking and quick reorder access here.'}
                </p>
                {activeOrder ? (
                  <Link className="btn btn-secondary" to={`/track/${activeOrder.id}`}>
                    <Truck size={16} />
                    Track live
                  </Link>
                ) : (
                  <button className="btn btn-secondary" onClick={handleQuickReorder} type="button">
                    <History size={16} />
                    {latestOrder ? 'Reorder now' : 'See menu'}
                  </button>
                )}
              </article>
            </div>

            <section className="native-app-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Quick filters</p>
                  <h2>Find the right food mood in one swipe</h2>
                </div>
              </div>
              <QuickChips activeChip={activeChip} chips={APP_QUICK_CHIPS} onSelectChip={setActiveChip} />
            </section>

            <FeaturedProductsGrid
              description="Direct add actions stay close to the thumb zone so ordering feels faster than browsing."
              eyebrow="Quick order"
              loading={loading}
              products={featuredProducts}
              title="Top food items"
              viewAllTo={activeChip === 'all' ? '/menu' : `/menu?chip=${encodeURIComponent(activeChip)}`}
              whatsappNumber={settings?.whatsappNumber}
            />

            <section className="native-app-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Categories</p>
                  <h2>Tap into the menu section you need</h2>
                </div>
                <Link className="text-link" to="/menu">
                  View all
                </Link>
              </div>
              <CategoryGrid items={categoryGridItems} />
            </section>

            {productRails.map((rail) => (
              <HorizontalProductRow
                description={rail.description}
                eyebrow={rail.eyebrow}
                key={rail.id}
                products={rail.items}
                title={rail.title}
                viewAllTo={activeChip === 'all' ? '/menu' : `/menu?chip=${encodeURIComponent(activeChip)}`}
                whatsappNumber={settings?.whatsappNumber}
              />
            ))}

            <section className="native-app-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Trust</p>
                  <h2>Small assurance signals that help users order faster</h2>
                </div>
              </div>
              <TrustBadges badges={APP_TRUST_BADGES.slice(0, 4)} />
            </section>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SeoMeta
        description="Order pure veg meals, thalis, combos, and monthly plans from Sardar Ji Food Corner with an app-like food ordering experience in Indore."
        includeLocalBusiness
        includeWebsiteSchema
        keywords={[
          'tiffin service in Indore',
          'monthly thali plan Indore',
          'food delivery in Indore',
          'pure veg meals Indore',
          'food ordering app Indore',
        ]}
        path="/"
        schema={[
          createBreadcrumbSchema([{ name: 'Home', path: '/' }]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Order Pure Veg Food in Indore | Sardar Ji Food Corner"
      />

      <section className="section first-section app-home-screen">
        <div className="container app-home-stack">
          <div className="app-home-utility-strip">
            {APP_HOME_VALUE_PILLS.map((pill) => {
              const Icon = pill.icon;

              return (
                <span className="app-home-utility-pill" key={pill.id}>
                  <Icon size={14} />
                  {pill.label}
                </span>
              );
            })}
          </div>

          <HeroCarousel onPrimaryAction={() => navigate('/menu')} primaryLabel="Order Now" slides={heroSlides} />

          <div className="app-home-status-grid app-home-premium-grid">
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="app-home-status-card"
              initial={{ opacity: 0, y: 10 }}
            >
              <p className="eyebrow">{premiumCopy.homeEyebrow || 'Ordering now'}</p>
              <h2>{premiumCopy.homeTrustTitle || 'Food first, decisions faster'}</h2>
              <div className="app-home-status-meta">
                <span className="hero-chip">
                  <MapPin size={14} />
                  {STORE_CITY}
                </span>
                <span className="hero-chip">
                  <Star fill="currentColor" size={14} />
                  {STORE_AVERAGE_RATING.toFixed(1)} • {STORE_ORDER_SOCIAL_PROOF}
                </span>
                <span className="hero-chip">
                  <Clock3 size={14} />
                  Avg 25-35 min
                </span>
              </div>
            </motion.article>

            <PromoBanner
              actions={
                <Link className="btn btn-primary" to={itemCount ? '/cart' : '/my-subscription?checkout=1'}>
                  {itemCount ? 'Open cart' : 'Start monthly plan'}
                </Link>
              }
              className="app-home-cart-banner"
              description={
                itemCount
                  ? `${itemCount} items are already in your cart. ${liveCartState.offerMessage}`
                  : `${premiumCopy.rewardsTitle || 'Monthly Thali starts at a premium everyday price.'} Plans begin at ${formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)}.`
              }
              eyebrow={itemCount ? 'Live cart' : 'Subscription'}
              title={
                itemCount
                  ? `Ready to checkout? Total ${formatCurrency(liveCartState.total)}`
                  : MONTHLY_SUBSCRIPTION_PLAN_NAME
              }
              tone={itemCount ? 'accent' : 'success'}
            />
          </div>

          <div className="app-section-block">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Quick filters</p>
                <h2>Find the right meal faster</h2>
                <p className="section-heading-note">
                  Use a small set of strong filters instead of digging through the full menu.
                </p>
              </div>
            </div>
            <QuickChips activeChip={activeChip} chips={APP_QUICK_CHIPS} onSelectChip={setActiveChip} />
          </div>

          <FeaturedProductsGrid
            description="The strongest picks stay up front so customers can move from desire to checkout with less friction."
            eyebrow="Featured now"
            loading={loading}
            products={featuredProducts}
            title="Signature quick picks"
            viewAllTo={activeChip === 'all' ? '/menu' : `/menu?chip=${encodeURIComponent(activeChip)}`}
            whatsappNumber={settings?.whatsappNumber}
          />

          <section className="app-section-block">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Browse by category</p>
                <h2>Tap into the part of the menu you need</h2>
              </div>
              <Link className="text-link" to="/menu">
                Open full menu
              </Link>
            </div>
            <CategoryGrid items={categoryGridItems} />
          </section>

          {offerCards.length ? (
            <section className="app-section-block">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Offers</p>
                  <h2>Clarity before checkout</h2>
                </div>
              </div>
              <div className="app-offer-strip">
                {offerCards.map((offer, index) => (
                  <motion.article
                    animate={{ opacity: 1, y: 0 }}
                    className={`app-offer-strip-card offer-rail-card-${(index % 3) + 1}`.trim()}
                    initial={{ opacity: 0, y: 12 }}
                    key={offer.id}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <p className="eyebrow">Offer</p>
                    <strong>{offer.title}</strong>
                    <span>{offer.description}</span>
                  </motion.article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="app-download-teaser-section">
            <PromoBanner
              actions={
                <>
                  <a
                    className="btn btn-primary"
                    download={APP_DOWNLOAD_FILE_NAME}
                    href={appDownloadUrl}
                    onClick={() => trackAppDownloadClick({ source: 'home-download-teaser' })}
                  >
                    <Download size={16} />
                    {APP_DOWNLOAD_LABEL}
                  </a>
                  <Link className="btn btn-secondary" to={APP_DOWNLOAD_PAGE_PATH}>
                    <Smartphone size={16} />
                    Preview the app
                  </Link>
                </>
              }
              className="app-download-teaser"
              description={`Install the newest Android build to try the redesigned ${businessName} experience with faster browsing, smarter cart flow, and cleaner tracking.`}
              eyebrow="Download our app"
              extraContent={
                <div className="app-section-block">
                  <div className="app-home-status-meta">
                    <span className="hero-chip">
                      <Smartphone size={14} />
                      Native Android app
                    </span>
                    <span className="hero-chip">
                      <Download size={14} />
                      v{APP_LATEST_VERSION}
                    </span>
                    <span className="hero-chip">
                      <Clock3 size={14} />
                      Updated {APP_RELEASE_DATE}
                    </span>
                  </div>
                  <p className="section-heading-note">{APP_DOWNLOAD_SUPPORT_NOTE}</p>
                </div>
              }
              title={`Take the latest ${businessName} build with you`}
              tone="warning"
            />
          </section>

          {productRails.map((rail) => (
            <HorizontalProductRow
              description={rail.description}
              eyebrow={rail.eyebrow}
              key={rail.id}
              products={rail.items}
              title={rail.title}
              viewAllTo={activeChip === 'all' ? '/menu' : `/menu?chip=${encodeURIComponent(activeChip)}`}
              whatsappNumber={settings?.whatsappNumber}
            />
          ))}

          <section className="app-section-block">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Plans & combos</p>
                <h2>Shortcuts for repeat ordering</h2>
              </div>
            </div>
            <div className="app-plan-grid">
              {APP_PLAN_CARDS.map((card, index) => (
                <motion.article
                  animate={{ opacity: 1, y: 0 }}
                  className="app-plan-card"
                  initial={{ opacity: 0, y: 12 }}
                  key={card.id}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <p className="eyebrow">{card.eyebrow}</p>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <Link className="btn btn-primary" to={card.ctaTo}>
                    {card.ctaLabel}
                  </Link>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="app-section-block">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Why customers trust it</p>
                <h2>Small signals that matter when ordering food</h2>
              </div>
            </div>
            <TrustBadges badges={APP_TRUST_BADGES} />
          </section>

          {!itemCount ? (
            <PromoBanner
              actions={
                <Link className="btn btn-primary" to="/menu">
                  <ShoppingBag size={16} />
                  Start ordering
                </Link>
              }
              className="app-home-final-cta"
              description="Browse the menu, add food in a couple of taps, and move into checkout without extra friction."
              eyebrow="Ready when you are"
              title="Open the menu and build your next order quickly"
              tone="warning"
            />
          ) : null}
        </div>
      </section>
    </PageTransition>
  );
};
