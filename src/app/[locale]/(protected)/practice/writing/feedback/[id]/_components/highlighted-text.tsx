'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';

import type { RewriteErrorSegment, RewriteParseResult, RewriteSegment } from '@/lib/writing-feedback-v2';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';

type DisplayMode = 'improved' | 'original';

interface HighlightedTextProps {
  rewrite: RewriteParseResult;
  mode?: DisplayMode;
  sourceText?: string;
}

interface DisplaySegment {
  type: 'text' | 'error';
  text: string;
  meta?: RewriteErrorSegment;
}

function HighlightedTextComponent({ rewrite, mode = 'improved', sourceText }: HighlightedTextProps) {
  const segments = useMemo(() => {
    if (mode === 'original') {
      return buildOriginalDisplaySegments(sourceText ?? '', rewrite.segments);
    }
    return buildImprovedDisplaySegments(rewrite.segments);
  }, [mode, rewrite.segments, sourceText]);

  const errorEntries = useMemo(() => {
    const entries: Array<{ segment: RewriteErrorSegment; displayText: string }> = [];
    segments.forEach(segment => {
      if (segment.type === 'error' && segment.meta) {
        entries.push({ segment: segment.meta, displayText: segment.text });
      }
    });
    return entries;
  }, [segments]);

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sheetState, setSheetState] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  const highlightRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    highlightRefs.current = new Array(errorEntries.length).fill(null);
  }, [errorEntries.length]);

  useEffect(() => {
    if (sheetState.open && (errorEntries.length === 0 || sheetState.index >= errorEntries.length)) {
      setSheetState({ open: false, index: 0 });
    }
  }, [errorEntries.length, sheetState.index, sheetState.open]);

  const registerHighlight = useCallback((index: number, node: HTMLSpanElement | null) => {
    highlightRefs.current[index] = node;
  }, []);

  const focusHighlight = useCallback((index: number) => {
    if (typeof window === 'undefined') {
      return;
    }
    const target = highlightRefs.current[index];
    if (!target) {
      return;
    }
    const container = target.closest('[data-response-scroll-container="true"]') as HTMLElement | null;
    const prefersMobile = window.innerWidth < 768;
    if (container && container !== document.body && container !== document.documentElement && container.scrollHeight > container.clientHeight) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset = prefersMobile ? 32 : 48;
      const scrollTop = container.scrollTop + (targetRect.top - containerRect.top) - offset;
      container.scrollTo({ top: Math.max(scrollTop, 0), behavior: 'smooth' });
    } else {
      const rect = target.getBoundingClientRect();
      const offset = prefersMobile ? 110 : 164;
      const top = rect.top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
    target.focus({ preventScroll: true } as FocusOptions);
  }, []);

  const handleSheetOpen = useCallback(
    (index: number) => {
      if (isDesktop || index < 0 || index >= errorEntries.length) {
        return;
      }
      focusHighlight(index);
      setSheetState({ open: true, index });
    },
    [errorEntries.length, focusHighlight, isDesktop]
  );

  const handleSheetChange = useCallback(
    (open: boolean) => {
      setSheetState(prev => ({ ...prev, open }));
    },
    []
  );

  const handleNextHighlight = useCallback(() => {
    if (errorEntries.length <= 1) {
      return;
    }
    const nextIndex = (sheetState.index + 1) % errorEntries.length;
    focusHighlight(nextIndex);
    setSheetState({ open: true, index: nextIndex });
  }, [errorEntries.length, focusHighlight, sheetState.index]);

  if (segments.length === 0) {
    return null;
  }

  let runningErrorIndex = -1;
  const activeSheetEntry = !isDesktop && sheetState.open ? errorEntries[sheetState.index] : null;

  return (
    <>
      <span className='inline'>
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <Fragment key={`text-${index}`}>{renderTextWithBreaks(segment.text, `text-${index}`)}</Fragment>;
          }

          runningErrorIndex += 1;

          return (
            <ErrorHighlight
              key={`error-${index}`}
              segment={segment.meta!}
              displayText={segment.text}
              mode={mode}
              index={runningErrorIndex}
              useTooltip={isDesktop}
              onRegister={registerHighlight}
              onRequestSheet={handleSheetOpen}
            />
          );
        })}
      </span>

      {!isDesktop && activeSheetEntry ? (
        <BottomSheet open={sheetState.open} onOpenChange={handleSheetChange}>
          <BottomSheetContent className='px-[18rem] pb-[24rem]' aria-label='Highlight details'>
            <header className='flex items-center justify-between gap-[12rem] px-[2rem] pb-[12rem]'>
              <div className='space-y-[2rem]'>
                <p className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-slate-400'>Highlight</p>
                <h3 className='text-[17rem] font-semibold text-slate-900 leading-[1.4]'>{mode === 'original' ? 'Detected issue' : 'Applied improvement'}</h3>
              </div>
              <BottomSheetClose
                className='inline-flex size-[36rem] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500'
                aria-label='Close highlight details'
              >
                <X className='size-[18rem]' aria-hidden='true' />
              </BottomSheetClose>
            </header>
            <div className='flex min-h-0 flex-1 flex-col gap-[16rem] overflow-y-auto pr-[4rem] text-[14rem] leading-[1.6] text-slate-600'>
              <section className='space-y-[6rem]'>
                <p className='text-[12rem] font-semibold uppercase tracking-[0.2em] text-slate-400'>Originally</p>
                <p className='rounded-[14rem] bg-slate-50 px-[14rem] py-[12rem] text-[14rem] font-medium text-slate-700'>{activeSheetEntry.segment.original || '—'}</p>
              </section>

              {mode === 'original' && activeSheetEntry.segment.explanation ? (
                <section className='space-y-[6rem]'>
                  <p className='text-[12rem] font-semibold uppercase tracking-[0.2em] text-rose-500'>Issue</p>
                  <p className='rounded-[14rem] bg-rose-50 px-[14rem] py-[12rem] text-[14rem] text-rose-700'>{activeSheetEntry.segment.explanation}</p>
                </section>
              ) : null}

              <section className='space-y-[6rem]'>
                <p className='text-[12rem] font-semibold uppercase tracking-[0.2em] text-emerald-600'>{mode === 'original' ? 'Suggested fix' : 'Changed to'}</p>
                <p className='rounded-[14rem] bg-emerald-50 px-[14rem] py-[12rem] text-[14rem] font-medium text-emerald-700'>{activeSheetEntry.segment.fixed}</p>
              </section>
            </div>
            <div className='mt-[16rem] flex w-full justify-center'>
              <button
                type='button'
                disabled={errorEntries.length <= 1}
                onClick={handleNextHighlight}
                className='inline-flex w-full max-w-[240rem] items-center justify-center rounded-[18rem] border border-slate-200 bg-slate-900 px-[18rem] py-[12rem] text-[13rem] font-semibold text-white transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500'
              >
                {errorEntries.length <= 1 ? 'No other highlights' : 'Next highlight'}
              </button>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      ) : null}
    </>
  );
}

function buildImprovedDisplaySegments(segments: RewriteSegment[]): DisplaySegment[] {
  return segments.map<DisplaySegment>(segment => {
    if (segment.type === 'text') {
      return { type: 'text', text: segment.text };
    }

    return { type: 'error', text: segment.fixed, meta: segment };
  });
}

function buildOriginalDisplaySegments(source: string, segments: RewriteSegment[]): DisplaySegment[] {
  if (!source) {
    return [];
  }

  const display: DisplaySegment[] = [];
  let cursor = 0;

  const errors = segments.filter((segment): segment is RewriteErrorSegment => segment.type === 'error');

  for (const error of errors) {
    if (!error.original) {
      continue;
    }

    const searchIndex = source.indexOf(error.original, cursor);
    if (searchIndex === -1) {
      continue;
    }

    if (searchIndex > cursor) {
      display.push({ type: 'text', text: source.slice(cursor, searchIndex) });
    }

    const originalSlice = source.slice(searchIndex, searchIndex + error.original.length);
    display.push({ type: 'error', text: originalSlice, meta: error });
    cursor = searchIndex + originalSlice.length;
  }

  if (cursor < source.length) {
    display.push({ type: 'text', text: source.slice(cursor) });
  }

  return display.length > 0 ? display : [{ type: 'text', text: source }];
}

function renderTextWithBreaks(value: string, keyPrefix: string): JSX.Element[] {
  const parts = value.split('\n');
  return parts.flatMap((part, partIndex) => {
    const nodes: JSX.Element[] = [];
    if (partIndex > 0) {
      nodes.push(<br key={`${keyPrefix}-br-${partIndex}`} />);
    }
    nodes.push(
      <span key={`${keyPrefix}-span-${partIndex}`}>
        {part.length > 0 ? part : ' '}
      </span>
    );
    return nodes;
  });
}

interface ErrorHighlightProps {
  segment: RewriteErrorSegment;
  displayText: string;
  mode: DisplayMode;
  index: number;
  useTooltip: boolean;
  onRegister: (index: number, node: HTMLSpanElement | null) => void;
  onRequestSheet: (index: number) => void;
}

function ErrorHighlight({ segment, displayText, mode, index, useTooltip, onRegister, onRequestSheet }: ErrorHighlightProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number; placement: 'top' | 'bottom' } | null>(null);

  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onRegister(index, highlightRef.current);
    return () => onRegister(index, null);
  }, [index, onRegister]);

  const updatePosition = useCallback(() => {
    const trigger = highlightRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;
    const margin = 10;

    // Clamp the horizontal position so the tooltip never overflows the viewport.
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    let placement: 'top' | 'bottom' = 'bottom';
    let top: number;

    if (spaceBelow >= tooltipRect.height + margin) {
      top = rect.bottom + margin;
      placement = 'bottom';
    } else if (spaceAbove >= tooltipRect.height + margin) {
      top = rect.top - tooltipRect.height - margin;
      placement = 'top';
    } else if (spaceBelow >= spaceAbove) {
      top = Math.min(viewportHeight - tooltipRect.height - padding, rect.bottom + margin);
      placement = 'bottom';
    } else {
      top = Math.max(padding, rect.top - tooltipRect.height - margin);
      placement = 'top';
    }

    // Flip vertically when there is not enough space to avoid pushing layout.
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

    setTooltipPosition({ left, top, placement });
  }, []);

  useLayoutEffect(() => {
    if (!useTooltip || !mounted || !open) {
      setTooltipPosition(null);
      return;
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [mounted, open, updatePosition, useTooltip]);

  const handleOpen = () => {
    if (useTooltip) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    if (useTooltip) {
      setOpen(false);
    }
  };

  const handleToggle = () => {
    if (useTooltip) {
      setOpen(prev => !prev);
    } else {
      onRequestSheet(index);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const handleMouseMove = () => {
    if (open && useTooltip) {
      updatePosition();
    }
  };

  useEffect(() => {
    if (!open) {
      setTooltipPosition(null);
    }
  }, [open]);

  const parts = displayText.split('\n');

  const highlightClassName =
    mode === 'original'
      ? 'relative inline-flex cursor-pointer flex-wrap items-center gap-x-[2rem] rounded-[8rem] bg-[#FFEAF1] px-[4rem] py-[2rem] text-slate-900 underline decoration-dotted decoration-2 underline-offset-[6rem] transition hover:bg-[#FFD7E3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300'
      : 'relative inline-flex cursor-pointer flex-wrap items-center gap-x-[2rem] rounded-[8rem] border border-emerald-200 bg-emerald-50 px-[4rem] py-[2rem] text-emerald-900 underline decoration-dotted decoration-2 decoration-emerald-500 underline-offset-[6rem] transition hover:bg-emerald-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300';

  const tooltipClassName =
    mode === 'original'
      ? 'w-max max-w-[280rem] rounded-[16rem] border border-[#FECFE0] bg-white p-[16rem] text-left text-[12rem] leading-[1.6] text-slate-600 shadow-[0_28rem_72rem_-52rem_rgba(18,37,68,0.38)]'
      : 'w-max max-w-[280rem] rounded-[16rem] border border-emerald-200 bg-white p-[16rem] text-left text-[12rem] leading-[1.6] text-slate-600 shadow-[0_28rem_72rem_-52rem_rgba(16,107,80,0.32)]';

  const tooltip = mounted && useTooltip
    ? createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, y: tooltipPosition?.placement === 'top' ? -6 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: tooltipPosition?.placement === 'top' ? -6 : 6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              style={{
                top: (tooltipPosition?.top ?? -9999),
                left: (tooltipPosition?.left ?? -9999),
              }}
              className='fixed z-[120]'
            >
              <div className={tooltipClassName}>
                {mode === 'original' ? (
                  <>
                    <p className='text-[12rem] font-semibold text-[#B91C6F]'>Original</p>
                    <p className='text-[12rem] text-slate-700'>{segment.original}</p>
                    {segment.explanation ? <p className='mt-[8rem] text-[12rem] text-slate-600'>Issue: {segment.explanation}</p> : null}
                    <p className='mt-[8rem] text-[12rem] font-semibold text-slate-700'>Fix: {segment.fixed}</p>
                  </>
                ) : (
                  <>
                    <p className='text-[12rem] font-semibold text-emerald-600'>Originally</p>
                    <p className='text-[12rem] text-slate-700'>{segment.original || '—'}</p>
                    <p className='mt-[8rem] text-[12rem] font-semibold text-emerald-600'>Changed to</p>
                    <p className='text-[12rem] text-slate-700'>{segment.fixed}</p>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <span
        ref={highlightRef}
        role='button'
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={onKeyDown}
        onMouseEnter={useTooltip ? handleOpen : undefined}
        onMouseLeave={useTooltip ? handleClose : undefined}
        onMouseMove={useTooltip ? handleMouseMove : undefined}
        onFocus={useTooltip ? handleOpen : undefined}
        onBlur={useTooltip ? handleClose : undefined}
        className={highlightClassName}
      >
        {parts.map((part, index) => (
          <Fragment key={`part-${index}`}>
            {index > 0 ? <br /> : null}
            <span>{part || ' '}</span>
          </Fragment>
        ))}
      </span>
      {tooltip}
    </>
  );
}

export const HighlightedText = withHydrationGuard(HighlightedTextComponent);
