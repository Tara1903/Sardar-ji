import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { VisitUsSection } from '../components/home/VisitUsSection';
import { FaqSection } from '../components/seo/FaqSection';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { formatCurrency } from '../utils/format';
import {
  MONTHLY_SUBSCRIPTION_BENEFITS,
  MONTHLY_SUBSCRIPTION_PLAN_NAME,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../utils/subscription';
import { STORE_OPENING_HOURS_SHORT } from '../utils/storefront';
import { createBreadcrumbSchema, createFaqSchema } from '../seo/siteSeo';

export const MonthlyThaliPlanIndorePage = () => {
  const { settings } = useAppData();
  const faqItems = [
    {
      question: 'How long is the monthly thali plan valid?',
      answer: 'The monthly thali plan stays active for 30 days from the date of activation.',
    },
    {
      question: 'Is the monthly thali plan available for customers in Indore only?',
      answer:
        'Yes, this plan is designed for local Indore customers within the delivery coverage managed by Sardar Ji Food Corner.',
    },
    {
      question: 'What are the active hours for the plan and regular ordering?',
      answer: `The store is currently active ${STORE_OPENING_HOURS_SHORT}.`,
    },
  ];

  return (
    <PageTransition>
      <SeoMeta
        description="Monthly thali plan in Indore with pure veg meals, daily convenience, and affordable subscription pricing from Sardar Ji Food Corner."
        includeLocalBusiness
        keywords={[
          'monthly thali plan Indore',
          'monthly tiffin service Indore',
          'veg thali subscription Indore',
          'affordable thali plan Indore',
        ]}
        path="/monthly-thali-plan-indore"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Monthly Thali Plan Indore', path: '/monthly-thali-plan-indore' },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Monthly Thali Plan Indore"
      />
      <section className="section first-section">
        <div className="container local-landing-layout">
          <div className="panel-card local-landing-hero">
            <p className="eyebrow">Monthly thali plan in Indore</p>
            <h1>Daily pure veg meals with a simple monthly thali subscription</h1>
            <p>
              If you need a dependable monthly thali plan in Indore for work, hostel, or home, this
              page is built for that exact search. Subscribe once, track your validity, and keep your
              daily meal routine simple.
            </p>
            <div className="local-landing-pills">
              <span className="hero-chip">
                <MapPin size={14} />
                Palm n Dine Market, Indore
              </span>
              <span className="hero-chip">{formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)} for 30 days</span>
              <span className="hero-chip">{STORE_OPENING_HOURS_SHORT}</span>
            </div>
            <div className="landing-actions">
              <Link className="btn btn-primary" to="/my-subscription?checkout=1">
                Subscribe Now
              </Link>
              <Link className="btn btn-secondary" to="/menu">
                View Menu
              </Link>
            </div>
          </div>

          <div className="panel-card local-landing-side">
            <p className="eyebrow">What you get</p>
            <h2>{MONTHLY_SUBSCRIPTION_PLAN_NAME}</h2>
            <div className="subscription-benefit-list">
              {MONTHLY_SUBSCRIPTION_BENEFITS.map((benefit) => (
                <div className="subscription-benefit-row" key={benefit}>
                  <CheckCircle2 size={16} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PromoBanner
            description="This dedicated subscription is separate from the regular menu so recurring customers can manage daily thali access more easily."
            eyebrow="Who this is for"
            title="A practical fit for office workers, students, and families in Indore"
            tone="accent"
          />
        </div>
      </section>

      <section className="section local-copy-section">
        <div className="container">
          <div className="panel-card local-copy-card">
            <h2>Why this monthly thali plan works for Indore customers</h2>
            <p>
              People searching for a monthly thali plan in Indore usually want predictable pricing,
              pure veg food, and a routine they can trust. This plan is designed to give exactly that,
              while keeping daily ordering friction low.
            </p>
            <p>
              It also supports customers who are already looking for a tiffin service in Indore and
              want the convenience of a longer meal plan instead of placing one-off orders every day.
            </p>
          </div>
        </div>
      </section>

      <FaqSection
        eyebrow="Monthly plan FAQs"
        questions={faqItems}
        title="Common questions about our monthly thali plan in Indore"
      />
      <ReviewsSection />
      <VisitUsSection />
    </PageTransition>
  );
};
