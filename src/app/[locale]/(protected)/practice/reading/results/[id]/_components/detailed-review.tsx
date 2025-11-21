"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { NormalizedReadingQuestion, ReadingFilterKey } from "./question-types";

const HEADER_OFFSET_DESKTOP = 110;
const HEADER_OFFSET_MOBILE = 80;

interface ReadingDetailedReviewProps {
  questions: NormalizedReadingQuestion[];
  activeFilter: ReadingFilterKey;
  shouldReduceMotion: boolean;
  singleOpen: boolean;
}

export interface ReadingDetailedReviewHandle {
  focusQuestion: (number: number) => void;
}

const statusStyles = {
  correct: {
    chip: "bg-[#E7F2DD] text-[#2F5E25]",
    border: "border-[#C9E0B7]",
    dot: "bg-[#4C7A3A]",
    helper: null,
  },
  incorrect: {
    chip: "bg-[#FFE4E2] text-[#9E2E2A]",
    border: "border-[#FFD3CF]",
    dot: "bg-[#C3423F]",
    helper: "Review this question again in the passage.",
  },
  unanswered: {
    chip: "bg-[#f7f3da] text-[#6F6335]/70",
    border: "border-[#E8DCAC]",
    dot: "bg-[#85784A]",
    helper: "Give every question a try next time for stronger recall.",
  },
} satisfies Record<NormalizedReadingQuestion["status"], {
  chip: string;
  border: string;
  dot: string;
  helper: string | null;
}>;

const FILTER_FNS: Record<ReadingFilterKey, (question: NormalizedReadingQuestion) => boolean> = {
  all: () => true,
  correct: question => question.status === "correct",
  incorrect: question => question.status === "incorrect",
  unanswered: question => question.status === "unanswered",
};

export const ReadingDetailedReview = memo(
  forwardRef<ReadingDetailedReviewHandle, ReadingDetailedReviewProps>(function ReadingDetailedReview(
    { questions, activeFilter, shouldReduceMotion, singleOpen },
    ref
  ) {
    const filteredQuestions = useMemo(() => questions.filter(FILTER_FNS[activeFilter]), [activeFilter, questions]);

    const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const questionRefs = useRef<Record<number, HTMLElement | null>>({});
    const scrollFramesRef = useRef<{ first: number | null; second: number | null }>({ first: null, second: null });

    useEffect(() => {
      setExpanded(prev => {
        const next = new Set<number>();
        filteredQuestions.forEach(question => {
          if (prev.has(question.number)) {
            next.add(question.number);
          }
        });
        return next;
      });
    }, [filteredQuestions]);

    const scrollToQuestion = useCallback((questionNumber: number) => {
      const node = questionRefs.current[questionNumber];
      if (!node || typeof window === "undefined") {
        return;
      }

      const rect = node.getBoundingClientRect();
      const offset = window.matchMedia("(max-width: 767px)").matches ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP;
      const top = rect.top + window.scrollY - offset;

      window.scrollTo({ top, behavior: "smooth" });
    }, []);

    const scheduleScrollToQuestion = useCallback(
      (questionNumber: number) => {
        if (typeof window === "undefined") {
          return;
        }

        const { first, second } = scrollFramesRef.current;
        if (first !== null) {
          window.cancelAnimationFrame(first);
        }
        if (second !== null) {
          window.cancelAnimationFrame(second);
        }

        const firstFrame = window.requestAnimationFrame(() => {
          scrollFramesRef.current.first = null;
          const secondFrame = window.requestAnimationFrame(() => {
            scrollFramesRef.current.second = null;
            scrollToQuestion(questionNumber);
          });
          scrollFramesRef.current.second = secondFrame;
        });

        scrollFramesRef.current = { first: firstFrame, second: null };
      },
      [scrollToQuestion]
    );

    const applyHighlight = useCallback((questionNumber: number) => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }

      setHighlighted(questionNumber);
      highlightTimerRef.current = setTimeout(() => {
        setHighlighted(null);
      }, 1600);
    }, []);

    const openQuestion = useCallback(
      (questionNumber: number) => {
        setExpanded(prev => {
          if (singleOpen) {
            const isAlreadyOpen = prev.has(questionNumber);
            return isAlreadyOpen ? new Set<number>() : new Set<number>([questionNumber]);
          }

          const next = new Set(prev);
          if (next.has(questionNumber)) {
            next.delete(questionNumber);
          } else {
            next.add(questionNumber);
          }
          return next;
        });
      },
      [singleOpen]
    );

    useImperativeHandle(
      ref,
      () => ({
        focusQuestion(questionNumber) {
          setExpanded(prev => {
            if (singleOpen) {
              return new Set<number>([questionNumber]);
            }
            const next = new Set(prev);
            next.add(questionNumber);
            return next;
          });
          applyHighlight(questionNumber);
          // Double rAF ensures the accordion expansion has flushed to the DOM before measuring for scroll.
          scheduleScrollToQuestion(questionNumber);
        },
      }),
      [applyHighlight, scheduleScrollToQuestion, singleOpen]
    );

    useEffect(() => () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
      if (typeof window !== "undefined") {
        const { first, second } = scrollFramesRef.current;
        if (first !== null) {
          window.cancelAnimationFrame(first);
        }
        if (second !== null) {
          window.cancelAnimationFrame(second);
        }
      }
    }, []);

    if (filteredQuestions.length === 0) {
      return (
        <section className="rounded-[28rem] border border-dashed border-[#E1D6B4] bg-d-yellow-secondary/60 px-[24rem] py-[32rem] text-center text-[14rem] text-d-black/70">
          Nothing to review here. Switch filters or explore another test.
        </section>
      );
    }

    return (
      <section className="flex flex-col gap-[16rem]">
        {filteredQuestions.map(question => {
          const styles = statusStyles[question.status];
          const isExpanded = expanded.has(question.number);
          const helperText = question.status === "correct" ? null : styles.helper;

          return (
            <motion.article
              key={question.number}
              ref={node => {
                questionRefs.current[question.number] = node;
              }}
              layout
              className={cn(
                "relative overflow-hidden rounded-[28rem] border bg-white shadow-[0_18rem_48rem_-32rem_rgba(56,56,56,0.18)]",
                styles.border,
                highlighted === question.number && "ring-4 ring-[#4C7A3A]/60"
              )}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              transition={shouldReduceMotion ? undefined : { layout: { duration: 0.28, ease: "easeOut" } }}
            >
              <AnimatePresence>
                {highlighted === question.number && !shouldReduceMotion ? (
                  <motion.span
                    key="highlight"
                    className="pointer-events-none absolute inset-0 z-0 rounded-[28rem] bg-[#F6E8B5]/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                ) : null}
              </AnimatePresence>
              <button
                type="button"
                className="relative z-[1] flex w-full items-center justify-between gap-[16rem] px-[24rem] py-[18rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8E7B45]"
                aria-expanded={isExpanded}
                aria-controls={`reading-question-panel-${question.number}`}
                onClick={() => openQuestion(question.number)}
              >
                <div className="flex items-center gap-[14rem]">
                  <span className={cn("size-[12rem] min-w-[12rem] rounded-full", styles.dot)} aria-hidden="true" />
                  <div className="flex flex-col gap-[4rem]">
                    <span className="text-[12rem] font-semibold uppercase tracking-[0.2em] text-[#85784A]">Question {question.number}</span>
                    <p className="text-[15rem] font-semibold text-d-black">
                      {question.answer ? `Your answer: ${question.answer}` : "No answer provided"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    question.status === "unanswered"
                      ? "rounded-full px-2 py-1 text-xs font-medium"
                      : "rounded-[999rem] px-[14rem] py-[6rem] text-[12rem] font-semibold",
                    styles.chip
                  )}
                >
                  {question.status === "correct" ? "Correct" : question.status === "incorrect" ? "Incorrect" : "No answer"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    key="content"
                    id={`reading-question-panel-${question.number}`}
                    initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion ? undefined : { height: "auto", opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={shouldReduceMotion ? undefined : { duration: 0.32, ease: "easeInOut" }}
                    className="relative z-[1] overflow-hidden border-t border-[#E1D6B4]/60"
                  >
                    <div className="space-y-[14rem] px-[24rem] py-[20rem] text-[14rem] text-d-black/80">
                      <p className="font-semibold text-d-black">Correct answer: {question.correctAnswer ?? "—"}</p>
                      <p>Your answer: {question.answer ?? "No answer provided"}</p>
                      {helperText ? <p className="text-[13rem] text-[#6F6335]">{helperText}</p> : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </section>
    );
  })
);
