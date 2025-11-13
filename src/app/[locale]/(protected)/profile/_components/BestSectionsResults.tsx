import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { IPracticeScoresStats } from '@/types/Stats';

export const BestSectionsResults = ({ stats, loading }: { stats?: IPracticeScoresStats; loading: boolean }) => {
  const { t, tActions, tCommon } = useCustomTranslations('profile.bestSectionsResults');

  const list = [
    {
      text: 'writing',
      value: stats?.best_writing_score || 0,
      icon: '/images/icon_writingSection.svg',
      bg: 'bg-d-blue-secondary',
    },
    {
      text: 'reading',
      value: stats?.best_reading_score || 0,
      icon: '/images/icon_readingSection.svg',
      bg: 'bg-d-yellow-secondary',
    },
    {
      text: 'listening',
      value: stats?.best_listening_score || 0,
      icon: '/images/icon_listeningSection.svg',
      bg: 'bg-d-green-secondary',
    },
    {
      text: 'speaking',
      value: stats?.best_speaking_score || 0,
      icon: '/images/icon_speakingSection.svg',
      bg: 'bg-d-violet-secondary',
    },
  ];

  return (
    <div className='w-full tablet:max-w-[360rem] desktop:mr-[140rem] desktop:w-[290rem]'>
      <h2 className='mb-[24rem] text-[20rem] font-medium leading-tight'>{t('title')}</h2>

      {!loading ? (
        <ul className='grid grid-cols-2 gap-x-[16rem] gap-y-[20rem]'>
          {list.map((item, index) => (
            <li key={index} className='flex items-center gap-[12rem]'>
              <div className={`flex size-[52rem] items-center justify-center rounded-[8rem] ${item.bg}`}>
                <img src={item.icon} className='size-[24rem]' alt='icon' />
              </div>
              <div>
                <p className='text-[14rem] font-medium'>{tCommon(item.text)}</p>
                <p className='text-[14rem] font-medium'>{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className='flex flex-col gap-[24rem]'>
          <p className='font-poppins text-[14rem] leading-tight text-d-black/70'>{t('subtitle')}</p>
          <Link
            href='/mock'
            className='flex h-[50rem] items-center justify-center rounded-full bg-d-green px-[40rem] text-[14rem] font-semibold text-d-black transition-colors hover:bg-d-green/40'
          >
            {tActions('completeMOCK')}
          </Link>
        </div>
      )}
    </div>
  );
};
