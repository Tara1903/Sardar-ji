import { Link } from 'react-router-dom';
import { Clock3, MapPin, ShoppingBag } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { VisitUsSection } from '../components/home/VisitUsSection';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { createBreadcrumbSchema } from '../seo/siteSeo';

export const TiffinServiceIndorePage = () => {
  const { settings } = useAppData();

  return (
    <PageTransition>
      <SeoMeta
        description="Tiffin service in Indore for pure veg meals, quick food delivery, and affordable monthly meal options from Sardar Ji Food Corner."
        includeLocalBusiness
        keywords={[
          'tiffin service in Indore',
          'food delivery in Indore',
          'affordable tiffin near me',
          'veg tiffin Indore',
        ]}
        path="/tiffin-service-indore"
        schema={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Tiffin Service Indore', path: '/tiffin-service-indore' },
        ])}
        settings={settings}
        title="Tiffin Service in Indore"
      />
      <section className="section first-section">
        <div className="container local-landing-layout">
          <div className="panel-card local-landing-hero">
            <p className="eyebrow">Tiffin service in Indore</p>
            <h1>Pure veg tiffin service in Indore with fast local delivery</h1>
            <p>
              Sardar Ji Food Corner helps customers who search for food delivery in Indore, a tiffin
              service in Indore, or an affordable tiffin near me. The goal is simple: good daily food,
              fast ordering, and clear delivery pricing.
            </p>
            <div className="local-landing-pills">
              <span className="hero-chip">
                <MapPin size={14} />
                Near Palm n Dine Market, Indore
              </span>
              <span className="hero-chip">
                <Clock3 size={14} />
                Order quickly for daily meals
              </span>
            </div>
            <div className="landing-actions">
              <Link className="btn btn-primary" to="/menu">
                Order Now
              </Link>
              <Link className="btn btn-secondary" to="/my-subscription?checkout=1">
                View Monthly Plan
              </Link>
            </div>
          </div>

          <div className="panel-card local-landing-side">
            <p className="eyebrow">Popular reasons to order</p>
            <div className="local-seo-points">
              <div className="local-seo-point">
                <ShoppingBag size={16} />
                <span>Pure veg meals for office lunch, hostel dinners, and regular home orders</span>
              </div>
              <div className="local-seo-point">
                <ShoppingBag size={16} />
                <span>Menu browsing, cart, checkout, and WhatsApp ordering all supported</span>
              </div>
              <div className="local-seo-point">
                <ShoppingBag size={16} />
                <span>Subscription option available for repeat customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PromoBanner
            description="Customers near Palm n Dine Market can discover the store faster with clear address details, map visibility, and local-first ordering pages."
            eyebrow="Local relevance"
            title="Located in Indore near Palm n Dine Market"
            tone="success"
          />
        </div>
      </section>

      <section className="section local-copy-section">
        <div className="container">
          <div className="panel-card local-copy-card">
            <h2>Why choose our tiffin service in Indore?</h2>
            <p>
              We focus on pure veg meals, predictable pricing, and a fast ordering experience that
              works well on mobile. That helps first-time customers order confidently and keeps repeat
              customers coming back for everyday food delivery in Indore.
            </p>
            <p>
              If you want a longer routine, the monthly thali plan is also available as a dedicated
              subscription instead of a normal menu product.
            </p>
          </div>
        </div>
      </section>

      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
