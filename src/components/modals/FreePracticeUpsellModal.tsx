"use client";

import { useCallback, useEffect, useMemo, useId } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Infinity as InfinityIcon, Sparkles, Route } from "lucide-react";
import { Logo } from '@/components/auth';

interface FreePracticeUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscriptionModal: () => void;
}

export function FreePracticeUpsellModal({ isOpen, onClose, onOpenSubscriptionModal }: FreePracticeUpsellModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
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
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
      }
    },
    [onClose]
  );

  const handlePrimaryAction = useCallback(() => {
    onOpenSubscriptionModal();
    onClose();
  }, [onClose, onOpenSubscriptionModal]);

  const highlightItems = useMemo(
    () => [
      { label: "Unlimited practice", Icon: InfinityIcon },
      { label: "AI-powered feedback", Icon: Sparkles },
      { label: "Personalised study plan", Icon: Route },
    ],
    []
  );

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {isOpen ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" }}
                className="fixed inset-0 z-[2000] cursor-pointer bg-slate-950/55 backdrop-blur-[6rem]"
                onClick={onClose}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              aria-describedby={descriptionId}
              onEscapeKeyDown={event => {
                event.preventDefault();
                onClose();
              }}
              onPointerDownOutside={event => {
                event.preventDefault();
                onClose();
              }}
            >
              <div className="fixed inset-0 z-[2001] flex items-center justify-center px-[20rem] py-[36rem] tablet:px-[28rem]">
                <motion.div
                  initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
                  className="relative w-full"
                >
                  <div className="mx-auto flex w-[min(92vw,440rem)] flex-col items-center overflow-hidden rounded-[24rem] border border-white/75 bg-white px-[24rem] py-[26rem] shadow-[0_32rem_96rem_-72rem_rgba(32,48,128,0.42)] tablet:px-[28rem] tablet:py-[30rem]">
                    <div className="flex w-full flex-col items-center text-center">
                      <motion.div
                        className="mb-[24rem] flex items-center justify-center shadow-[0_0_48rem_-32rem_rgba(68,90,255,0.46)]"
                        initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                        transition={shouldReduceMotion ? undefined : { duration: 0.32, ease: "easeOut" }}
                      >
                        <Logo  showStudyboxText/>
                      </motion.div>
                      <DialogPrimitive.Title
                        id={headingId}
                        className="text-[18.5rem] font-semibold leading-[1.32] text-slate-900 tablet:text-[21.5rem]"
                      >
                        Great job — you’ve completed your free practice!
                      </DialogPrimitive.Title>
                      <DialogPrimitive.Description
                        id={descriptionId}
                        className="mt-[9rem] max-w-[392rem] text-[13rem] leading-[1.58] text-slate-500 tablet:text-[14rem]"
                      >
                        You’ve taken your first step. With Studybox Pro, you can unlock unlimited practice, AI feedback, and your personalised study roadmap.
                      </DialogPrimitive.Description>
                    </div>

                    <div className="mt-[18rem] flex w-full items-center justify-center gap-[18rem] tablet:gap-[20rem]">
                      {highlightItems.map(item => (
                        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-[8rem] text-center">
                          <span className="flex size-[30rem] items-center justify-center rounded-full border border-slate-200/70 bg-slate-50">
                            <item.Icon className="size-[16rem] text-[#4653FE]" aria-hidden="true" />
                          </span>
                          <span className="text-[12.8rem] font-medium text-slate-600 leading-[1.45] tablet:text-[13.2rem]">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-[24rem] flex w-full flex-col items-center gap-[10rem]">
                      <button
                        type="button"
                        className="inline-flex w-full max-w-[260rem] items-center justify-center rounded-full bg-[#3E4CFF] px-[22rem] py-[11rem] text-[13.5rem] font-semibold text-white shadow-[0_18rem_44rem_-28rem_rgba(62,76,255,0.5)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A86FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:bg-[#3543F2] active:bg-[#2D3ADA]"
                        onClick={handlePrimaryAction}
                      >
                        See subscription plans
                      </button>
                      <button
                        type="button"
                        className="text-[12rem] font-semibold text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        onClick={onClose}
                      >
                        Not now
                      </button>
                    </div>
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
