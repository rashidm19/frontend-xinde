"use client";

import { memo } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { ReadingFilterKey } from "./question-types";

interface FilterBarProps {
  counts: Record<ReadingFilterKey, number>;
  activeFilter: ReadingFilterKey;
  onChange: (value: ReadingFilterKey) => void;
  shouldReduceMotion: boolean;
}

const FILTER_LABELS: Record<ReadingFilterKey, string> = {
  all: "All",
  correct: "Correct",
  incorrect: "Incorrect",
  unanswered: "Unanswered",
};

export const FilterPillsBar = memo(function FilterPillsBar({ counts, activeFilter, onChange, shouldReduceMotion }: FilterBarProps) {
  return (
    <section className="relative overflow-hidden rounded-[28rem] border border-[#E1D6B4] bg-white px-[16rem] py-[14rem] shadow-[0_16rem_40rem_-28rem_rgba(56,56,56,0.14)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[28rem] bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[28rem] bg-gradient-to-l from-white to-transparent" aria-hidden="true" />

      <div className="relative flex items-center gap-[10rem] overflow-x-auto scroll-smooth px-[8rem] py-[4rem] text-[13rem] font-semibold text-d-black scrollbar-thin scrollbar-thumb-transparent">
        {(Object.keys(FILTER_LABELS) as ReadingFilterKey[]).map(key => (
          <motion.button
            key={key}
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-[8rem] rounded-[999rem] border px-[16rem] py-[8rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8E7B45]",
              activeFilter === key
                ? "border-[#5e7a3f] bg-[#5e7a3f] text-white"
                : "border-[#D9CDA9] bg-d-yellow-secondary/65 text-d-black hover:bg-d-yellow-secondary"
            )}
            aria-pressed={activeFilter === key}
            aria-label={`${FILTER_LABELS[key]} questions: ${counts[key]}`}
          >
            <span>{FILTER_LABELS[key]}</span>
            <span className={cn("rounded-[999rem] px-[8rem] py-[2rem] text-[12rem] font-semibold", activeFilter === key ? "bg-white/20" : "bg-white/80 text-d-black/80")}>{counts[key]}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
});
