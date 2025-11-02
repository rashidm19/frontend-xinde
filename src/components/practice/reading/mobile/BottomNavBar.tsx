"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Map } from "lucide-react";

import { cn } from "@/lib/utils";

const navVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
};

const progressTransition = { type: "spring", stiffness: 260, damping: 32, mass: 0.7 } as const;

export interface BottomNavBarProps {
  hidden?: boolean;
  onOpenMap: () => void;
  mapLabel: string;
  rangeLabel: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  primaryDisabled?: boolean;
  ariaPrimaryLabel?: string;
  className?: string;
  progress: number;
  progressLabel: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  hidden,
  onOpenMap,
  mapLabel,
  rangeLabel,
  primaryLabel,
  onPrimaryAction,
  primaryDisabled,
  ariaPrimaryLabel,
  className,
  progress,
  progressLabel,
}) => {
  const clampedProgress = React.useMemo(() => Math.min(100, Math.max(0, progress)), [progress]);

  return (
    <motion.div
      variants={navVariants}
      animate={hidden ? "hidden" : "visible"}
      initial="hidden"
      className={cn(
        "tablet:hidden",
        "fixed inset-x-[12rem] bottom-[12rem] z-50 flex items-center gap-[12rem] rounded-[24rem] border border-[#e1d6b4] bg-white/95 px-[14rem] py-[10rem] shadow-[0_18rem_44rem_rgba(56,56,56,0.18)] backdrop-blur",
        "overflow-hidden",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[4px] bg-[#f3edd3]">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={progressTransition}
          className="block h-full bg-[#C9FF55]"
        />
        <span className="sr-only">{progressLabel}</span>
      </div>

      <button
        type="button"
        onClick={onOpenMap}
        className="inline-flex size-[44rem] items-center justify-center rounded-full border border-transparent bg-[#FEFBEA] text-d-black transition hover:bg-d-green/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60"
        aria-label={mapLabel}
      >
        <Map className="size-[20rem]" aria-hidden="true" />
      </button>

      <div className="flex flex-1 flex-col items-center justify-center">
        <span className="text-[13rem] font-semibold uppercase tracking-[0.16em] text-d-black/60">{rangeLabel}</span>
      </div>

      <button
        type="button"
        onClick={onPrimaryAction}
        disabled={primaryDisabled}
        className={cn(
          "flex min-h-[48rem] w-[70%] items-center justify-center rounded-[20rem] bg-gradient-to-r from-[#C9FF55] to-[#B7F152] text-[15rem] font-semibold text-d-black transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60",
          primaryDisabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-[1rem] hover:shadow-[0_14rem_32rem_rgba(56,56,56,0.16)]",
        )}
        aria-label={ariaPrimaryLabel ?? primaryLabel}
      >
        {primaryLabel}
      </button>
    </motion.div>
  );
};
