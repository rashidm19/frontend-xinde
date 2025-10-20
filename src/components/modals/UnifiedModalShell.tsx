"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  description?: string;
  trailingSlot?: ReactNode;
}

export function ModalHeader({ title, onClose, description, trailingSlot }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-[16rem] px-[32rem] py-[22rem]">
      <div className="flex flex-col gap-[6rem]">
        <DialogPrimitive.Title className="text-[22rem] font-semibold text-slate-900">{title}</DialogPrimitive.Title>
        {description ? <p className="text-[13rem] text-slate-500">{description}</p> : null}
      </div>
      <div className="flex items-center gap-[12rem]">
        {trailingSlot}
        <DialogPrimitive.Close asChild>
          <button
            type="button"
            aria-label="Close modal"
            className="rounded-full border border-slate-200 bg-white p-[10rem] text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-[18rem]"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6.225 5.175a.75.75 0 0 0-1.05 1.05L10.95 12l-5.775 5.775a.75.75 0 0 0 1.05 1.05L12 13.05l5.775 5.775a.75.75 0 0 0 1.05-1.05L13.05 12l5.775-5.775a.75.75 0 1 0-1.05-1.05L12 10.95 6.225 5.175Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </DialogPrimitive.Close>
      </div>
    </div>
  );
}

interface ModalShellProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "md" | "lg";
  children: ReactNode;
  renderHeader?: (helpers: { close: () => void }) => ReactNode;
  progressSlot?: ReactNode;
  renderFooter?: (helpers: { close: () => void }) => ReactNode;
  contentRef?: (node: HTMLDivElement | null) => void;
  onContentScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function ModalShell({
  title,
  open,
  onOpenChange,
  size = "md",
  children,
  renderHeader,
  progressSlot,
  renderFooter,
  contentRef,
  onContentScroll,
}: ModalShellProps) {
  const shouldReduceMotion = useReducedMotion();
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const contentNodeRef = useRef<HTMLDivElement | null>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    wasOpenRef.current = true;
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      lastActiveRef.current = active;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.dataset.modalLock = (Number(document.body.dataset.modalLock ?? "0") + 1).toString();
    document.body.style.overflow = "hidden";

    return () => {
      const lockCount = Number(document.body.dataset.modalLock ?? "1") - 1;
      if (lockCount <= 0) {
        document.body.style.overflow = originalOverflow;
        delete document.body.dataset.modalLock;
      } else {
        document.body.dataset.modalLock = String(lockCount);
      }
    };
  }, [open]);

  useEffect(() => {
    if (open || !wasOpenRef.current) {
      return;
    }

    wasOpenRef.current = false;
    const lastActive = lastActiveRef.current;
    if (lastActive && typeof lastActive.focus === "function") {
      requestAnimationFrame(() => {
        lastActive.focus({ preventScroll: true });
      });
    }
  }, [open]);

  const evaluateScroll = useCallback((node: HTMLDivElement) => {
    const maxScroll = node.scrollHeight - node.clientHeight;
    if (maxScroll <= 0) {
      setShowTopFade(false);
      setShowBottomFade(false);
      return;
    }

    const topThreshold = 12;
    const bottomThreshold = maxScroll - 12;
    setShowTopFade(!(node.scrollTop <= topThreshold));
    setShowBottomFade(!(node.scrollTop >= bottomThreshold));
  }, []);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const node = event.currentTarget;
      evaluateScroll(node);
      onContentScroll?.(event);
    },
    [evaluateScroll, onContentScroll]
  );

  const setContentNode = useCallback(
    (node: HTMLDivElement | null) => {
      contentNodeRef.current = node;
      contentRef?.(node);

      if (node) {
        requestAnimationFrame(() => evaluateScroll(node));
      } else {
        setShowTopFade(false);
        setShowBottomFade(false);
      }
    },
    [contentRef, evaluateScroll]
  );

  useEffect(() => {
    const node = contentNodeRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => evaluateScroll(node));
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [children, evaluateScroll]);

  const fadeEdges = useMemo(
    () => (
      <>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 right-0 top-0 h-[48rem] bg-gradient-to-b from-white via-white/80 to-transparent transition-opacity duration-200",
            showTopFade ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 right-0 h-[60rem] bg-gradient-to-t from-white via-white/80 to-transparent transition-opacity duration-200",
            showBottomFade ? "opacity-100" : "opacity-0"
          )}
        />
      </>
    ),
    [showBottomFade, showTopFade]
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
                className="fixed inset-0 z-[2000] cursor-pointer bg-slate-900/40 backdrop-blur-sm"
                onClick={close}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              onEscapeKeyDown={() => close()}
              onPointerDownOutside={event => {
                event.preventDefault();
                close();
              }}
            >
              <div className="fixed inset-0 z-[2001] flex items-center justify-center px-[24rem] py-[40rem] focus:outline-none">
                <motion.div
                  initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" }}
                  className={cn("relative w-[min(92vw,820rem)] max-w-full", size === "lg" && "w-[min(92vw,960rem)]")}
                >
                  <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-[24rem] rounded-b-[32rem] border border-slate-100 bg-white shadow-[0_60rem_140rem_-80rem_rgba(32,64,171,0.35)]">
                    <div className="sticky top-0 z-[3] border-b border-slate-100 bg-white/95 backdrop-blur">
                      {renderHeader ? renderHeader({ close }) : <ModalHeader title={title} onClose={close} />}
                      {progressSlot}
                    </div>
                    <div
                      className="relative flex-1 overflow-y-auto px-[32rem] py-[28rem] scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
                      ref={setContentNode}
                      onScroll={handleScroll}
                    >
                      {fadeEdges}
                      <div className="relative z-[1]">{children}</div>
                    </div>
                    {renderFooter ? (
                      <footer className="sticky bottom-0 z-[2] border-t border-slate-100 bg-white/95 px-[32rem] py-[20rem] backdrop-blur">
                        {renderFooter({ close })}
                      </footer>
                    ) : null}
                  </div>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

interface ModalScrollProgressProps {
  value: number;
  label?: string;
}

export function ModalScrollProgress({ value, label }: ModalScrollProgressProps) {
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  const percent = Math.round(clamped * 100);

  return (
    <div className="flex flex-col gap-[8rem] border-b border-slate-100 bg-white/92 px-[32rem] py-[16rem] backdrop-blur-sm">
      <div className="flex items-center justify-between text-[12rem] font-semibold text-slate-500">
        <span>{label ?? "Scroll progress"}</span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-[6rem] w-full overflow-hidden rounded-[999rem] bg-slate-200/70"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <motion.div
          className="h-full rounded-[999rem] bg-slate-900"
          animate={{ width: `${Math.max(percent, 2)}%` }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface EmptyModalStateProps {
  description: string;
}

export function EmptyModalState({ description }: EmptyModalStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[12rem] rounded-[24rem] border border-dashed border-slate-200 bg-slate-50 px-[32rem] py-[40rem] text-center">
      <span className="text-[15rem] font-semibold text-slate-600">Content is not ready yet</span>
      <p className="text-[13rem] text-slate-500">{description}</p>
    </div>
  );
}
