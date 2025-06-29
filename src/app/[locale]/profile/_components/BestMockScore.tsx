import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const BestMockScore = () => {
  const { t } = useCustomTranslations('profile.approximateIELTSSCore');

  return (
    <div className='relative mr-[20rem] flex flex-col items-center'>
      <h2 className='mb-[24rem] text-[20rem] leading-tight'>{t('title')}</h2>

      <HorseshoeProgressBar
        value={0}
        width={220}
        height={140}
        maxValue={10}
        strokeWidth={14.5}
        textColor='#383838'
        circleColor='#F4F4F4'
        no_results_text={t('noResults')}
        progressGradient={{
          startColor: '#C9FF56',
          endColor: '#E3F8B4',
        }}
      />
    </div>
  );
};
