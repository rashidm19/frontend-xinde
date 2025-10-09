"use client";

import { useEffect, useId, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

import { LEGEND_ITEMS } from "./constants";
import type { LegendTooltipItem } from "./types";

interface LegendTooltipProps {
  shouldReduceMotion: boolean;
  items?: LegendTooltipItem[];
  className?: string;
  panelClassName?: string;
  title?: string;
  description?: string[];
}

const DEFAULT_TITLE = "Color legend";
const DEFAULT_DESCRIPTION = [
  "Emerald shows questions you answered correctly.",
  "Rose highlights answers that need review.",
  "Slate marks questions without an answer.",
];

export function LegendTooltip({
  shouldReduceMotion,
  items = LEGEND_ITEMS,
  className,
  panelClassName,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: LegendTooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (triggerRef.current && triggerRef.current.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("relative flex items-center gap-[12rem] text-[12rem] text-slate-500", className)}>
      {items.map(item => (
        <span key={item.label} className="inline-flex items-center gap-[6rem]">
          {item.icon}
          {item.label}
        </span>
      ))}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={tooltipId}
        onClick={() => setOpen(prev => !prev)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-[8rem] text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
      >
        <Info className="size-[14rem]" aria-hidden="true" />
        <span className="sr-only">Explain status colors</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="legend-tooltip"
            id={tooltipId}
            role="tooltip"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={shouldReduceMotion ? undefined : { duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute right-0 top-full z-[20] mt-[10rem] w-[240rem] rounded-[18rem] border border-slate-200 bg-white px-[16rem] py-[14rem] text-left text-[12rem] text-slate-600 shadow-[0_20rem_40rem_-28rem_rgba(42,58,128,0.35)]",
              panelClassName
            )}
          >
            <p className="font-semibold text-slate-900">{title}</p>
            <ul className="mt-[8rem] space-y-[6rem]">
              {description.map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
