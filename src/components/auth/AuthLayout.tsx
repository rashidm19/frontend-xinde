"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const gradientDefaults = {
  from: "from-[#F3F7FF]",
  via: "via-[#EEF4FF]",
  to: "to-[#EAF2FF]",
};

export interface AuthLayoutProps {
  children: ReactNode;
  headline?: string;
  tagline?: string;
  showHeadline?: boolean;
  rightSlot?: ReactNode;
  gradientClassName?: string;
  className?: string;
}

export function AuthLayout({
  children,
  headline = "Master IELTS with confidence.",
  tagline = "Your progress. Your pace. Your AI coach.",
  showHeadline = true,
  rightSlot,
  gradientClassName,
  className,
}: AuthLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("min-h-screen w-full overflow-y-auto bg-gray-50", className)}>
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <div className="flex w-full items-center justify-center px-[28rem] py-[48rem] lg:w-1/2 lg:px-[48rem]">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-[520rem]"
          >
            {children}
          </motion.div>
        </div>

        {(rightSlot || showHeadline) && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }}
            className={cn(
              "hidden w-full items-center justify-center bg-gradient-to-br px-[40rem] py-[48rem] text-center text-slate-800 lg:flex lg:w-1/2",
              gradientClassName ?? `${gradientDefaults.from} ${gradientDefaults.via} ${gradientDefaults.to}`
            )}
          >
            {rightSlot ??
              (showHeadline ? (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.1 }}
                  className="flex max-w-[340rem] flex-col items-center gap-[12rem]"
                >
                  <span className="inline-flex items-center justify-center rounded-full bg-white/70 px-[16rem] py-[6rem] text-[12rem] font-medium uppercase tracking-[0.18em] text-slate-600 shadow-[0_16rem_40rem_-28rem_rgba(44,70,144,0.35)]">
                    StudyBox
                  </span>
                  <h2 className="text-[32rem] font-semibold leading-tight text-slate-900 desktop:text-[40rem]">{headline}</h2>
                  <p className="text-[16rem] text-slate-600">{tagline}</p>
                </motion.div>
              ) : null)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
