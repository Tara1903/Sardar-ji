import { CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { VisitUsSection } from '../components/home/VisitUsSection';
import { FaqSection } from '../components/seo/FaqSection';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { createBreadcrumbSchema, createFaqSchema } from '../seo/siteSeo';
import { STORE_OPENING_HOURS_SHORT } from '../utils/storefront';

const faqItems = [
  {
    question: 'Do you serve Punjabi food in Indore for everyday ordering?',
    answer:
      'Yes, Sardar Ji Food Corner focuses on Punjabi-style pure veg comfort food, including thalis, paneer dishes, parathas, and quick local delivery in Indore.',
  },
  {
    question: 'Where is your Punjabi food restaurant in Indore located?',
    answer:
      'We are located near Palm n Dine Market on Silicon Road in Indore, making us easy to find for nearby customers searching for Punjabi food or daily thali options.',
  },
  {
    question: 'Can I order online or on WhatsApp?',
    answer:
      'Yes, customers can order directly on the website or continue on WhatsApp if they prefer a quick assisted order flow.',
  },
];

const highlights = [
  'Pure veg Punjabi-style meals',
  'Fast local delivery in Indore',
  'Strong thali and paneer menu',
];

export const PunjabiFoodRestaurantIndorePage = () => {
  const { settings } = useAppData();

  return (
    <PageTransition>
      <SeoMeta
        description="Punjabi food restaurant in Indore with pure veg thalis, paneer meals, and fast local delivery from Sardar Ji Food Corner."
        includeLocalBusiness
        keywords={[
          'Punjabi food restaurant in Indore',
          'Punjabi veg food Indore',
          'paneer thali Indore',
          'pure veg Punjabi restaurant Indore',
        ]}
        path="/punjabi-food-restaurant-indore"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            {
              name: 'Punjabi Food Restaurant Indore',
              path: '/punjabi-food-restaurant-indore',
            },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Punjabi Food Restaurant in Indore"
      />
      <section className="section first-section">
        <div className="container local-landing-layout">
          <div className="panel-card local-landing-hero">
            <p className="eyebrow">Punjabi food restaurant in Indore</p>
            <h1>Comforting Punjabi-style veg food for daily cravings and fast local orders</h1>
            <p>
              If you are looking for a Punjabi food restaurant in Indore with a strong veg menu,
              Sardar Ji Food Corner is built around homestyle favourites that are easy to order again
              and again.
            </p>
            <div className="local-landing-pills">
              <span className="hero-chip">
                <MapPin size={14} />
                Palm n Dine Market, Indore
              </span>
              <span className="hero-chip">Pure veg Punjabi-style meals</span>
              <span className="hero-chip">{STORE_OPENING_HOURS_SHORT}</span>
            </div>
            <div className="landing-actions">
              <Link className="btn btn-primary" to="/menu">
                Order Punjabi favourites
              </Link>
              <Link className="btn btn-secondary" to="/track">
                Track an order
              </Link>
            </div>
          </div>

          <div className="panel-card local-landing-side">
            <p className="eyebrow">Why customers choose us</p>
            <h2>Daily-friendly Punjabi veg comfort food</h2>
            <div className="subscription-benefit-list">
              {highlights.map((highlight) => (
                <div className="subscription-benefit-row" key={highlight}>
                  <CheckCircle2 size={16} />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PromoBanner
            description="Customers looking for Punjabi food in Indore often want dependable taste, easy ordering, and a menu that works for both daily meals and treat orders."
            eyebrow="Local search fit"
            title="Built for Indore customers searching for Punjabi veg food, thalis, and fast delivery"
            tone="accent"
          />
        </div>
      </section>

      <FaqSection
        eyebrow="Punjabi food FAQs"
        questions={faqItems}
        title="Common questions about Punjabi food ordering in Indore"
      />
      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
