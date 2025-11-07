"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Map } from "lucide-react";

import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
};

const progressTransition = { type: "spring", stiffness: 260, damping: 32, mass: 0.7 } as const;

export interface UnifiedBottomNavProps {
  hidden?: boolean;
  audioSlot: React.ReactNode;
  onOpenMap: () => void;
  mapLabel: string;
  rangeLabel: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  primaryDisabled?: boolean;
  ariaPrimaryLabel?: string;
  progress: number;
  progressLabel: string;
  className?: string;
}

export const UnifiedBottomNav: React.FC<UnifiedBottomNavProps> = ({
  hidden,
  audioSlot,
  onOpenMap,
  mapLabel,
  rangeLabel,
  primaryLabel,
  onPrimaryAction,
  primaryDisabled,
  ariaPrimaryLabel,
  progress,
  progressLabel,
  className,
}) => {
  const clampedProgress = React.useMemo(() => Math.min(100, Math.max(0, progress)), [progress]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={hidden ? "hidden" : "visible"}
      className={cn(
        "tablet:hidden",
        "fixed inset-x-[12rem] bottom-[12rem] z-50 flex flex-col gap-[14rem]",
        "rounded-[28rem] border border-[#cdecd6] bg-[#F9FFFB]/95 px-[18rem] pt-[20rem] pb-[calc(18rem+env(safe-area-inset-bottom))]",
        "shadow-[0_22rem_44rem_rgba(56,56,56,0.18)] backdrop-blur",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[4px] rounded-t-[28rem] bg-[#d9f6e4]">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={progressTransition}
          className="block h-full rounded-t-[28rem] bg-[#C9FF55]"
        />
        <span className="sr-only">{progressLabel}</span>
      </div>

      {audioSlot}

      <div className="flex items-center gap-[14rem]">
        <button
          type="button"
          onClick={onOpenMap}
          className="inline-flex size-[48rem] items-center justify-center rounded-full border border-[#cdecd6] bg-[#E9FFF2] text-d-black transition hover:bg-d-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60"
          aria-label={mapLabel}
        >
          <Map className="size-[20rem]" aria-hidden="true" />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="text-[13rem] font-semibold uppercase tracking-[0.14em] text-d-black/60">{rangeLabel}</span>
        </div>

        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={primaryDisabled}
          className={cn(
            "flex min-h-[52rem] w-[70%] items-center justify-center rounded-[22rem] bg-gradient-to-r from-[#C9FF55] to-[#B7F152]",
            "text-[15rem] font-semibold text-d-black transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60",
            primaryDisabled
              ? "cursor-not-allowed opacity-60"
              : "hover:-translate-y-[1rem] hover:shadow-[0_16rem_36rem_rgba(56,56,56,0.18)]",
          )}
          aria-label={ariaPrimaryLabel ?? primaryLabel}
        >
          {primaryLabel}
        </button>
      </div>
    </motion.div>
  );
};
