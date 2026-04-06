import { motion } from 'framer-motion';
import { PAGE_TRANSITION_VARIANTS } from '../../motion/variants';

export const PageTransition = ({ children }) => (
  <motion.main
    animate="animate"
    exit="exit"
    initial="initial"
    variants={PAGE_TRANSITION_VARIANTS}
  >
    {children}
  </motion.main>
);
