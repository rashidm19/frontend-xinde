'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { cn } from '@/lib/utils';

interface OfferCountdownProps {
  /** ISO timestamp the offer closes at (server-authoritative). */
  expiresAt: string;
  discountPct: number;
  onExpire?: () => void;
  className?: string;
}

const remainingSeconds = (iso: string): number => {
  const end = Date.parse(iso);
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
};

const pad = (n: number) => String(n).padStart(2, '0');

// Bright, urgent — but truthful — countdown bound to the real per-user offer expiry.
// When it reaches zero it removes itself and fires onExpire so the cards revert to
// the full (non-discounted) price.
export const OfferCountdown = ({ expiresAt, discountPct, onExpire, className }: OfferCountdownProps) => {
  const { t } = useCustomTranslations('pricesModal');
  const prefersReducedMotion = useReducedMotion();
  const [secs, setSecs] = useState(() => remainingSeconds(expiresAt));
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    setSecs(remainingSeconds(expiresAt));
    const id = setInterval(() => setSecs(remainingSeconds(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    if (secs <= 0 && !firedRef.current) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [secs, onExpire]);

  if (secs <= 0) return null;

  const hh = Math.floor(secs / 3600);
  const mm = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;
  const segments = [pad(hh), pad(mm), pad(ss)];

  return (
    <div
      role='timer'
      aria-label={t('offer.endsIn', { percent: discountPct })}
      className={cn(
        'inline-flex flex-wrap items-center justify-center gap-x-[14rem] gap-y-[8rem] rounded-[28rem] bg-gradient-to-r from-d-red to-[#FF9D5C] px-[20rem] py-[10rem] text-white shadow-[0_22rem_55rem_-24rem_rgba(255,110,110,0.95)]',
        className
      )}
    >
      <span className='inline-flex items-center gap-[8rem]'>
        <motion.span
          aria-hidden
          className='inline-block size-[9rem] rounded-full bg-white'
          animate={prefersReducedMotion ? undefined : { opacity: [1, 0.25, 1], scale: [1, 0.78, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className='text-[13rem] font-semibold uppercase tracking-[0.04em]'>{t('offer.endsIn', { percent: discountPct })}</span>
      </span>
      <span aria-hidden className='flex items-center gap-[5rem]'>
        {segments.map((value, index) => (
          <span key={index} className='flex items-center gap-[5rem]'>
            {index > 0 ? <span className='text-[18rem] font-bold opacity-80'>:</span> : null}
            <span className='inline-flex min-w-[34rem] justify-center rounded-[10rem] bg-black/25 px-[8rem] py-[5rem] font-poppins text-[20rem] font-bold tabular-nums text-white'>{value}</span>
          </span>
        ))}
      </span>
    </div>
  );
};
