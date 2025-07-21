import React from 'react';
import Link from 'next/link';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

const list = [
  {
    text: 'listening',
    link: '/practice/listening/rules',
    icon: '/images/icon_listeningSection.svg',
    bg: 'bg-d-green-secondary',
  },
  {
    text: 'reading',
    link: '/practice/reading/rules',
    icon: '/images/icon_readingSection.svg',
    bg: 'bg-d-yellow-secondary',
  },
  {
    text: 'writing',
    link: '/practice/writing/customize',
    icon: '/images/icon_writingSection.svg',
    bg: 'bg-d-blue-secondary',
  },
  {
    text: 'speaking',
    link: '/practice/speaking/customize',
    icon: '/images/icon_speakingSection.svg',
    bg: 'bg-d-violet-secondary',
  },
];

export const PracticeBySections = () => {
  const { t, tCommon } = useCustomTranslations('profile.practiceList');

  return (
    <section className='rounded-[16rem] bg-white p-[24rem]'>
      <h2 className='mb-[24rem] text-[20rem] font-medium leading-tight'>{t('title')}</h2>
      <p className='mb-[32rem] font-poppins text-[14rem] leading-tight'>{t('subtitle')}</p>

      <div className='flex flex-col gap-y-[16rem]'>
        {list.map((item, i) => (
          <Link key={i} href={item.link} className='flex items-center'>
            <div className={`mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] ${item.bg}`}>
              <img src={item.icon} className='size-[24rem]' alt='icon' />
            </div>
            <div className='text-[14rem] font-medium'>{tCommon(item.text)}</div>
            <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
          </Link>
        ))}
      </div>
    </section>
  );
};
