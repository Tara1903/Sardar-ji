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
    question: 'Do you serve daily thali near Silicon Road in Indore?',
    answer:
      'Yes, Sardar Ji Food Corner serves customers near Silicon Road and Palm n Dine Market with pure veg thalis, repeat ordering, and a separate monthly plan option.',
  },
  {
    question: 'Can I order daily thali online for home or office delivery?',
    answer:
      'Yes, customers can order online from the menu, continue on WhatsApp if needed, and use the monthly plan page for recurring thali access.',
  },
  {
    question: 'What are your active hours for daily thali orders?',
    answer: `The store is currently active ${STORE_OPENING_HOURS_SHORT}.`,
  },
];

export const DailyThaliNearSiliconRoadPage = () => {
  const { settings } = useAppData();

  return (
    <PageTransition>
      <SeoMeta
        description="Daily thali near Silicon Road in Indore with pure veg meals, local delivery, and a monthly plan from Sardar Ji Food Corner."
        includeLocalBusiness
        keywords={[
          'daily thali near Silicon Road',
          'thali near Palm n Dine Market',
          'daily veg thali Indore',
          'Silicon Road food delivery Indore',
        ]}
        path="/daily-thali-near-silicon-road"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Daily Thali near Silicon Road', path: '/daily-thali-near-silicon-road' },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Daily Thali near Silicon Road"
      />
      <section className="section first-section">
        <div className="container local-landing-layout">
          <div className="panel-card local-landing-hero">
            <p className="eyebrow">Daily thali near Silicon Road</p>
            <h1>Local thali ordering built for nearby customers in Indore</h1>
            <p>
              This page targets customers around Silicon Road, Palm n Dine Market, and nearby
              neighbourhoods who want a dependable place for daily thali ordering and repeat veg meals.
            </p>
            <div className="local-landing-pills">
              <span className="hero-chip">
                <MapPin size={14} />
                Silicon Road, Indore
              </span>
              <span className="hero-chip">Local daily thali focus</span>
              <span className="hero-chip">{STORE_OPENING_HOURS_SHORT}</span>
            </div>
            <div className="landing-actions">
              <Link className="btn btn-primary" to="/menu">
                Order daily thali
              </Link>
              <Link className="btn btn-secondary" to="/monthly-thali-plan-indore">
                Monthly thali plan
              </Link>
            </div>
          </div>

          <div className="panel-card local-landing-side">
            <p className="eyebrow">Local advantages</p>
            <h2>Good fit for nearby repeat customers</h2>
            <div className="subscription-benefit-list">
              {['Strong Indore location match', 'Pure veg daily meal options', 'Fast reorder-friendly flow'].map((item) => (
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
            description="People nearby usually want easy repeat access to thalis, clear pricing, and a dependable veg option they can order again tomorrow without friction."
            eyebrow="Nearby ordering"
            title="Made for local customers near Silicon Road and Palm n Dine Market"
            tone="accent"
          />
        </div>
      </section>

      <FaqSection eyebrow="Daily thali FAQs" questions={faqItems} title="Common questions about daily thali near Silicon Road" />
      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
