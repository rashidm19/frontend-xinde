'use client';

import { ModalShell } from '@/components/modals/UnifiedModalShell';

interface WritingTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  prompt?: string;
  question?: string;
  description?: string;
  picture?: string | null;
}

export function WritingTaskModal({ open, onOpenChange, title, prompt, question, description, picture }: WritingTaskModalProps) {
  const hasPrompt = Boolean(prompt && prompt.trim().length > 0);
  const hasQuestion = Boolean(question && question.trim().length > 0);
  const hasDescription = Boolean(description && description.trim().length > 0);
  const hasVisual = Boolean(picture);

  return (
    <ModalShell title={title} open={open} onOpenChange={onOpenChange} size='md'>
      <div className='flex flex-col gap-[20rem] text-left'>
        {hasPrompt ? (
          <p className='text-[13rem] font-semibold uppercase tracking-[0.22em] text-slate-500'>{prompt}</p>
        ) : null}

        {hasQuestion ? (
          <h3 className='text-[18rem] font-semibold leading-[1.5] text-slate-900 md:text-[20rem]'>{question}</h3>
        ) : null}

        {hasDescription ? (
          <p className='text-[14rem] leading-[1.7] text-slate-600 whitespace-pre-line'>{description}</p>
        ) : null}

        {hasVisual ? (
          <figure className='overflow-hidden rounded-[20rem] border border-slate-200 bg-slate-50 p-[16rem]'>
            <div className='mx-auto w-full max-w-[420rem]'>
              <img src={picture ?? ''} alt='Task illustration' className='h-full w-full rounded-[18rem] object-contain' loading='lazy' />
            </div>
          </figure>
        ) : null}

        {!hasPrompt && !hasQuestion && !hasDescription && !hasVisual ? (
          <p className='rounded-[18rem] border border-dashed border-slate-200 bg-slate-50 px-[20rem] py-[24rem] text-[14rem] text-slate-500'>
            Task details are not available for this submission.
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}
