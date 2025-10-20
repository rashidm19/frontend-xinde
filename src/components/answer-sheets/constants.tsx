import type { ReactNode } from "react";

import { Circle, CircleCheck, CircleX } from "lucide-react";

import type { AnswerSheetStatus, BandMappingEntry, LegendTooltipItem, ReviewFilterKey } from "./types";

export const FILTER_LABELS: Record<ReviewFilterKey, string> = {
  all: "All",
  incorrect: "Incorrect",
  unanswered: "Unanswered",
  correct: "Correct",
};

export const STATUS_STYLES: Record<AnswerSheetStatus, { surface: string; text: string; ring: string; label: string; icon: ReactNode }> = {
  correct: {
    surface: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Correct",
    icon: <CircleCheck className="size-[16rem] text-emerald-600" aria-hidden="true" />,
  },
  incorrect: {
    surface: "bg-rose-50",
    text: "text-rose-800",
    ring: "ring-rose-200",
    label: "Incorrect",
    icon: <CircleX className="size-[16rem] text-rose-600" aria-hidden="true" />,
  },
  unanswered: {
    surface: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "No answer",
    icon: <Circle className="size-[16rem] text-slate-400" aria-hidden="true" />,
  },
};

export const LEGEND_ITEMS: LegendTooltipItem[] = [
  { icon: STATUS_STYLES.correct.icon, label: "Correct" },
  { icon: STATUS_STYLES.incorrect.icon, label: "Incorrect" },
  { icon: STATUS_STYLES.unanswered.icon, label: "No answer" },
];

export const GRID_LAYOUT_BREAKPOINTS: Array<{ query: string; columns: number }> = [
  { query: "(min-width: 1920px)", columns: 8 },
  { query: "(min-width: 1440px)", columns: 6 },
  { query: "(min-width: 1200px)", columns: 5 },
  { query: "(min-width: 768px)", columns: 4 },
];

export const DEFAULT_BAND_MAPPING: BandMappingEntry[] = [
  { minCorrect: 0, maxCorrect: 13, estimatedBand: "4.0" },
  { minCorrect: 14, maxCorrect: 18, estimatedBand: "5.0" },
  { minCorrect: 19, maxCorrect: 23, estimatedBand: "5.5" },
  { minCorrect: 24, maxCorrect: 27, estimatedBand: "6.0" },
  { minCorrect: 28, maxCorrect: 29, estimatedBand: "6.5" },
  { minCorrect: 30, maxCorrect: 31, estimatedBand: "7.0" },
  { minCorrect: 32, maxCorrect: 33, estimatedBand: "7.5" },
  { minCorrect: 34, maxCorrect: 35, estimatedBand: "8.0" },
  { minCorrect: 36, maxCorrect: 37, estimatedBand: "8.5" },
  { minCorrect: 38, maxCorrect: 40, estimatedBand: "9.0" },
];

export const STICKY_OFFSET = "calc(88rem + 16rem)";
