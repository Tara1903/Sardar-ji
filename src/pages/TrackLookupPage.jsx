import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { SeoMeta } from '../components/seo/SeoMeta';

export const TrackLookupPage = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!orderId.trim()) {
      return;
    }

    navigate(`/track/${orderId.trim()}`);
  };

  return (
    <PageTransition>
      <SeoMeta noIndex path="/track" title="Track Order" />
      <section className="section first-section">
        <div className="container">
          <div className="panel-card track-lookup-card">
            <p className="eyebrow">Track your order</p>
            <h1>Enter your order ID for live updates</h1>
            <p>
              Use the order ID from your confirmation screen to view status updates, ETA, and
              delivery location.
            </p>

            <form className="track-lookup-form" onSubmit={handleSubmit}>
              <label className="search-bar">
                <Search size={18} />
                <input
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="Paste your order ID"
                  value={orderId}
                />
              </label>
              <button className="btn btn-primary" type="submit">
                Track order
              </button>
            </form>

            <Link className="text-link" to="/profile">
              View your recent orders
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
