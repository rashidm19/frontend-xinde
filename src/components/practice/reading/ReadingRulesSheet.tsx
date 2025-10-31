'use client';

import { useCallback, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import axiosInstance from '@/lib/axiosInstance';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

interface ReadingRulesSheetProps {
  open: boolean;
  onRequestClose: () => void;
}

const INTERACTIVE_TAP = { scale: 0.97 };

export function ReadingRulesSheet({ open, onRequestClose }: ReadingRulesSheetProps) {
  const router = useRouter();
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('practice.reading.rules');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsStarting(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onRequestClose();
      }
    },
    [onRequestClose]
  );

  const startPractice = useCallback(async () => {
    if (isStarting || isCheckingAccess) {
      return;
    }

    setIsStarting(true);

    try {
      const canStart = await requireSubscription();

      if (!canStart) {
        return;
      }

      const response = await axiosInstance.get('/practice/reading', {
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        const payload = response.data;
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * payload.data.length);
          const randomReadingId = payload.data[randomIndex].reading_id;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('practiceReadingId', String(randomReadingId));
          }
          nProgress.start();
          onRequestClose();
          router.push('/practice/reading/test');
        } else {
          console.error('No available reading tasks');
        }
      }
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isCheckingAccess, requireSubscription, onRequestClose, router]);

  const sheetTitle = `${tCommon('reading')} • ${tCommon('minCount', { count: 60 })} • 3 passages`;

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent className='max-h-[90dvh] border-none bg-transparent px-0 pb-0'>
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[32rem] bg-white/95 pb-[calc(20rem+env(safe-area-inset-bottom))] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.28)] backdrop-blur-lg'>
          <span className='sr-only' aria-live='polite'>
            {t('title')}
          </span>
          <header className='sticky top-0 z-[2] flex items-center justify-between gap-[12rem] border-b border-slate-200 bg-white/95 px-[20rem] pb-[16rem] pt-[calc(20rem+env(safe-area-inset-top))]'>
            <div className='flex items-center gap-[12rem]'>
              <span className='flex size-[36rem] items-center justify-center rounded-full bg-d-yellow-secondary/20'>
                <img src='/images/icon_readingSection.svg' alt={tImgAlts('reading') ?? 'Reading'} className='size-[20rem]' />
              </span>
              <span className='text-[15rem] font-semibold leading-[120%] text-slate-900'>{sheetTitle}</span>
            </div>
            <button
              type='button'
              onClick={onRequestClose}
              className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
              aria-label='Close'
            >
              <img src='/images/icon_close--black.svg' alt='' className='size-[18rem]' />
            </button>
          </header>

          <div className='flex-1 overflow-y-auto px-[20rem] py-[20rem]'>
            <div className='flex flex-col gap-[20rem]'>
              <h1 className='text-[22rem] font-semibold leading-[120%] text-slate-900'>{t('title')}</h1>
              <div className='flex flex-col gap-[12rem]'>
                <CollapsibleSection id='reading-about' title={t('title')} defaultOpen>
                  {t('text')}
                </CollapsibleSection>
                <CollapsibleSection id='reading-marking' title={tCommon('marking')}>
                  {t('marking')}
                </CollapsibleSection>
              </div>
            </div>
          </div>

          <footer className='sticky bottom-0 z-[1] border-t border-slate-200 bg-white/95 px-[20rem] pb-[calc(20rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.18)]'>
            <div className='space-y-[8rem]'>
              <motion.button
                type='button'
                whileTap={!isStarting && !isCheckingAccess ? INTERACTIVE_TAP : undefined}
                disabled={isStarting || isCheckingAccess}
                onClick={startPractice}
                className='flex h-[52rem] w-full items-center justify-center rounded-[28rem] bg-d-green text-[16rem] font-semibold transition hover:bg-d-green/90 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
              >
                {isCheckingAccess || isStarting ? '...' : tActions('continue')}
              </motion.button>
              <SubscriptionAccessLabel className='text-center text-[12rem]' />
            </div>
          </footer>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: string;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ id, title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className='rounded-[20rem] border border-slate-200 bg-white/95 shadow-[0_12rem_32rem_-28rem_rgba(15,23,42,0.28)]'>
      <motion.button
        type='button'
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen(prev => !prev)}
        whileTap={INTERACTIVE_TAP}
        className='flex w-full items-center justify-between gap-[12rem] px-[18rem] py-[16rem] text-left'
      >
        <span className='text-[16rem] font-semibold leading-[120%] text-slate-900'>{title}</span>
        <img src='/images/icon_chevron--down.svg' alt='' className={cn('size-[16rem] transition-transform duration-200', open ? 'rotate-180' : '')} />
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key='content'
            id={`${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='overflow-hidden'
          >
            <div className='px-[18rem] pb-[18rem] pr-[6rem]'>
              <p className='max-w-[520rem] whitespace-pre-line text-[14rem] leading-[160%] text-slate-600'>{children}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
