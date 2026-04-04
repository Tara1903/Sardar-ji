import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeIndianRupee,
  Bike,
  Gift,
  MessageCircleMore,
  ShieldCheck,
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
import { getCartOfferState } from '../utils/pricing';
import { createGeneralOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import {
  FREE_DELIVERY_THRESHOLD,
  SPECIAL_OFFER_SUBTITLE,
  SPECIAL_OFFER_TITLE,
} from '../utils/storefront';

export const HomePage = () => {
  const { products, categories, settings, loading } = useAppData();
  const { items } = useCart();
  const featuredProducts = products.filter((product) => product.badge).slice(0, 4);
  const heroOfferState = getCartOfferState(items, products, settings?.deliveryRules);
  const dynamicHeroLine = items.length
    ? heroOfferState.offerMessage
    : `Order above ₹${FREE_DELIVERY_THRESHOLD} for free delivery within 5 km, or cross ₹499 for a FREE Mango Juice 🥭`;

  return (
    <PageTransition>
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45 }}
          >
            <span className="hero-chip">{settings?.businessName || 'Sardar Ji Food Corner'}</span>
            <p className="eyebrow hero-kicker">Fresh food, quick local delivery</p>
            <h1>Hot, Fresh & Delicious Food Delivered Fast</h1>
            <p>
              Order from Sardar Ji Food Corner and enjoy fresh taste with exciting offers on every order.
            </p>

            <PromoBanner
              className="hero-offer-banner"
              description={dynamicHeroLine}
              eyebrow="Today's delivery rewards"
              title={SPECIAL_OFFER_TITLE}
              tone="hero"
            />

            <div className="hero-actions">
              <a
                className="btn btn-primary"
                href={createWhatsAppLink(settings?.whatsappNumber, createGeneralOrderMessage())}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircleMore size={16} />
                Order on WhatsApp
              </a>
              <Link className="btn btn-secondary" to="/menu">
                View Menu
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="hero-highlights">
              <div>
                <BadgeIndianRupee size={18} />
                ₹70 se ₹149 tak har budget ki thali
              </div>
              <div>
                <Bike size={18} />
                ₹299 = FREE delivery within 5 km
              </div>
              <div>
                <Gift size={18} />
                ₹499 = FREE delivery + Mango Juice 🥭
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            transition={{ delay: 0.08, duration: 0.55 }}
          >
            <div className="hero-card accent">
              <strong>Hungry right now?</strong>
              <span>Start with thali, paratha, or chaat in minutes</span>
            </div>
            <SmartImage
              alt="Sardar Ji thali presentation"
              className="hero-visual-image"
              loading="eager"
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
            />
            <div className="hero-card floating">
              <Sparkles size={18} />
              <span>{SPECIAL_OFFER_SUBTITLE}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Why people order again</p>
              <h2>Offers and trust signals placed where they convert</h2>
            </div>
          </div>

          <div className="offer-grid">
            {(settings?.offers || []).map((offer) => (
              <motion.article
                className="offer-card"
                initial={{ opacity: 0, y: 16 }}
                key={offer.id}
                transition={{ duration: 0.25 }}
                viewport={{ once: true, amount: 0.3 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured categories</p>
              <h2>Built for fast scanning on mobile</h2>
            </div>
            <Link className="text-link" to="/menu">
              Explore full menu
            </Link>
          </div>

          <div className="category-showcase">
            {categories.map((category) => (
              <div className="category-panel" key={category.id}>
                <strong>{category.name}</strong>
                <p>{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2>Fastest way to start ordering</h2>
            </div>
          </div>

          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid cards-grid">
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
      </section>

      <section className="section">
        <div className="container trust-strip">
          <div>
            <ShieldCheck size={20} />
            <div>
              <strong>Trusted local service</strong>
              <p>Designed for customers ordering quickly from busy phones.</p>
            </div>
          </div>
          <div>
            <Star size={20} />
            <div>
              <strong>100% veg menu</strong>
              <p>Easy to browse, easy to repeat, easy to recommend.</p>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
