import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import TargetGoalModal from './TargetGoalModal';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import React from 'react';

interface Props {
  grade?: number;
}

export const IeltsGoal = ({ grade }: Props) => {
  const { t, tImgAlts } = useCustomTranslations('profile.ieltsGoal');

  return (
    <section className='relative rounded-[16rem] bg-white p-[24rem]'>
      <h3 className='mb-[32rem] text-[20rem] font-medium leading-tight'>{t('title')}</h3>

      <HorseshoeProgressBar
        width={220}
        height={140}
        maxValue={9.0}
        strokeWidth={14.5}
        textColor='#383838'
        circleColor='#F4F4F4'
        value={grade ? +grade : 0}
        containerClassName='mx-auto flex'
        no_results_text={t('noResults')}
        progressGradient={{
          startColor: '#C9FF56',
          endColor: '#E3F8B4',
        }}
      />

      <Dialog>
        <DialogTrigger className='group mt-[12rem] flex h-[54rem] w-full items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-light-gray hover:bg-d-green/40'>
          {grade ? (
            <>
              <img src='/images/icon_rotate.svg' className={`size-[14rem]`} alt={tImgAlts('rotate')} />
              <span className='text-[14rem] font-semibold'>{t('changeTarget')}</span>
            </>
          ) : (
            <>
              <img src='/images/icon_trophy.svg' className={`size-[14rem]`} alt={tImgAlts('trophy')} />
              <span className='text-[14rem] font-semibold'>{t('setTarget')}</span>
            </>
          )}
        </DialogTrigger>

        {grade && (
          <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
            <TargetGoalModal grade={grade} />
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
};
