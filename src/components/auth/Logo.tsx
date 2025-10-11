"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={cn("font-semibold tracking-wide text-gray-900", className)}>
      studybox
    </span>
  );
}
