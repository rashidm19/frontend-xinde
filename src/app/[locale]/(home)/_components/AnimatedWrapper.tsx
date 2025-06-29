import { motion } from 'framer-motion';
import React from 'react';

const perspective = {
  initial: {
    opacity: 0,
    rotateX: 90,
    translateY: 80,
    translateX: -20,
  },
  enter: (i: number) => ({
    opacity: 1,
    rotateX: 0,
    translateY: 0,
    translateX: 0,
    transition: {
      duration: 0.65,
      delay: 0.5 + i * 0.1,
      ease: [0.215, 0.61, 0.355, 1],
      opacity: { duration: 0.35 },
    },
  }),
  exit: {
    opacity: 0,
    transition: { duration: 0.5, type: 'linear', ease: [0.76, 0, 0.24, 1] },
  },
};

interface AnimatedWrapperProps {
  index: number;
  children: React.ReactNode;
}

// This wrapper applies both the animation and the perspective styling.
export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({ index, children }) => {
  return (
    <motion.div
      variants={perspective}
      custom={index}
      initial='initial'
      animate='enter'
      exit='exit'
      // inline style for perspective (Tailwind doesn't include this by default)
      style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}
    >
      {children}
    </motion.div>
  );
};
