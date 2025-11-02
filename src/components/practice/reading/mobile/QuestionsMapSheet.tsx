"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { BottomSheet, BottomSheetContent } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

const chipVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.16, ease: "easeOut" } },
};

export interface QuestionsMapSection {
  label: string;
  questions: number[];
}

export interface QuestionsMapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: QuestionsMapSection[];
  answered: Set<number>;
  flagged?: Set<number>;
  currentQuestion?: number | null;
  onSelectQuestion: (questionNumber: number) => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
  answeredLabel: string;
  flaggedLabel: string;
  questionAriaLabel?: (questionNumber: number) => string;
}

export const QuestionsMapSheet: React.FC<QuestionsMapSheetProps> = ({
  open,
  onOpenChange,
  sections,
  answered,
  flagged,
  currentQuestion,
  onSelectQuestion,
  title,
  subtitle,
  closeLabel,
  answeredLabel,
  flaggedLabel,
  questionAriaLabel,
}) => {
  const handleSelect = React.useCallback(
    (question: number) => {
      onSelectQuestion(question);
      onOpenChange(false);
    },
    [onOpenChange, onSelectQuestion],
  );

  const flaggedSet = React.useMemo(() => flagged ?? new Set<number>(), [flagged]);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        className="flex max-h-[90dvh] flex-col gap-[8rem] px-[20rem] pb-[20rem]"
        aria-label={title}
        role="dialog"
        aria-modal="true"
        style={{ paddingBottom: "calc(20rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col gap-[6rem] text-center">
          <h2 className="text-[18rem] font-semibold text-d-black">{title}</h2>
          {subtitle ? <p className="text-[14rem] leading-[20rem] text-d-black/70">{subtitle}</p> : null}
        </div>

        <div className="flex flex-col gap-[12rem] text-[12rem] pb-[8rem] text-d-black/45">
          <div className="inline-flex items-center justify-center gap-[12rem]">
            <span className="inline-flex items-center gap-[4rem]">
              <span className="size-[8rem] rounded-full bg-d-green" aria-hidden="true" />
              <span>{answeredLabel}</span>
            </span>
            <span className="inline-flex items-center gap-[4rem]">
              <span className="size-[8rem] rounded-full bg-[#FEC260]" aria-hidden="true" />
              <span>{flaggedLabel}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-[4rem]">
          <div className="flex flex-col gap-[16rem] pb-[12rem]">
            {sections.map(section => (
              <div key={section.label} className="flex flex-col gap-[12rem]">
                <span className="text-[13rem] font-semibold uppercase tracking-[0.12em] text-d-black/60">{section.label}</span>
                <div className="flex flex-wrap gap-[8rem]">
                  {section.questions.map(questionNumber => {
                    const isAnswered = answered.has(questionNumber);
                    const isFlagged = flaggedSet.has(questionNumber);
                    const isActive = currentQuestion === questionNumber;
                    return (
                      <motion.button
                        key={questionNumber}
                        type="button"
                        {...chipVariants}
                        onClick={() => handleSelect(questionNumber)}
                        className={cn(
                          "relative flex size-[42rem] items-center justify-center rounded-full border border-transparent text-[14rem] font-semibold text-d-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/50",
                          isActive ? "border-d-black bg-d-green" : isAnswered ? "bg-d-green/60" : "bg-white shadow-[0_6rem_16rem_rgba(56,56,56,0.1)]",
                        )}
                        aria-pressed={isActive}
                        aria-label={questionAriaLabel ? questionAriaLabel(questionNumber) : `Question ${questionNumber}`}
                      >
                        {questionNumber}
                        {isFlagged ? <span className="absolute -right-[4rem] -top-[4rem] size-[10rem] rounded-full bg-[#FEC260]" aria-hidden="true" /> : null}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[8rem] pt-[12rem]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex w-full items-center justify-center rounded-[18rem] border border-d-black/10 bg-white px-[18rem] py-[12rem] text-[14rem] font-semibold text-d-black transition hover:bg-d-green/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/50"
          >
            {closeLabel}
          </button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
};
