"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface MobileContextBarProps {
  partLabel: string;
  onPartPress: () => void;
  timerLabel?: string | null;
  instructionText?: string;
  showTimer?: boolean;
  className?: string;
}

export const MobileContextBar: React.FC<MobileContextBarProps> = ({
  partLabel,
  onPartPress,
  timerLabel,
  instructionText,
  showTimer = true,
  className,
}) => {
  return (
    <div className={cn("tablet:hidden px-[16rem] mt-[20rem]", className)}>
      <div className="flex w-full flex-col gap-[12rem] rounded-[18rem] border border-[#e1d6b4] bg-white px-[20rem] py-[18rem] text-d-black shadow-[0_18rem_40rem_rgba(56,56,56,0.14)]">
        <div className="flex items-center justify-between gap-[12rem]">
          <button
            type="button"
            onClick={onPartPress}
            className="inline-flex items-center gap-[8rem] rounded-full border border-[#dacfae] bg-white px-[16rem] py-[10rem] text-[13rem] font-semibold uppercase tracking-[0.12em] text-d-black transition hover:bg-d-green/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60"
            aria-label={partLabel}
          >
            {partLabel}
            <ChevronDown className="size-[14rem]" aria-hidden="true" />
          </button>

          {showTimer && timerLabel ? (
            <span className="text-[14rem] font-semibold text-d-black" aria-live="polite">
              {timerLabel}
            </span>
          ) : null}
        </div>

        {instructionText ? (
          <p className="text-[13rem] font-medium leading-[18rem] text-d-black/65">
            {instructionText}
          </p>
        ) : null}
      </div>
    </div>
  );
};
