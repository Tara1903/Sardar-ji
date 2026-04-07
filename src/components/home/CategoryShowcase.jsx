import { motion } from 'framer-motion';
import { getFallbackImage } from '../../data/fallbackImages';
import { SmartImage } from '../common/SmartImage';

export const CategoryShowcase = ({
  categories = [],
  activeCategory = 'All',
  onSelectCategory,
  showAll = true,
}) => {
  const categoryItems = showAll
    ? [
        {
          id: 'all',
          name: 'All',
          image:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        },
        ...categories,
      ]
    : categories;

  return (
    <div
      className="category-showcase"
      role="tablist"
      aria-label="Food categories"
    >
      {categoryItems.map((category, index) => {
        const isActive = activeCategory === category.name;

        return (
          <motion.button
            className={`category-orb ${isActive ? 'active' : ''}`.trim()}
            key={category.id || category.name}
            onClick={() => onSelectCategory?.(category.name)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.22 }}
          >
            <span className="category-orb-image-wrap">
              <SmartImage
                alt={`${category.name} pure veg dishes in Indore`}
                className="category-orb-image"
                fallbackSrc={getFallbackImage(category.name)}
                loading="lazy"
                sizes="80px"
                wrapperClassName="category-orb-image-frame"
                src={category.image}
              />
            </span>
            <span className="category-orb-label">{category.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
