"use client";

import { useMemo } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Infinity as InfinityIcon, Route, Sparkles } from 'lucide-react';

import { Logo } from '@/components/auth';
import { cn } from '@/lib/utils';

export interface FreePracticeUpsellModalProps {
  headingId?: string;
  descriptionId?: string;
  prefersReducedMotion?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  variant: 'desktop' | 'mobile';
}

export function FreePracticeUpsellModal({
  headingId,
  descriptionId,
  prefersReducedMotion = false,
  onPrimaryAction,
  onSecondaryAction,
  variant,
}: FreePracticeUpsellModalProps) {
  const highlightItems = useMemo<Array<{ label: string; Icon: LucideIcon }>>(
    () => [
      { label: 'Unlimited practice', Icon: InfinityIcon },
      { label: 'AI-powered feedback', Icon: Sparkles },
      { label: 'Personalised study plan', Icon: Route },
    ],
    []
  );

  const containerClass =
    variant === 'desktop'
      ? 'mx-auto flex w-[min(92vw,440rem)] flex-col items-center overflow-hidden rounded-[24rem] border border-white/75 bg-white px-[24rem] py-[26rem] shadow-[0_32rem_96rem_-72rem_rgba(32,48,128,0.42)] tablet:px-[28rem] tablet:py-[30rem]'
      : 'flex w-full flex-col items-center gap-[20rem] px-[24rem] pb-[32rem] pt-[12rem] text-center';

  const highlightsClass =
    variant === 'desktop'
      ? 'mt-[18rem] flex w-full items-center justify-center gap-[18rem] tablet:gap-[20rem]'
      : 'mt-[18rem] grid w-full grid-cols-1 gap-[16rem]';

  const highlightItemClass =
    variant === 'desktop'
      ? 'flex min-w-0 flex-1 flex-col items-center gap-[8rem] text-center'
      : 'flex w-full flex-col items-center gap-[8rem] text-center';

  const primaryButtonClass =
    variant === 'desktop'
      ? 'inline-flex w-full max-w-[260rem] items-center justify-center rounded-full bg-[#3E4CFF] px-[22rem] py-[11rem] text-[13.5rem] font-semibold text-white shadow-[0_18rem_44rem_-28rem_rgba(62,76,255,0.5)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A86FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:bg-[#3543F2] active:bg-[#2D3ADA]'
      : 'inline-flex w-full items-center justify-center rounded-full bg-[#3E4CFF] px-[22rem] py-[12rem] text-[14rem] font-semibold text-white shadow-[0_18rem_44rem_-28rem_rgba(62,76,255,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A86FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:bg-[#3543F2] active:bg-[#2D3ADA]';

  const secondaryButtonClass =
    variant === 'desktop'
      ? 'text-[12rem] font-semibold text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
      : 'text-[13rem] font-semibold text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2';

  const ctaContainerClass =
    variant === 'desktop' ? 'mt-[24rem] flex w-full flex-col items-center gap-[10rem]' : 'mt-[22rem] flex w-full flex-col items-stretch gap-[12rem]';

  return (
    <div className={containerClass}>
      <div className='flex w-full flex-col items-center text-center'>
        <motion.div
          className={cn('flex items-center justify-center shadow-[0_0_48rem_-32rem_rgba(68,90,255,0.46)]', variant === 'desktop' ? 'mb-[24rem]' : 'mb-[18rem]')}
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.32, ease: 'easeOut' }}
        >
          <Logo showStudyboxText />
        </motion.div>
        <DialogPrimitive.Title id={headingId} className='text-[18.5rem] font-semibold leading-[1.32] text-slate-900 tablet:text-[21.5rem]'>
          Great job — you’ve completed your free practice!
        </DialogPrimitive.Title>
        <DialogPrimitive.Description id={descriptionId} className='mt-[9rem] max-w-[392rem] text-[13rem] leading-[1.58] text-slate-500 tablet:text-[14rem]'>
          You’ve taken your first step. With Studybox Pro, you can unlock unlimited practice, AI feedback, and your personalised study roadmap.
        </DialogPrimitive.Description>
      </div>

      <div className={highlightsClass}>
        {highlightItems.map(item => (
          <div key={item.label} className={highlightItemClass}>
            <span className='flex size-[30rem] items-center justify-center rounded-full border border-slate-200/70 bg-slate-50'>
              <item.Icon className='size-[16rem] text-[#4653FE]' aria-hidden='true' />
            </span>
            <span className='text-[12.8rem] font-medium leading-[1.45] text-slate-600 tablet:text-[13.2rem]'>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={ctaContainerClass}>
        <button type='button' className={primaryButtonClass} onClick={onPrimaryAction}>
          See subscription plans
        </button>
        <button type='button' className={secondaryButtonClass} onClick={onSecondaryAction}>
          Not now
        </button>
      </div>
    </div>
  );
}
