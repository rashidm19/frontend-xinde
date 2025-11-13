import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { Skeleton } from '@/components/ui/skeleton';

export const ApproximateIELTSScore = ({ score = 0, loading }: { score: number; loading?: boolean }) => {
  const { t } = useCustomTranslations('profile.approximateIELTSSCore');

  return (
    <div className='relative flex w-full flex-col items-center text-center tablet:max-w-[320rem] desktop:w-[260rem]'>
      <h2 className='mb-[12rem] text-[20rem] leading-tight'>{t('title')}</h2>

      {loading ? <Skeleton className='mb-[24rem] h-[16rem] w-full max-w-[180rem]' /> : null}

      <HorseshoeProgressBar
        value={score}
        width={200}
        height={128}
        maxValue={10}
        strokeWidth={14.5}
        textColor='#383838'
        circleColor='#F4F4F4'
        no_results_text={loading ? '' : t('noResults')}
        progressGradient={{
          startColor: '#22BFEB',
          endColor: '#A1DFF0',
        }}
      />
    </div>
  );
};
