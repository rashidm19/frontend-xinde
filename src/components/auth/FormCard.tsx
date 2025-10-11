"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import { Logo } from "./Logo";

interface FormCardProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function FormCard({ title, subtitle, eyebrow, children, footer, className }: FormCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 32, scale: 0.98 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
      className={cn(
        "flex flex-col gap-[24rem] rounded-[32rem] bg-white p-[36rem] shadow-xl shadow-black/5 ring-1 ring-black/5",
        className
      )}
    >
      <header className="flex flex-col gap-[16rem]">
        <Logo aria-label="StudyBox" className="h-[32rem] w-auto text-gray-900" />
        {eyebrow ? (
          <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-[12rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
            {eyebrow}
          </span>
        ) : null}
        <div className="flex flex-col gap-[8rem]">
          <h1 className="text-[32rem] font-semibold leading-tight tracking-tight text-gray-900 desktop:text-[36rem]">{title}</h1>
          {subtitle ? <p className="text-[16rem] text-gray-500">{subtitle}</p> : null}
        </div>
      </header>

      <div className="flex flex-col gap-[20rem]">{children}</div>

      {footer ? <footer className="border-t border-gray-100 pt-[16rem] text-[14rem] text-gray-500">{footer}</footer> : null}

      <p className="mt-[8rem] text-center text-[12rem] text-gray-400">© 2025 StudyBox. All rights reserved.</p>
    </motion.section>
  );
}
