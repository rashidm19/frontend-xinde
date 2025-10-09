"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookOpenCheck,
  BookOpenText,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock3,
  LogOut,
  Sparkles,
  Table,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { PracticeReadingResult, PracticeReadingResultQuestion } from "@/types/PracticeReading";
import { EmptyModalState, ModalShell } from "@/components/modals/UnifiedModalShell";

type ReadingQuestionStatus = "correct" | "incorrect" | "unanswered";

interface ReadingQuestion extends PracticeReadingResultQuestion {
  number: number;
  status: ReadingQuestionStatus;
}

type ReviewFilterKey = "all" | "correct" | "incorrect" | "unanswered";

interface ReadingMeta {
  testName?: string | null;
  takenAt?: string | null;
  elapsedMinutes?: number | null;
}

interface BandMappingEntry {
  minCorrect: number;
  maxCorrect: number;
  estimatedBand: string;
}

interface ReadingAnswerSheetProps {
  data: PracticeReadingResult;
  locale: string;
  meta?: ReadingMeta | null;
  bandMapping?: BandMappingEntry[];
  onRetry?: () => void;
}

const DEFAULT_BAND_MAPPING: BandMappingEntry[] = [
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

const FILTER_LABELS: Record<ReviewFilterKey, string> = {
  all: "All",
  incorrect: "Incorrect",
  unanswered: "Unanswered",
  correct: "Correct",
};

const STATUS_STYLES: Record<ReadingQuestionStatus, { surface: string; text: string; ring: string; label: string; icon: ReactNode }> = {
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

const GRID_LAYOUT_BREAKPOINTS: Array<{ query: string; columns: number }> = [
  { query: "(min-width: 1920px)", columns: 8 },
  { query: "(min-width: 1440px)", columns: 6 },
  { query: "(min-width: 1200px)", columns: 5 },
  { query: "(min-width: 768px)", columns: 4 },
];

export function ReadingAnswerSheet({ data, locale, meta, bandMapping, onRetry }: ReadingAnswerSheetProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<ReviewFilterKey>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(() => new Set());
  const [highlightedQuestion, setHighlightedQuestion] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [bandModalOpen, setBandModalOpen] = useState(false);
  const [columns, setColumns] = useState(2);

  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const questionRefs = useRef<Record<number, HTMLElement | null>>({});

  const total = data.questions.length;
  const normalizedQuestions = useMemo<ReadingQuestion[]>(() => {
    return data.questions.map((question, index) => {
      const hasAnswer = typeof question.answer === "string" && question.answer.trim().length > 0;
      const status: ReadingQuestionStatus = hasAnswer ? (question.correct ? "correct" : "incorrect") : "unanswered";
      return {
        ...question,
        number: index + 1,
        status,
      };
    });
  }, [data.questions]);

  const correctCount = useMemo(() => {
    if (typeof data.correct_answers_count === "number") {
      return data.correct_answers_count;
    }
    return normalizedQuestions.filter(question => question.status === "correct").length;
  }, [data.correct_answers_count, normalizedQuestions]);

  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

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
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleExit = useCallback(() => {
    router.push(`/${locale}/profile`);
  }, [locale, router]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
      return;
    }
    router.push(`/${locale}/practice/reading`);
  }, [locale, onRetry, router]);

  const filteredQuestions = useMemo(() => {
    switch (activeFilter) {
      case "correct":
        return normalizedQuestions.filter(question => question.status === "correct");
      case "incorrect":
        return normalizedQuestions.filter(question => question.status === "incorrect");
      case "unanswered":
        return normalizedQuestions.filter(question => question.status === "unanswered");
      default:
        return normalizedQuestions;
    }
  }, [activeFilter, normalizedQuestions]);

  useEffect(() => {
    const targetNumbers = filteredQuestions.map(question => question.number);
    setExpandedQuestions(prev => {
      const next = new Set<number>();
      targetNumbers.forEach(number => {
        if (prev.has(number)) {
          next.add(number);
        }
      });
      return next;
    });
  }, [filteredQuestions]);

  const toggleQuestion = useCallback((number: number) => {
    setExpandedQuestions(prev => {
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
    setExpandedQuestions(new Set(filteredQuestions.map(question => question.number)));
  }, [filteredQuestions]);

  const collapseAll = useCallback(() => {
    setExpandedQuestions(new Set());
  }, []);

  const handleQuestionFocus = useCallback((questionNumber: number) => {
    const node = questionRefs.current[questionNumber];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    setExpandedQuestions(prev => new Set(prev).add(questionNumber));

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    setHighlightedQuestion(questionNumber);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedQuestion(null);
    }, 1400);
  }, []);

  const handleGridKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const totalCells = normalizedQuestions.length;
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % totalCells;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + totalCells) % totalCells;
          break;
        case "ArrowDown":
          nextIndex = (index + columns) % totalCells;
          break;
        case "ArrowUp":
          nextIndex = (index - columns + totalCells) % totalCells;
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          handleQuestionFocus(normalizedQuestions[index]?.number);
          return;
        default:
          return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        gridRefs.current[nextIndex]?.focus();
      }
    },
    [columns, handleQuestionFocus, normalizedQuestions]
  );

  const reviewCounts = useMemo(() => {
    return {
      all: normalizedQuestions.length,
      incorrect: normalizedQuestions.filter(question => question.status === "incorrect").length,
      unanswered: normalizedQuestions.filter(question => question.status === "unanswered").length,
      correct: normalizedQuestions.filter(question => question.status === "correct").length,
    } satisfies Record<ReviewFilterKey, number>;
  }, [normalizedQuestions]);

  const hasAnyAnswers = normalizedQuestions.some(question => question.status !== "unanswered");

  const heroMotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.45, ease: "easeOut" },
      };

  const effectiveBandMapping = bandMapping?.length ? bandMapping : DEFAULT_BAND_MAPPING;

  const reviewList = useMemo(() => {
    return normalizedQuestions.filter(question => question.status !== "correct");
  }, [normalizedQuestions]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF3FF] via-white to-white">
      <div className="mx-auto flex w-full max-w-[1240rem] flex-col gap-[28rem] px-[28rem] pb-[64rem] pt-[36rem] tablet:px-[40rem] desktop:px-[56rem]">
        <header className="flex flex-wrap items-center justify-between gap-[16rem] rounded-[28rem] border border-white/40 bg-white/70 px-[24rem] py-[18rem] shadow-[0_20rem_50rem_-40rem_rgba(62,88,189,0.55)] backdrop-blur">
          <nav aria-label="Page navigation" className="flex items-center gap-[12rem]">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-[10rem] rounded-[18rem] border border-slate-200 bg-white px-[16rem] py-[10rem] text-[13rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="size-[16rem]" aria-hidden="true" />
              Back to tasks
            </button>
          </nav>
          <div className="flex flex-col items-center gap-[6rem] text-center">
            <span className="text-[13rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Reading results</span>
            <h1 className="text-[20rem] font-semibold text-slate-900 tablet:text-[22rem]">Answer sheet</h1>
          </div>
          <div className="flex items-center gap-[12rem]">
            <div className="inline-flex items-center gap-[10rem] rounded-[20rem] border border-slate-200 bg-white px-[18rem] py-[10rem] text-[13rem] font-semibold text-slate-600 shadow-[0_18rem_32rem_-26rem_rgba(27,52,129,0.4)]">
              <span className="rounded-[12rem] bg-slate-900 px-[12rem] py-[6rem] text-white">Reading</span>
              <span>{total} questions</span>
            </div>
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center gap-[8rem] rounded-[18rem] border border-slate-200 bg-white px-[18rem] py-[10rem] text-[13rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Exit
              <LogOut className="size-[16rem]" aria-hidden="true" />
            </button>
          </div>
        </header>

        <motion.section
          {...heroMotionProps}
          className="relative flex flex-col gap-[22rem] rounded-[32rem] border border-white/50 bg-gradient-to-br from-[#3568FF]/10 via-white to-white px-[32rem] py-[28rem] shadow-[0_46rem_120rem_-70rem_rgba(40,78,176,0.65)] tablet:flex-row tablet:items-center tablet:justify-between"
        >
          <div className="flex flex-1 flex-col gap-[16rem]">
            <div className="flex items-center gap-[12rem]">
+              <div className="flex size-[56rem] items-center justify-center rounded-[18rem] bg-gradient-to-br from-[#4F86F7] to-[#7B61FF] text-white shadow-[0_24rem_48rem_-32rem_rgba(58,88,208,0.55)]">
                <BookOpenCheck className="size-[26rem]" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-[4rem]">
                <span className="text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Correct answers</span>
                <div className="flex items-end gap-[10rem] text-slate-900">
                  <span className="text-[46rem] font-semibold leading-none">{correctCount}</span>
                  <span className="pb-[4rem] text-[18rem] font-semibold text-slate-500">/ {total}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[12rem]">
              <div className="flex items-center justify-between text-[13rem] font-medium text-slate-500">
                <span>Accuracy</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-[8rem] w-full rounded-[999rem] bg-slate-100">
                <motion.div
                  className={cn(
                    "h-full rounded-[999rem] bg-gradient-to-r from-[#4F86F7] via-[#6D7CFF] to-[#8F62FF] shadow-[0_12rem_28rem_-18rem_rgba(73,88,196,0.5)]",
                    percentage === 0 && "bg-slate-300"
                  )}
                  initial={{ width: shouldReduceMotion ? `${percentage}%` : 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
                />
              </div>
              <p className="text-[13rem] text-slate-500">Score based on checked answers.</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-[12rem] rounded-[26rem] border border-slate-100 bg-white/80 px-[24rem] py-[22rem] shadow-[0_26rem_60rem_-48rem_rgba(38,62,140,0.45)]">
            <div className="flex flex-wrap items-center gap-[12rem] text-[13rem] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-[8rem]"><BookOpenText className="size-[16rem]" aria-hidden="true" /> {meta?.testName ?? `Practice set #${data.id}`}</span>
              <span className="size-[6rem] rounded-full bg-slate-200" aria-hidden="true" />
              <span className="inline-flex items-center gap-[8rem]"><Clock3 className="size-[16rem]" aria-hidden="true" /> {meta?.elapsedMinutes ? `${meta.elapsedMinutes} min` : "Time pending"}</span>
            </div>
            <p className="text-[13rem] text-slate-500">Completed {meta?.takenAt ? new Date(meta.takenAt).toLocaleString() : "—"}</p>
            <div className="rounded-[20rem] border border-slate-200 bg-white px-[20rem] py-[12rem] text-[13rem] font-medium text-slate-600">
              Keep momentum by reviewing mistakes and revisiting tricky question types.
            </div>
          </div>
        </motion.section>

        <section className="space-y-[20rem]">
          <header className="flex flex-wrap items-center justify-between gap-[16rem]">
            <div className="flex items-center gap-[12rem]">
              <span className="text-[15rem] font-semibold text-slate-900">Answers overview</span>
              <span className="rounded-[18rem] bg-white px-[14rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-[0_12rem_24rem_-20rem_rgba(34,51,120,0.35)]">Quick scan</span>
            </div>
            <div className="flex items-center gap-[10rem] text-[12rem] text-slate-500">
              <span className="inline-flex items-center gap-[6rem]"><CircleCheck className="size-[14rem] text-emerald-500" aria-hidden="true" /> Correct</span>
              <span className="inline-flex items-center gap-[6rem]"><CircleX className="size-[14rem] text-rose-500" aria-hidden="true" /> Incorrect</span>
              <span className="inline-flex items-center gap-[6rem]"><Circle className="size-[14rem] text-slate-400" aria-hidden="true" /> No answer</span>
            </div>
          </header>
          <div
            className="grid grid-cols-2 gap-[12rem] tablet:grid-cols-4 desktop:grid-cols-6 wide:grid-cols-8"
            role="grid"
            aria-label="Question overview"
          >
            {normalizedQuestions.map((question, index) => {
              const statusVisual = STATUS_STYLES[question.status];
              return (
                <button
                  key={question.number}
                  ref={node => {
                    gridRefs.current[index] = node;
                  }}
                  type="button"
                  role="gridcell"
                  aria-label={`Question ${question.number}: ${statusVisual.label}`}
                  onClick={() => handleQuestionFocus(question.number)}
                  onKeyDown={event => handleGridKeyDown(event, index)}
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
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
                      className={cn("text-[12rem] font-medium", statusVisual.text)}
                    >
                      {statusVisual.label}
                    </motion.div>
                  </AnimatePresence>
                  <div
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute top-full z-10 mt-[10rem] w-[190rem] -translate-x-1/2 rounded-[16rem] border border-white/75 bg-white px-[14rem] py-[12rem] text-left text-[12rem] font-medium text-slate-600 opacity-0 shadow-[0_20rem_50rem_-34rem_rgba(40,60,120,0.4)] transition group-hover:opacity-100 group-focus-visible:opacity-100",
                      question.status === "correct" && "group-hover:border-emerald-200",
                      question.status === "incorrect" && "group-hover:border-rose-200"
                    )}
                    style={{ left: "50%" }}
                  >
                    <p className="font-semibold text-slate-900">Question {question.number}</p>
                    <div className="mt-[6rem] space-y-[4rem]">
                      <p className="text-slate-500">Your answer: {question.answer ?? "—"}</p>
                      <p className="text-slate-500">Correct answer: {question.correct_answer}</p>
                      <p className={cn("font-semibold", statusVisual.text)}>Status: {statusVisual.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-[18rem]">
          <header className="flex flex-wrap items-center justify-between gap-[16rem]">
            <div className="flex flex-col gap-[8rem]">
              <h2 className="text-[18rem] font-semibold text-slate-900">Detailed review</h2>
              <p className="text-[13rem] text-slate-500">Tap a question to reveal your answer, the correct one, and improvement cues.</p>
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
          </header>

          <div className="flex flex-wrap items-center gap-[12rem]" role="tablist" aria-label="Question filter">
            {(
              ["all", "incorrect", "unanswered", "correct"] satisfies ReviewFilterKey[]
            ).map(key => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeFilter === key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "rounded-[18rem] border px-[16rem] py-[8rem] text-[12rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
                  activeFilter === key
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_16rem_36rem_-28rem_rgba(32,56,140,0.6)]"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                )}
              >
                {FILTER_LABELS[key]} <span className="ml-[6rem] inline-flex min-w-[20rem] justify-center rounded-[12rem] bg-slate-100 px-[6rem] py-[2rem] text-[11rem] font-semibold text-slate-500">{reviewCounts[key]}</span>
              </button>
            ))}
            <span aria-live="polite" className="sr-only">
              Showing {filteredQuestions.length} questions filtered by {FILTER_LABELS[activeFilter]}.
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="rounded-[26rem] border border-slate-100 bg-white px-[28rem] py-[40rem] text-center text-[14rem] text-slate-500">
              Nothing to review here. Switch filters or explore another test.
            </div>
          ) : (
            <LayoutGroup>
              <div className="flex flex-col gap-[16rem]">
                {filteredQuestions.map(question => {
                  const statusVisual = STATUS_STYLES[question.status];
                  const isExpanded = expandedQuestions.has(question.number) || question.status !== "correct";
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
                        highlightedQuestion === question.number && "ring-4 ring-offset-2",
                        highlightedQuestion === question.number && statusVisual.ring
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
                            <p className="text-[15rem] font-semibold text-slate-900">
                              {question.answer && question.answer.trim().length > 0 ? `Your answer: ${question.answer}` : "No answer provided"}
                            </p>
                          </div>
                        </div>
                        <span className={cn("inline-flex items-center gap-[8rem] rounded-[16rem] px-[14rem] py-[6rem] text-[12rem] font-semibold", statusVisual.surface, statusVisual.text)}>
                          {statusVisual.label}
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: "easeOut" }}
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
                            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={shouldReduceMotion ? {} : { height: 0, opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-[18rem] space-y-[14rem] rounded-[22rem] border border-slate-100 bg-[#F8FAFF] px-[20rem] py-[16rem] text-[14rem] text-slate-600">
                              <p className="font-semibold text-slate-900">Correct answer: {question.correct_answer}</p>
                              <p className="text-slate-600">Your answer: {question.answer ? question.answer : "—"}</p>
                              <div className="rounded-[18rem] border border-dashed border-slate-200 bg-white px-[18rem] py-[14rem] text-[13rem] text-slate-500">
                                Tip placeholder · Add targeted explanation once available.
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </div>
            </LayoutGroup>
          )}
        </section>

        <section className="grid gap-[18rem] tablet:grid-cols-2">
          <motion.article
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            className="flex flex-col gap-[14rem] rounded-[28rem] border border-slate-100 bg-white px-[24rem] py-[24rem] shadow-[0_30rem_60rem_-46rem_rgba(48,60,128,0.45)]"
          >
            <div className="flex items-center gap-[12rem]">
              <CircleHelp className="size-[18rem] text-rose-500" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[15rem] font-semibold text-slate-900">Review mistakes only</span>
                <p className="text-[13rem] text-slate-500">Focus on incorrect and skipped questions in one place.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="self-start rounded-[18rem] bg-slate-900 px-[20rem] py-[10rem] text-[13rem] font-semibold text-white shadow-[0_20rem_40rem_-28rem_rgba(22,36,96,0.55)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Open mistake review
            </button>
          </motion.article>

          <motion.article
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            className="flex flex-col gap-[14rem] rounded-[28rem] border border-slate-100 bg-white px-[24rem] py-[24rem] shadow-[0_30rem_60rem_-46rem_rgba(48,60,128,0.45)]"
          >
            <div className="flex items-center gap-[12rem]">
              <Table className="size-[18rem] text-slate-600" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[15rem] font-semibold text-slate-900">View band mapping</span>
                <p className="text-[13rem] text-slate-500">See how correct answers align with estimated IELTS bands.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBandModalOpen(true)}
              className="self-start rounded-[18rem] border border-slate-200 bg-white px-[20rem] py-[10rem] text-[13rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Open band mapping
            </button>
          </motion.article>

          <motion.article
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            className="flex flex-col gap-[14rem] rounded-[28rem] border border-transparent bg-gradient-to-br from-[#4F86F7] to-[#7C5CFF] px-[24rem] py-[24rem] text-white shadow-[0_40rem_80rem_-50rem_rgba(64,80,200,0.75)] tablet:col-span-2"
          >
            <div className="flex items-center gap-[12rem]">
              <Sparkles className="size-[20rem]" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[15rem] font-semibold">Try another Reading test</span>
                <p className="text-[13rem] text-white/80">Keep practicing while the insights are fresh.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-[12rem]">
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-[18rem] bg-white px-[22rem] py-[12rem] text-[13rem] font-semibold text-slate-900 shadow-[0_20rem_40rem_-32rem_rgba(54,72,180,0.65)] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Start new test
              </button>
              <span className="text-[12rem] text-white/80">Reset mindset · Build timing · Track improvements</span>
            </div>
          </motion.article>
        </section>

        {!hasAnyAnswers ? (
          <section className="rounded-[28rem] border border-slate-100 bg-white px-[28rem] py-[32rem] text-center text-[14rem] text-slate-600">
            You didn’t submit answers yet. Jump back into the practice test when ready.
            <div className="mt-[18rem] flex justify-center">
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-[18rem] bg-slate-900 px-[20rem] py-[10rem] text-[13rem] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                Resume practice
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <ModalShell title="Review mistakes" open={reviewModalOpen} onOpenChange={setReviewModalOpen} size="lg">
        {reviewList.length === 0 ? (
          <EmptyModalState description="Once you have incorrect or skipped answers, you can review them here." />
        ) : (
          <div className="space-y-[16rem]">
            {reviewList.map(question => {
              const statusVisual = STATUS_STYLES[question.status];
              return (
                <article key={`modal-question-${question.number}`} className="rounded-[22rem] border border-slate-100 bg-white px-[22rem] py-[18rem] shadow-[0_20rem_44rem_-32rem_rgba(32,52,128,0.28)]">
                  <header className="flex items-center justify-between gap-[12rem]">
                    <div className="flex items-center gap-[12rem]">
                      <span className={cn("flex size-[28rem] items-center justify-center rounded-full", statusVisual.surface, statusVisual.text)}>{statusVisual.icon}</span>
                      <div>
                        <p className="text-[13rem] font-semibold text-slate-500">Question {question.number}</p>
                        <p className="text-[14rem] font-semibold text-slate-900">Correct answer: {question.correct_answer}</p>
                      </div>
                    </div>
                    <span className={cn("rounded-[16rem] px-[14rem] py-[6rem] text-[12rem] font-semibold", statusVisual.surface, statusVisual.text)}>{statusVisual.label}</span>
                  </header>
                  <div className="mt-[14rem] space-y-[10rem] text-[13rem] text-slate-600">
                    <p>Your answer: {question.answer ?? "—"}</p>
                    <p className="rounded-[18rem] border border-dashed border-slate-200 bg-[#F8FAFF] px-[18rem] py-[12rem] font-medium text-slate-500">
                      Tip placeholder · Reinforce scanning for keywords and synonyms in the passage before answering.
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </ModalShell>

      <ModalShell title="Band mapping" open={bandModalOpen} onOpenChange={setBandModalOpen}>
        {effectiveBandMapping.length === 0 ? (
          <EmptyModalState description="Band mapping is not available right now. Check back soon." />
        ) : (
          <table className="w-full table-fixed border-separate border-spacing-y-[10rem] text-left">
            <thead>
              <tr className="text-[12rem] uppercase tracking-[0.16em] text-slate-500">
                <th className="rounded-l-[18rem] bg-slate-100 px-[16rem] py-[10rem]">Correct answers</th>
                <th className="rounded-r-[18rem] bg-slate-100 px-[16rem] py-[10rem]">Estimated band</th>
              </tr>
            </thead>
            <tbody>
              {effectiveBandMapping.map(entry => {
                const isCurrent = correctCount >= entry.minCorrect && correctCount <= entry.maxCorrect;
                return (
                  <tr key={`${entry.minCorrect}-${entry.maxCorrect}`} className="text-[13rem] text-slate-600">
                    <td className={cn("rounded-l-[18rem] bg-white px-[16rem] py-[12rem]", isCurrent && "bg-emerald-50 font-semibold text-emerald-700")}>{entry.minCorrect} – {entry.maxCorrect}</td>
                    <td className={cn("rounded-r-[18rem] bg-white px-[16rem] py-[12rem]", isCurrent && "bg-emerald-50 font-semibold text-emerald-700")}>{entry.estimatedBand}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </ModalShell>
    </div>
  );
}

export const MOCK_READING_RESULT: PracticeReadingResult = {
  id: 401,
  reading_id: 12,
  score: 0,
  correct_answers_count: 28,
  questions: Array.from({ length: 40 }).map((_, index) => {
    const number = index + 1;
    const correct = number % 3 !== 0;
    const answered = number % 5 !== 0;
    return {
      answer: answered ? (correct ? "A" : "C") : null,
      correct_answer: correct ? "A" : "B",
      correct,
    } satisfies PracticeReadingResultQuestion;
  }),
};

export function ReadingAnswerSheetDemo({ locale }: { locale: string }) {
  const [state, setState] = useState<"ready" | "loading" | "error">("ready");
  const [data, setData] = useState<PracticeReadingResult | null>(MOCK_READING_RESULT);

  useEffect(() => {
    if (state === "loading") {
      const timeout = setTimeout(() => {
        setData(MOCK_READING_RESULT);
        setState("ready");
      }, 1200);
      return () => clearTimeout(timeout);
    }
    if (state === "error") {
      setData(null);
    }
    return undefined;
  }, [state]);

  return (
    <div className="space-y-[20rem]">
      <div className="flex gap-[12rem]">
        <button
          type="button"
          onClick={() => setState("loading")}
          className="rounded-[16rem] bg-slate-100 px-[16rem] py-[8rem] text-[12rem] font-semibold text-slate-600"
        >
          Show loading
        </button>
        <button
          type="button"
          onClick={() => setState("error")}
          className="rounded-[16rem] bg-slate-100 px-[16rem] py-[8rem] text-[12rem] font-semibold text-slate-600"
        >
          Show error
        </button>
        <button
          type="button"
          onClick={() => {
            setData(MOCK_READING_RESULT);
            setState("ready");
          }}
          className="rounded-[16rem] bg-slate-900 px-[16rem] py-[8rem] text-[12rem] font-semibold text-white"
        >
          Reset
        </button>
      </div>
      {state === "loading" && <ReadingAnswerSheetSkeleton />}
      {state === "error" && <ReadingAnswerSheetError onRetry={() => setState("loading") } />}
      {state === "ready" && data ? (
        <ReadingAnswerSheet data={data} locale={locale} meta={{ testName: "Fog Harvesters", takenAt: new Date().toISOString(), elapsedMinutes: 57 }} />
      ) : null}
    </div>
  );
}

export function ReadingAnswerSheetSkeleton() {
  return (
    <div className="relative min-h-[40vh] animate-pulse space-y-[24rem] rounded-[32rem] bg-gradient-to-b from-white to-slate-50 p-[24rem]">
      <div className="h-[120rem] rounded-[24rem] bg-slate-200/60" />
      <div className="h-[180rem] rounded-[24rem] bg-slate-200/50" />
      <div className="h-[280rem] rounded-[24rem] bg-slate-200/40" />
    </div>
  );
}

export function ReadingAnswerSheetError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[14rem] rounded-[28rem] border border-rose-100 bg-rose-50 px-[32rem] py-[40rem] text-center text-[14rem] text-rose-700">
      Something went wrong while loading your reading results.
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[18rem] border border-rose-200 bg-white px-[20rem] py-[10rem] text-[13rem] font-semibold text-rose-600 transition hover:text-rose-800"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
