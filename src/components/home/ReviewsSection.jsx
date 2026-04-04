import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../../utils/storefront';

export const ReviewsSection = () => (
  <section className="section">
    <div className="container">
      <div className="section-heading">
        <div>
          <p className="eyebrow">⭐ Customer Reviews</p>
          <h2>Proof that keeps new customers confident and repeat buyers loyal</h2>
        </div>
      </div>

      <div className="reviews-row">
        {CUSTOMER_REVIEWS.map((review, index) => (
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
