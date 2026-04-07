import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  Clock3,
  Download,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import {
  BUTTON_PRESS_VARIANTS,
  CONTENT_FADE_VARIANTS,
  CONTENT_STACK_VARIANTS,
  SPRING_SMOOTH,
  SURFACE_REVEAL_VARIANTS,
} from '../motion/variants';
import { createBreadcrumbSchema } from '../seo/siteSeo';
import { getFallbackImage } from '../data/fallbackImages';
import { formatCurrency } from '../utils/format';
import { CUSTOMER_REVIEWS } from '../utils/storefront';
import { sortProductsByCategoryAndPrice, STORE_AVERAGE_RATING, STORE_ORDER_SOCIAL_PROOF } from '../utils/catalog';
import {
  APP_DOWNLOAD_BADGE,
  APP_DOWNLOAD_FILE_NAME,
  APP_DOWNLOAD_LABEL,
  APP_DOWNLOAD_PATH,
  APP_DOWNLOAD_SUPPORT_NOTE,
} from '../utils/appDownload';
import { trackAppDownloadClick } from '../utils/analytics';

const AUTO_ROTATE_MS = 4200;
const MotionLink = motion(Link);
const MotionAnchor = motion.a;

const featureItems = [
  {
    id: 'feature-fast-ordering',
    icon: ShoppingBag,
    title: 'One-tap ordering',
    description: 'Browse best sellers, add favourites quickly, and keep the cart moving without friction.',
  },
  {
    id: 'feature-live-tracking',
    icon: Clock3,
    title: 'Live order tracking',
    description: 'Check delivery progress, kitchen updates, and order status from a single clean flow.',
  },
  {
    id: 'feature-secure-payments',
    icon: ShieldCheck,
    title: 'Secure checkout',
    description: 'Razorpay-backed payments, account-safe ordering, and a smoother mobile buying experience.',
  },
  {
    id: 'feature-alerts',
    icon: BellRing,
    title: 'Offers that stay visible',
    description: 'Delivery rewards, coupons, and monthly plan actions stay close so customers miss less.',
  },
];

const howItWorksSteps = [
  {
    id: 'step-download',
    label: '01',
    title: 'Download the app',
    description: 'Install the signed Android APK directly from the website in one tap.',
  },
  {
    id: 'step-browse',
    label: '02',
    title: 'Browse, add, and pay',
    description: 'Search the menu fast, add dishes, and checkout with the same flow you already know.',
  },
  {
    id: 'step-track',
    label: '03',
    title: 'Track and reorder',
    description: 'Follow order progress, repeat your favourites, and manage your monthly plan with less effort.',
  },
];

const PreviewScreen = ({ slide }) => (
  <motion.div
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className="download-phone-screen"
    exit={{ opacity: 0, y: -12, scale: 0.98 }}
    initial={{ opacity: 0, y: 14, scale: 0.985 }}
    key={slide.id}
    transition={{ duration: 0.28, ease: 'easeOut' }}
  >
    <div className="download-phone-topbar">
      <span>{slide.kicker}</span>
      <strong>SJFC</strong>
    </div>

    <div className="download-phone-hero">
      <img
        alt={slide.imageAlt}
        className="download-phone-image"
        loading="eager"
        onError={(event) => {
          if (event.currentTarget.src !== slide.fallbackImage) {
            event.currentTarget.src = slide.fallbackImage;
          }
        }}
        src={slide.image}
      />
      <div className="download-phone-image-overlay" />
      <div className="download-phone-copy">
        <span>{slide.badge}</span>
        <strong>{slide.title}</strong>
        <p>{slide.description}</p>
      </div>
    </div>

    <div className="download-phone-product-row">
      <div className="download-phone-product-copy">
        <b>{slide.productName}</b>
        <span>{slide.productMeta}</span>
      </div>
      <strong>{slide.priceLabel}</strong>
    </div>

    <div className="download-phone-chip-row">
      {slide.chips.map((chip) => (
        <span className="download-phone-chip" key={chip}>
          {chip}
        </span>
      ))}
    </div>

    <div className="download-phone-footer">
      <div>
        <span>Ready to order</span>
        <strong>{slide.footerLabel}</strong>
      </div>
      <button type="button">{slide.footerCta}</button>
    </div>
  </motion.div>
);

export const DownloadAppPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const { appConfig, products, categories, settings } = useAppData();
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedProducts = useMemo(
    () =>
      sortProductsByCategoryAndPrice(
        products.filter((product) => product.isAvailable),
        appConfig.categories?.length ? appConfig.categories : categories,
      ),
    [appConfig.categories, categories, products],
  );

  const previewSlides = useMemo(() => {
    const featured = sortedProducts.slice(0, 3);

    return [
      {
        id: 'preview-bestsellers',
        kicker: 'Best sellers',
        badge: 'Fast pick',
        title: 'Discover top food items in seconds',
        description: 'Open the app and land right inside a focused, easy-to-browse food feed.',
        productName: featured[0]?.name || 'Super Veg Thali',
        productMeta: featured[0]?.category || 'Thali Specials',
        priceLabel: formatCurrency(featured[0]?.price || 149),
        image: featured[0]?.image || getFallbackImage(featured[0]?.category || 'Thali Specials'),
        fallbackImage: getFallbackImage(featured[0]?.category || 'Thali Specials'),
        imageAlt: `${featured[0]?.name || 'Super Veg Thali'} app preview`,
        chips: ['Quick add', 'Pure veg', 'Top rated'],
        footerLabel: 'Swipe, tap, and order',
        footerCta: 'Add',
      },
      {
        id: 'preview-rewards',
        kicker: 'Smart cart',
        badge: 'Live rewards',
        title: 'Keep delivery offers visible while you shop',
        description: 'Watch free delivery and mango juice rewards unlock as the cart total grows.',
        productName: featured[1]?.name || 'Premium Thali',
        productMeta: featured[1]?.category || 'Thali Specials',
        priceLabel: formatCurrency(featured[1]?.price || 199),
        image: featured[1]?.image || getFallbackImage(featured[1]?.category || 'Thali Specials'),
        fallbackImage: getFallbackImage(featured[1]?.category || 'Thali Specials'),
        imageAlt: `${featured[1]?.name || 'Premium Thali'} rewards preview`,
        chips: ['₹299 free delivery', '₹499 free juice', 'Coupon ready'],
        footerLabel: 'Cart updates instantly',
        footerCta: 'Track',
      },
      {
        id: 'preview-subscription',
        kicker: 'Monthly plan',
        badge: 'Daily comfort',
        title: 'Manage your thali plan from the same app',
        description: 'Subscriptions, pauses, and plan status stay in one place without switching screens.',
        productName: 'Monthly Thali Plan',
        productMeta: '30-day subscription',
        priceLabel: 'Active dashboard',
        image: featured[2]?.image || getFallbackImage(featured[2]?.category || 'Beverages'),
        fallbackImage: getFallbackImage(featured[2]?.category || 'Beverages'),
        imageAlt: 'Monthly plan management preview',
        chips: ['Plan status', 'Pause or skip', 'Reorder faster'],
        footerLabel: 'Everything in one app',
        footerCta: 'Open',
      },
    ];
  }, [sortedProducts]);

  useEffect(() => {
    if (prefersReducedMotion || previewSlides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % previewSlides.length);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, previewSlides.length]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(previewSlides.length - 1, 0)));
  }, [previewSlides.length]);

  const reviews = (appConfig.reviews?.length ? appConfig.reviews : CUSTOMER_REVIEWS).slice(0, 3);
  const activeSlide = previewSlides[activeIndex];
  const businessName = settings?.businessName || 'Sardar Ji Food Corner';

  const handleDownloadClick = (source) => {
    trackAppDownloadClick({ source });
  };

  return (
    <PageTransition>
      <SeoMeta
        description="Download the Sardar Ji Food Corner Android app for faster ordering, live tracking, and pure veg food delivery in Indore."
        includeLocalBusiness
        keywords={[
          'download food delivery app Indore',
          'Sardar Ji Food Corner app',
          'Android food ordering app Indore',
          'pure veg ordering app',
        ]}
        path="/download-app"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Download App', path: '/download-app' },
          ]),
        ]}
        settings={settings}
        title="Download the App"
      />

      <section className="section first-section download-app-page">
        <div className="container">
          <div className="download-hero-shell">
            <motion.div
              animate="show"
              className="download-hero-copy"
              initial="hidden"
              variants={CONTENT_STACK_VARIANTS}
            >
              <motion.span className="download-overline" variants={CONTENT_FADE_VARIANTS}>
                <Sparkles size={16} />
                {APP_DOWNLOAD_BADGE}
              </motion.span>
              <motion.h1 className="download-hero-title" variants={CONTENT_FADE_VARIANTS}>
                Order pure veg favourites faster with the {businessName} app
              </motion.h1>
              <motion.p className="download-hero-text" variants={CONTENT_FADE_VARIANTS}>
                Take the premium food ordering experience with you: quick browsing, smarter cart rewards,
                live tracking, and one-tap access to your monthly plan.
              </motion.p>

              <motion.div className="download-meta-row" variants={CONTENT_FADE_VARIANTS}>
                <span className="download-meta-pill">
                  <Star fill="currentColor" size={14} />
                  {STORE_AVERAGE_RATING.toFixed(1)} local rating
                </span>
                <span className="download-meta-pill">
                  <ShoppingBag size={14} />
                  {STORE_ORDER_SOCIAL_PROOF}
                </span>
                <span className="download-meta-pill">
                  <MapPin size={14} />
                  Indore delivery
                </span>
              </motion.div>

              <motion.div className="download-hero-actions" variants={CONTENT_FADE_VARIANTS}>
                <MotionAnchor
                  className="btn btn-primary download-app-primary"
                  download={APP_DOWNLOAD_FILE_NAME}
                  href={APP_DOWNLOAD_PATH}
                  initial="rest"
                  onClick={() => handleDownloadClick('download-page-hero')}
                  variants={BUTTON_PRESS_VARIANTS}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Download size={18} />
                  {APP_DOWNLOAD_LABEL}
                </MotionAnchor>
                <MotionLink
                  className="btn btn-secondary"
                  initial="rest"
                  to="/menu"
                  variants={BUTTON_PRESS_VARIANTS}
                  whileHover="hover"
                  whileTap="tap"
                >
                  View Menu
                  <ArrowRight size={16} />
                </MotionLink>
              </motion.div>

              <motion.p className="download-support-note" variants={CONTENT_FADE_VARIANTS}>
                {APP_DOWNLOAD_SUPPORT_NOTE}
              </motion.p>
            </motion.div>

            <motion.div
              animate="show"
              className="download-hero-visual"
              initial="hidden"
              variants={SURFACE_REVEAL_VARIANTS}
            >
              <div className="download-phone-stage">
                <div className="download-phone-ambient download-phone-ambient-left" />
                <div className="download-phone-ambient download-phone-ambient-right" />
                <div className="download-phone-frame">
                  <div className="download-phone-notch" />
                  <AnimatePresence initial={false} mode="wait">
                    <PreviewScreen slide={activeSlide} />
                  </AnimatePresence>
                </div>
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="download-floating-pill download-floating-pill-top"
                  initial={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.12, duration: 0.28, ease: 'easeOut' }}
                >
                  <Clock3 size={16} />
                  25-35 min delivery
                </motion.div>
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="download-floating-pill download-floating-pill-bottom"
                  initial={{ opacity: 0, y: 14 }}
                  transition={{ delay: 0.18, duration: 0.28, ease: 'easeOut' }}
                >
                  <ShieldCheck size={16} />
                  Smooth secure checkout
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section download-preview-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Interactive app preview</p>
              <h2>Swipe the experience before you install</h2>
              <p className="section-heading-note">
                The app is designed for quick food decisions, cleaner checkout, and fewer dead ends.
              </p>
            </div>
          </div>

          <div className="download-preview-grid">
            <div className="download-preview-selector">
              {previewSlides.map((slide, index) => (
                <motion.button
                  className={`download-preview-card ${index === activeIndex ? 'is-active' : ''}`.trim()}
                  initial="rest"
                  key={slide.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                  variants={BUTTON_PRESS_VARIANTS}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span>{slide.kicker}</span>
                  <strong>{slide.title}</strong>
                  <p>{slide.description}</p>
                </motion.button>
              ))}
            </div>

            <PromoBanner
              className="download-preview-banner"
              description={activeSlide.description}
              eyebrow={activeSlide.badge}
              title={activeSlide.title}
              tone="success"
            >
              <div className="download-preview-dots">
                {previewSlides.map((slide, index) => (
                  <button
                    aria-label={`Show ${slide.title}`}
                    className={`download-preview-dot ${index === activeIndex ? 'is-active' : ''}`.trim()}
                    key={slide.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </PromoBanner>
          </div>
        </div>
      </section>

      <section className="section download-feature-section">
        <div className="container">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Built for repeat orders</p>
              <h2>Why the app feels faster than the browser alone</h2>
            </div>
          </div>

          <motion.div
            animate="show"
            className="download-feature-grid"
            initial="hidden"
            variants={CONTENT_STACK_VARIANTS}
          >
            {featureItems.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.article className="download-feature-card" key={feature.id} variants={SURFACE_REVEAL_VARIANTS}>
                  <span className="download-feature-icon">
                    <Icon size={20} />
                  </span>
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="section download-how-section">
        <div className="container">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">How it works</p>
              <h2>Three quick steps to start ordering from the app</h2>
            </div>
          </div>

          <div className="download-step-grid">
            {howItWorksSteps.map((step) => (
              <motion.article
                className="download-step-card"
                key={step.id}
                transition={SPRING_SMOOTH}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <span className="download-step-number">{step.label}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section download-proof-section">
        <div className="container">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Loved by regular customers</p>
              <h2>Local trust already built into the ordering journey</h2>
            </div>
          </div>

          <div className="download-proof-grid">
            {reviews.map((review) => (
              <motion.article
                className="download-proof-card"
                key={review.id}
                transition={SPRING_SMOOTH}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div className="download-review-stars">
                  {Array.from({ length: review.rating || 5 }).map((_, index) => (
                    <Star fill="currentColor" key={`${review.id}-star-${index}`} size={16} />
                  ))}
                </div>
                <p>{review.quote}</p>
                <strong>{review.author}</strong>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section download-final-cta-section">
        <div className="container">
          <div className="download-final-cta">
            <div>
              <p className="eyebrow">Get the app now</p>
              <h2>Install once. Order faster every time after that.</h2>
              <p>
                Keep Sardar Ji Food Corner on your home screen and turn repeat food orders into a much
                smoother habit.
              </p>
            </div>
            <div className="download-final-actions">
              <MotionAnchor
                className="btn btn-primary"
                download={APP_DOWNLOAD_FILE_NAME}
                href={APP_DOWNLOAD_PATH}
                initial="rest"
                onClick={() => handleDownloadClick('download-page-final-cta')}
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <Smartphone size={18} />
                {APP_DOWNLOAD_LABEL}
              </MotionAnchor>
              <MotionLink
                className="btn btn-secondary"
                initial="rest"
                to="/menu"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                Order on the web
              </MotionLink>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
