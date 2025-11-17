'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

import type { RewriteErrorSegment, RewriteParseResult, RewriteSegment } from '@/lib/writing-feedback-v2';

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

export function HighlightedText({ rewrite, mode = 'improved', sourceText }: HighlightedTextProps) {
  const segments = useMemo(() => {
    if (mode === 'original') {
      return buildOriginalDisplaySegments(sourceText ?? '', rewrite.segments);
    }
    return buildImprovedDisplaySegments(rewrite.segments);
  }, [mode, rewrite.segments, sourceText]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <span className='inline'>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Fragment key={`text-${index}`}>{renderTextWithBreaks(segment.text, `text-${index}`)}</Fragment>;
        }

        return <ErrorHighlight key={`error-${index}`} segment={segment.meta!} displayText={segment.text} mode={mode} />;
      })}
    </span>
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
}

function ErrorHighlight({ segment, displayText, mode }: ErrorHighlightProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number; placement: 'top' | 'bottom' } | null>(null);

  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!mounted || !open) {
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
  }, [mounted, open, updatePosition]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prev => !prev);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const handleMouseMove = () => {
    if (open) {
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

  const tooltip = mounted
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
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onMouseMove={handleMouseMove}
        onFocus={handleOpen}
        onBlur={handleClose}
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
