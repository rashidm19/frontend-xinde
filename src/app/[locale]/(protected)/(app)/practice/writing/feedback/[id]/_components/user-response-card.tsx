'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { FileText } from 'lucide-react';

import { cn } from '@/lib/utils';

import { OverallBandCard } from './overall-band-card';

type ResponseMode = 'original' | 'improved';

interface UserResponseCardProps {
  title: string;
  subtitle?: string;
  words: number;
  statusMessage: string;
  answer: string;
  originalContent?: ReactNode;
  improvedContent?: ReactNode;
  improvedHelpText?: string;
  bandScore?: number | null;
  bandSummary?: string;
  bandLabel?: string;
  highlightsEnabled?: boolean;
  onViewTask?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function UserResponseCard({
  title,
  subtitle,
  words,
  statusMessage,
  answer,
  originalContent,
  improvedContent,
  improvedHelpText,
  bandScore,
  bandSummary,
  bandLabel,
  highlightsEnabled = true,
  onViewTask,
  variant = 'default',
  className,
}: UserResponseCardProps) {
  const [activeMode, setActiveMode] = useState<ResponseMode>('original');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [showGradient, setShowGradient] = useState(false);
  const [tabsElevated, setTabsElevated] = useState(false);

  const hasImprovedContent = useMemo(() => improvedContent !== undefined && improvedContent !== null, [improvedContent]);

  const tabs = useMemo(() => {
    const base: Array<{ key: ResponseMode; label: string }> = [{ key: 'original', label: 'Original' }];
    if (hasImprovedContent) {
      base.push({ key: 'improved', label: 'Improved' });
    }
    return base;
  }, [hasImprovedContent]);

  const updateGradient = useCallback(() => {
    const node = contentRef.current;
    if (!node) {
      setShowGradient(false);
      setTabsElevated(false);
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowGradient(false);
      setTabsElevated(false);
      return;
    }
    const needsGradient = node.scrollHeight - node.clientHeight > node.scrollTop + 12;
    setShowGradient(needsGradient);
    setTabsElevated(node.scrollTop > 8);
  }, []);

  const metaItems = useMemo(() => {
    const items = [`${words} words`];
    if (statusMessage) {
      items.push(statusMessage);
    }

    return items;
  }, [words, statusMessage]);

  const legend = useMemo(() => {
    if (!highlightsEnabled) {
      return { dotClass: 'bg-slate-300', text: 'Highlights are currently hidden' };
    }
    return activeMode === 'original'
      ? { dotClass: 'bg-rose-400', text: 'Highlights show mistakes' }
      : { dotClass: 'bg-emerald-400', text: 'Highlights show AI improvements' };
  }, [activeMode, highlightsEnabled]);

  const handleViewTask = useCallback(() => {
    onViewTask?.();
  }, [onViewTask]);

  useEffect(() => {
    if (!hasImprovedContent && activeMode === 'improved') {
      setActiveMode('original');
    }
  }, [activeMode, hasImprovedContent]);

  useEffect(() => {
    const node = contentRef.current;
    if (node) {
      node.scrollTo({ top: 0 });
    }
    updateGradient();
    if (!node) return;

    const handleScroll = () => updateGradient();
    node.addEventListener('scroll', handleScroll);

    return () => {
      node.removeEventListener('scroll', handleScroll);
    };
  }, [updateGradient, activeMode]);

  useEffect(() => {
    const handleResize = () => updateGradient();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateGradient]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex w-full flex-col bg-white shadow-[0_32rem_92rem_-72rem_rgba(18,37,68,0.35)]',
        variant === 'default'
          ? 'rounded-[20rem] border border-white/60 p-[16rem] tablet:rounded-[28rem] tablet:p-[32rem]'
          : 'rounded-[18rem] border border-white/50 p-[16rem] tablet:rounded-[24rem] tablet:p-[24rem]',
        className
      )}
    >
      <header className='flex min-w-0 flex-1 flex-col gap-[16rem] tablet:gap-[18rem]'>
        <div className='flex flex-col gap-[12rem] tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-between'>
          <div className='flex min-w-0 flex-col gap-[6rem] tablet:flex-row tablet:flex-wrap tablet:items-center tablet:gap-[12rem]'>
            <h2 className={cn('font-semibold text-slate-900', variant === 'default' ? 'text-[18rem] tablet:text-[22rem]' : 'text-[18rem] tablet:text-[20rem]')}>
              {title}
            </h2>
            {subtitle ? (
              <span className='rounded-[14rem] bg-d-blue-secondary px-[10rem] py-[4rem] text-[11rem] font-semibold text-slate-500 tablet:rounded-[16rem] tablet:px-[12rem] tablet:py-[6rem] tablet:text-[12rem]'>
                {subtitle}
              </span>
            ) : null}
          </div>
          <button
            type='button'
            onClick={handleViewTask}
            title='View the original IELTS task'
            className='inline-flex items-center gap-[8rem] rounded-[999rem] border border-sky-200 bg-sky-50 px-[14rem] py-[8rem] text-[12rem] font-semibold text-sky-700 shadow-[0_12rem_28rem_-20rem_rgba(29,78,216,0.35)] transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 tablet:gap-[10rem] tablet:px-[16rem] tablet:py-[9rem] tablet:text-[13rem]'
          >
            <FileText className='size-[15rem] text-sky-600 tablet:size-[16rem]' aria-hidden='true' />
            View task
          </button>
        </div>

        {bandScore !== null && bandScore !== undefined ? (
          <div className='hidden w-full tablet:mt-0 tablet:block tablet:self-start'>
            <OverallBandCard score={bandScore} summary={bandSummary ?? ''} pillLabel={bandLabel} className='w-full' />
          </div>
        ) : null}

        <div className='flex flex-col gap-[10rem] tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-[12rem]'>
          <p className='text-[12rem] text-slate-500 tablet:text-[13rem]'>
            {metaItems.map((item, index) => (
              <span key={`${item}-${index}`} className='inline-flex items-center'>
                {index > 0 ? (
                  <span aria-hidden='true' className='mx-[6rem] text-slate-300'>
                    •
                  </span>
                ) : null}
                <span>{item}</span>
              </span>
            ))}
          </p>

          {tabs.length > 1 ? (
            <div className='hidden items-center gap-[10rem] tablet:flex'>
              <div className='flex items-center gap-[10rem] text-[12rem] text-slate-500'>
                <span className={cn('size-[10rem] rounded-full', legend.dotClass)} aria-hidden='true' />
                <span>{legend.text}</span>
              </div>

              <span aria-hidden='true' className='text-[12rem] text-slate-300'>
                •
              </span>

              <div className='flex items-center gap-[10rem]'>
                <span className='text-[12rem] font-medium text-slate-500'>Mode</span>
                <div
                  role='group'
                  aria-label='Response mode'
                  className={cn(
                    'inline-flex items-center gap-[4rem] rounded-[999rem] border border-slate-200 bg-white/95 px-[6rem] py-[4rem] text-[12rem] font-semibold transition-shadow duration-200',
                    tabsElevated ? 'shadow-[0_16rem_36rem_-24rem_rgba(42,73,170,0.28)]' : 'shadow-none'
                  )}
                >
                  {tabs.map(tab => {
                    const isActive = activeMode === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type='button'
                        aria-pressed={isActive}
                        onClick={() => setActiveMode(tab.key)}
                        className={cn(
                          'rounded-[999rem] px-[14rem] py-[6rem] text-[12rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                          isActive
                            ? 'bg-sky-700 text-white shadow-[0_12rem_26rem_-22rem_rgba(45,78,168,0.32)]'
                            : 'border border-transparent text-slate-600 hover:border-slate-300 hover:bg-white'
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {tabs.length > 1 ? (
        <div className='sticky top-[86rem] z-[5] mt-[12rem] tablet:hidden'>
          <div className='flex flex-col gap-[8rem] px-[4rem]'>
            <div className='flex items-center justify-between px-[2rem] text-[12rem] font-medium text-slate-500'>
              <span>Mode</span>
              <span className='flex items-center gap-[6rem] text-slate-400'>
                <span className={cn('size-[8rem] rounded-full', legend.dotClass)} aria-hidden='true' />
                {legend.text}
              </span>
            </div>
            <div className='flex w-full justify-center'>
              <div className='relative flex w-full max-w-[420rem] items-center rounded-[999rem] bg-slate-100/90 p-[4rem] shadow-[0_8rem_24rem_-18rem_rgba(42,73,170,0.2)]'>
                {tabs.map(tab => {
                  const isActive = activeMode === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type='button'
                      aria-pressed={isActive}
                      onClick={() => setActiveMode(tab.key)}
                      className={cn(
                        'relative z-[1] flex h-[36rem] w-1/2 items-center justify-center rounded-[999rem] px-[12rem] text-[12.5rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                        isActive ? 'text-sky-700' : 'text-slate-500'
                      )}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId='mobile-mode-thumb'
                          className='absolute inset-[4rem] rounded-[999rem] bg-white shadow-[0_10rem_30rem_-18rem_rgba(18,37,68,0.15)]'
                          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        />
                      ) : null}
                      <span className='relative z-[1]'>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className='relative mt-[14rem] flex-1 break-words rounded-[18rem] border border-slate-100 bg-[#F8FBFF] px-[16rem] py-[14rem] text-[14rem] leading-relaxed text-slate-700 tablet:mt-[18rem] tablet:rounded-[20rem] tablet:px-[20rem] tablet:py-[18rem] tablet:text-[15rem] tablet:leading-[1.7]'>
        <div
          ref={contentRef}
          role='textbox'
          aria-label={activeMode === 'original' ? 'Original response' : 'Improved response'}
          data-response-scroll-container='true'
          className='mx-auto max-w-[600rem] text-left tablet:max-w-none tablet:pr-[6rem]'
        >
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className='whitespace-pre-wrap leading-relaxed tablet:leading-[1.7]'
            >
              {activeMode === 'original'
                ? (originalContent ?? (answer?.trim() ? answer : 'Your answer will appear here once submitted.'))
                : hasImprovedContent
                  ? improvedContent
                  : 'The improved version will appear here when available.'}
            </motion.div>
          </AnimatePresence>
        </div>
        <div
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute inset-x-[16rem] bottom-[14rem] hidden h-[48rem] rounded-b-[16rem] bg-gradient-to-t from-[#F8FBFF] via-[#F8FBFF]/80 to-transparent transition-opacity duration-200 tablet:inset-x-[20rem] tablet:bottom-[18rem] tablet:block tablet:h-[56rem] tablet:rounded-b-[18rem]',
            showGradient ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {activeMode === 'improved' && improvedHelpText ? (
        <p className='mt-[14rem] text-[12.5rem] text-slate-500 tablet:mt-[16rem] tablet:text-[13rem]'>{improvedHelpText}</p>
      ) : null}
    </motion.section>
  );
}
