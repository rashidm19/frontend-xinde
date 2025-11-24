'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';

import { ModalShell } from '@/components/modals/UnifiedModalShell';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';

interface SpeakingTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: Array<{ id: string; title: string; questions: string[] }>;
}

function SpeakingTaskModalComponent({ open, onOpenChange, sections }: SpeakingTaskModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const content = useMemo(() => {
    if (sections.length === 0) {
      return (
        <p className='rounded-[18rem] border border-dashed border-slate-200 bg-white px-[18rem] py-[22rem] text-[14rem] text-slate-500'>
          Task questions are not available for this attempt.
        </p>
      );
    }

    return (
      <div className='flex flex-col gap-[20rem]'>
        {sections.map(section => (
          <div key={section.id} className='space-y-[12rem]'>
            <h3 className='text-[15rem] font-semibold uppercase tracking-[0.18em] text-slate-500 tablet:text-[16rem]'>{section.title}</h3>
            {section.questions.length > 0 ? (
              <ol className='flex flex-col gap-[12rem] text-[14rem] leading-[1.6] text-slate-700 tablet:text-[14.5rem]'>
                {section.questions.map((question, index) => (
                  <li
                    key={`${section.id}-${index}`}
                    className='flex items-start gap-[12rem] rounded-[18rem] border border-slate-100 bg-white px-[16rem] py-[14rem] shadow-[0_12rem_32rem_-24rem_rgba(15,23,42,0.18)]'
                  >
                    <span className='mt-[2rem] inline-flex size-[22rem] items-center justify-center rounded-full bg-slate-900 text-[12rem] font-semibold text-white'>
                      {index + 1}
                    </span>
                    <p className='flex-1 whitespace-pre-line'>{question}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className='rounded-[16rem] border border-slate-100 bg-white px-[16rem] py-[14rem] text-[13.5rem] text-slate-500'>
                Questions for this part are not available.
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }, [sections]);

  if (!isDesktop) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        <BottomSheetContent className='px-[18rem] pb-[24rem]' aria-label='Speaking task questions'>
          <header className='flex items-center justify-between gap-[12rem] px-[2rem] pb-[16rem]'>
            <div className='space-y-[2rem]'>
              <p className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-slate-400'>View task</p>
              <h2 className='text-[18rem] font-semibold text-slate-900 leading-[1.4]'>Speaking questions</h2>
            </div>
            <BottomSheetClose
              className='inline-flex size-[36rem] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500'
              aria-label='Close task details'
            >
              <X className='size-[18rem]' aria-hidden='true' />
            </BottomSheetClose>
          </header>
          <div className='flex min-h-0 flex-1 flex-col gap-[18rem] overflow-y-auto pr-[4rem]'>{content}</div>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <ModalShell title='Speaking questions' open={open} onOpenChange={onOpenChange} size='md'>
      <div className='flex flex-col gap-[20rem]'>{content}</div>
    </ModalShell>
  );
}

export const SpeakingTaskModal = withHydrationGuard(SpeakingTaskModalComponent);
