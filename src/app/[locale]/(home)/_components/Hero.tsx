'use client';

import { AnimatedHorseshoeProgressBar } from './AnimatedHorseshoeProgressBar';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const Hero = () => {
  const { t } = useCustomTranslations('home');

  const [showFirstScore, setShowFirstScore] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowFirstScore(prev => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <section>
      <div className='container relative flex flex-col items-center overflow-hidden p-[20rem] py-[40rem] tablet:max-w-[1024rem] tablet:overflow-visible tablet:px-[56rem] tablet:pb-[80rem] tablet:pt-[60rem] desktop:max-w-[1440rem] desktop:px-[134rem] desktop:pb-[120rem] desktop:pt-[40rem] wide:max-w-[1920rem] wide:px-[200rem] wide:pt-[120rem]'>
        <div className='pointer-events-none absolute -left-[28rem] top-[204rem] z-[100] aspect-[637/786] w-[77rem] animate-float-1 tablet:left-[60em] tablet:top-[140rem] tablet:w-[135rem] desktop:left-[230rem] desktop:top-[130rem] desktop:w-[170rem] wide:left-[227rem] wide:top-[220rem] wide:w-[220rem]'>
          <Image fill alt={t('common.illustration')} src='/images/illustration_hero--01.png' className='object-cover' />
        </div>
        <div className='pointer-events-none absolute -right-[28rem] top-[26rem] z-[100] aspect-[510/510] w-[77rem] animate-float-2 tablet:right-[73rem] tablet:top-[44rem] tablet:w-[110rem] desktop:right-[260rem] desktop:w-[130rem] wide:right-[280rem] wide:top-[100rem] wide:w-[170rem]'>
          <Image fill alt={t('common.illustration')} src='/images/illustration_hero--02.png' className='object-cover' />
        </div>
        <div className='pointer-events-none absolute -right-[28rem] top-[317rem] z-[100] aspect-[776/759] w-[108rem] animate-float-3 tablet:right-[100rem] tablet:top-[364rem] tablet:w-[156rem] desktop:right-[237rem] desktop:top-[330rem] desktop:w-[224rem] wide:right-[350rem] wide:top-[540rem] wide:w-[266rem]'>
          <Image fill alt={t('common.illustration')} src='/images/illustration_hero--03.png' className='object-cover' />
        </div>

        {/* //* Tag */}
        <figure className='mb-[24rem] flex items-center justify-center gap-x-[4rem] rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] px-[16rem] py-[8rem] tablet:px-[20rem] wide:right-[350rem] wide:px-[24rem] wide:py-[12rem]'>
          <img src='/images/icon_stars--white.svg' alt={t('common.illustration')} className='size-[16rem] tablet:size-[20rem] wide:size-[22rem]' />
          <div className='text-nowrap text-[12rem] leading-tight text-white tablet:text-[14rem] wide:text-[20rem]'>Powered by AI</div>
        </figure>
        {/* //* h1 */}
        <h1 className='mb-[24rem] text-center font-poppins text-[40rem] font-semibold leading-none tablet:mb-[10rem] tablet:text-[80rem] desktop:mb-[20rem] wide:mb-[32rem] wide:text-[120rem]'>
          {t.rich('hero.studySmarter', { br: () => <br /> })}
        </h1>
        <h2 className='mb-[32rem] px-[20rem] text-center text-[16rem] font-medium leading-tight tablet:mb-[40rem] tablet:px-[30rem] tablet:text-[24rem] wide:mb-[40rem] wide:text-[30rem]'>
          {t.rich('hero.startJourney', { br: () => <br /> })}
        </h2>
        {/* // * Auth button */}
        <Link
          href='/registration'
          className='mb-[64rem] flex items-center justify-center gap-x-[8rem] rounded-full bg-[#C9FF55] px-[32rem] py-[16rem] text-[16rem] font-medium leading-none hover:bg-[#C9FF55]/40 tablet:mb-[72rem] tablet:px-[48rem] tablet:py-[20rem] tablet:text-[24rem] desktop:mb-[80rem] wide:mb-[120rem] wide:px-[56rem] wide:py-[24rem] wide:text-[32rem]'
        >
          {t('actions.tryForFree')}
          <img src='/images/icon_arrow--right.svg' alt={t('common.arrowRight')} className='size-[20rem] tablet:size-[22rem] wide:size-[24rem]' />
        </Link>
        {/* // * Features Cards */}
        <div id='about' className='grid w-full grid-cols-1 gap-y-[16rem] tablet:grid-cols-2 tablet:gap-x-[20rem] tablet:gap-y-[20rem]'>
          <article
            data-aos='fade-up'
            className='card-shadow rounded-[24rem] bg-white p-[24rem] tablet:col-span-2 tablet:flex tablet:justify-between tablet:pb-0 tablet:pl-[40rem] tablet:pr-[32rem] tablet:pt-[32rem] desktop:rounded-[40rem]'
          >
            <div className='mb-[24rem] flex flex-col gap-y-[4rem] tablet:mb-0 tablet:w-[252rem] tablet:gap-y-[16rem] desktop:w-[338rem] wide:w-[450rem]'>
              <h3 className='font-poppins text-[24rem] font-medium leading-tight tablet:text-[32rem] wide:text-[40rem]'>{t('hero.smartLearningWithAI')}</h3>
              <p className='text-[14rem] font-medium leading-normal wide:text-[20rem]'>
                {t.rich('hero.getReadyText', {
                  span: chunks => <span className='hidden tablet:block'>{chunks}</span>,
                })}
              </p>
            </div>
            <div className='relative flex h-[240rem] w-full flex-col items-center justify-end overflow-hidden rounded-[24rem] bg-[#FCFDC1] tablet:h-[388rem] tablet:w-[526rem] tablet:shrink-0 tablet:rounded-b-none desktop:w-[698rem] wide:h-[544rem] wide:w-[934rem]'>
              <div className='absolute left-0 top-0 aspect-[1017/621] w-[325rem] wide:w-[700rem]'>
                <Image src='/images/icon__yellow-spikes.png' alt={t('common.mockTest')} fill quality={100} className='object-cover' />
              </div>

              <div data-aos='slide-up' data-aos-duration='500' data-aos-delay='50' className='relative aspect-[638/441] w-[240rem] tablet:w-[325rem] wide:w-[500rem]'>
                <Image src='/images/img_feedback.png' alt={t('common.feedback')} fill quality={100} className='object-cover' />
              </div>
            </div>
          </article>
          <article
            data-aos='fade-right'
            className='card-shadow relative rounded-[24rem] bg-d-violet p-[24rem] tablet:flex tablet:h-[478rem] tablet:flex-col tablet:justify-between tablet:px-[20rem] tablet:pb-0 tablet:pt-[40rem] desktop:h-[420rem] desktop:rounded-[40rem] wide:h-[576rem] wide:pt-[32rem]'
          >
            <img
              alt={t('common.worm')}
              src='/images/illustration_worm.png'
              className='pointer-events-none absolute right-0 top-0 h-auto w-[103rem] mix-blend-soft-light tablet:w-[166rem] wide:w-[200rem]'
            />
            <div className='mb-[24rem] flex flex-col gap-y-[4rem] pr-[34rem] tablet:mb-0 tablet:w-[374rem] tablet:pl-[20rem] tablet:pr-0 desktop:w-[398rem] wide:w-[474rem]'>
              <h3 className='font-poppins text-[24rem] font-medium leading-tight text-white tablet:text-[32rem] wide:text-[40rem]'>
                {t.rich('hero.unlimitedMockTests', {
                  br: () => <br className='hidden tablet:block desktop:hidden' />,
                })}
              </h3>
              <p className='text-[14rem] font-medium leading-normal text-white/80 wide:text-[20rem]'>{t('hero.unlimitedMockText')}</p>
            </div>
            <div className='flex h-[240rem] w-full items-center justify-center rounded-[24rem] bg-[#EAEAEA]/10 p-[16rem] tablet:h-[232rem] tablet:items-end tablet:rounded-b-none tablet:pb-0 wide:h-[308rem]'>
              <div className='relative flex w-[422rem] items-center justify-center rounded-[24rem] rounded-tl-[24rem] rounded-tr-[24rem] bg-white pb-[20rem] pt-[28rem] tablet:w-[340rem] tablet:rounded-bl-[0] tablet:rounded-br-[0] tablet:pt-[24rem] desktop:h-[200rem] desktop:w-[480rem] desktop:justify-between wide:h-[250rem] wide:w-[600rem] wide:px-[40rem]'>
                <div className='flex h-[150rem] flex-col items-center gap-y-[16rem] tablet:-mb-[20rem] desktop:-mb-[18rem] desktop:h-auto'>
                  <h2 className='text-[14rem] leading-tight wide:text-[22rem]'>{t('hero.bestMockScore')}</h2>
                  <AnimatedHorseshoeProgressBar
                    startValue={3}
                    endValue={7}
                    maxValue={9}
                    width={220}
                    height={140}
                    strokeWidth={14.5}
                    circleColor='#F4F4F4'
                    progressGradient={{
                      startColor: '#22BFEB',
                      endColor: '#A1DFF0',
                    }}
                    textColor='#383838'
                    no_results_text='test your skills'
                    isAnimating={!showFirstScore}
                    duration={1000}
                  />
                </div>

                <div className='hidden flex-col items-center gap-y-[16rem] desktop:-mb-[18rem] desktop:flex'>
                  <h2 className='text-[14rem] leading-tight wide:text-[22rem]'>{t('hero.IELTSTargetAssessment')}</h2>
                  <AnimatedHorseshoeProgressBar
                    startValue={5.5}
                    endValue={9}
                    maxValue={9}
                    width={220}
                    height={140}
                    strokeWidth={14.5}
                    circleColor='#F4F4F4'
                    progressGradient={{
                      startColor: '#636AFB',
                      endColor: '#B9BDF7',
                    }}
                    textColor='#383838'
                    no_results_text='test your skills'
                    isAnimating={!showFirstScore}
                    duration={1000}
                  />
                </div>
              </div>
            </div>
          </article>

          <article
            data-aos='fade-left'
            className='card-shadow relative overflow-hidden rounded-[24rem] bg-d-blue p-[24rem] tablet:flex tablet:h-[478rem] tablet:flex-col tablet:justify-between tablet:px-[20rem] tablet:pb-0 tablet:pt-[40rem] desktop:h-[420rem] desktop:rounded-[40rem] wide:h-[576rem] wide:pt-[32rem]'
          >
            <img
              alt={t('common.flower')}
              src='/images/illustration_flower.png'
              className='absolute right-0 top-0 h-auto w-[116rem] mix-blend-soft-light tablet:w-[153rem] desktop:w-[189rem] wide:w-[221rem]'
            />
            <div className='mb-[24rem] flex flex-col gap-y-[4rem] tablet:mb-0 tablet:w-[374rem] tablet:pl-[20rem] desktop:w-[448rem] wide:w-[474rem]'>
              <h3 className='font-poppins text-[24rem] font-medium leading-tight text-white tablet:text-[32rem] wide:text-[40rem]'>
                {t.rich('hero.practiceBySection', {
                  br: () => <br className='hidden tablet:block desktop:hidden' />,
                })}
              </h3>
              <p className='text-[14rem] font-medium leading-normal text-white/80 wide:text-[20rem]'>
                {t('hero.practiceBySectionText')}
              </p>
            </div>

            <div className='flex h-[240rem] w-full items-center overflow-hidden rounded-[24rem] bg-[#EAEAEA]/10 tablet:h-[232rem] tablet:rounded-b-none desktop:h-[212rem] wide:h-[308rem]'>
              <div className='flex animate-scroll gap-x-[16rem]'>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.reading')}
                </div>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.listening')}
                </div>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.writing')}
                </div>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.speaking')}
                </div>
                {/* Duplicate pills for seamless loop */}
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.reading')}
                </div>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.listening')}
                </div>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.writing')}
                </div>
                <div className='flex h-[90rem] min-w-max items-center justify-center rounded-[80rem] bg-white px-[138rem] text-[40rem] font-semibold leading-[42rem] text-d-black'>
                  {t('common.speaking')}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
