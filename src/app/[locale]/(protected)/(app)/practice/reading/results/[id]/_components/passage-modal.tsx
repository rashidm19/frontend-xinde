'use client';

import { X } from 'lucide-react';
import { useMemo } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';

import { ModalShell } from '@/components/modals/UnifiedModalShell';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';

interface PassageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text?: string;
  picture?: string | null;
}

function PassageModalComponent({ open, onOpenChange, title, text, picture }: PassageModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const hasText = Boolean(text && text.trim().length > 0);
  const hasVisual = Boolean(picture);

  const content = useMemo(
    () => (
      <div className="flex flex-col gap-[18rem] text-left tablet:gap-[20rem]">
        {hasVisual ? (
          <figure className="overflow-hidden rounded-[16rem] border border-slate-200 bg-slate-50 p-[12rem] tablet:rounded-[20rem] tablet:p-[16rem]">
            <div className="mx-auto w-full max-w-[560rem]">
              <img src={picture ?? ''} alt="Reading passage illustration" className="h-full w-full rounded-[14rem] object-contain tablet:rounded-[18rem]" loading="lazy" />
            </div>
          </figure>
        ) : null}

        {hasText ? (
          <p className="whitespace-pre-line text-[15rem] leading-[1.8] text-slate-700">{text}</p>
        ) : null}

        {!hasText && !hasVisual ? (
          <p className="rounded-[16rem] border border-dashed border-slate-200 bg-slate-50 px-[16rem] py-[20rem] text-[13rem] text-slate-500 tablet:rounded-[18rem] tablet:px-[20rem] tablet:py-[24rem] tablet:text-[14rem]">
            Passage content is not available.
          </p>
        ) : null}
      </div>
    ),
    [hasText, hasVisual, picture, text]
  );

  if (!isDesktop) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        <BottomSheetContent className="px-[18rem] pb-[20rem]" aria-label="Reading passage">
          <header className="flex items-center justify-between gap-[12rem] px-[2rem] pb-[12rem]">
            <div className="space-y-[2rem]">
              <p className="text-[12rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Reading Passage</p>
              <h2 className="text-[18rem] font-semibold leading-[1.4] text-slate-900">{title}</h2>
            </div>
            <BottomSheetClose
              className="inline-flex size-[36rem] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              aria-label="Close passage"
            >
              <X className="size-[18rem]" aria-hidden="true" />
            </BottomSheetClose>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-[4rem]">{content}</div>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <ModalShell title={title} open={open} onOpenChange={onOpenChange} size="lg">
      {content}
    </ModalShell>
  );
}

export const PassageModal = withHydrationGuard(PassageModalComponent);
