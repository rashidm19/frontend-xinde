import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function UserAgreement() {
  const { t, tActions } = useCustomTranslations('userAgreement');

  return (
    <main>
      <section className='relative flex min-h-[1024rem] items-center'>
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <Link
            href='/public'
            className='absolute left-[40rem] top-[80rem] flex h-[64rem] w-[150rem] items-center justify-center gap-x-[14rem] rounded-[40rem] bg-white hover:bg-white/70'
          >
            <img src='/images/icon_chevron--back.svg' alt={t('back')} />
            <span className='text-[20rem] font-normal leading-[26rem]'>
              {tActions('back')}
            </span>
          </Link>

          <div className='flex h-fit w-[902rem] flex-col rounded-[24rem] bg-white p-[64rem] shadow-card'>
            <h1 className='mx-auto mb-[24rem] text-center text-[32rem] font-normal leading-[26rem]'>
              {t('userAgreement')}
            </h1>

            <p className='mb-[48rem] text-center text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
              {t('effectiveDate')}
            </p>

            {/* Section 1 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section1Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t('section1Content')}
              </p>
            </div>

            {/* Section 2 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section2Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t.rich('section2Content', { br: () => <br /> })}
              </p>
            </div>

            {/* Section 3 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section3Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t('section3Content')}
              </p>
            </div>

            {/* Section 4 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section4Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] mb-[12rem]'>
                {t('section4Content1')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t('section4Content2')}
              </p>
            </div>

            {/* Section 5 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section5Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t('section5Content')}
              </p>
            </div>

            {/* Section 6 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section6Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t.rich('section6Content', { br: () => <br /> })}
              </p>
            </div>

            {/* Section 7 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section7Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t('section7Content')}
              </p>
            </div>

            {/* Section 8 */}
            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>
                {t('section8Title')}
              </p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                {t('section8Content')}
              </p>
            </div>

            <Link href='/login' className='mx-auto flex h-[65rem] w-[280rem] items-center justify-center gap-x-[24rem] rounded-[40rem] bg-d-light-gray hover:bg-d-gray'>
              <span className='text-[20rem] font-normal leading-[26rem]'>
                {tActions('back')}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}