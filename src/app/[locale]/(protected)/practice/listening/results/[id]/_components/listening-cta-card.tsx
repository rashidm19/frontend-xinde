'use client';

import Link from 'next/link';
import { type MouseEvent, memo } from 'react';

import { motion } from 'framer-motion';

interface ListeningCtaCardProps {
  startNewHref: string;
  onStartNew?: (event: MouseEvent<HTMLAnchorElement>) => void;
  shouldReduceMotion: boolean;
}

export const ListeningCtaCard = memo(function ListeningCtaCard({ startNewHref, onStartNew, shouldReduceMotion }: ListeningCtaCardProps) {
  return (
    <motion.section
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.35, ease: 'easeOut' }}
      className='rounded-[24rem] border border-[#CFE7D5] bg-white px-[18rem] py-[20rem] shadow-[0_16rem_44rem_-30rem_rgba(47,143,104,0.2)] tablet:rounded-[32rem] tablet:px-[28rem] tablet:py-[28rem]'
    >
      <div className='flex flex-col gap-[14rem] tablet:flex-row tablet:items-center tablet:justify-between'>
        <div className='flex flex-col gap-[6rem] text-[#0F3A2E]'>
          <h3 className='text-[16rem] font-semibold tablet:text-[18rem]'>Keep practising while the audio cues are fresh</h3>
          <p className='text-[12rem] text-[#0F3A2E]/75 tablet:text-[14rem]'>Sharpen attention to accents, refine timing, and see how your listening accuracy improves.</p>
        </div>
        <div className='flex flex-wrap items-center gap-[10rem]'>
          <Link
            href={startNewHref}
            onClick={event => {
              if (onStartNew) {
                onStartNew(event);
              }
            }}
            className='inline-flex items-center justify-center rounded-[999rem] bg-[#2F8F68] px-[18rem] py-[10rem] text-[13rem] font-semibold text-white shadow-[0_12rem_32rem_-24rem_rgba(47,143,104,0.35)] transition hover:bg-[#247052] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2F8F68] tablet:px-[22rem] tablet:py-[12rem] max-tablet:w-full'
          >
            Start new Listening test
          </Link>
        </div>
      </div>
    </motion.section>
  );
});
