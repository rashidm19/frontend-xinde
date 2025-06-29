import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const BestSectionsResults = () => {
  const { t, tActions } = useCustomTranslations('profile.bestSectionsResults');

  return (
    <div className='mr-[140rem] w-[290rem]'>
      <h2 className='mb-[24rem] text-[20rem] font-medium leading-tight'>{t('title')}</h2>
      <p className='mb-[46rem] font-poppins text-[14rem] leading-tight'>{t('subtitle')}</p>
      <Link href='/mock' className='flex h-[50rem] items-center rounded-full bg-d-green px-[85rem] text-[14rem] font-semibold hover:bg-d-green/40'>
        {tActions('completeMOCK')}
      </Link>
    </div>
  );
};
