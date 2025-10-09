"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { motion } from "framer-motion";

import { EmptyModalState, ModalShell } from "../modals/UnifiedModalShell";
import { cn } from "@/lib/utils";
import type { BandMappingEntry } from "./types";

interface BandMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bandMapping: BandMappingEntry[];
  correctCount: number;
  shouldReduceMotion: boolean;
  title?: string;
  emptyDescription?: string;
}

const DEFAULT_TITLE = "Band mapping";
const DEFAULT_EMPTY_DESCRIPTION = "Band mapping is not available right now. Check back soon.";

export function BandMappingModal({
  open,
  onOpenChange,
  bandMapping,
  correctCount,
  shouldReduceMotion,
  title = DEFAULT_TITLE,
  emptyDescription = DEFAULT_EMPTY_DESCRIPTION,
}: BandMappingModalProps) {
  const effectiveMapping = useMemo(() => bandMapping ?? [], [bandMapping]);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (!open) {
      setHighlightKey(null);
      return;
    }

    const match = effectiveMapping.find(entry => correctCount >= entry.minCorrect && correctCount <= entry.maxCorrect);
    const key = match ? `${match.minCorrect}-${match.maxCorrect}` : null;
    setHighlightKey(key);

    if (key) {
      requestAnimationFrame(() => {
        const node = rowRefs.current[key ?? ""];
        node?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }
  }, [correctCount, effectiveMapping, open]);

  return (
    <ModalShell title={title} open={open} onOpenChange={onOpenChange}>
      {effectiveMapping.length === 0 ? (
        <EmptyModalState description={emptyDescription} />
      ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-[6rem]">
          <table className="w-full table-fixed border-separate border-spacing-y-[10rem] text-left">
            <thead>
              <tr className="text-[12rem] uppercase tracking-[0.16em] text-slate-500">
                <th className="rounded-l-[18rem] bg-slate-100 px-[16rem] py-[10rem]">Correct answers</th>
                <th className="rounded-r-[18rem] bg-slate-100 px-[16rem] py-[10rem]">Estimated band</th>
              </tr>
            </thead>
            <tbody>
              {effectiveMapping.map(entry => {
                const key = `${entry.minCorrect}-${entry.maxCorrect}`;
                const isCurrent = correctCount >= entry.minCorrect && correctCount <= entry.maxCorrect;
                const isHighlighted = highlightKey === key;
                return (
                  <motion.tr
                    key={key}
                    ref={node => {
                      rowRefs.current[key] = node;
                    }}
                    initial={false}
                    animate={{
                      backgroundColor: isHighlighted ? "rgba(209, 250, 229, 0.6)" : "rgba(255,255,255,1)",
                    }}
                    transition={shouldReduceMotion ? undefined : { duration: 0.35, ease: "easeOut" }}
                    className="text-[13rem] text-slate-600"
                  >
                    <td
                      className={cn(
                        "rounded-l-[18rem] px-[16rem] py-[12rem] transition-colors",
                        isCurrent ? "font-semibold text-emerald-700" : "text-slate-600"
                      )}
                    >
                      {entry.minCorrect} – {entry.maxCorrect}
                    </td>
                    <td
                      className={cn(
                        "rounded-r-[18rem] px-[16rem] py-[12rem] transition-colors",
                        isCurrent ? "font-semibold text-emerald-700" : "text-slate-600"
                      )}
                    >
                      {entry.estimatedBand}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ModalShell>
  );
}
