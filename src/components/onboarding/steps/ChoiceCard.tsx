'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ChoiceCardProps extends Omit<HTMLMotionProps<'button'>, 'layout'> {
  label: string;
  description?: string;
  active?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export function ChoiceCard({ label, description, active, layout = 'vertical', className, ...rest }: ChoiceCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const cardTitle = description ? `${label} — ${description}` : label;

  return (
    <motion.button
      type='button'
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      className={cn(
        'group relative flex w-full overflow-hidden rounded-[18rem] border px-[18rem] py-[14rem] pr-[38rem] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2',
        layout === 'horizontal' ? 'items-center gap-[10rem]' : 'flex-col items-start gap-[6rem]',
        active
          ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-[0_18rem_48rem_-42rem_rgba(37,99,235,0.55)]'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/30'
      )}
      title={cardTitle}
      data-active={active}
      {...rest}
    >
      <span className='max-w-full truncate text-[13.5rem] font-semibold leading-[1.3]'>{label}</span>
      {description ? <span className='max-w-full truncate text-[12rem] leading-[1.45] text-slate-500 group-data-[active=true]:text-blue-600'>{description}</span> : null}
      <span
        aria-hidden='true'
        className={cn('pointer-events-none absolute inset-y-[8rem] right-[12rem] my-auto h-[16rem] w-[16rem] rounded-full border-2', active ? 'border-blue-600 bg-blue-600' : 'border-slate-300')}
      />
    </motion.button>
  );
}
