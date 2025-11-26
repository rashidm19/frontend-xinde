'use client';

import { type ReactNode } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

import { Logo } from './Logo';

const gradientDefaults = {
  from: 'from-[#F1F6FF]',
  via: 'via-[#F8FAFF]',
  to: 'to-[#FFFFFF]',
};

export interface AuthLayoutProps {
  children: ReactNode;
  headline?: string;
  tagline?: string;
  showHeadline?: boolean;
  rightSlot?: ReactNode;
  gradientClassName?: string;
  className?: string;
}

export function AuthLayout({
  children,
  headline = 'Study smarter with gentle structure.',
  tagline = 'Short, human moments of feedback that keep your IELTS journey feeling possible.',
  showHeadline = true,
  rightSlot,
  gradientClassName,
  className,
}: AuthLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn('relative min-h-screen w-full overflow-y-auto bg-gray-50', className)}>
      <div className='absolute left-[20rem] top-[20rem] z-20 flex items-center desktop:left-[36rem] desktop:top-[32rem]'>
        <Logo showStudyboxText className='h-[24rem] desktop:h-[28rem]' />
      </div>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute left-1/2 top-0 hidden desktop:block'
        style={{
          width: '1px',
          height: '100%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, rgba(148,163,184,0) 0%, rgba(148,163,184,0.35) 45%, rgba(148,163,184,0) 100%)',
        }}
      />
      <div className='relative z-10 mx-auto flex min-h-screen w-full flex-col gap-[36rem] px-[20rem] pb-[44rem] pt-[80rem] desktop:flex-row desktop:gap-0 desktop:px-0 desktop:pb-0 desktop:pt-0'>
        <div className='flex min-h-[calc(100svh-80rem)] w-full flex-1 items-center justify-center desktop:min-h-0 desktop:w-1/2 desktop:px-[44rem] desktop:py-[44rem]'>
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.4, ease: 'easeOut' }}
            className='w-full max-w-[520rem] desktop:max-w-[460rem]'
          >
            {children}
          </motion.div>
        </div>

        {(rightSlot || showHeadline) && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: 24 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
            className={cn(
              'relative hidden w-full bg-gradient-to-br text-center text-gray-800 desktop:flex desktop:w-1/2',
              gradientClassName ?? `${gradientDefaults.from} ${gradientDefaults.via} ${gradientDefaults.to}`
            )}
          >
            <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
              <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/images/bridge.png')" }} />
              <div className='absolute inset-0 bg-gradient-to-br from-white/80 via-white/70 to-white/60' />
            </div>
            <div className='relative z-10 flex h-[100svh] w-full items-center justify-center px-[44rem] py-[44rem]'>
              {rightSlot ??
                (showHeadline ? (
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.1 }}
                    className='flex w-full max-w-[400rem] flex-col items-center justify-center gap-[14rem]'
                  >
                    <span className='inline-flex items-center justify-center rounded-full bg-white/60 px-[14rem] py-[6rem] text-[11rem] font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-[0_14rem_34rem_-30rem_rgba(44,70,144,0.35)]'>
                      Studybox
                    </span>
                    <h2 className='text-[27rem] font-semibold leading-[1.24] text-gray-900 desktop:text-[33rem]'>{headline}</h2>
                    <p className='text-[14.5rem] leading-relaxed text-gray-600'>{tagline}</p>
                  </motion.div>
                ) : null)}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
