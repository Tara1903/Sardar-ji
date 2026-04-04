import { MessageSquareQuote } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const createEmptyReview = () => ({
  id: `review-${Date.now()}`,
  author: '',
  quote: '',
  rating: 5,
});

export const AdminReviewsPage = () => {
  const {
    saveSettings,
    savingSettings,
    settingsDraft,
    updateStorefrontReviewList,
  } = useAdmin();

  if (!settingsDraft) {
    return null;
  }

  const reviews = settingsDraft.storefront?.reviews || [];

  return (
    <section className="admin-page-grid">
      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Customer reviews</p>
            <h2>Manage trust-building quotes</h2>
          </div>
          <MessageSquareQuote size={18} />
        </div>

        <div className="stack-list">
          {reviews.map((review, index) => (
            <div className="admin-list-card" key={review.id || `${index}`}>
              <div className="admin-form-stack">
                <label>
                  Customer name
                  <input
                    onChange={(event) =>
                      updateStorefrontReviewList((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, author: event.target.value } : item,
                        ),
                      )
                    }
                    value={review.author || ''}
                  />
                </label>

                <label>
                  Review text
                  <textarea
                    onChange={(event) =>
                      updateStorefrontReviewList((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, quote: event.target.value } : item,
                        ),
                      )
                    }
                    rows="4"
                    value={review.quote || ''}
                  />
                </label>

                <label>
                  Rating
                  <input
                    max="5"
                    min="1"
                    onChange={(event) =>
                      updateStorefrontReviewList((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, rating: Number(event.target.value) || 5 }
                            : item,
                        ),
                      )
                    }
                    type="number"
                    value={review.rating || 5}
                  />
                </label>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  updateStorefrontReviewList((current) => current.filter((item) => item.id !== review.id))
                }
                type="button"
              >
                Remove review
              </button>
            </div>
          ))}
        </div>

        <div className="admin-button-stack">
          <button
            className="btn btn-secondary"
            onClick={() => updateStorefrontReviewList((current) => [...current, createEmptyReview()])}
            type="button"
          >
            Add review
          </button>
          <button
            className="btn btn-primary"
            disabled={savingSettings}
            onClick={() => saveSettings(settingsDraft)}
            type="button"
          >
            {savingSettings ? 'Saving...' : 'Save reviews'}
          </button>
        </div>
      </article>
    </section>
  );
};
