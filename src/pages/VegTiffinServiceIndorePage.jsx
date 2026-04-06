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
    question: 'Do you offer a veg tiffin service in Indore for daily meals?',
    answer:
      'Yes, Sardar Ji Food Corner is a pure veg local food service in Indore with thalis, daily ordering, and a separate monthly plan for recurring customers.',
  },
  {
    question: 'Is the tiffin service suitable for students and working professionals?',
    answer:
      'Yes, our meal flow works well for office workers, students, and families who want quick repeat ordering and reliable daily food delivery.',
  },
  {
    question: 'Can I also buy a monthly thali plan?',
    answer:
      'Yes, the Monthly Thali plan is handled as a dedicated subscription so customers can manage validity and reorders separately from normal food orders.',
  },
];

export const VegTiffinServiceIndorePage = () => {
  const { settings } = useAppData();

  return (
    <PageTransition>
      <SeoMeta
        description="Veg tiffin service in Indore with pure veg meals, quick repeat ordering, and monthly thali subscriptions from Sardar Ji Food Corner."
        includeLocalBusiness
        keywords={[
          'veg tiffin service in Indore',
          'pure veg tiffin service Indore',
          'daily veg meals Indore',
          'monthly tiffin Indore',
        ]}
        path="/veg-tiffin-service-indore"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Veg Tiffin Service Indore', path: '/veg-tiffin-service-indore' },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Veg Tiffin Service in Indore"
      />
      <section className="section first-section">
        <div className="container local-landing-layout">
          <div className="panel-card local-landing-hero">
            <p className="eyebrow">Veg tiffin service in Indore</p>
            <h1>Pure veg daily meals made easy for work, hostel, and home</h1>
            <p>
              This page is built for customers searching for a veg tiffin service in Indore that is
              affordable, repeat-friendly, and easy to manage from a phone.
            </p>
            <div className="local-landing-pills">
              <span className="hero-chip">
                <MapPin size={14} />
                Located near Palm n Dine Market
              </span>
              <span className="hero-chip">Pure veg only</span>
              <span className="hero-chip">{STORE_OPENING_HOURS_SHORT}</span>
            </div>
            <div className="landing-actions">
              <Link className="btn btn-primary" to="/my-subscription?checkout=1">
                Start monthly plan
              </Link>
              <Link className="btn btn-secondary" to="/menu">
                Browse veg menu
              </Link>
            </div>
          </div>

          <div className="panel-card local-landing-side">
            <p className="eyebrow">Best suited for</p>
            <h2>Customers who want dependable repeat ordering</h2>
            <div className="subscription-benefit-list">
              {['Office lunches', 'Student meals', 'Home-style daily thalis'].map((item) => (
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
            description="The experience is designed around quick scanning, easy reorders, and a dedicated monthly plan so regular customers do not need to start from scratch every day."
            eyebrow="Why it works"
            title="A simpler veg tiffin flow for busy Indore customers"
            tone="accent"
          />
        </div>
      </section>

      <FaqSection eyebrow="Veg tiffin FAQs" questions={faqItems} title="Common questions about our veg tiffin service in Indore" />
      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
