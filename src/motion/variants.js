export const SPRING_FAST = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

export const SPRING_SMOOTH = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

export const PAGE_TRANSITION_VARIANTS = {
  initial: {
    opacity: 0,
    x: 24,
    y: 10,
    scale: 0.992,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.42,
    },
  },
  exit: {
    opacity: 0,
    x: -18,
    y: -10,
    scale: 0.992,
    transition: {
      duration: 0.24,
      ease: 'easeInOut',
    },
  },
};

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const STAGGER_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.985,
  },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.34,
      delay: index * 0.045,
    },
  }),
};

export const CARD_MOTION_VARIANTS = {
  hidden: STAGGER_ITEM_VARIANTS.hidden,
  show: STAGGER_ITEM_VARIANTS.show,
  hover: {
    y: -10,
    scale: 1.012,
    transition: SPRING_FAST,
  },
  tap: {
    y: -2,
    scale: 0.988,
    transition: SPRING_FAST,
  },
};

export const CARD_IMAGE_VARIANTS = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.055,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export const BUTTON_PRESS_VARIANTS = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.018,
    transition: SPRING_FAST,
  },
  tap: {
    scale: 0.96,
    transition: {
      ...SPRING_FAST,
      stiffness: 500,
    },
  },
};

export const FLOATING_CART_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_FAST,
      duration: 0.32,
    },
  },
  exit: {
    opacity: 0,
    y: 24,
    scale: 0.96,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
};

export const FLOATING_CART_BADGE_VARIANTS = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_FAST,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -8,
    transition: {
      duration: 0.16,
    },
  },
};

export const HERO_SLIDE_VARIANTS = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 1.015,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.985,
    transition: {
      duration: 0.22,
      ease: 'easeInOut',
    },
  },
};

export const HERO_IMAGE_VARIANTS = {
  initial: {
    scale: 1.08,
  },
  animate: {
    scale: 1.02,
    transition: {
      duration: 0.75,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.06,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export const HERO_CONTENT_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 26,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.38,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const HERO_CONTENT_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.28,
    },
  },
};

export const QUANTITY_SWAP_VARIANTS = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRING_FAST,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: {
      duration: 0.16,
      ease: 'easeOut',
    },
  },
};

export const SURFACE_REVEAL_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.34,
    },
  },
};

export const CONTENT_STACK_VARIANTS = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const CONTENT_FADE_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.28,
    },
  },
};

export const TIMELINE_STEP_VARIANTS = {
  hidden: {
    opacity: 0,
    x: -18,
    y: 12,
  },
  show: (index = 0) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      ...SPRING_SMOOTH,
      duration: 0.28,
      delay: index * 0.05,
    },
  }),
};
