import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, MapPin, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

const AUTO_ADVANCE_MS = 5200;

export const HeroCarousel = ({
  onPrimaryAction,
  primaryLabel = 'Order Now',
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
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="app-hero-slide"
            exit={{ opacity: 0, y: -12, scale: 0.985 }}
            initial={{ opacity: 0, y: 18, scale: 1.015 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            {...dragHandlers}
          >
            <img
              alt={activeSlide.imageAlt || activeSlide.title}
              className="app-hero-slide-image"
              fetchPriority="high"
              src={activeSlide.image}
            />
            <div className="app-hero-slide-overlay" />
            <div className="app-hero-content">
              <div className="app-hero-copy">
                <div className="app-hero-topline">
                  <span className="app-hero-badge">
                    <Sparkles size={14} />
                    {activeSlide.kicker}
                  </span>
                  <span className="app-hero-availability">
                    <MapPin size={14} />
                    Delivering across Indore
                  </span>
                </div>
                <h1>{activeSlide.title}</h1>
                <p>{activeSlide.description}</p>

                <div className="app-hero-chip-row">
                  {(activeSlide.highlights || []).map((highlight) => (
                    <span className="app-hero-info-chip" key={highlight}>
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="app-hero-actions">
                  <button className="btn btn-primary app-hero-primary" onClick={onPrimaryAction} type="button">
                    {primaryLabel}
                    <ArrowRight size={16} />
                  </button>
                  <Link className="btn btn-secondary app-hero-secondary" to="/menu">
                    {secondaryLabel}
                  </Link>
                </div>
              </div>

              <div className="app-hero-spotlight">
                <div className="app-hero-spotlight-card">
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
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        {slides.length > 1 ? (
          <>
            <div className="app-hero-dots" aria-label="Hero slide navigation">
              {slides.map((slide, index) => (
                <button
                  aria-label={`Go to ${slide.title}`}
                  className={`app-hero-dot ${index === activeIndex ? 'is-active' : ''}`.trim()}
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  type="button"
                />
              ))}
            </div>

            <div className="app-hero-controls">
              <button
                aria-label="Previous hero slide"
                className="app-hero-control"
                onClick={() => shiftSlide(-1)}
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next hero slide"
                className="app-hero-control"
                onClick={() => shiftSlide(1)}
                type="button"
              >
                <ChevronRight size={18} />
              </button>
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
