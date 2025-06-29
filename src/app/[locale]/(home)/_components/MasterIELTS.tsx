import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const MasterIELTS = () => {
  const { t } = useCustomTranslations('home');

  return (
    <section className='relative bg-d-violet'>
      <img
        alt='molecule'
        src='/images/illustration_molecule.png'
        className='pointer-events-none absolute right-0 top-[7rem] h-auto w-[239rem] mix-blend-soft-light tablet:hidden'
      />
      <img
        data-aos='fade-down-left'
        data-aos-duration={500}
        src='/images/illustration_molecule--03.png'
        className='pointer-events-none absolute right-0 top-0 hidden h-auto mix-blend-soft-light tablet:block tablet:w-[191rem] desktop:w-[356rem]'
        alt='illustration'
      />
      <img
        data-aos='fade-up-right'
        data-aos-duration={500}
        src='/images/illustration_torusArray--03.png'
        className='pointer-events-none absolute bottom-[17rem] left-0 hidden h-auto mix-blend-soft-light tablet:block tablet:w-[210rem] desktop:w-[305rem] wide:w-[350rem]'
        alt='illustration'
      />
      <img
        data-aos='fade-down'
        data-aos-duration={500}
        data-aos-delay={500}
        src='/images/illustration_reveal--01.png'
        className='pointer-events-none absolute left-[40rem] top-[40rem] hidden h-auto tablet:block tablet:w-[280rem] desktop:left-[64rem] desktop:top-[64rem] desktop:w-[335rem] wide:left-[80rem] wide:top-[80rem] wide:w-[400rem]'
        alt='illustration'
      />
      <img
        data-aos='fade-up'
        data-aos-duration={500}
        data-aos-delay={500}
        src='/images/illustration_reveal--02.png'
        className='pointer-events-none absolute bottom-0 right-[40rem] hidden h-auto tablet:block tablet:w-[320rem] desktop:right-[64rem] desktop:w-[356rem] wide:right-[80rem] wide:w-[400rem]'
        alt='illustration'
      />

      <div className='container relative z-10 flex flex-col items-center px-[20rem] py-[80rem] tablet:max-w-full tablet:justify-center tablet:py-[240rem] wide:py-[348rem]'>
        <h2
          data-aos='fade-down'
          data-aos-duration='500'
          className='text-poppins mb-[24rem] text-center text-[40rem] font-semibold leading-none text-white tablet:mb-[8rem] tablet:text-[72rem] desktop:mb-[24rem] desktop:text-[80rem] wide:text-[120rem]'
        >
          {t('masterIELTS.title')}
        </h2>
        <p
          data-aos='fade-right'
          data-aos-duration='500'
          className='mb-[32rem] text-center text-[24rem] font-medium italic leading-tight text-white tablet:text-[32rem] desktop:mb-[40rem] wide:text-[40rem]'
        >
          {t('masterIELTS.subtitle')}
        </p>
        {/* // * Auth button */}
        <Link
          href='/registration'
          className='flex items-center justify-center gap-x-[8rem] rounded-full bg-[#C9FF55] px-[32rem] py-[16rem] text-[16rem] font-medium leading-tight hover:bg-[#C9FF55]/40 tablet:px-[48rem] tablet:py-[22rem] tablet:text-[24rem] wide:px-[56rem] wide:py-[24rem] wide:text-[32rem]'
        >
          {t('actions.joinForFreeNow')}
          <img src='/images/icon_arrow--right.svg' alt='arrow-right-icon' className='size-[20rem] tablet:size-[24rem] wide:size-[28rem]' />
        </Link>
      </div>
    </section>
  );
};
