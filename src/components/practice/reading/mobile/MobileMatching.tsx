"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useCustomTranslations } from "@/hooks/useCustomTranslations";

import { HintBadge } from "./HintBadge";

type MatchingChoice = {
  choice: string;
  answer: string;
  [key: string]: unknown;
};

type MatchingQuestion = {
  question: string;
  number: string;
  [key: string]: unknown;
};

export interface MobileMatchingProps {
  block: {
    questions: MatchingQuestion[];
    choices: MatchingChoice[];
    [key: string]: unknown;
  };
  value: Record<string, string | undefined>;
  setFieldValue: (field: string, value: string | undefined) => void;
  hintMessage?: string;
}

const fadeVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12, ease: "easeIn" } },
};

const pulseAnimation = { scale: [1, 1.04, 1] };

const MULTI_USE_KEYS = [
  "allowReuse",
  "allow_reuse",
  "allowDuplicates",
  "allow_duplicates",
  "allowRepeat",
  "allow_repeat",
  "canUseMoreThanOnce",
  "can_use_more_than_once",
  "mayUseMoreThanOnce",
  "may_use_more_than_once",
  "useMoreThanOnce",
  "use_more_than_once",
  "reusable",
  "isReusable",
];

const resolveReuseFlag = (block: Record<string, unknown>) => MULTI_USE_KEYS.some(key => Boolean(block?.[key]));

export const MobileMatching: React.FC<MobileMatchingProps> = ({ block, value, setFieldValue, hintMessage }) => {
  const { t } = useCustomTranslations("practice.reading.test");
  const [selectedChoice, setSelectedChoice] = React.useState<string | null>(null);
  const [animatedSlot, setAnimatedSlot] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState("");

  const answerToChoice = React.useMemo(() => {
    const map = new Map<string, MatchingChoice>();
    block.choices.forEach(choice => {
      map.set(choice.answer, choice);
    });
    return map;
  }, [block.choices]);

  const assignments = React.useMemo(() => {
    const mapping: Record<string, string | null> = {};
    block.questions.forEach(question => {
      const key = String(question.number);
      const stored = value?.[key];
      mapping[key] = typeof stored === "string" ? stored : null;
    });
    return mapping;
  }, [block.questions, value]);

  const usedAnswers = React.useMemo(() => new Set(Object.values(assignments).filter((val): val is string => Boolean(val))), [assignments]);

  const allowReuse = React.useMemo(() => resolveReuseFlag(block), [block]);

  const announce = React.useCallback((message: string) => {
    setStatusMessage(prev => (prev === message ? `${message} ` : message));
  }, []);

  const handleChoicePress = React.useCallback(
    (answer: string) => {
      const isDisabled = !allowReuse && usedAnswers.has(answer);
      if (isDisabled) {
        return;
      }

      setSelectedChoice(prev => {
        const next = prev === answer ? null : answer;
        if (next) {
          const label = answerToChoice.get(next)?.choice ?? next;
          announce(t("mobile.matching.choiceSelected", { choice: label }));
        }
        return next;
      });
    },
    [allowReuse, announce, answerToChoice, t, usedAnswers]
  );

  const handleSlotPress = React.useCallback(
    (questionNumber: string) => {
      const currentAnswer = assignments[questionNumber];

      if (selectedChoice) {
        const label = answerToChoice.get(selectedChoice)?.choice ?? selectedChoice;

        if (!allowReuse) {
          Object.entries(assignments).forEach(([key, answer]) => {
            if (key !== questionNumber && answer === selectedChoice) {
              setFieldValue(key, undefined);
            }
          });
        }

        if (currentAnswer !== selectedChoice) {
          setFieldValue(questionNumber, selectedChoice);
        }

        setSelectedChoice(null);
        setAnimatedSlot(questionNumber);
        announce(t("mobile.matching.inserted", { choice: label, number: questionNumber }));

        window.setTimeout(() => {
          setAnimatedSlot(prev => (prev === questionNumber ? null : prev));
        }, 320);

        return;
      }

      if (currentAnswer) {
        setFieldValue(questionNumber, undefined);
        setSelectedChoice(currentAnswer);
        announce(t("mobile.matching.removed", { number: questionNumber }));
      }
    },
    [allowReuse, announce, answerToChoice, assignments, selectedChoice, setFieldValue, t]
  );

  return (
    <div className="flex flex-col gap-[20rem]">
      <HintBadge icon="💬" className="self-start">
        {hintMessage ?? "Tap a word, then tap a blank to insert it."}
      </HintBadge>
      <div
        className="flex items-center gap-[12rem] overflow-x-auto pb-[10rem] [scrollbar-width:none] [-ms-overflow-style:none]"
        role="group"
        aria-label={t("mobile.matching.choicesLabel")}
      >
        {block.choices.map(choice => {
          const answer = choice.answer;
          const isSelected = selectedChoice === answer;
          const isUsed = usedAnswers.has(answer);
          const isDisabled = !allowReuse && isUsed;

          return (
            <button
              key={answer}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              onClick={() => handleChoicePress(answer)}
              disabled={isDisabled}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border border-[#dacfae] bg-white px-[16rem] py-[10rem] text-[14rem] font-medium text-d-black transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60",
                isDisabled && "cursor-not-allowed opacity-40",
                !isDisabled && !isSelected && "hover:bg-d-green/20",
                isSelected && "border-d-green/70 bg-d-green/40 shadow-[0_6rem_18rem_rgba(56,56,56,0.12)]"
              )}
            >
              {choice.choice}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-[16rem]">
        {block.questions.map(question => {
          const questionNumber = String(question.number);
          const assignedAnswer = assignments[questionNumber];
          const assignedChoice = assignedAnswer ? answerToChoice.get(assignedAnswer) : null;
          const isFilled = Boolean(assignedChoice);
          const isPulsing = animatedSlot === questionNumber;

          return (
            <div key={questionNumber} className="flex flex-col gap-[8rem]">
              <p className="text-[14rem] font-medium leading-[20rem] text-d-black">{question.question}</p>
              <motion.button
                type="button"
                onClick={() => handleSlotPress(questionNumber)}
                aria-pressed={isFilled}
                aria-label={t("mobile.matching.slotAria", { number: questionNumber })}
                className={cn(
                  "flex min-h-[44px] w-full items-center justify-between gap-[12rem] rounded-[18rem] border border-[#dacfae] bg-white px-[16rem] py-[14rem] text-left text-[14rem] font-semibold text-d-black transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60",
                  isFilled ? "border-d-green/70 bg-d-green/30" : "border-[#dacfae]",
                  selectedChoice && "ring-1 ring-d-green/40"
                )}
                animate={isPulsing ? pulseAnimation : undefined}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                <AnimatePresence initial={false} mode="wait">
                  {isFilled && assignedChoice ? (
                    <motion.span key={assignedAnswer} {...fadeVariants} className="text-[15rem] font-semibold text-d-black">
                      {assignedChoice.choice}
                    </motion.span>
                  ) : (
                    <motion.span key="placeholder" {...fadeVariants} className="text-[14rem] font-medium text-d-black/40">
                      {t("mobile.matching.slotPlaceholder", { number: questionNumber })}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          );
        })}
      </div>

      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
    </div>
  );
};
