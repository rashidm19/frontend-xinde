'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Copy, PenSquare, BookOpen, Headphones, Mic, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';

const INTERACTIVE_TAP = { scale: 0.97 };

export type PracticeHandoffSection = 'writing' | 'listening' | 'reading' | 'speaking';

const SECTION_LABELS: Record<PracticeHandoffSection, string> = {
  writing: 'Writing',
  listening: 'Listening',
  reading: 'Reading',
  speaking: 'Speaking',
};

const SECTION_ICONS: Record<PracticeHandoffSection, ReactNode> = {
  writing: <PenSquare className='size-[20rem]' aria-hidden='true' />,
  reading: <BookOpen className='size-[20rem]' aria-hidden='true' />,
  listening: <Headphones className='size-[20rem]' aria-hidden='true' />,
  speaking: <Mic className='size-[20rem]' aria-hidden='true' />,
};

const FALLBACK_COPY: Record<PracticeHandoffSection, { title: string; subtitle: string; body: string }> = {
  writing: {
    title: 'Better on a computer',
    subtitle: 'Recommended for comfortable typing and formatting',
    body: 'For the best experience, we recommend continuing Writing on your computer. A keyboard makes typing and editing easier — but you can stay on your phone if you prefer.',
  },
  reading: {
    title: 'Better on a computer',
    subtitle: 'Recommended for a larger screen and easier navigation',
    body: 'For the best experience, we recommend continuing Reading on your computer. A wider screen helps with passages and scrolling — but you can stay on your phone if you prefer.',
  },
  listening: {
    title: 'Better on a computer',
    subtitle: 'Recommended for stable audio and playback controls',
    body: 'For the best experience, we recommend continuing Listening on your computer. It’s easier to control audio output there — but you can stay on your phone if you prefer.',
  },
  speaking: {
    title: 'Better on a computer',
    subtitle: 'Recommended for the best mic and audio setup',
    body: 'For the best experience, we recommend continuing Speaking on your computer. It’s easier to use your mic and headphones there — but you can stay on your phone if you prefer.',
  },
};

const SECTION_SHARE_META: Record<PracticeHandoffSection, { title: string; text: string }> = {
  writing: {
    title: 'IELTS Writing practice',
    text: 'Open the IELTS Writing practice on your computer for the best experience.',
  },
  listening: {
    title: 'IELTS Listening practice',
    text: 'Open the IELTS Listening practice on your computer for the best experience.',
  },
  reading: {
    title: 'IELTS Reading practice',
    text: 'Open the IELTS Reading practice on your computer for the best experience.',
  },
  speaking: {
    title: 'IELTS Speaking practice',
    text: 'Open the IELTS Speaking practice on your computer for the best experience.',
  },
};

interface SectionHandoffSheetProps {
  section: PracticeHandoffSection;
  open: boolean;
  desktopUrl: string | null;
  onRequestClose: () => void;
  onContinue: () => void;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  body?: string;
  icon?: ReactNode;
  shareTitle?: string;
  shareText?: string;
}

export function SectionHandoffSheet({
  section,
  open,
  desktopUrl,
  onRequestClose,
  onContinue,
  onRetry,
  title,
  subtitle,
  body,
  icon,
  shareTitle,
  shareText,
}: SectionHandoffSheetProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const copyResetTimerRef = useRef<number | null>(null);

  const t = useTranslations('handoff');
  const defaults = FALLBACK_COPY[section];

  const tOr = useCallback(
    (id: string, fallback: string) => {
      try {
        const value = t(id);
        return value && value !== id ? value : fallback;
      } catch (error) {
        return fallback;
      }
    },
    [t]
  );

  const resolvedTitle = title ?? tOr('common.title', defaults.title);
  const resolvedSubtitle = subtitle ?? tOr(`${section}.subtitle`, defaults.subtitle);
  const resolvedBody = body ?? tOr(`${section}.body`, defaults.body);
  const resolvedIcon = icon ?? SECTION_ICONS[section];

  const labelCopy = tOr('actions.copy', 'Copy link');
  const labelCopied = tOr('actions.copied', 'Copied');
  const labelShare = tOr('actions.share', 'Share');
  const labelContinue = tOr('actions.continue', 'Continue on phone');
  const labelOpenedOnDesktop = tOr('actions.openedOnDesktop', 'I’ve opened it on my computer');
  const resolvedShareMeta = SECTION_SHARE_META[section];
  const resolvedShareTitle = shareTitle ?? resolvedShareMeta.title;
  const resolvedShareText = shareText ?? resolvedShareMeta.text;
  const sectionLabel = SECTION_LABELS[section];

  const isShareSupported = useMemo(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function', []);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = null;
      }
    };
  }, []);

  const scheduleCopyReset = useCallback((delay: number) => {
    if (copyResetTimerRef.current) {
      window.clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = window.setTimeout(() => {
      setCopyState('idle');
      copyResetTimerRef.current = null;
    }, delay);
  }, []);

  const performCopy = useCallback(async () => {
    if (!desktopUrl) {
      setCopyState('error');
      scheduleCopyReset(2400);
      return false;
    }

    setIsCopying(true);
    if (copyResetTimerRef.current) {
      window.clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = null;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(desktopUrl);
        setCopyState('success');
        scheduleCopyReset(2200);
        return true;
      }

      const textarea = document.createElement('textarea');
      textarea.value = desktopUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        setCopyState('success');
        scheduleCopyReset(2200);
        return true;
      }

      throw new Error('execCommand failed');
    } catch (error) {
      setCopyState('error');
      scheduleCopyReset(2400);
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [desktopUrl, scheduleCopyReset]);

  const handleShare = useCallback(async () => {
    if (!desktopUrl) {
      setCopyState('error');
      scheduleCopyReset(2400);
      return;
    }

    if (!isShareSupported) {
      void performCopy();
      return;
    }

    const canShareUrl = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' ? navigator.canShare({ url: desktopUrl }) : true;

    if (!canShareUrl) {
      void performCopy();
      return;
    }

    try {
      await navigator.share({
        title: resolvedShareTitle,
        text: resolvedShareText,
        url: desktopUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
        return;
      }
      void performCopy();
    }
  }, [desktopUrl, isShareSupported, performCopy, resolvedShareText, resolvedShareTitle, scheduleCopyReset]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onRequestClose();
      }
    },
    [onRequestClose]
  );

  const actionsDisabled = !desktopUrl;
  const copyButtonDisabled = actionsDisabled || isCopying || copyState === 'success';
  const copyLiveMessage = copyState === 'success' ? labelCopied : copyState === 'error' ? 'Copy failed. Tap again.' : '';

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent className='max-h-[90dvh] border-none bg-transparent px-0 pb-0'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
          className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[32rem] bg-white/95 shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.32)] backdrop-blur-lg'
        >
          <span className='sr-only' aria-live='polite'>
            {open ? `${sectionLabel} handoff prompt open` : `${sectionLabel} handoff prompt closed`}
          </span>
          <span className='sr-only' aria-live='polite'>
            {copyLiveMessage}
          </span>

          <header className='sticky top-0 z-[2] flex items-start justify-between gap-[12rem] border-b border-slate-200 bg-white/95 px-[22rem] pb-[18rem] pt-[calc(22rem+env(safe-area-inset-top))]'>
            <div className='flex min-w-0 items-center gap-[12rem]'>
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } }}
                className='flex size-[38rem] shrink-0 items-center justify-center rounded-full bg-d-violet-secondary/40'
              >
                <span className='flex items-center justify-center text-d-black'>{resolvedIcon}</span>
              </motion.span>
              <div className='min-w-0 flex-1'>
                <p className='text-[16rem] font-semibold leading-[120%] text-d-black'>{resolvedTitle}</p>
                <p className='mt-[4rem] text-[13rem] leading-[140%] text-d-black/70'>{resolvedSubtitle}</p>
              </div>
            </div>
            <button
              type='button'
              onClick={onRequestClose}
              aria-label='Close handoff sheet'
              className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
            >
              <img src='/images/icon_close--black.svg' alt='' className='size-[18rem]' />
            </button>
          </header>

          <div className='flex-1 overflow-y-auto px-[24rem] py-[28rem]'>
            <div className='space-y-[28rem]'>
              <div className='space-y-[14rem]'>
                <p className='text-[15rem] leading-[155%] text-slate-600'>{resolvedBody}</p>
              </div>

              <div className='grid gap-[12rem]'>
                <motion.button
                  type='button'
                  aria-label={`Copy link to open ${sectionLabel} on desktop`}
                  whileTap={!actionsDisabled ? INTERACTIVE_TAP : undefined}
                  disabled={copyButtonDisabled}
                  onClick={() => {
                    void performCopy();
                  }}
                  className='flex h-[52rem] items-center justify-center rounded-[24rem] border border-slate-200 bg-white px-[20rem] text-[15rem] font-semibold text-d-black transition hover:border-d-violet/40 hover:text-d-violet disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400'
                >
                  <AnimatePresence mode='wait' initial={false}>
                    {copyState === 'success' ? (
                      <motion.span
                        key='copied'
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }}
                        exit={{ opacity: 0, y: -4, scale: 0.96, transition: { duration: 0.14, ease: 'easeIn' } }}
                        className='flex items-center gap-[8rem] text-d-green'
                      >
                        <Check className='size-[18rem]' />
                        {labelCopied}
                      </motion.span>
                    ) : copyState === 'error' ? (
                      <motion.span
                        key='copy-error'
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }}
                        exit={{ opacity: 0, y: -4, scale: 0.96, transition: { duration: 0.14, ease: 'easeIn' } }}
                        className='flex items-center gap-[8rem] text-red-600'
                      >
                        <AlertCircle className='size-[18rem]' />
                        Copy failed — tap again
                      </motion.span>
                    ) : (
                      <motion.span
                        key='copy-default'
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }}
                        exit={{ opacity: 0, y: -4, scale: 0.96, transition: { duration: 0.14, ease: 'easeIn' } }}
                        className='flex items-center gap-[10rem]'
                      >
                        <Copy className='size-[18rem]' />
                        {labelCopy}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  type='button'
                  aria-label={`Share ${sectionLabel} link to another device`}
                  whileTap={!actionsDisabled ? INTERACTIVE_TAP : undefined}
                  disabled={actionsDisabled}
                  onClick={() => {
                    void handleShare();
                  }}
                  className='flex h-[52rem] items-center justify-center gap-[10rem] rounded-[24rem] border border-slate-200 bg-white text-[15rem] font-semibold text-d-black transition hover:border-d-violet/40 hover:text-d-violet disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400'
                >
                  <Share2 className='size-[18rem]' />
                  {labelShare}
                </motion.button>
              </div>

              {actionsDisabled ? (
                <div className='rounded-[16rem] border border-amber-200/80 bg-amber-50/90 px-[16rem] py-[12rem] text-[13rem] font-medium text-amber-900'>
                  We couldn’t build the desktop link right now.
                  {onRetry ? (
                    <button
                      type='button'
                      onClick={onRetry}
                      className='ml-[10rem] inline-flex items-center rounded-[12rem] bg-amber-200/50 px-[12rem] py-[4rem] text-[12rem] font-semibold text-amber-900 transition hover:bg-amber-200/70'
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <footer className='sticky bottom-0 z-[2] border-t border-slate-200 bg-white/95 px-[24rem] pb-[calc(22rem+env(safe-area-inset-bottom))] pt-[18rem] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.2)]'>
            <div className='space-y-[14rem]'>
              <motion.button
                type='button'
                whileTap={INTERACTIVE_TAP}
                onClick={onContinue}
                className='flex h-[52rem] w-full items-center justify-center rounded-[26rem] bg-d-green/80 text-[16rem] font-semibold transition hover:bg-d-green'
              >
                {labelContinue}
              </motion.button>
              <button type='button' onClick={onContinue} className='mx-auto block text-[14rem] font-semibold text-d-violet transition hover:text-d-violet/80'>
                {labelOpenedOnDesktop}
              </button>
            </div>
          </footer>
        </motion.div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
