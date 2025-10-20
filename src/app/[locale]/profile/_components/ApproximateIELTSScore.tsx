import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { Skeleton } from '@/components/ui/skeleton';

export const ApproximateIELTSScore = ({ score = 0, loading }: { score: number; loading?: boolean }) => {
  const { t } = useCustomTranslations('profile.approximateIELTSSCore');

  return (
    <div className='relative flex w-[260rem] flex-col items-center text-center'>
      <h2 className='mb-[12rem] text-[20rem] leading-tight'>{t('title')}</h2>

      {loading && <Skeleton className='mb-[24rem] h-[16rem] w-[180rem]' />}

      <HorseshoeProgressBar
        value={score}
        width={220}
        height={140}
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
