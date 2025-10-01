'use client';

import { ChartComponent } from '@/components/ChartComponent';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { MockTimeStats } from '@/types/Stats';
import { ChartConfig } from '@/components/ui/chart';

interface Props {
  data?: MockTimeStats;
  loading?: boolean;
}

const BAR_COLOR = '#ECFFC3';

export const TimeSpent = ({ data, loading }: Props) => {
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('profile.timeSpent');

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      data.day_stats.reduce(
        (acc, item, idx) => {
          const key = `bar_${String(idx + 1).padStart(2, '0')}`;
          acc[key] = item.time;
          return acc;
        },
        {} as Record<string, number>
      ),
    ];
  }, [data]);

  const barColors = useMemo(() => {
    if (!data) return {};
    return data.day_stats.reduce(
      (acc, _, idx) => {
        const key = `bar_${String(idx + 1).padStart(2, '0')}`;
        acc[key] = BAR_COLOR;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [data]);

  const chartConfig = useMemo(() => {
    if (!data) return {};
    return data.day_stats.reduce((acc, item, idx) => {
      const key = `bar_${String(idx + 1).padStart(2, '0')}`;
      acc[key] = { label: item.date, color: BAR_COLOR };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  const yAxisDomainMax = useMemo(() => {
    if (!data || !data.day_stats.length) return 30;
    const maxValue = Math.max(...data.day_stats.map(item => item.time));
    if (maxValue === 0) return 30;
    const withMargin = Math.ceil(maxValue * 1.1);
    return withMargin <= 10 ? 10 : withMargin <= 25 ? 25 : withMargin <= 50 ? 50 : Math.ceil(withMargin / 10) * 10;
  }, [data]);

  return (
    <section>
      <div className='relative rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        {/* Title & Full list btn */}
        <div className='mb-[16rem] flex items-center justify-between'>
          <h2 className='text-[20rem] font-medium leading-normal'>{t('title')}</h2>
          {/*<button type='button' className='flex h-[30rem] items-center gap-x-[4rem] px-[16rem] disabled:cursor-not-allowed' disabled>
            <span className='text-[14rem] font-medium leading-normal text-d-black/80'>{tCommon('thisWeek')}</span>
            <img src='/images/icon_chevron--down.svg' className='size-[14rem] rotate-90' alt={tImgAlts('chevronDown')} />
          </button>*/}
        </div>

        {!loading && data && data.total_period_time > 0 ? (
          <>
            <div className='flex items-start gap-x-[32rem]'>
              {/* Daily Average */}
              <InfoBlock label={t('dailyAverage')} value={tCommon('hCount', { count: data.daily_average_time || 0 })} />
              {/* Week total */}
              <InfoBlock label={t('weekTotal')} value={tCommon('hCount', { count: data.total_period_time || 0 })} />
              {/* // * Weekly goal */}
              {/*<InfoBlock label={t('weeklyGoal')} value='82%' />*/}
            </div>
            <ChartComponent
              width='100%'
              height='300rem'
              barGapNumber={80}
              useGradient={false}
              chartData={chartData}
              barColors={barColors}
              displayAsPercent={false}
              chartConfig={chartConfig}
              yAxisDomain={[0, yAxisDomainMax]}
              titleClassName='ml-[-8rem] desktop:ml-[40rem]'
              containerClassName='desktop:pr-[12rem] desktop:pl-[0rem] desktop:col-span-2'
            />
          </>
        ) : (
          <EmptyState t={t} tImgAlts={tImgAlts} tActions={tActions} />
        )}
      </div>
    </section>
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className='flex flex-col text-[14rem] font-medium leading-normal tracking-[-0.2rem] text-d-black'>
    <div>{label}</div>
    <div className='text-[20rem] font-medium text-d-black'>{value}</div>
  </div>
);

const EmptyState = ({ t, tImgAlts, tActions }: any) => (
  <>
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
);
