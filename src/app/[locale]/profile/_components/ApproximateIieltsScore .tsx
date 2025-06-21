import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import React from 'react';

export const ApproximateIeltsScore = () => {
  return (
    <div className='relative flex flex-col items-center'>
      <h2 className='mb-[24rem] text-[20rem] leading-tight'>Approximate&nbsp;IELTS&nbsp;score </h2>

      <HorseshoeProgressBar
        value={0}
        maxValue={10}
        width={220}
        height={140}
        strokeWidth={14.5}
        circleColor='#F4F4F4'
        progressGradient={{
          startColor: '#22BFEB',
          endColor: '#A1DFF0',
        }}
        textColor='#383838'
        no_results_text='achieve your goal'
      />
    </div>
  );
};
