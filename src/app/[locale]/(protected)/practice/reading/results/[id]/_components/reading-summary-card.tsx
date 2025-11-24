"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";

import { motion } from "framer-motion";

import { formatDateTime } from "@/lib/formatters";

interface ReadingSummaryCardProps {
  correctCount: number;
  totalCount: number;
  testTitle: string | null;
  completedAt: string | null;
  shouldReduceMotion: boolean;
}

export function ReadingSummaryCard({ correctCount, totalCount, testTitle, completedAt, shouldReduceMotion }: ReadingSummaryCardProps) {
  const locale = useLocale();
  const accuracy = useMemo(() => {
    if (totalCount <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, correctCount / totalCount));
  }, [correctCount, totalCount]);

  const accuracyPercent = Math.round(accuracy * 100);
  const formattedDate = useMemo(() => formatDateTime(completedAt, locale, { dateStyle: "medium", timeStyle: "short" }), [completedAt, locale]);

  return (
    <section className="rounded-[32rem] border border-[#E1D6B4] bg-white px-[24rem] py-[28rem] shadow-[0_22rem_60rem_-40rem_rgba(56,56,56,0.16)] tablet:px-[32rem] tablet:py-[36rem]">
      <div className="grid gap-[24rem] tablet:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] tablet:items-center">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-[16rem]"
        >
          <div className="flex flex-col gap-[6rem]">
            <span className="text-[13rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]">Correct answers</span>
            <p className="text-[36rem] font-semibold text-d-black tablet:text-[42rem]">
              {correctCount}
              <span className="text-[20rem] font-medium text-d-black/70">/{totalCount}</span>
            </p>
          </div>
          <div className="flex flex-col gap-[10rem]">
            <div className="w-full max-w-[420rem]">
              <div className="relative h-[8rem] w-full overflow-hidden rounded-full bg-d-yellow-secondary/70" role="presentation">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#3E7F2C]"
                  initial={shouldReduceMotion ? undefined : { width: 0 }}
                  animate={{ width: `${accuracy * 100}%` }}
                  transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>
            <span className="text-[12rem] font-semibold text-[#3E7F2C]">Accuracy {accuracyPercent}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.32, ease: "easeOut", delay: 0.05 }}
          className="flex flex-col gap-[12rem] rounded-[28rem] border border-[#E6DDBD] bg-d-yellow-secondary/50 px-[20rem] py-[18rem] text-[14rem] text-d-black"
        >
          <div className="flex flex-col gap-[2rem]">
            <span className="text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]">Section</span>
            <p className="font-semibold">Reading · {totalCount} questions</p>
          </div>
          {testTitle ? (
            <div className="flex flex-col gap-[2rem]">
              <span className="text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]">Test</span>
              <p className="font-semibold text-d-black">{testTitle}</p>
            </div>
          ) : null}
          {formattedDate ? (
            <div className="flex flex-col gap-[2rem]">
              <span className="text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]">Completed</span>
              <p className="font-medium text-d-black/80">{formattedDate}</p>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
