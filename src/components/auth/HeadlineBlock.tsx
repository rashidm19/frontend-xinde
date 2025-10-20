"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface HeadlineBlockProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function HeadlineBlock({ eyebrow = "Studybox", title, description, children, className }: HeadlineBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.55, ease: "easeOut" }}
      className={cn("flex max-w-[360rem] flex-col items-center gap-[12rem] text-center", className)}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-white/60 px-[16rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-[0_18rem_52rem_-36rem_rgba(52,72,132,0.5)]">
        {eyebrow}
      </span>
      <h2 className="text-[34rem] font-semibold text-slate-900 desktop:text-[44rem]">{title}</h2>
      {description ? <p className="text-[16rem] text-slate-600">{description}</p> : null}
      {children}
    </motion.div>
  );
}
