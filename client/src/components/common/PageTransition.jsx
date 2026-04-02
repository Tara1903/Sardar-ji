import { motion } from 'framer-motion';

export const PageTransition = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.32, ease: 'easeOut' }}
  >
    {children}
  </motion.main>
);
