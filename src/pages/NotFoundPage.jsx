import { Link } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { SeoMeta } from '../components/seo/SeoMeta';

export const NotFoundPage = () => (
  <PageTransition>
    <SeoMeta noIndex title="Page Not Found" />
    <section className="section first-section">
      <div className="container center-stack">
        <p className="eyebrow">404</p>
        <h1>That page is off the menu.</h1>
        <p>The page you requested could not be found.</p>
        <Link className="btn btn-primary" to="/">
          Back home
        </Link>
      </div>
    </section>
  </PageTransition>
);
