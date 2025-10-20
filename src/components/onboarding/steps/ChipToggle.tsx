'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ChipToggleProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string;
  active?: boolean;
}

export function ChipToggle({ label, active, className, ...rest }: ChipToggleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type='button'
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-[16rem] py-[8rem] text-[13rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2',
        active ? 'border-transparent bg-blue-600 text-white shadow-[0_14rem_30rem_-26rem_rgba(37,99,235,0.55)]' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40',
        className
      )}
      data-active={active}
      aria-pressed={active}
      title={label}
      {...rest}
    >
      {label}
    </motion.button>
  );
}
