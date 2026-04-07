import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, MapPin, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import {
  BUTTON_PRESS_VARIANTS,
  HERO_CONTENT_ITEM_VARIANTS,
  HERO_CONTENT_VARIANTS,
  HERO_IMAGE_VARIANTS,
  HERO_SLIDE_VARIANTS,
} from '../../motion/variants';

const AUTO_ADVANCE_MS = 5200;
const MotionLink = motion(Link);

export const HeroCarousel = ({
  onPrimaryAction,
  primaryLabel = 'Order Now',
  searchNode = null,
  secondaryLabel = 'View Menu',
  slides = [],
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (slides.length <= 1 || prefersReducedMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, slides.length]);

  useEffect(() => {
    setActiveIndex((current) => (slides.length ? Math.min(current, slides.length - 1) : 0));
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  const shiftSlide = (direction) => {
    setActiveIndex((current) => {
      if (!slides.length) {
        return current;
      }

      return (current + direction + slides.length) % slides.length;
    });
  };

  const dragHandlers = useMemo(
    () => ({
      drag: slides.length > 1 ? 'x' : false,
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 0.08,
      onDragEnd: (_, info) => {
        if (info.offset.x <= -80) {
          shiftSlide(1);
          return;
        }

        if (info.offset.x >= 80) {
          shiftSlide(-1);
        }
      },
    }),
    [slides.length],
  );

  if (!activeSlide) {
    return null;
  }

  return (
    <section className="app-hero-carousel">
      <div className="app-hero-shell">
        <AnimatePresence initial={false} mode="wait">
          <motion.article
            key={activeSlide.id}
            animate="animate"
            className="app-hero-slide"
            exit="exit"
            initial="initial"
            variants={HERO_SLIDE_VARIANTS}
            {...dragHandlers}
          >
            <motion.img
              alt={activeSlide.imageAlt || activeSlide.title}
              animate="animate"
              className="app-hero-slide-image"
              fetchPriority="high"
              initial="initial"
              src={activeSlide.image}
              variants={HERO_IMAGE_VARIANTS}
              whileHover="hover"
            />
            <div className="app-hero-slide-overlay" />
            <div className="app-hero-content">
              <motion.div
                animate="show"
                className="app-hero-copy"
                initial="hidden"
                variants={HERO_CONTENT_VARIANTS}
              >
                <motion.div className="app-hero-topline" variants={HERO_CONTENT_ITEM_VARIANTS}>
                  <span className="app-hero-badge">
                    <Sparkles size={14} />
                    {activeSlide.kicker}
                  </span>
                  <span className="app-hero-availability">
                    <MapPin size={14} />
                    Delivering across Indore
                  </span>
                </motion.div>
                <motion.h1 variants={HERO_CONTENT_ITEM_VARIANTS}>{activeSlide.title}</motion.h1>
                <motion.p variants={HERO_CONTENT_ITEM_VARIANTS}>{activeSlide.description}</motion.p>
                {searchNode ? (
                  <motion.div variants={HERO_CONTENT_ITEM_VARIANTS}>{searchNode}</motion.div>
                ) : null}

                <motion.div className="app-hero-chip-row" variants={HERO_CONTENT_ITEM_VARIANTS}>
                  {(activeSlide.highlights || []).map((highlight) => (
                    <span className="app-hero-info-chip" key={highlight}>
                      {highlight}
                    </span>
                  ))}
                </motion.div>

                <motion.div className="app-hero-actions" variants={HERO_CONTENT_ITEM_VARIANTS}>
                  <motion.button
                    className="btn btn-primary app-hero-primary"
                    initial="rest"
                    onClick={onPrimaryAction}
                    type="button"
                    variants={BUTTON_PRESS_VARIANTS}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {primaryLabel}
                    <ArrowRight size={16} />
                  </motion.button>
                  <MotionLink
                    className="btn btn-secondary app-hero-secondary"
                    initial="rest"
                    to="/menu"
                    variants={BUTTON_PRESS_VARIANTS}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {secondaryLabel}
                  </MotionLink>
                </motion.div>
              </motion.div>

              <motion.div
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="app-hero-spotlight"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ delay: 0.12, duration: 0.34, ease: 'easeOut' }}
              >
                <motion.div
                  className="app-hero-spotlight-card"
                  whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.22 } }}
                >
                  <p className="eyebrow">Featured today</p>
                  <div className="app-hero-spotlight-top">
                    <div>
                      <strong>{activeSlide.featuredTitle}</strong>
                      <span>{activeSlide.featuredSubtitle}</span>
                    </div>
                    {activeSlide.priceLabel ? <b>{activeSlide.priceLabel}</b> : null}
                  </div>
                  <div className="app-hero-spotlight-stats">
                    <span>
                      <Star fill="currentColor" size={14} />
                      {activeSlide.ratingLabel || '4.3'}
                    </span>
                    <span>
                      <Clock3 size={14} />
                      {activeSlide.timeLabel || '25-35 min'}
                    </span>
                  </div>
                  {activeSlide.note ? <p className="app-hero-note">{activeSlide.note}</p> : null}
                </motion.div>
              </motion.div>
            </div>
          </motion.article>
        </AnimatePresence>

        {slides.length > 1 ? (
          <>
            <div className="app-hero-dots" aria-label="Hero slide navigation">
              {slides.map((slide, index) => (
                <motion.button
                  aria-label={`Go to ${slide.title}`}
                  className={`app-hero-dot ${index === activeIndex ? 'is-active' : ''}`.trim()}
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  type="button"
                  variants={BUTTON_PRESS_VARIANTS}
                  whileHover="hover"
                  whileTap="tap"
                />
              ))}
            </div>

            <div className="app-hero-controls">
              <motion.button
                aria-label="Previous hero slide"
                className="app-hero-control"
                initial="rest"
                onClick={() => shiftSlide(-1)}
                type="button"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <ChevronLeft size={18} />
              </motion.button>
              <motion.button
                aria-label="Next hero slide"
                className="app-hero-control"
                initial="rest"
                onClick={() => shiftSlide(1)}
                type="button"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export const createHeroSlides = ({ heroConfig, products = [] }) => {
  const topProducts = products.slice(0, 3);

  const coreSlide = {
    id: 'hero-default',
    image: heroConfig.backgroundImage,
    imageAlt: 'Premium pure veg food delivery from Sardar Ji Food Corner',
    kicker: 'Fresh from Sardar Ji Food Corner',
    title: heroConfig.headline,
    description: heroConfig.subtext,
    highlights: [heroConfig.offerText, 'Pure Veg', 'Fast delivery'],
    featuredTitle: 'Daily crowd favourite',
    featuredSubtitle: 'App-style ordering with premium delivery experience',
    note: 'Scroll, swipe, and add dishes in a few satisfying taps.',
  };

  const productSlides = topProducts.map((product) => ({
    id: `hero-${product.id}`,
    image: product.image,
    imageAlt: `${product.name} from Sardar Ji Food Corner`,
    kicker: product.badge || 'Best Seller',
    title: product.name,
    description: product.description,
    highlights: [product.category, 'Fast delivery', product.badge || 'Trending now'],
    featuredTitle: product.name,
    featuredSubtitle: product.category,
    priceLabel: formatCurrency(product.price),
    ratingLabel: '4.3',
    timeLabel: product.price >= 150 ? '30-40 min' : '20-30 min',
    note: `Add ${product.name} to start your order and keep the cart moving.`,
  }));

  return [coreSlide, ...productSlides];
};
