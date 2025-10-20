'use client';

import type { MutableRefObject, ReactNode } from 'react';
import { useMemo } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

export interface OnboardingLayoutProps {
  heading: string;
  description?: string;
  supportingText?: string;
  children: ReactNode;
  footer?: ReactNode;
  progress?: ReactNode;
  className?: string;
  announcement?: string;
  headingRef?: MutableRefObject<HTMLHeadingElement | null>;
  headingId?: string;
}

export function OnboardingLayout({ heading, description, supportingText, children, footer, progress, className, announcement, headingRef, headingId }: OnboardingLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  const illustrationVariants = useMemo(
    () => ({
      initial: { scale: 1, y: 0 },
      animate: prefersReducedMotion
        ? undefined
        : {
            scale: [1, 1.03, 1],
            y: [0, -10, 0],
            transition: {
              repeat: Infinity,
              repeatType: 'mirror' as const,
              duration: 10,
              ease: 'easeInOut',
            },
          },
    }),
    [prefersReducedMotion]
  );

  return (
    <div className={cn('relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-white text-gray-900 tablet:h-[100svh] tablet:flex-row', className)}>
      <motion.aside
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }}
        className='relative flex h-[32vh] w-full flex-none overflow-hidden bg-slate-950 text-white shadow-[0_50rem_120rem_-80rem_rgba(23,37,84,0.55)] tablet:h-full tablet:w-1/2 tablet:flex-col tablet:justify-center tablet:shadow-none'
      >
        <motion.div className='absolute inset-0' initial={illustrationVariants.initial} animate={illustrationVariants.animate}>
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: "url('/images/shanghai.png')" }}
          />
          <div className='absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-transparent' />
        </motion.div>
        <div className='relative z-10 flex h-full w-full items-end justify-start px-[28rem] pb-[28rem] tablet:items-center tablet:justify-center tablet:px-[44rem] tablet:pb-0'>
          <div className='flex flex-col items-start gap-[10rem] text-left tablet:items-center tablet:text-center'>
            <span className='inline-flex w-fit items-center justify-center rounded-full bg-white/10 px-[14rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-[18rem]'>
              StudyBox
            </span>
            {supportingText ? (
              <p className='max-w-[360rem] text-[16rem] font-medium leading-[1.4] text-white/90 desktop:text-[18rem]'>{supportingText}</p>
            ) : null}
          </div>
        </div>
      </motion.aside>
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 32 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
        className='flex flex-1 items-stretch justify-center overflow-y-auto bg-gray-50/70 px-[20rem] py-[28rem] tablet:overflow-hidden tablet:px-[36rem] tablet:py-0'
      >
        <div className='relative my-auto flex w-full max-w-[500rem] flex-col gap-[18rem] rounded-[24rem] bg-white px-[24rem] pb-[24rem] pt-[28rem] shadow-[0_22rem_60rem_-50rem_rgba(15,23,42,0.45)] ring-1 ring-slate-100 tablet:max-h-[calc(100svh-96rem)] tablet:overflow-hidden tablet:px-[32rem] tablet:pb-[30rem] tablet:pt-[32rem]'>
          {progress ? <div aria-live='polite'>{progress}</div> : null}
          <header className='flex flex-col gap-[8rem]'>
            <h1
              ref={headingRef ?? undefined}
              id={headingId}
              tabIndex={-1}
              className='text-[26rem] font-semibold leading-[1.2] text-slate-900 outline-none desktop:text-[30rem]'
            >
              {heading}
            </h1>
            {description ? <p className='text-[14rem] leading-[1.6] text-slate-500'>{description}</p> : null}
          </header>
          <div className='flex flex-1 flex-col gap-[14rem] pr-[4rem] tablet:pr-0'>{children}</div>
          {footer ? <footer className='mt-auto pt-[14rem]'>{footer}</footer> : null}
          <span className='sr-only' aria-live='assertive'>
            {announcement}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
