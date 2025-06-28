import React from 'react';
import Image from 'next/image';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default async function Error500() {
  const { t, tImgAlts, tActions } = useCustomTranslations('error503');

  return (
    <div className='overrflow-visible relative flex h-[100vh] flex-col items-start justify-center pl-[120rem]'>
      <div className='relative z-40'>
        <h2 className='mb-[32rem] font-poppins text-[56rem] font-semibold leading-normal -tracking-[0.2rem]'>{t('title')}</h2>

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
      <div className='absolute -right-[0rem] bottom-[30rem] aspect-[1063/1452] w-[708rem] -rotate-[10deg]'>
        <Image fill src='/images/illustration_503.png' alt={tImgAlts('illustrationSphere')} className='object-cover' />
      </div>
    </div>
  );
}
