"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function NotFound() {
  const { t, tImgAlts, tActions } = useCustomTranslations('notFound');
  const router = useRouter();

  return (
    <div className='relative flex h-[100vh] w-full flex-col justify-center overflow-hidden px-[20rem] text-center items-center desktop:items-start desktop:pl-[120rem] desktop:text-left'>
      {/* Content */}
      <div className='relative z-40 flex flex-col items-center w-full desktop:w-auto desktop:items-start'>
        <h2 className='mb-[16rem] font-poppins text-[56rem] font-semibold leading-normal -tracking-[0.2rem] desktop:mb-[32rem]'>
          {t('title')}
        </h2>
        
        {/* Error Code */}
        <p className='mb-[12rem] text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>
            {t('error')}
        </p>

        {/* Subtitle */}
        <p className='text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>
          {t.rich('subtitle', {
            br: () => <br />,
          })}
        </p>

        {/* Actions */}
        <div className='mt-[48rem] flex flex-col gap-[20rem] w-full items-center desktop:items-start'>
            {/* Go to home */}
            <Link
                href='/'
                className='flex h-[65rem] w-full max-w-[393rem] items-center justify-center rounded-[32rem] bg-d-black text-[24rem] font-medium leading-[29rem] -tracking-[0.2rem] text-white hover:bg-d-black/80'
            >
                {tActions('goToHome')}
            </Link>

            {/* Go back */}
            <button
                onClick={() => router.back()}
                className='flex h-[65rem] w-full max-w-[393rem] items-center justify-center rounded-[32rem] bg-white text-[24rem] font-medium leading-[29rem] -tracking-[0.2rem] text-d-black hover:bg-white/40'
            >
                {tActions('back')}
            </button>
        </div>
      </div>

      {/* Illustration */}
      <div className='pointer-events-none absolute -right-[230rem] bottom-[45rem] hidden aspect-[1380/1122] w-[789rem] desktop:block'>
        <Image fill src='/images/illustration_404.png' alt={tImgAlts('illustrationSphere')} className='object-cover' />
      </div>
    </div>
  );
}
