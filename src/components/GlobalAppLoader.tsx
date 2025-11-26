'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { useAppBootstrapReady } from '@/hooks/useAppBootstrapReady';

export const GlobalAppLoader = () => {
  const isBootstrapReady = useAppBootstrapReady();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [shouldRender, setShouldRender] = useState(() => !isBootstrapReady);

  useEffect(() => {
    if (isBootstrapReady) {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [isBootstrapReady]);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isBootstrapReady ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col items-center justify-center gap-[28rem] bg-gradient-to-b from-white to-d-blue-secondary px-[24rem]"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center gap-[8rem]"
          >
            <span className="text-[32rem] font-bold text-d-black">Studybox</span>
            <span className="text-[12rem] font-medium uppercase tracking-[0.3em] text-d-black/60">IELTS Preparation</span>
          </motion.div>

          <div className="flex items-center gap-[8rem]" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="size-[10rem] rounded-full bg-d-blue"
                animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </div>

          <div className="space-y-[8rem] text-center">
            <p className="text-[20rem] font-semibold text-d-black">Preparing your learning space...</p>
            <p className="text-[14rem] text-d-black/70">Setting up your personalized experience</p>
          </div>

          <motion.span
            aria-hidden="true"
            className="h-[4px] w-[220rem] rounded-full bg-d-blue"
            initial={{ scaleX: 0 }}
            animate={shouldReduceMotion ? { scaleX: 1 } : { scaleX: [0, 0.85, 0.4, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
