'use client';

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import { BestResults } from './BestResults';

export const Practice = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section>
      <div className='container relative flex flex-col overflow-hidden px-[20rem] py-[40rem] tablet:max-w-[1024rem] tablet:overflow-visible tablet:px-[56rem] tablet:py-[80rem] desktop:max-w-[1440rem] desktop:px-[134rem] desktop:py-[120rem] wide:max-w-[1920rem] wide:px-[200rem]'>
        <h2
          data-aos='fade-up'
          data-aos-duration='500'
          className='mb-[16rem] font-poppins text-[40rem] font-semibold leading-none tablet:mb-[24rem] tablet:text-[80rem] wide:mb-[30rem] wide:text-[120rem]'
        >
          Practice makes perfect
        </h2>
        <p
          data-aos='fade-up'
          data-aos-duration='500'
          className='mb-[32rem] w-[220rem] text-[16rem] font-medium leading-tight tablet:mb-[40rem] tablet:w-[535rem] tablet:text-[24rem] wide:mb-[50rem] wide:w-[750rem] wide:text-[32rem]'
        >
          Consistent practice breeds excellence, mastering IELTS with us isn't rocket science
        </p>
        <div className='absolute -right-[20rem] top-[115rem] aspect-[711/618] w-[85rem] tablet:right-[80rem] tablet:top-[95rem] tablet:w-[122rem] desktop:top-[125rem] desktop:w-[152rem] wide:top-[272rem] wide:w-[237rem]'>
          <Image fill alt='Illustration' src='/images/illustration_flower_full.png' className='object-cover' />
        </div>
        <div className='absolute -left-[20rem] top-[205rem] aspect-[865/1138] w-[175rem] tablet:top-[562rem] tablet:w-[349rem]'>
          <Image fill alt='Illustration' src='/images/illustration_coils.png' className='object-cover' />
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            breakpoints: {
              '(min-width: 1024px)': { active: false },
            },
          }}
        >
          <CarouselContent className='pl-[20rem] tablet:grid tablet:grid-cols-2 tablet:gap-y-[20rem] desktop:grid-cols-3' data-aos='fade-left' data-aos-duration='500'>
            <CarouselItem className='-ml-[9rem] h-[440rem]'>
              <div className='flex h-full flex-col justify-between rounded-[24rem] bg-white p-[24rem] shadow-card'>
                <div className='mb-[24rem] flex-col pr-[34rem]'>
                  <p className='mb-[16rem] flex size-[32rem] items-center justify-center rounded-full bg-[#383838]/30 font-poppins text-[16rem] font-semibold leading-none text-white'>
                    1
                  </p>
                  <h3 className='mb-[8rem] font-poppins text-[24rem] font-medium leading-none'>
                    Follow Your <br /> Personal Road <br />
                    Map
                  </h3>
                  <p className='text-[14rem] font-medium leading-normal'>
                    Having a personal study roadmap for IELTS preparation allows you to set clear goals, track progress, and tailor your study plan to your individual
                    strengths and weaknesses.
                  </p>
                </div>
                <div className='relative h-[140rem] w-full overflow-hidden rounded-[24rem] bg-[#F4F4F4] pb-[32rem] pl-[32rem] pt-[32rem]'>
                  <div className='animate-scrollY relative aspect-[2032/780] w-[430rem]'>
                    <Image src='/images/img__mock-results.png' alt='mock-test-icon' fill quality={100} className='rounded-[16rem] object-cover' />
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='flex h-full flex-col justify-between rounded-[24rem] bg-white p-[24rem] shadow-card'>
                <div className='mb-[24rem] flex-col pr-[34rem]'>
                  <p className='mb-[16rem] flex size-[32rem] items-center justify-center rounded-full bg-[#383838]/30 font-poppins text-[16rem] font-semibold leading-none text-white'>
                    2
                  </p>
                  <h3 className='mb-[8rem] font-poppins text-[24rem] font-medium leading-none'>Train on Up-To-Date Tasks</h3>
                  <p className='mb-[24rem] text-[14rem] font-medium leading-normal'>
                    By completing up-to-date tasks for the IELTS, you gain familiarity with current test formats and trends, offering a realistic preview of what to
                    expect on exam day.
                  </p>
                </div>
                <div className='relative flex h-[140rem] w-full flex-col gap-y-[12rem] overflow-hidden rounded-[24rem] bg-[#F4F4F4] px-[16rem] pb-[24rem] pt-[13rem]'>
                  <div className='flex flex-col gap-y-[10rem]'>
                    <div
                      data-aos='slide-left'
                      data-aos-duration='500'
                      className='w-[220rem] self-end rounded-[16rem] bg-d-violet px-[8rem] py-[8rem] text-[11rem] leading-[15rem] text-d-light-gray tablet:w-[270rem] tablet:rounded-[80rem] tablet:px-[20rem] tablet:text-[13rem] tablet:leading-[18rem] desktop:w-[280rem] desktop:text-[12rem]'
                    >
                      What are your thoughts on the use of artificial intelligence in everyday life?
                    </div>
                    <div
                      data-aos='slide-right'
                      data-aos-duration='500'
                      data-aos-delay='100'
                      className='w-[220rem] rounded-[16rem] bg-d-blue px-[8rem] py-[8rem] text-[11rem] leading-[15rem] text-d-light-gray tablet:w-[300rem] tablet:rounded-[80rem] tablet:px-[20rem] tablet:text-[13rem] tablet:leading-[18rem] desktop:w-[280rem] desktop:text-[12rem]'
                    >
                      Do you think automation will significantly change your job in the future?
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className='tablet:col-span-2 desktop:col-span-1'>
              <div className='flex h-full flex-col justify-between rounded-[24rem] bg-white p-[24rem] shadow-card'>
                <div className='mb-[24rem] flex-col pr-[34rem]'>
                  <p className='mb-[16rem] flex size-[32rem] items-center justify-center rounded-full bg-[#383838]/30 font-poppins text-[16rem] font-semibold leading-none text-white'>
                    3
                  </p>
                  <h3 className='mb-[8rem] font-poppins text-[24rem] font-medium leading-none'>Track Your Results</h3>
                  <p className='mb-[24rem] text-[14rem] font-medium leading-normal'>
                    Results tracking in IELTS practice enables you to monitor your progress, identify areas for improvement, and adjust your study strategies accordingly.
                  </p>
                </div>
                <div className='flex h-[140rem] w-full flex-col items-center justify-center overflow-hidden rounded-[24rem] bg-[#F4F4F4] p-[12rem] tablet:p-[24rem]'>
                  <BestResults />
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className='mx-auto mt-[24rem] flex justify-center gap-x-[6rem] tablet:hidden'>
            {[1, 2, 3].map((_, index: number) => (
              <div key={index} className={`size-[12rem] rounded-full ${current === index + 1 ? 'bg-d-black' : 'bg-[#D9D9D9]'}`} />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
};
