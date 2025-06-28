import Image from 'next/image';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default async function Error500() {
  const { t, tImgAlts, tActions } = useCustomTranslations('error500');

  return (
    <div className='overrflow-visible relative flex h-[100vh] flex-col items-start justify-center pl-[120rem]'>
      <div className='relative z-40'>
        <h2 className='mb-[32rem] font-poppins text-[56rem] font-semibold leading-normal -tracking-[0.2rem]'>{t('title')}</h2>
        <p className='mb-[12rem] text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>{t('error')}</p>
        <p className='mb-[32rem] text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>
          {t.rich('text', {
            br: () => <br />,
          })}
        </p>
        <a
          href='/public'
          className='flex h-[65rem] w-[393rem] items-center justify-center rounded-[32rem] bg-white text-[24rem] font-medium leading-[29rem] -tracking-[0.2rem] text-d-black hover:bg-white/40'
        >
          {tActions('backToHomepage')}
        </a>
      </div>
      <div className='absolute -bottom-[10rem] -right-[260rem] aspect-[1376/1316] w-[989rem] -rotate-[10deg]'>
        <Image fill src='/images/illustration_500.png' alt={tImgAlts('chain')} className='object-cover' />
      </div>
    </div>
  );
}
