'use client';

import React, { useState } from 'react';

import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { postUser } from '@/api/POST_user';
import { useRouter } from 'next/navigation';

export default function TargetGoalModal() {
  const router = useRouter();
  const [selectedScore, setSelectedScore] = useState(5.0);

  const scores = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  const isScoreSelected = (score: any) => {
    return score <= selectedScore;
  };

  return (
    <section className='fixed flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[40rem] desktop:rounded-[40rem]'>
      <DialogClose className='absolute right-[24rem] top-[24rem]'>
        <img src='/images/icon_close--black.svg' alt='Close' className='size-[20rem]' />
      </DialogClose>

      <div className='mx-auto flex w-[544rem] flex-col text-[14rem]'>
        <h2 className='mb-[14rem] text-center text-[20rem] font-semibold text-d-black'>IELTS Target Assessment</h2>
        <p className='mb-[70rem] text-center text-[14rem] text-d-black'>Select the score you would like to achieve</p>
        <div className='flex flex-col gap-y-[16rem]'>
          {/* Progress Bar Container */}
          <div className='relative flex h-[20rem] items-center'>
            {scores.map((score, index) => (
              <button
                key={score}
                onClick={() => setSelectedScore(score)}
                className={cn(
                  'relative h-full flex-1 transition-colors first:rounded-l-full last:rounded-r-full',
                  isScoreSelected(score) ? 'bg-d-black' : 'bg-d-light-gray'
                )}
              >
                {/* Dot indicator */}
                <div
                  className={cn(
                    'absolute -right-[0rem] -top-[2rem] z-20 h-[24rem]',
                    selectedScore === score ? '-right-[10rem] w-[24rem] rounded-full bg-d-black' : `w-[4rem] bg-d-gray ${index === scores.length - 1 ? 'hidden' : ''}`
                  )}
                />
              </button>
            ))}
          </div>

          {/* Score Labels */}
          <div className='-mr-[8rem] flex justify-between gap-x-[28rem] pl-[48rem]'>
            {scores.map(score => (
              <button
                key={score}
                onClick={() => setSelectedScore(score)}
                className={cn('text-[14rem] text-d-black transition-colors', score === selectedScore ? 'font-extrabold' : 'font-normal')}
              >
                {score.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          className='mx-auto mt-[60rem] h-[50rem] w-[280rem] rounded-full bg-d-green px-[16rem] py-[8rem] font-semibold text-d-black transition-colors hover:bg-d-green-secondary'
          onClick={() => {
            postUser({ grade: selectedScore.toString() });
            window.location.reload();
          }}
        >
          Confirm
        </button>
      </div>
    </section>
  );
}
