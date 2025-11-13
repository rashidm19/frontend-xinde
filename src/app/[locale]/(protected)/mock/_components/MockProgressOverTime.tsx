import { HorseshoeProgressBar } from '@/app/[locale]/(protected)/profile/_components/HorseshoeProgressBar';
import React from 'react';

interface Props {
  data?: any;
}

export const MockProgressOverTime = ({ data }: Props) => {
  return (
    <section>
      <div className='relative overflow-hidden rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        {/* // * Title & Full litst btn */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-x-[24rem]'>
            <h2 className='text-[20rem] font-medium leading-normal'>MOCK progress over time</h2>
            {data && <div className='mt-[3rem] text-[14rem] font-medium leading-normal tracking-[-0.2rem] text-d-black/80'>27.05 - 2.06</div>}
          </div>
          <button type='button' className='flex h-[30rem] items-center gap-x-[4rem] px-[16rem] disabled:cursor-not-allowed' disabled>
            <span className='text-[14rem] font-medium leading-normal text-d-black/80'>This week</span>
            <img src='/images/icon_chevron--down.svg' className='size-[14rem] rotate-90' alt='icon' />
          </button>
        </div>

        {data ? (
          <div className='mt-[24rem] flex w-full flex-row items-start justify-between gap-x-[13rem]'>
            <div className='shrink-0'>
              <div className='mb-[24rem] text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Best sections results</div>
              <div className='grid grid-cols-2 gap-x-[40rem] gap-y-[24rem]'>
                <button type='button' className='flex items-center'>
                  <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-green-secondary'>
                    <img src='/images/icon_listeningSection.svg' className='size-[24rem]' alt='icon' />
                  </div>
                  <div className='flex flex-col items-start'>
                    <div className='mb-[4rem] flex items-center gap-x-[8rem]'>
                      <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Listening</div>
                      <div className='text-[14rem] font-normal tracking-[-0.2rem] text-d-blue'>+0.5</div>
                    </div>
                    <div className='text-[20rem] font-semibold tracking-[-0.2rem]'>6.5</div>
                  </div>
                </button>
                <button type='button' className='flex items-center'>
                  <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-yellow-secondary'>
                    <img src='/images/icon_readingSection.svg' className='size-[24rem]' alt='icon' />
                  </div>
                  <div className='flex flex-col items-start'>
                    <div className='mb-[4rem] flex items-center gap-x-[8rem]'>
                      <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Reading</div>
                      <div className='text-[14rem] font-normal tracking-[-0.2rem] text-d-blue'>+0.5</div>
                    </div>
                    <div className='text-[20rem] font-semibold tracking-[-0.2rem]'>6.5</div>
                  </div>
                </button>
                <button type='button' className='flex items-center'>
                  <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-blue-secondary'>
                    <img src='/images/icon_writingSection.svg' className='size-[24rem]' alt='icon' />
                  </div>
                  <div className='flex flex-col items-start'>
                    <div className='mb-[4rem] flex items-center gap-x-[8rem]'>
                      <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Writing</div>
                      <div className='text-[14rem] font-normal tracking-[-0.2rem] text-d-blue'>+0.5</div>
                    </div>
                    <div className='text-[20rem] font-semibold tracking-[-0.2rem]'>6.5</div>
                  </div>
                </button>
                <button type='button' className='flex items-center'>
                  <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-violet-secondary'>
                    <img src='/images/icon_speakingSection.svg' className='size-[24rem]' alt='icon' />
                  </div>
                  <div className='flex flex-col items-start'>
                    <div className='mb-[4rem] flex items-center gap-x-[8rem]'>
                      <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Speaking</div>
                      <div className='text-[14rem] font-normal tracking-[-0.2rem] text-d-blue'>+0.5</div>
                    </div>
                    <div className='text-[20rem] font-semibold tracking-[-0.2rem]'>6.5</div>
                  </div>
                </button>
              </div>
            </div>
            <div className='flex items-start gap-x-[40rem] pr-[14rem]'>
              <div className='flex flex-col'>
                <div className='mx-auto mb-[24rem] flex items-center gap-x-[8rem]'>
                  <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Best MOCK score</div>
                  <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-blue'>+0.5</div>
                </div>
                <HorseshoeProgressBar
                  value={5.5}
                  maxValue={10}
                  width={152}
                  height={140}
                  strokeWidth={14.5}
                  circleColor='#F4F4F4'
                  progressGradient={{
                    startColor: '#C9FF55',
                    endColor: '#E3F8B4',
                  }}
                  textColor='#383838'
                  no_results_text='achieve your goal'
                />
              </div>

              <div className='flex flex-col'>
                <div className='mx-auto mb-[24rem] flex items-center gap-x-[8rem]'>
                  <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Best MOCK score</div>
                  <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-blue'>+0.5</div>
                </div>
                <HorseshoeProgressBar
                  value={5.5}
                  maxValue={10}
                  width={152}
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

              <div className='flex flex-col'>
                <div className='mx-auto mb-[24rem] text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Target MOCK score</div>

                <HorseshoeProgressBar
                  value={5.5}
                  maxValue={10}
                  width={152}
                  height={140}
                  strokeWidth={14.5}
                  circleColor='#F4F4F4'
                  progressGradient={{
                    startColor: '#636AFB',
                    endColor: '#A4A6F8',
                  }}
                  textColor='#383838'
                  no_results_text='achieve your goal'
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* // * Empty state */}
            <div className='mb-[102rem] mt-[110rem] flex w-full flex-col items-center gap-y-[24rem]'>
              <div className='font-poppins text-[14rem]'>Complete exam by section or take MOCK test to view results</div>
            </div>
            <img
              src='/images/illustration_flower3.png'
              className='pointer-events-none absolute bottom-0 right-0 h-auto w-[462rem] mix-blend-luminosity'
              alt='illustration'
            />
          </>
        )}
      </div>
    </section>
  );
};
