"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface QuestionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ title, subtitle, children, className, contentClassName }) => {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-[24rem] rounded-[18rem] border border-[#cdecd6] bg-white px-[20rem] py-[24rem] text-d-black shadow-[0_18rem_44rem_rgba(56,56,56,0.1)]",
        "tablet:gap-[32rem] tablet:rounded-[16rem] tablet:border-none tablet:px-[40rem] tablet:py-[40rem] tablet:shadow-none",
        className,
      )}
    >
      <div className="flex flex-col gap-[8rem]">
        <h2 className="text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem] text-d-black">{title}</h2>
        {subtitle ? <p className="text-[15rem] font-medium leading-[20rem] text-d-black/70">{subtitle}</p> : null}
      </div>

      <div className={cn("flex flex-col gap-[18rem]", contentClassName)}>{children}</div>
    </section>
  );
};
