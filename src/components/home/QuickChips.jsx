import { motion } from 'framer-motion';

export const QuickChips = ({ activeChip = 'all', chips = [], onSelectChip, className = '' }) => (
  <div
    aria-label="Quick browse filters"
    className={`quick-chip-strip ${className}`.trim()}
    role="tablist"
  >
    {chips.map((chip, index) => {
      const isActive = chip.id === activeChip;

      return (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className={`quick-chip ${isActive ? 'active' : ''}`.trim()}
          initial={{ opacity: 0, y: 10 }}
          key={chip.id}
          onClick={() => onSelectChip?.(chip.id)}
          role="tab"
          tabIndex={isActive ? 0 : -1}
          transition={{ delay: index * 0.03, duration: 0.18 }}
          type="button"
          whileTap={{ scale: 0.97 }}
        >
          {chip.label}
        </motion.button>
      );
    })}
  </div>
);
