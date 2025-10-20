"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { GRID_LAYOUT_BREAKPOINTS, STATUS_STYLES } from "./constants";
import type { AnswerSheetQuestion } from "./types";
import { formatTimestamp } from "./utils";

interface AnswersGridProps {
  questions: AnswerSheetQuestion[];
  shouldReduceMotion: boolean;
  onQuestionSelect: (questionNumber: number) => void;
  ariaLabel?: string;
  className?: string;
  questionLabelPrefix?: string;
}

export function AnswersGrid({
  questions,
  shouldReduceMotion,
  onQuestionSelect,
  ariaLabel = "Question overview",
  className,
  questionLabelPrefix = "Question",
}: AnswersGridProps) {
  const [activePopover, setActivePopover] = useState<number | null>(null);
  const [columns, setColumns] = useState(2);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const columnCount = useMemo(() => Math.min(Math.max(columns, 2), 8), [columns]);
  const gridTemplateColumns = useMemo(() => `repeat(${columnCount}, minmax(0, 1fr))`, [columnCount]);

  useEffect(() => {
    const queries = GRID_LAYOUT_BREAKPOINTS.map(({ query, columns: value }) => ({ mq: window.matchMedia(query), value }));

    const evaluate = () => {
      const matched = queries.find(entry => entry.mq.matches);
      setColumns(matched ? matched.value : 2);
    };

    evaluate();
    queries.forEach(entry => entry.mq.addEventListener("change", evaluate));

    return () => {
      queries.forEach(entry => entry.mq.removeEventListener("change", evaluate));
    };
  }, []);

  useEffect(() => {
    if (activePopover === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) {
        return;
      }
      setActivePopover(null);
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePopover(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePopover]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      const total = questions.length;
      if (total === 0) return;

      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % total;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + total) % total;
          break;
        case "ArrowDown":
          nextIndex = (index + columnCount) % total;
          break;
        case "ArrowUp":
          nextIndex = (index - columnCount + total) % total;
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onQuestionSelect(questions[index]?.number);
          setActivePopover(questions[index]?.number ?? null);
          return;
        default:
          return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        buttonRefs.current[nextIndex]?.focus();
      }
    },
    [columnCount, onQuestionSelect, questions]
  );

  return (
    <div
      ref={containerRef}
      className={cn("grid gap-[12rem]", className)}
      role="grid"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns }}
    >
      {questions.map((question, index) => {
        const status = STATUS_STYLES[question.status];
        const isPopoverOpen = activePopover === question.number;
        const popoverId = `answer-sheet-question-${question.number}-tooltip`;
        const timestamp = formatTimestamp(question.timestampSeconds);
        return (
          <button
            key={question.number}
            ref={node => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="gridcell"
            aria-label={`${questionLabelPrefix} ${question.number}: ${status.label}`}
            aria-describedby={isPopoverOpen ? popoverId : undefined}
            onClick={() => {
              onQuestionSelect(question.number);
              setActivePopover(question.number);
            }}
            onMouseEnter={() => setActivePopover(question.number)}
            onMouseLeave={() => setActivePopover(prev => (prev === question.number ? null : prev))}
            onFocus={() => setActivePopover(question.number)}
            onBlur={() => setActivePopover(prev => (prev === question.number ? null : prev))}
            onKeyDown={event => handleKeyDown(event, index)}
            className={cn(
              "group relative flex h-[74rem] flex-col items-center justify-center rounded-[20rem] border border-white/60 bg-white text-[14rem] font-semibold shadow-[0_16rem_34rem_-24rem_rgba(42,56,140,0.35)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500",
              question.status === "correct" && "hover:bg-emerald-50",
              question.status === "incorrect" && "hover:bg-rose-50",
              question.status === "unanswered" && "hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-[8rem] text-[13rem] font-semibold text-slate-700">
              <span
                aria-hidden="true"
                className={cn(
                  "size-[12rem] rounded-full",
                  question.status === "correct" ? "bg-emerald-500" : question.status === "incorrect" ? "bg-rose-500" : "bg-slate-300"
                )}
              />
              Q{question.number}
            </div>
            <AnimatePresence>
              <motion.div
                key={question.status}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.22, ease: "easeOut" }}
                className={cn("text-[12rem] font-medium", status.text)}
              >
                {status.label}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {isPopoverOpen ? (
                <motion.div
                  key="question-popover"
                  id={popoverId}
                  role="tooltip"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                  transition={shouldReduceMotion ? undefined : { duration: 0.18, ease: "easeOut" }}
                  className={cn(
                    "pointer-events-none absolute top-full z-10 mt-[10rem] w-[200rem] -translate-x-1/2 rounded-[16rem] border border-slate-100 bg-white px-[14rem] py-[12rem] text-left text-[12rem] font-medium text-slate-600 shadow-[0_20rem_50rem_-34rem_rgba(40,60,120,0.4)]",
                    question.status === "correct" && "border-emerald-200",
                    question.status === "incorrect" && "border-rose-200"
                  )}
                  style={{ left: "50%" }}
                  aria-hidden={!isPopoverOpen}
                >
                  <p className="font-semibold text-slate-900">
                    {questionLabelPrefix} {question.number}
                  </p>
                  <div className="mt-[6rem] space-y-[4rem]">
                    {question.sectionLabel ? <p className="text-slate-500">Section: {question.sectionLabel}</p> : null}
                    <p className="text-slate-500">Your answer: {question.answer ?? "—"}</p>
                    <p className="text-slate-500">Correct answer: {question.correctAnswer ?? "—"}</p>
                    <p className={cn("font-semibold", status.text)}>Status: {status.label}</p>
                    {timestamp ? <p className="text-slate-400">Heard at ~{timestamp}</p> : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
