import { motion } from 'framer-motion';

export const TrustBadges = ({ badges = [] }) => (
  <div className="app-trust-grid">
    {badges.map((badge, index) => {
      const Icon = badge.icon;

      return (
        <motion.article
          animate={{ opacity: 1, y: 0 }}
          className="app-trust-card"
          initial={{ opacity: 0, y: 10 }}
          key={badge.id}
          transition={{ delay: index * 0.04, duration: 0.2 }}
        >
          <span className="app-trust-icon">
            <Icon size={18} />
          </span>
          <div>
            <strong>{badge.title}</strong>
            <p>{badge.description}</p>
          </div>
        </motion.article>
      );
    })}
  </div>
);
