"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AuthAlertProps {
  variant?: "default" | "success" | "error";
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<AuthAlertProps["variant"]>, string> = {
  default: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-600",
  error: "border-rose-200 bg-rose-50 text-rose-600",
};

export function AuthAlert({ variant = "default", title, description, icon, className }: AuthAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-[12rem] rounded-[20rem] border px-[16rem] py-[14rem] text-[14rem]",
        variantClasses[variant],
        className
      )}
    >
      {icon ? <span className="mt-[2rem]" aria-hidden="true">{icon}</span> : null}
      <div className="flex flex-col gap-[4rem]">
        {title ? <p className="font-semibold">{title}</p> : null}
        {description ? <p className="text-[13rem] opacity-90">{description}</p> : null}
      </div>
    </motion.div>
  );
}
