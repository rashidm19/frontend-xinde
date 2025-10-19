import type { ReactNode } from "react";

export type AnswerSheetStatus = "correct" | "incorrect" | "unanswered";

export type ReviewFilterKey = "all" | "correct" | "incorrect" | "unanswered";

export interface AnswerSheetQuestion {
  number: number;
  status: AnswerSheetStatus;
  answer: string | null;
  correctAnswer: string | null;
  questionLabel?: string | null;
  sectionLabel?: string | null;
  timestampSeconds?: number | null;
  detailHint?: string | null;
}

export interface ResultOverviewMetaItem {
  icon: ReactNode;
  label: string;
}

export interface ResultOverviewProps {
  icon: ReactNode;
  iconContainerClassName?: string;
  heroLabel?: string;
  accentLabel: string;
  accentValue: string;
  correctCount: number;
  totalCount: number;
  metaItems?: ResultOverviewMetaItem[];
  metaDescription?: string | null;
  contextDescription?: string | null;
  accuracyLabel?: string;
  accuracyHelpText?: string;
  shouldReduceMotion: boolean;
}

export interface LegendTooltipItem {
  icon: ReactNode;
  label: string;
}

export interface BandMappingEntry {
  minCorrect: number;
  maxCorrect: number;
  estimatedBand: string;
}

export interface MistakesReviewQuestion extends AnswerSheetQuestion {}

export interface ReviewListHandle {
  focusQuestion: (questionNumber: number) => void;
}
