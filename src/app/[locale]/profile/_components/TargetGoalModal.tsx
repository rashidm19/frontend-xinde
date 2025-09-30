'use client';

import React, { useRef, useState } from 'react';

import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { postUser } from '@/api/POST_user';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useMutation } from '@tanstack/react-query';
import { ProfileUpdateRequest, ProfileUpdateResponse } from '@/api/profile';
import { setProfile, refreshProfile } from '@/stores/profileStore';

interface Props {
  grade: number;
}

export default function TargetGoalModal({ grade }: Props) {
  const { t, tImgAlts, tActions } = useCustomTranslations('profile.targetGoalModal');
  const closeRef = useRef<HTMLButtonElement>(null);

  const [selectedScore, setSelectedScore] = useState(grade);
  const [loading, setLoading] = useState(false);

  const scores = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  const isScoreSelected = (score: any) => {
    return score <= selectedScore;
  };

  const mutation = useMutation<ProfileUpdateResponse, Error, ProfileUpdateRequest>({
    mutationFn: postUser,
    onSuccess: async updatedUser => {
      setProfile(updatedUser);
      try {
        await refreshProfile();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await mutation.mutateAsync({ grade: selectedScore.toString() });
      closeRef.current?.click();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='fixed flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[40rem] desktop:rounded-[40rem]'>
      <DialogClose ref={closeRef} className='absolute right-[24rem] top-[24rem]'>
        <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[20rem]' />
      </DialogClose>

      <div className='mx-auto flex w-[544rem] flex-col text-[14rem]'>
        <h2 className='mb-[14rem] text-center text-[20rem] font-semibold text-d-black'>{t('title')}</h2>
        <p className='mb-[70rem] text-center text-[14rem] text-d-black'>{t('selectGoal')}</p>
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
          className='mx-auto mt-[60rem] flex h-[50rem] w-[280rem] items-center justify-center rounded-full bg-d-green px-[16rem] py-[8rem] font-semibold text-d-black transition-colors hover:bg-d-green-secondary'
          onClick={handleSubmit}
        >
          {loading ? (
            <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          ) : (
            tActions('confirm')
          )}
        </button>
      </div>
    </section>
  );
}
