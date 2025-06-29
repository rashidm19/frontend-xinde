'use client';

import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useState } from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function Page() {
  const { t, tImgAlts, tCommon, tCommonRich, tActions, tMessages } = useCustomTranslations('practice.listening.rules');

  const [accepted, setAccepted] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!accepted) {
      e.preventDefault();
      alert(tMessages('acceptUserAgreement'));
    }
  };

  return (
    <>
      <main className='min-h-screen overflow-hidden bg-d-light-gray'>
        <div className='container relative min-h-[100dvh] max-w-[1440rem] px-[270rem] py-[80rem]'>
          <img
            src='/images/illustration_bread.png'
            alt={tImgAlts('bread')}
            className='absolute right-[81rem] top-[67rem] h-auto w-[238rem] opacity-60 mix-blend-multiply'
          />
          <img
            alt={tImgAlts('abstract')}
            src='/images/illustration_abstract.png'
            className='absolute left-[-11rem] top-[738rem] h-auto w-[303rem] opacity-60 mix-blend-multiply'
          />

          <div className='relative flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-primary'>
            {/* // * Cancel practice  */}
            <Link href='/practice' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
              <img src='/images/icon_cross.svg' alt={tImgAlts('close')} className='size-[20rem]' />
            </Link>
            {/* // * Header */}
            <header className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[52rem] items-center justify-center bg-d-mint'>
                <img src='/images/icon_listeningSection.svg' className='size-[24rem]' alt={tImgAlts('listening')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('listening')}</div>
                <div className='text-[20rem] font-medium leading-none'>{tCommon('minCount', { count: 30 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[20rem] font-medium leading-none'>4</div>
              </div>
            </header>

            {/* // * Rules */}
            <section>
              <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>{t('title')}</h1>
              <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
                {t.rich('text', {
                  br: () => <br />,
                })}
              </p>
              <h2 className='mb-[32rem] text-[32rem] font-medium leading-none'>{tCommon('marking')}</h2>
              <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>{t('marking')}</p>

              <label className='mb-[56rem] flex select-none items-center gap-x-[12rem]'>
                <Checkbox className='size-[20rem]' checked={accepted} onCheckedChange={newCheckedState => setAccepted(!!newCheckedState)} />
                <div className='text-[16rem] font-medium leading-none'>
                  {tCommonRich('acceptUserAgreement', {
                    link: (chunks: any) => (
                      <Link href='/user-agreement' className='border-b border-d-black'>
                        {chunks}
                      </Link>
                    ),
                  })}
                </div>
              </label>

              <Link
                onClick={handleClick}
                href={accepted ? '/practice/listening/audio-check' : '#'}
                className={`mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] text-[20rem] font-semibold ${accepted ? 'cursor-pointer bg-d-green hover:bg-d-green/40' : 'pointer-events-none cursor-not-allowed bg-d-gray opacity-50'}`}
              >
                {tActions('continue')}
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
