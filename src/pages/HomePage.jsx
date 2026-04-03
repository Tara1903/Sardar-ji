import { motion } from 'framer-motion';
import { ArrowRight, BadgeIndianRupee, Bike, Gift, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { SkeletonGrid } from '../components/common/Loader';
import { SmartImage } from '../components/common/SmartImage';
import { ProductCard } from '../components/menu/ProductCard';
import { useAppData } from '../contexts/AppDataContext';

export const HomePage = () => {
  const { products, categories, settings, loading } = useAppData();
  const featuredProducts = products.filter((product) => product.badge).slice(0, 4);

  return (
    <PageTransition>
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45 }}
          >
            <span className="hero-chip">Local premium veg delivery</span>
            <h1>
              {settings?.businessName || 'Sardar Ji Food Corner'}
              <span>{settings?.tagline || 'Swad Bhi, Budget Bhi'}</span>
            </h1>
            <p>
              Daily thalis, parathas, chaat, snacks, and beverages delivered with fast local service
              and pricing built for repeat orders.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/menu">
                Order Now
                <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-secondary" to="/menu">
                View Menu
              </Link>
            </div>

            <div className="hero-highlights">
              <div>
                <BadgeIndianRupee size={18} />
                Rs 70 se Rs 149 tak har budget ki thali
              </div>
              <div>
                <Bike size={18} />
                Rs 299 order = free delivery
              </div>
              <div>
                <Gift size={18} />
                6 referrals = 1 month free
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
              <strong>Today's best pickup</strong>
              <span>Regular Thali + Chaach combo</span>
            </div>
            <SmartImage
              alt="Sardar Ji thali presentation"
              className="hero-visual-image"
              loading="eager"
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
            />
            <div className="hero-card floating">
              <Sparkles size={18} />
              <span>Fresh veg kitchen, cooked daily</span>
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
    </PageTransition>
  );
};
