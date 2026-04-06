import { ExternalLink, Star } from 'lucide-react';
import { trackReviewIntent } from '../../utils/analytics';

const stars = [1, 2, 3, 4, 5];

export const ReviewRequestCard = ({ orderId, reviewUrl, source = 'order-history' }) => (
  <div className="panel-card review-request-card">
    <div>
      <p className="eyebrow">Loved the order?</p>
      <h3>Leave a quick Google review</h3>
      <p>Your feedback helps more local customers in Indore find us faster.</p>
    </div>

    <div className="review-request-stars" aria-hidden="true">
      {stars.map((star) => (
        <Star fill="currentColor" key={star} size={18} />
      ))}
    </div>

    <a
      className="btn btn-primary"
      href={reviewUrl}
      onClick={() => trackReviewIntent({ orderId, source })}
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink size={16} />
      Leave a review
    </a>
  </div>
);
