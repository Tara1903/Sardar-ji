import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, MapPin, ShoppingBag, Star } from 'lucide-react';
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
import { useCart } from '../contexts/CartContext';
import { createCategoryGridItems, APP_HOME_VALUE_PILLS, APP_PLAN_CARDS, APP_QUICK_CHIPS, APP_TRUST_BADGES, buildHomeProductRails, filterProductsByQuickChip } from '../data/appExperience';
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

export const HomePage = () => {
  const navigate = useNavigate();
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { items, itemCount } = useCart();
  const [activeChip, setActiveChip] = useState('all');
  const liveCartState = getCartOfferState(items, products, settings?.deliveryRules);
  const heroConfig = appConfig.hero;
  const railCategories = appConfig.categories?.length ? appConfig.categories : categories;
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
    () => createHeroSlides({ heroConfig, products: availableProducts.slice(0, 4) }),
    [availableProducts, heroConfig],
  );
  const productRails = useMemo(
    () => buildHomeProductRails(chipFilteredProducts).slice(0, 5),
    [chipFilteredProducts],
  );
  const categoryGridItems = useMemo(
    () => createCategoryGridItems(railCategories.slice(0, 9)),
    [railCategories],
  );
  const offerCards = (appConfig.offers?.cards || settings?.offers || []).slice(0, 3);
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

          <div className="app-home-status-grid">
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="app-home-status-card"
              initial={{ opacity: 0, y: 10 }}
            >
              <p className="eyebrow">Ordering now</p>
              <h2>Food first, decisions faster</h2>
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
                  : `Monthly Thali starts at ${formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)} with its own plan tracking flow.`
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
                <h2>Find your meal mood instantly</h2>
                <p className="section-heading-note">Swipe and narrow down what you want in one tap.</p>
              </div>
            </div>
            <QuickChips activeChip={activeChip} chips={APP_QUICK_CHIPS} onSelectChip={setActiveChip} />
          </div>

          <FeaturedProductsGrid
            description="Fast-moving dishes with direct add-to-cart actions right away."
            eyebrow="Featured now"
            loading={loading}
            products={featuredProducts}
            title="Quick order picks"
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
                  <h2>See the value before you start adding</h2>
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
