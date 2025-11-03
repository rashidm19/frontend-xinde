"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface HintBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const HintBadge: React.FC<HintBadgeProps> = ({ icon, children, className, ...rest }) => {
  return (
    <div
      className={cn(
        "mt-[8rem] mb-[12rem] inline-flex max-w-full items-start gap-[4rem] break-words rounded-[12rem] border border-neutral-200 bg-neutral-50 px-[12rem] py-[8rem] text-[14rem] leading-[20rem] text-neutral-500",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
};
