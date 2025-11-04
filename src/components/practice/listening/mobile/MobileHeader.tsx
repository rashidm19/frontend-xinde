"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const headerVariants = {
  initial: { y: -24, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

const closeClasses = cn(
  "flex size-[32rem] items-center justify-center rounded-full border border-d-black/10 bg-white text-d-black",
  "shadow-[0_4rem_12rem_rgba(56,56,56,0.12)] transition",
  "hover:bg-neutral-100 active:bg-neutral-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400",
);

export interface MobileHeaderProps {
  exitLabel: string;
  closeHref: string;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ exitLabel, closeHref, className }) => {
  return (
    <motion.header
      {...headerVariants}
      initial="initial"
      animate="animate"
      role="banner"
      className={cn(
        "tablet:hidden",
        "sticky top-0 z-50 flex flex-col gap-[12rem] border-b border-[#f0e8cc]",
        "bg-[#FFFDF5]/95 px-[18rem] pb-[12rem] pt-[calc(12rem+env(safe-area-inset-top))] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-[12rem]">
        <div className="flex items-center gap-[10rem]">
          <img src="/images/logo.svg" alt="Studybox" className="size-[28rem]" />
          <div className="flex flex-col leading-none text-d-black">
            <span className="font-poppins text-[16rem] font-semibold">Practice</span>
            <span className="text-[12rem] font-medium uppercase tracking-[0.08em] text-d-black/60">Listening</span>
          </div>
        </div>

        <Link href={closeHref} aria-label={exitLabel} className={closeClasses}>
          <X className="h-[16rem] w-[16rem] text-neutral-600" aria-hidden="true" />
        </Link>
      </div>
    </motion.header>
  );
};
