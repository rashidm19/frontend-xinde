import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import React from 'react';

export const BestMockScore = () => {
  return (
    <div className='relative mr-[20rem] flex flex-col items-center'>
      <h2 className='mb-[24rem] text-[20rem] leading-tight'>Best MOCK score</h2>

      <HorseshoeProgressBar
        value={0}
        maxValue={10}
        width={220}
        height={140}
        strokeWidth={14.5}
        circleColor='#F4F4F4'
        progressGradient={{
          startColor: '#C9FF56',
          endColor: '#E3F8B4',
        }}
        textColor='#383838'
        no_results_text='test your skills'
      />
    </div>
  );
};
