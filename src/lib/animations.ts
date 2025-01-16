import { theme } from '@/styles/theme';

// Framer Motion variants for common animations
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: parseFloat(theme.animation.duration.normal) / 1000,
      ease: theme.animation.easing.easeInOut
    }
  },

  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: {
      duration: parseFloat(theme.animation.duration.normal) / 1000,
      ease: theme.animation.easing.easeOut
    }
  },

  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: {
      duration: parseFloat(theme.animation.duration.normal) / 1000,
      ease: theme.animation.easing.easeOut
    }
  },

  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: {
      duration: parseFloat(theme.animation.duration.normal) / 1000,
      ease: theme.animation.easing.spring
    }
  },

  // Stagger children animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: {
      duration: parseFloat(theme.animation.duration.page) / 1000,
      ease: theme.animation.easing.easeInOut
    }
  },

  // Modal/Dialog animations
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: parseFloat(theme.animation.duration.normal) / 1000
      }
    },
    content: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
      transition: {
        duration: parseFloat(theme.animation.duration.normal) / 1000,
        ease: theme.animation.easing.spring
      }
    }
  },

  // Chart animations
  chart: {
    line: {
      initial: { pathLength: 0, opacity: 0 },
      animate: { pathLength: 1, opacity: 1 },
      transition: {
        duration: parseFloat(theme.animation.duration.slow) / 1000,
        ease: theme.animation.easing.easeOut
      }
    },
    bar: {
      initial: { scaleY: 0, opacity: 0 },
      animate: { scaleY: 1, opacity: 1 },
      transition: {
        duration: parseFloat(theme.animation.duration.normal) / 1000,
        ease: theme.animation.easing.spring
      }
    }
  },

  // Loading states
  loading: {
    spinner: {
      animate: {
        rotate: 360
      },
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    },
    pulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.5, 1]
      },
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },

  // Hover effects
  hover: {
    scale: {
      scale: 1.05,
      transition: {
        duration: parseFloat(theme.animation.duration.fast) / 1000,
        ease: theme.animation.easing.spring
      }
    },
    lift: {
      y: -5,
      transition: {
        duration: parseFloat(theme.animation.duration.fast) / 1000,
        ease: theme.animation.easing.spring
      }
    }
  },

  // List item animations
  listItem: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: {
      duration: parseFloat(theme.animation.duration.normal) / 1000,
      ease: theme.animation.easing.easeOut
    }
  },

  // Notification animations
  notification: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
    transition: {
      duration: parseFloat(theme.animation.duration.normal) / 1000,
      ease: theme.animation.easing.spring
    }
  }
};
