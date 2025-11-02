"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: "easeOut" } },
};

export interface CollapsiblePassageProps {
  content: string;
  expandLabel: string;
  collapseLabel: string;
  className?: string;
}

export const CollapsiblePassage: React.FC<CollapsiblePassageProps> = ({ content, expandLabel, collapseLabel, className }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [heights, setHeights] = React.useState<{ full: number; collapsed: number } | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const measureHeights = React.useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const contentNode = contentRef.current;
    if (!contentNode) {
      return;
    }

    const full = contentNode.scrollHeight;
    const viewportSlice = Math.max(window.innerHeight * 0.6, 260);
    const collapsed = Math.min(full, viewportSlice);
    setHeights({ full, collapsed });
    setIsOverflowing(full > collapsed + 12);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined" || !contentRef.current) {
      return;
    }

    measureHeights();

    const resizeObserver = new ResizeObserver(() => {
      measureHeights();
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureHeights]);

  React.useEffect(() => {
    measureHeights();
  }, [content, measureHeights]);

  const toggle = React.useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;

      if (prev && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      return next;
    });
  }, []);

  const currentHeight = React.useMemo(() => {
    if (!heights) {
      return undefined;
    }
    return isExpanded ? heights.full : heights.collapsed;
  }, [heights, isExpanded]);

  return (
    <motion.section
      {...containerVariants}
      ref={containerRef}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[18rem] border border-[#e1d6b4] bg-white px-[20rem] py-[24rem] text-[15rem] leading-[150%] text-d-black shadow-[0_18rem_48rem_rgba(56,56,56,0.12)]",
        className,
      )}
    >
      <motion.div
        className="relative overflow-hidden"
        animate={currentHeight ? { height: currentHeight } : undefined}
        initial={false}
        transition={{ type: "spring", damping: 32, stiffness: 240 }}
      >
        <div ref={contentRef} className="whitespace-pre-line text-[15rem] leading-[160%]">
          {content}
        </div>
        {isOverflowing && !isExpanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[64rem] bg-gradient-to-b from-transparent to-white" aria-hidden="true" />
        ) : null}
      </motion.div>

      {isOverflowing ? (
        <div className="mt-[18rem] flex items-center justify-center">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-[6rem] rounded-full border border-[#dacfae] bg-[#FEFBEA] px-[16rem] py-[10rem] text-[13rem] font-semibold text-d-black transition hover:bg-d-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? collapseLabel : expandLabel}</span>
            <img
              src="/images/icon_chevron--down.svg"
              alt=""
              className={cn("size-[14rem] transition-transform", isExpanded ? "rotate-180" : "rotate-0")}
              aria-hidden="true"
            />
          </button>
        </div>
      ) : null}
    </motion.section>
  );
};
