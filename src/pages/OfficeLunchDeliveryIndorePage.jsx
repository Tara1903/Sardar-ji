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
    question: 'Do you provide office lunch delivery in Indore?',
    answer:
      'Yes, Sardar Ji Food Corner supports quick lunch ordering in Indore for office teams and solo customers looking for pure veg thalis, paneer meals, and snacks.',
  },
  {
    question: 'Is the ordering flow fast enough for lunch-hour orders?',
    answer:
      'Yes, the website is designed for fast scanning, quick cart updates, and repeat orders so customers can place lunch orders without extra friction.',
  },
  {
    question: 'Can office customers also use the monthly thali plan?',
    answer:
      'Yes, recurring office customers can activate the Monthly Thali plan separately and manage it from their account page.',
  },
];

export const OfficeLunchDeliveryIndorePage = () => {
  const { settings } = useAppData();

  return (
    <PageTransition>
      <SeoMeta
        description="Office lunch delivery in Indore with pure veg thalis, paneer dishes, and repeat-friendly ordering from Sardar Ji Food Corner."
        includeLocalBusiness
        keywords={[
          'office lunch delivery Indore',
          'office veg lunch Indore',
          'thali delivery for office Indore',
          'work lunch delivery Indore',
        ]}
        path="/office-lunch-delivery-indore"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Office Lunch Delivery Indore', path: '/office-lunch-delivery-indore' },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Office Lunch Delivery in Indore"
      />
      <section className="section first-section">
        <div className="container local-landing-layout">
          <div className="panel-card local-landing-hero">
            <p className="eyebrow">Office lunch delivery in Indore</p>
            <h1>Fast lunch ordering for office teams and busy workdays</h1>
            <p>
              Customers searching for office lunch delivery in Indore usually need speed, reliable
              pricing, and food that is easy to order again. That is exactly what this flow supports.
            </p>
            <div className="local-landing-pills">
              <span className="hero-chip">
                <MapPin size={14} />
                Near Silicon Road and Palm n Dine Market
              </span>
              <span className="hero-chip">Quick thali-friendly ordering</span>
              <span className="hero-chip">{STORE_OPENING_HOURS_SHORT}</span>
            </div>
            <div className="landing-actions">
              <Link className="btn btn-primary" to="/menu">
                Order lunch now
              </Link>
              <Link className="btn btn-secondary" to="/my-subscription?checkout=1">
                Explore monthly plan
              </Link>
            </div>
          </div>

          <div className="panel-card local-landing-side">
            <p className="eyebrow">Strong lunch picks</p>
            <h2>Built for repeat office ordering</h2>
            <div className="subscription-benefit-list">
              {['Quick thali orders', 'Paneer and paratha options', 'Easy reorder flow'].map((item) => (
                <div className="subscription-benefit-row" key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PromoBanner
            description="The menu and cart are designed to reduce lunch-hour friction, which helps office customers get from browse to checkout quickly."
            eyebrow="Lunch ordering advantage"
            title="A practical local lunch option for Indore offices"
            tone="accent"
          />
        </div>
      </section>

      <FaqSection eyebrow="Office lunch FAQs" questions={faqItems} title="Common questions about office lunch delivery in Indore" />
      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
