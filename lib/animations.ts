import { Variants } from "framer-motion"

// Optimized animation variants for better performance
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1], // Custom easing for smoother animation
    }
  }
}

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Smooth easing
    }
  }
}

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -60,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
    }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
}

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    }
  }
}

export const slideInFromBottom: Variants = {
  hidden: { 
    y: 100, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const slideInFromTop: Variants = {
  hidden: { 
    y: -100, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const rotateIn: Variants = {
  hidden: { 
    opacity: 0, 
    rotate: -180,
    scale: 0.5,
  },
  visible: { 
    opacity: 1, 
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    }
  }
}

export const floatAnimation: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
}

// Hover effects - simplified for type compatibility
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
}

export const hoverLift = {
  y: -8,
  transition: { duration: 0.2 }
}

export const tapScale = {
  scale: 0.95,
  transition: { duration: 0.1 }
}

// Page transition
export const pageTransition: Variants = {
  hidden: { 
    opacity: 0,
    x: -20,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    }
  },
  exit: { 
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    }
  }
}

// Smooth scroll reveal
export const scrollReveal: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
}

// Card animations - simplified for type compatibility
export const cardHover = {
  scale: 1.02,
  y: -5,
  transition: { duration: 0.3 }
}

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
}
