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
    const needsGradient = node.scrollHeight - node.clientHeight > node.scrollTop + 12;
    setShowGradient(needsGradient);
    setTabsElevated(node.scrollTop > 8);
  }, []);

  const currentModeLabel = activeMode === 'original' ? 'Original' : 'Improved';
  const highlightsLabel = highlightsEnabled ? 'On' : 'Off';

  const metaItems = useMemo(() => {
    const items = [`${words} words`];
    if (statusMessage) {
      items.push(statusMessage);
    }

    return items;
  }, [words, statusMessage, currentModeLabel, highlightsLabel]);

  const legend = useMemo(
    () =>
      activeMode === 'original' ? { dotClass: 'bg-rose-400', text: 'Highlights show mistakes' } : { dotClass: 'bg-emerald-400', text: 'Highlights show AI improvements' },
    [activeMode]
  );

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
        'flex w-full flex-col rounded-[28rem] bg-white shadow-[0_32rem_92rem_-72rem_rgba(18,37,68,0.35)]',
        variant === 'default' ? 'border border-white/60 p-[32rem]' : 'border border-white/50 p-[24rem]',
        className
      )}
    >
      <header className='flex min-w-0 flex-1 flex-col gap-[16rem]'>
        <div className='flex flex-wrap items-center justify-between gap-[12rem]'>
          <div className='flex min-w-0 flex-wrap items-center gap-[12rem]'>
            <h2 className={cn('text-[20rem] font-semibold text-slate-900', variant === 'default' ? 'tablet:text-[22rem]' : 'tablet:text-[20rem]')}>{title}</h2>
            {subtitle ? <span className='rounded-[16rem] bg-d-blue-secondary px-[12rem] py-[6rem] text-[12rem] font-semibold text-slate-500'>{subtitle}</span> : null}
          </div>
          <button
            type='button'
            onClick={handleViewTask}
            title='View the original IELTS task'
            className='inline-flex items-center gap-[10rem] rounded-[999rem] border border-sky-200 bg-sky-50 px-[16rem] py-[9rem] text-[13rem] font-semibold text-sky-700 shadow-[0_12rem_28rem_-20rem_rgba(29,78,216,0.35)] transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2'
          >
            <FileText className='size-[16rem] text-sky-600' aria-hidden='true' />
            View task
          </button>
        </div>

        {bandScore !== null && bandScore !== undefined ? (
          <div className='md:mt-0 md:min-w-[220rem] md:w-auto md:self-start w-full'>
            <OverallBandCard score={bandScore} summary={bandSummary ?? ''} pillLabel={bandLabel} className='w-full' />
          </div>
        ) : null}

        <div className='flex w-full flex-wrap items-center justify-between gap-[12rem]'>
          <div className='md:text-[13rem] flex flex-wrap items-center gap-x-[10rem] gap-y-[6rem] text-[12rem] text-slate-500'>
            {metaItems.map((item, index) => (
              <span key={`${item}-${index}`} className='flex items-center gap-[10rem]'>
                {index > 0 ? (
                  <span aria-hidden='true' className='text-slate-300'>
                    •
                  </span>
                ) : null}
                <span>{item}</span>
              </span>
            ))}
          </div>

          {tabs.length > 1 ? (
            <div className='flex items-center gap-[10rem]'>
              <div className='flex flex-wrap items-center justify-end gap-[10rem] text-[12rem] text-slate-500'>
                <span className={cn('size-[10rem] rounded-full', legend.dotClass)} aria-hidden='true' />
                <span>{legend.text}</span>
                <span aria-hidden='true' className='text-slate-300'>
                  •
                </span>
              </div>

              <span className='text-[12rem] font-medium text-slate-500'>Mode</span>
              <div
                role='group'
                aria-label='Response mode'
                className={cn(
                  'inline-flex items-center gap-[4rem] rounded-[999rem] border border-slate-200 bg-white/95 px-[6rem] py-[4rem] text-[12rem] font-semibold transition-shadow duration-200',
                  tabsElevated ? 'shadow-[0_16rem_36rem_-24rem_rgba(18,37,68,0.28)]' : 'shadow-none'
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
                        'rounded-[999rem] px-[14rem] py-[6rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                        isActive
                          ? 'bg-slate-900 text-white shadow-[0_12rem_26rem_-22rem_rgba(15,23,42,0.36)]'
                          : 'border border-transparent text-slate-600 hover:border-slate-300 hover:bg-white'
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className='relative mt-[18rem] flex-1 rounded-[20rem] border border-slate-100 bg-[#F8FBFF] px-[20rem] py-[18rem] text-[15rem] leading-[1.7] text-slate-700'>
        <div
          ref={contentRef}
          role='textbox'
          aria-label={activeMode === 'original' ? 'Original response' : 'Improved response'}
          className='max-h-[460rem] overflow-y-auto pr-[6rem] text-left scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200/70'
        >
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className='whitespace-pre-wrap'
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
            'pointer-events-none absolute inset-x-[20rem] bottom-[18rem] h-[56rem] rounded-b-[18rem] bg-gradient-to-t from-[#F8FBFF] via-[#F8FBFF]/80 to-transparent transition-opacity duration-200',
            showGradient ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {activeMode === 'improved' && improvedHelpText ? <p className='mt-[16rem] text-[13rem] text-slate-500'>{improvedHelpText}</p> : null}
    </motion.section>
  );
}
