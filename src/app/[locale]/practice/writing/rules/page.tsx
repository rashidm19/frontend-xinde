import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function Page() {
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('practice.writing.rules');

  return (
    <main className='realtive min-h-screen bg-d-blue-secondary'>
      <img src='/images/illustration_torusArray--02.png' className='absolute bottom-0 left-0 h-auto w-[320rem] opacity-80' alt={tImgAlts('flower')} />
      <img src='/images/illustration_molecule.png' className='absolute right-0 top-0 h-auto w-[250rem] opacity-50' alt={tImgAlts('molecule')} />
      <div className='d container max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <div className='shadow-car flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem]'>
          {/* // * Header */}
          <div className='flex items-center gap-x-[12rem]'>
            <div className='flex size-[52rem] items-center justify-center bg-d-blue-secondary'>
              <img src='/images/icon_writingSection.svg' className='size-[24rem]' alt={tImgAlts('writing')} />
            </div>
            <div className='flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('writing')}</div>
              <div className='text-[20rem] font-medium leading-none'>{tCommon('minCount', { count: 60 })}</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
              <div className='text-[20rem] font-medium leading-none'>2</div>
            </div>
          </div>
          {/* // * Selection */}
          <div>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>{t('title')}</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>{t('text')}</p>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>{tCommon('marking')}</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>{t('marking')}</p>
            <Link
              href='/practice/writing/test'
              className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
            >
              {tActions('continue')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
