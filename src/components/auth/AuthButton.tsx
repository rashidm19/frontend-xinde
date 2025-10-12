'use client';

import { ReactNode } from 'react';

import { HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface AuthButtonProps extends HTMLMotionProps<'button'> {
  loading?: boolean;
  children?: ReactNode;
}

export function AuthButton({ loading, children, className, disabled, ...props }: AuthButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={prefersReducedMotion || isDisabled ? undefined : { scale: 1.02, boxShadow: '0 18px 48px -26px rgba(30,64,175,0.45)' }}
      whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={cn(
        'relative flex h-[48rem] w-full items-center justify-center gap-[10rem] rounded-[18rem] bg-blue-600 text-[15rem] font-semibold text-white shadow-[0_18rem_50rem_-32rem_rgba(36,74,180,0.55)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400',
        className
      )}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      {...props}
    >
      <span className={cn('flex items-center gap-[10rem]', loading && 'opacity-0')}>{children}</span>
      {loading ? (
        <span className='absolute inset-0 flex items-center justify-center' aria-hidden='true'>
          <span className='size-[20rem] animate-spin rounded-full border-[3rem] border-white/40 border-t-white' />
        </span>
      ) : null}
    </motion.button>
  );
}
