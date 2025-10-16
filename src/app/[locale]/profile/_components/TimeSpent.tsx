'use client';

import Link from 'next/link';
import React from 'react';
import { format, parseISO } from 'date-fns';

import { Skeleton } from '@/components/ui/skeleton';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { PracticeHistoryEntry } from '@/types/Stats';

interface Props {
  data?: PracticeHistoryEntry[];
  loading?: boolean;
}

export const PracticeHistory = ({ data, loading }: Props) => {
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('profile.practiceHistory');

  const items = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [] as PracticeHistoryEntry[];
    }

    return data.slice(0, 5);
  }, [data]);

  return (
    <section>
      <div className='relative rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        <div className='mb-[16rem] flex items-center justify-between'>
          <h2 className='text-[20rem] font-medium leading-normal'>{t('title')}</h2>
        </div>

        {loading ? (
          <LoadingState />
        ) : items.length ? (
          <HistoryList items={items} tCommon={tCommon} t={t} />
        ) : (
          <EmptyState t={t} tImgAlts={tImgAlts} tActions={tActions} />
        )}
      </div>
    </section>
  );
};

const LoadingState = () => (
  <div className='flex flex-col gap-y-[12rem]'>
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className='h-[56rem] w-full rounded-[12rem]' />
    ))}
  </div>
);

const HistoryList = ({
  items,
  tCommon,
  t,
}: {
  items: PracticeHistoryEntry[];
  tCommon: (key: string, values?: Record<string, string | number>) => string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) => (
  <div className='flex flex-col gap-y-[12rem]'>
    <div className='grid grid-cols-[120rem_1fr_80rem] gap-x-[16rem] px-[8rem] text-[12rem] font-medium uppercase tracking-[0.16rem] text-d-black/60'>
      <span>{t('columns.date')}</span>
      <span>{t('columns.section')}</span>
      <span className='justify-self-end'>{t('columns.score')}</span>
    </div>

    <ul className='flex flex-col gap-y-[12rem]'>
      {items.map((item, index) => (
        <li
          key={`${item.id ?? item.completed_at ?? index}`}
          className='grid grid-cols-[120rem_1fr_80rem] items-center gap-x-[16rem] rounded-[12rem] border border-d-light-gray/60 px-[16rem] py-[16rem]'
        >
          <span className='text-[14rem] font-medium leading-tight text-d-black/80'>{formatHistoryDate(item.completed_at)}</span>
          <span className='text-[14rem] font-medium leading-tight text-d-black'>{tCommon(item.section)}</span>
          <span className='justify-self-end text-[14rem] font-semibold leading-tight text-d-black'>{formatScore(item.score)}</span>
        </li>
      ))}
    </ul>
  </div>
);

const formatHistoryDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch (error) {
    return value;
  }
};

const formatScore = (value: number | null) => {
  if (typeof value !== 'number') {
    return '—';
  }

  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded.toFixed(0)}` : `${rounded.toFixed(1)}`;
};

const EmptyState = ({
  t,
  tImgAlts,
  tActions,
}: {
  t: (key: string) => string;
  tImgAlts: (key: string) => string;
  tActions: (key: string) => string;
}) => (
  <>
    <div className='mb-[72rem] mt-[90rem] flex w-full flex-col items-center gap-y-[24rem]'>
      <div className='px-[24rem] text-center font-poppins text-[14rem]'>{t('empty')}</div>
      <Link
        href='/practice'
        className='flex h-[50rem] w-[220rem] items-center justify-center rounded-[40rem] bg-d-light-gray px-[24rem] hover:bg-d-green/40'
      >
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
