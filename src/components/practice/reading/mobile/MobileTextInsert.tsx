"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn, transformStringToArrayV3 } from "@/lib/utils";
import { useCustomTranslations } from "@/hooks/useCustomTranslations";

import { HintBadge } from "./HintBadge";

type TextChoice = {
  choice: string;
  answer: string;
  [key: string]: unknown;
};

type TextQuestion = {
  question: string;
  number: string;
  [key: string]: unknown;
};

export interface MobileTextInsertProps {
  block: {
    text: string;
    questions: TextQuestion[];
    choices: TextChoice[];
    [key: string]: unknown;
  };
  value: Record<string, string | undefined>;
  setFieldValue: (field: string, value: string | undefined) => void;
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

export const MobileTextInsert: React.FC<MobileTextInsertProps> = ({ block, value, setFieldValue }) => {
  const { t } = useCustomTranslations("practice.reading.test");
  const [selectedChoice, setSelectedChoice] = React.useState<string | null>(null);
  const [animatedBlank, setAnimatedBlank] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState("");

  const textTokens = React.useMemo(() => transformStringToArrayV3(block.text), [block.text]);
  const answerToChoice = React.useMemo(() => {
    const map = new Map<string, TextChoice>();
    block.choices.forEach(choice => {
      map.set(choice.answer, choice);
    });
    return map;
  }, [block.choices]);

  const questionOrder = React.useMemo(() => block.questions.map(question => String(question.number)), [block.questions]);

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
          announce(t("mobile.textInsert.choiceSelected", { choice: label }));
        }
        return next;
      });
    },
    [allowReuse, announce, answerToChoice, t, usedAnswers]
  );

  const handleBlankPress = React.useCallback(
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
        setAnimatedBlank(questionNumber);
        announce(t("mobile.textInsert.inserted", { choice: label, number: questionNumber }));

        window.setTimeout(() => {
          setAnimatedBlank(prev => (prev === questionNumber ? null : prev));
        }, 320);

        return;
      }

      if (currentAnswer) {
        setFieldValue(questionNumber, undefined);
        setSelectedChoice(currentAnswer);
        announce(t("mobile.textInsert.removed", { number: questionNumber }));
      }
    },
    [allowReuse, announce, answerToChoice, assignments, selectedChoice, setFieldValue, t]
  );

  let blankIndex = -1;

  return (
    <div className="flex flex-col gap-[20rem]">
      <HintBadge icon="💬" className="self-start">
        Tap a word, then tap a blank to insert it.
      </HintBadge>
      <div
        className="flex items-center gap-[12rem] overflow-x-auto pb-[10rem] [scrollbar-width:none] [-ms-overflow-style:none]"
        role="group"
        aria-label={t("mobile.textInsert.choicesLabel")}
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

      <div className="inline-flex flex-wrap items-center gap-x-[8rem] gap-y-[8rem] text-[16rem] leading-[24rem] text-d-black">
        {textTokens.map((token, index) => {
          if (token === "___") {
            blankIndex += 1;
            const questionNumber = questionOrder[blankIndex] ?? String(blankIndex + 1);
            const assignedAnswer = assignments[questionNumber];
            const assignedChoice = assignedAnswer ? answerToChoice.get(assignedAnswer) : null;
            const isFilled = Boolean(assignedChoice);
            const isPulsing = animatedBlank === questionNumber;

            return (
              <motion.button
                key={`blank-${index}-${questionNumber}`}
                type="button"
                onClick={() => handleBlankPress(questionNumber)}
                aria-pressed={isFilled}
                aria-label={t("mobile.textInsert.blankAria", { number: questionNumber })}
                className={cn(
                  "inline-flex min-h-[40rem] items-center justify-center rounded-[16rem] border border-[#dacfae] bg-white px-[14rem] py-[8rem] text-[14rem] font-semibold text-d-black transition",
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
                      {t("mobile.textInsert.blankPlaceholder", { number: questionNumber })}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          }

          return (
            <span key={`token-${index}`} className="whitespace-pre-wrap">
              {token}
            </span>
          );
        })}
      </div>

      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
    </div>
  );
};
