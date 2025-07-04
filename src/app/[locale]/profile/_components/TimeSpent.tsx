'use client';

import { ChartComponent } from '@/components/ChartComponent';
import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface Props {
  data?: any;
}

export const TimeSpent = ({ data }: Props) => {
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('profile.timeSpent');

  return (
    <section>
      <div className='relative rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        {/* // * Title & Full litst btn */}
        <div className='mb-[16rem] flex items-center justify-between'>
          <h2 className='text-[20rem] font-medium leading-normal'>{t('title')}</h2>
          <button type='button' className='flex h-[30rem] items-center gap-x-[4rem] px-[16rem] disabled:cursor-not-allowed' disabled>
            <span className='text-[14rem] font-medium leading-normal text-d-black/80'>{tCommon('thisWeek')}</span>
            <img src='/images/icon_chevron--down.svg' className='size-[14rem] rotate-90' alt={tImgAlts('chevronDown')} />
          </button>
        </div>

        {data ? (
          <>
            <div className='flex items-start gap-x-[32rem]'>
              {/* // * Daily Average */}
              <div className='flex flex-col text-[14rem] font-medium leading-normal tracking-[-0.2rem] text-d-black'>
                <div>{t('dailyAverage')}</div>
                <div className='text-[20rem] font-medium text-d-black'>{tCommon('hCount', { count: 2 })}</div>
              </div>

              {/* // * Week total */}
              <div className='flex flex-col text-[14rem] font-medium leading-normal tracking-[-0.2rem] text-d-black'>
                <div>{t('weekTotal')}</div>
                <div className='text-[20rem] font-medium text-d-black'>{tCommon('hCount', { count: 2 })}</div>
              </div>

              {/* // * Weekly goal */}
              <div className='flex flex-col text-[14rem] font-medium leading-normal tracking-[-0.2rem] text-d-black'>
                <div>{t('weeklyGoal')}</div>
                <div className='text-[20rem] font-medium text-d-black'>82%</div>
              </div>
            </div>
            <ChartComponent
              width={'100%'}
              height={'300rem'}
              barGapNumber={80}
              useGradient={false}
              yAxisDomain={[0, 30]}
              displayAsPercent={false}
              titleClassName='ml-[-8rem] desktop:ml-[40rem]'
              chartData={[{ bar_01: 30, bar_02: 9, bar_03: 8, bar_04: 8 }]}
              containerClassName='desktop:pr-[12rem] desktop:pl-[0rem] desktop:col-span-2'
              barColors={{
                bar_01: '#ECFFC3',
                bar_02: '#ECFFC3',
                bar_03: '#ECFFC3',
                bar_04: '#ECFFC3',
                bar_05: '#ECFFC3',
              }}
              barSizes={{
                bar_01: 130,
                bar_02: 130,
                bar_03: 130,
                bar_04: 130,
                bar_05: 130,
              }}
              chartConfig={{
                bar_01: {
                  label: 'Listening',
                  color: '#ECFFC3',
                },
                bar_02: {
                  label: 'Reading',
                  color: '#ECFFC3',
                },
                bar_03: {
                  label: 'Writing',
                  color: '#ECFFC3',
                },
                bar_04: {
                  label: 'Speaking',
                  color: '#ECFFC3',
                },
              }}
            />{' '}
          </>
        ) : (
          <>
            {/* // * Empty state */}
            <div className='mb-[108rem] mt-[90rem] flex w-full flex-col items-center gap-y-[24rem]'>
              <div className='font-poppins text-[14rem]'>{t('start')}</div>
              <Link href='/practice' className='flex h-[50rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-light-gray px-[24rem] hover:bg-d-green/40'>
                <span className='text-[14rem] font-semibold'>{tActions('practiceBySection')}</span>
              </Link>
            </div>
            <img
              alt={tImgAlts('hairy')}
              src='/images/illustration_hairyknont.png'
              className='pointer-events-none absolute bottom-0 left-0 h-auto w-[410rem] mix-blend-luminosity'
            />
          </>
        )}
      </div>
    </section>
  );
};

function useWindowSize(): { width?: 1512 | undefined } {
  throw new Error('Function not implemented.');
}
