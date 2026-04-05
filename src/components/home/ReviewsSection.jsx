import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { STORE_MAP_URL } from '../../utils/storefront';

export const ReviewsSection = () => {
  const { appConfig } = useAppData();
  const reviews = appConfig.reviews || [];

  if (!reviews.length) {
    return null;
  }

  return (
    <section className="section reviews-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">⭐ Customer Reviews</p>
            <h2>Local trust that keeps first-time customers comfortable</h2>
          </div>
          <a className="text-link" href={STORE_MAP_URL} rel="noreferrer" target="_blank">
            Leave a review
          </a>
        </div>

        <div className="reviews-row">
          {reviews.map((review, index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="review-card"
              initial={{ opacity: 0, y: 20 }}
              key={review.id}
              transition={{ delay: index * 0.06, duration: 0.28 }}
              viewport={{ once: true, amount: 0.25 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="review-stars">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star fill="currentColor" key={`${review.id}-${starIndex}`} size={16} />
                ))}
              </div>
              <p>{review.quote}</p>
              <strong>{review.author}</strong>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
