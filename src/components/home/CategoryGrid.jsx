import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmartImage } from '../common/SmartImage';
import { getFallbackImage } from '../../data/fallbackImages';

export const CategoryGrid = ({ items = [] }) => (
  <div className="app-category-grid">
    {items.map((item, index) => (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="app-category-grid-card"
        initial={{ opacity: 0, y: 12 }}
        key={item.id}
        transition={{ delay: index * 0.03, duration: 0.22 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
      >
        <Link className="app-category-tile" to={item.to}>
          <div className="app-category-tile-visual">
            <SmartImage
              alt={`${item.title} food category`}
              className="app-category-tile-image"
              fallbackSrc={getFallbackImage(item.title)}
              sizes="(max-width: 768px) 33vw, (max-width: 1180px) 18vw, 120px"
              src={item.image}
            />
          </div>
          <div className="app-category-tile-copy">
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
          </div>
          <span className="app-category-tile-arrow">
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </motion.div>
    ))}
  </div>
);
