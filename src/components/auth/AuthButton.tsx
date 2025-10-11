"use client";

import { type ButtonHTMLAttributes } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function AuthButton({ loading, children, className, disabled, ...props }: AuthButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={prefersReducedMotion || isDisabled ? undefined : { scale: 1.03, boxShadow: "0 28px 80px -60px rgba(30,64,175,0.65)" }}
      whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "relative flex h-[54rem] w-full items-center justify-center gap-[12rem] rounded-[24rem] bg-blue-600 text-[16rem] font-semibold text-white shadow-[0_24rem_70rem_-50rem_rgba(36,74,180,0.75)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      {...props}
    >
      <span className={cn("flex items-center gap-[10rem]", loading && "opacity-0")}>{children}</span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="size-[20rem] animate-spin rounded-full border-[3rem] border-white/40 border-t-white" />
        </span>
      ) : null}
    </motion.button>
  );
}
