"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

import type { ResultOverviewMetaItem, ResultOverviewProps } from "./types";

const DEFAULT_ICON_CONTAINER = "flex size-[56rem] items-center justify-center rounded-[18rem] bg-gradient-to-br from-[#4F86F7] to-[#7B61FF] text-white shadow-[0_24rem_48rem_-32rem_rgba(58,88,208,0.55)]";

const DEFAULT_HERO_LABEL = "Correct answers";
const DEFAULT_ACCURACY_LABEL = "Accuracy";
const DEFAULT_ACCURACY_HELP_TEXT = "Score based on checked answers.";

export function ResultOverview({
  icon,
  iconContainerClassName,
  heroLabel = DEFAULT_HERO_LABEL,
  accentLabel,
  accentValue,
  correctCount,
  totalCount,
  metaItems,
  metaDescription,
  contextDescription,
  accuracyLabel = DEFAULT_ACCURACY_LABEL,
  accuracyHelpText = DEFAULT_ACCURACY_HELP_TEXT,
  shouldReduceMotion,
}: ResultOverviewProps) {
  const percentage = useMemo(() => {
    if (totalCount <= 0) return 0;
    return Math.round((correctCount / totalCount) * 100);
  }, [correctCount, totalCount]);

  const motionValue = useMotionValue(correctCount);
  const rounded = useTransform(motionValue, latest => Math.round(latest));
  const hasAnimatedRef = useRef(false);
  const [displayedValue, setDisplayedValue] = useState(() => correctCount);

  useEffect(() => {
    const unsubscribe = rounded.on("change", value => {
      setDisplayedValue(value);
    });

    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(correctCount);
      setDisplayedValue(correctCount);
      return;
    }

    if (!hasAnimatedRef.current) {
      motionValue.set(0);
    }

    const controls = animate(motionValue, correctCount, {
      duration: 0.8,
      ease: "easeOut",
    });

    hasAnimatedRef.current = true;

    return () => controls.stop();
  }, [correctCount, motionValue, shouldReduceMotion]);

  return (
    <motion.section
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
      className="relative flex flex-col gap-[22rem] rounded-[32rem] border border-white/50 bg-gradient-to-br from-[#3568FF]/10 via-white to-white px-[32rem] py-[28rem] shadow-[0_46rem_120rem_-70rem_rgba(40,78,176,0.65)] tablet:flex-row tablet:items-center tablet:justify-between"
    >
      <div className="flex flex-1 flex-col gap-[16rem]" aria-live="polite">
        <div className="flex items-center gap-[12rem]">
          <div className={cn(DEFAULT_ICON_CONTAINER, iconContainerClassName)}>{icon}</div>
          <div className="flex flex-col gap-[4rem]">
            <span className="text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{heroLabel}</span>
            <div className="flex items-end gap-[10rem] text-slate-900">
              <span className="text-[46rem] font-semibold leading-none">{displayedValue}</span>
              <span className="pb-[4rem] text-[18rem] font-semibold text-slate-500">/ {totalCount}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[12rem]">
          <div className="flex items-center justify-between text-[13rem] font-medium text-slate-500">
            <span>{accuracyLabel}</span>
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
              transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="text-[13rem] text-slate-500">{accuracyHelpText}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[12rem] rounded-[26rem] border border-slate-100 bg-white/80 px-[24rem] py-[22rem] shadow-[0_26rem_60rem_-48rem_rgba(38,62,140,0.45)]">
        <div className="flex flex-wrap items-center gap-[12rem] text-[13rem] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-[8rem]">
            <span className="rounded-[12rem] bg-slate-900 px-[12rem] py-[6rem] text-white">{accentLabel}</span>
            <span className="text-slate-600">{accentValue}</span>
          </span>
          {renderMetaItems(metaItems)}
        </div>
        {metaDescription ? <p className="text-[13rem] text-slate-500">{metaDescription}</p> : null}
        {contextDescription ? (
          <div className="rounded-[20rem] border border-slate-200 bg-white px-[20rem] py-[12rem] text-[13rem] font-medium text-slate-600">
            {contextDescription}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

function renderMetaItems(items?: ResultOverviewMetaItem[]) {
  if (!items || items.length === 0) {
    return null;
  }

  return items.map((item, index) => (
    <span key={index} className="inline-flex items-center gap-[8rem] text-slate-600">
      <span className="size-[6rem] rounded-full bg-slate-200" aria-hidden="true" />
      {item.icon}
      {item.label}
    </span>
  ));
}
