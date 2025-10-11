'use client';

import type { ReactNode } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface FormCardProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function FormCard({ title, subtitle, eyebrow, children, footer, className }: FormCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col gap-[20rem] rounded-[20rem] border border-white/70 bg-white/96 px-[28rem] pt-[26rem] pb-[14rem] shadow-[0_18rem_50rem_-28rem_rgba(15,23,42,0.32)] backdrop-blur-sm',
        className
      )}
    >
      <header className='flex flex-col gap-[10rem]'>
        {eyebrow ? (
          <span className='inline-flex w-fit items-center rounded-full bg-gray-100 px-[12rem] py-[6rem] text-[11rem] font-semibold uppercase tracking-[0.18em] text-gray-600'>
            {eyebrow}
          </span>
        ) : null}
        <div className='flex flex-col gap-[6rem] text-left'>
          <h1 className='text-center text-[25rem] font-semibold leading-[1.22] tracking-tight text-gray-900 desktop:text-[27rem]'>{title}</h1>
          {subtitle ? <p className='text-center text-[14.5rem] leading-relaxed text-gray-500'>{subtitle}</p> : null}
        </div>
      </header>

      <div className='flex flex-col gap-[14rem]'>{children}</div>

      {footer ? <footer className='border-t border-gray-100 pt-[12rem] text-[12.5rem] text-gray-500'>{footer}</footer> : null}

      <p className='text-[11.5rem] font-medium text-gray-300 text-center'>© 2025 StudyBox. All rights reserved.</p>
    </motion.section>
  );
}
