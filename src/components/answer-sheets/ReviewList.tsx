"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { FILTER_LABELS, STATUS_STYLES, STICKY_OFFSET } from "./constants";
import type { AnswerSheetQuestion, ReviewFilterKey, ReviewListHandle } from "./types";
import { formatTimestamp } from "./utils";

interface ReviewListProps {
  questions: AnswerSheetQuestion[];
  shouldReduceMotion: boolean;
  title?: string;
  subtitle?: string;
  emptyStateMessage?: string;
  stickyOffset?: string;
  filterLabels?: Record<ReviewFilterKey, string>;
  renderQuestionBody?: (question: AnswerSheetQuestion) => ReactNode;
  incorrectFilterGlow?: boolean;
}

const DEFAULT_TITLE = "Detailed review";
const DEFAULT_SUBTITLE = "Tap a question to reveal your answer, the correct one, and improvement cues.";
const DEFAULT_EMPTY_STATE = "Nothing to review here. Switch filters or explore another test.";

export const ReviewList = forwardRef<ReviewListHandle, ReviewListProps>(function ReviewList(
  {
    questions,
    shouldReduceMotion,
    title = DEFAULT_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    emptyStateMessage = DEFAULT_EMPTY_STATE,
    stickyOffset = STICKY_OFFSET,
    filterLabels = FILTER_LABELS,
    renderQuestionBody,
    incorrectFilterGlow = true,
  },
  ref
) {
  const [activeFilter, setActiveFilter] = useState<ReviewFilterKey>("all");
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const questionRefs = useRef<Record<number, HTMLElement | null>>({});
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredQuestions = useMemo(() => {
    switch (activeFilter) {
      case "correct":
        return questions.filter(question => question.status === "correct");
      case "incorrect":
        return questions.filter(question => question.status === "incorrect");
      case "unanswered":
        return questions.filter(question => question.status === "unanswered");
      default:
        return questions;
    }
  }, [activeFilter, questions]);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) {
        clearTimeout(highlightTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const numbers = filteredQuestions.map(question => question.number);
    setExpanded(prev => {
      const next = new Set<number>();
      numbers.forEach(number => {
        if (prev.has(number)) {
          next.add(number);
        }
      });
      return next;
    });
  }, [filteredQuestions]);

  const reviewCounts = useMemo(() => {
    return {
      all: questions.length,
      incorrect: questions.filter(question => question.status === "incorrect").length,
      unanswered: questions.filter(question => question.status === "unanswered").length,
      correct: questions.filter(question => question.status === "correct").length,
    } satisfies Record<ReviewFilterKey, number>;
  }, [questions]);

  const toggleQuestion = useCallback((number: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(filteredQuestions.map(question => question.number)));
  }, [filteredQuestions]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focusQuestion(questionNumber: number) {
        const node = questionRefs.current[questionNumber];
        if (!node) return;

        node.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        setExpanded(prev => new Set(prev).add(questionNumber));

        if (highlightTimer.current) {
          clearTimeout(highlightTimer.current);
        }

        setHighlighted(questionNumber);
        highlightTimer.current = setTimeout(() => {
          setHighlighted(null);
        }, 1400);
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (highlightTimer.current) {
        clearTimeout(highlightTimer.current);
      }
    };
  }, []);

  const renderBody = useCallback(
    (question: AnswerSheetQuestion) => {
      if (renderQuestionBody) {
        return renderQuestionBody(question);
      }

      const timestamp = formatTimestamp(question.timestampSeconds);
      const hint = question.detailHint;

      return (
        <div className="mt-[18rem] space-y-[14rem] rounded-[22rem] border border-slate-100 bg-[#F8FAFF] px-[20rem] py-[16rem] text-[14rem] text-slate-600">
          <p className="font-semibold text-slate-900">Correct answer: {question.correctAnswer ?? "—"}</p>
          <p className="text-slate-600">Your answer: {question.answer ? question.answer : "—"}</p>
          {timestamp ? <p className="text-slate-500">Heard at ~{timestamp}</p> : null}
          {hint ? (
            <div className="rounded-[18rem] border border-dashed border-slate-200 bg-white px-[18rem] py-[14rem] text-[13rem] text-slate-500">
              {hint}
            </div>
          ) : null}
        </div>
      );
    },
    [renderQuestionBody]
  );

  return (
    <section className="space-y-[18rem]">
      <header className="flex flex-wrap items-center justify-between gap-[16rem]">
        <div className="flex flex-col gap-[8rem]">
          <h2 className="text-[18rem] font-semibold text-slate-900">{title}</h2>
          <p className="text-[13rem] text-slate-500">{subtitle}</p>
        </div>
      </header>

      <div className="relative">
        <div
          className="z-[2] flex flex-wrap items-center justify-between gap-[12rem] rounded-[24rem] border border-white/60 bg-white/85 px-[18rem] py-[12rem] shadow-[0_18rem_40rem_-32rem_rgba(40,56,140,0.25)] backdrop-blur"
          style={{ top: stickyOffset }}
        >
          <div className="flex flex-wrap items-center gap-[12rem]" role="tablist" aria-label="Question filter">
            {(["all", "incorrect", "unanswered", "correct"] satisfies ReviewFilterKey[]).map(key => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeFilter === key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "rounded-[18rem] border px-[16rem] py-[8rem] text-[12rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
                  activeFilter === key
                    ? "border-slate-900 bg-slate-900 text-white mb-[0] shadow-[0_16rem_36rem_-28rem_rgba(32,56,140,0.6)]"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                )}
              >
                {filterLabels[key]} {" "}
                <span className="ml-[6rem] inline-flex min-w-[20rem] justify-center rounded-[12rem] bg-slate-100 px-[6rem] py-[2rem] text-[11rem] font-semibold text-slate-500">
                  {reviewCounts[key]}
                </span>
              </button>
            ))}
            <span aria-live="polite" className="sr-only">
              Showing {filteredQuestions.length} questions filtered by {filterLabels[activeFilter]}.
            </span>
          </div>
          <div className="flex items-center gap-[10rem]">
            <button
              type="button"
              onClick={expandAll}
              className="rounded-[18rem] border border-slate-200 bg-white px-[16rem] py-[10rem] text-[12rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-[18rem] border border-slate-200 bg-white px-[16rem] py-[10rem] text-[12rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="mt-[20rem]">
          {filteredQuestions.length === 0 ? (
            <div className="rounded-[26rem] border border-slate-100 bg-white px-[28rem] py-[40rem] text-center text-[14rem] text-slate-500">
              {emptyStateMessage}
            </div>
          ) : (
            <LayoutGroup>
              <div className="flex flex-col gap-[16rem]">
                {filteredQuestions.map(question => {
                  const statusVisual = STATUS_STYLES[question.status];
                  const isExpanded = expanded.has(question.number) || question.status !== "correct";
                  return (
                    <motion.article
                      key={question.number}
                      layout
                      ref={node => {
                        questionRefs.current[question.number] = node;
                      }}
                      className={cn(
                        "relative overflow-hidden rounded-[26rem] border bg-white px-[24rem] py-[18rem] shadow-[0_24rem_48rem_-36rem_rgba(40,56,132,0.28)]",
                        question.status === "correct" && "border-emerald-100",
                        question.status === "incorrect" && "border-rose-100",
                        question.status === "unanswered" && "border-slate-100",
                        highlighted === question.number && "ring-4 ring-offset-2",
                        highlighted === question.number && statusVisual.ring,
                        incorrectFilterGlow && activeFilter === "incorrect" && question.status === "incorrect" && "ring-1 ring-rose-200/80 shadow-[0_0_0_3px_rgba(244,63,94,0.08)]"
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={`question-panel-${question.number}`}
                        onClick={() => toggleQuestion(question.number)}
                        className="flex w-full items-center justify-between gap-[12rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      >
                        <div className="flex flex-1 items-center gap-[16rem]">
                          <span className={cn("flex size-[34rem] items-center justify-center rounded-full", statusVisual.surface, statusVisual.text)}>
                            {statusVisual.icon}
                          </span>
                          <div className="flex flex-col gap-[4rem]">
                            <span className="text-[13rem] font-semibold text-slate-500">Question {question.number}</span>
                            <div className="flex flex-wrap items-center gap-[8rem]">
                              <p className="text-[15rem] font-semibold text-slate-900">
                                {question.answer && question.answer.trim().length > 0 ? `Your answer: ${question.answer}` : "No answer provided"}
                              </p>
                              {question.sectionLabel ? (
                                <span className="rounded-[14rem] border border-slate-200 bg-slate-50 px-[10rem] py-[4rem] text-[11rem] font-semibold text-slate-500">
                                  {question.sectionLabel}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <span className={cn("inline-flex items-center gap-[8rem] rounded-[16rem] px-[14rem] py-[6rem] text-[12rem] font-semibold", statusVisual.surface, statusVisual.text)}>
                          {statusVisual.label}
                          <motion.span
                            animate={shouldReduceMotion ? undefined : { rotate: isExpanded ? 180 : 0 }}
                            transition={shouldReduceMotion ? undefined : { duration: 0.26, ease: "easeOut" }}
                            className="inline-flex"
                            aria-hidden="true"
                          >
                            <ChevronDown className="size-[16rem]" />
                          </motion.span>
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded ? (
                          <motion.div
                            id={`question-panel-${question.number}`}
                            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                            animate={shouldReduceMotion ? undefined : { height: "auto", opacity: 1 }}
                            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                            transition={shouldReduceMotion ? undefined : { duration: 0.28, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            {renderBody(question)}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </div>
            </LayoutGroup>
          )}
        </div>
      </div>
    </section>
  );
});
