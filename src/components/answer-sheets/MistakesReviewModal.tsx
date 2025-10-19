"use client";

import type { ReactNode } from "react";

import { STATUS_STYLES } from "./constants";
import { formatTimestamp } from "./utils";
import type { AnswerSheetQuestion } from "./types";
import { EmptyModalState, ModalShell } from "../modals/UnifiedModalShell";
import { cn } from "@/lib/utils";

interface MistakesReviewModalProps {
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: AnswerSheetQuestion[];
  emptyDescription?: string;
  renderTip?: (question: AnswerSheetQuestion) => ReactNode;
}

const DEFAULT_TITLE = "Review mistakes";
const DEFAULT_EMPTY_DESCRIPTION = "Once you have incorrect or skipped answers, you can review them here.";

export function MistakesReviewModal({
  title = DEFAULT_TITLE,
  open,
  onOpenChange,
  questions,
  emptyDescription = DEFAULT_EMPTY_DESCRIPTION,
  renderTip,
}: MistakesReviewModalProps) {
  const hasQuestions = questions.length > 0;

  return (
    <ModalShell title={title} open={open} onOpenChange={onOpenChange} size="lg">
      {!hasQuestions ? (
        <EmptyModalState description={emptyDescription} />
      ) : (
        <div className="space-y-[16rem]">
          {questions.map(question => {
            const status = STATUS_STYLES[question.status];
            const timestamp = formatTimestamp(question.timestampSeconds);
            const tipContent = renderTip ? renderTip(question) : question.detailHint;
            return (
              <article
                key={`mistake-question-${question.number}`}
                className="rounded-[22rem] border border-slate-100 bg-white px-[22rem] py-[18rem] shadow-[0_20rem_44rem_-32rem_rgba(32,52,128,0.28)]"
              >
                <header className="flex items-center justify-between gap-[12rem]">
                  <div className="flex items-center gap-[12rem]">
                    <span className={cn("flex size-[28rem] items-center justify-center rounded-full", status.surface, status.text)}>{status.icon}</span>
                    <div className="flex flex-col gap-[4rem]">
                      <p className="text-[13rem] font-semibold text-slate-500">Question {question.number}</p>
                      <p className="text-[14rem] font-semibold text-slate-900">Correct answer: {question.correctAnswer ?? "—"}</p>
                      {timestamp ? <p className="text-[12rem] font-medium text-slate-400">Heard at ~{timestamp}</p> : null}
                    </div>
                  </div>
                  <span className={cn("rounded-[16rem] px-[14rem] py-[6rem] text-[12rem] font-semibold", status.surface, status.text)}>{status.label}</span>
                </header>
                <div className="mt-[14rem] space-y-[10rem] text-[13rem] text-slate-600">
                  <p>Your answer: {question.answer ?? "—"}</p>
                  {tipContent ? (
                    <div className="rounded-[18rem] border border-dashed border-slate-200 bg-[#F8FAFF] px-[18rem] py-[12rem] font-medium text-slate-500">
                      {tipContent}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
