"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const switcherVariants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
};

export interface PartSwitcherMobileProps {
  label: string;
  onPress: () => void;
  className?: string;
  ariaLabel?: string;
}

export const PartSwitcherMobile: React.FC<PartSwitcherMobileProps> = ({ label, onPress, className, ariaLabel }) => {
  return (
    <motion.button
      type="button"
      {...switcherVariants}
      onClick={onPress}
      className={cn(
        "tablet:hidden",
        "inline-flex items-center gap-[8rem] rounded-full border border-[#ded4b2] bg-white px-[16rem] py-[10rem] text-[13rem] font-semibold uppercase tracking-[0.12em] text-d-black/80 shadow-[0_8rem_20rem_rgba(56,56,56,0.08)] transition hover:-translate-y-[1rem] hover:shadow-[0_12rem_32rem_rgba(56,56,56,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60",
        className,
      )}
      aria-label={ariaLabel ?? label}
    >
      <span className="tracking-tight">{label}</span>
      <img src="/images/icon_chevron--down.svg" alt="" className="size-[14rem]" aria-hidden="true" />
    </motion.button>
  );
};
