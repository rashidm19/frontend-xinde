'use client';

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import React, { useEffect, useState } from 'react';

export const DreamUniversity = () => {
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
      <div className='container px-[20rem] py-[40rem] tablet:max-w-[1024rem] tablet:px-[56rem] tablet:py-[80rem] desktop:max-w-[1440rem] desktop:px-[134rem] desktop:py-[120rem] wide:max-w-[1920rem] wide:px-[200rem]'>
        <h2
          data-aos='fade-up'
          data-aos-duratoin='300'
          className='mb-[16rem] font-poppins text-[40rem] font-semibold leading-none tracking-[-2%] tablet:mb-[24rem] tablet:text-[80rem] wide:mb-[32rem] wide:text-[120rem]'
        >
          Your dream university awaits
        </h2>
        <p data-aos='fade-up' data-aos-duratoin='300' className='mb-[32rem] text-[16rem] font-medium leading-tight text-d-black/80 tablet:mb-[40rem] tablet:text-[32rem]'>
          Unleash your potential with us
        </p>

        <div className='grid grid-cols-2 gap-x-[12rem] gap-y-[8rem] tablet:grid-cols-3 tablet:gap-[20rem]'>
          {/* // * blue  cube  */}
          <figure
            data-aos='zoom-out-up'
            data-aos-duration='500'
            className='relative h-[158rem] overflow-hidden rounded-[24rem] bg-d-blue p-[24rem] tablet:size-[290rem] tablet:p-[40rem] desktop:size-[376rem] wide:size-[493rem]'
          >
            <img
              src='/images/illustration_spunge.png'
              className='absolute bottom-[-35rem] right-[-20] h-auto w-[175rem] rotate-[24deg] mix-blend-soft-light tablet:bottom-[-86rem] tablet:right-[-56rem] tablet:w-[239rem] tablet:rotate-1 desktop:bottom-[-63rem] desktop:right-[-58rem] wide:bottom-[-64rem] wide:right-[-30rem] wide:w-[280rem]'
              alt='illustration'
            />
            <div className='mb-[16rem] flex items-start font-poppins text-[40rem] font-semibold leading-none text-white tablet:text-[80rem] wide:text-[120rem]'>
              <span>1</span>
              <span className='text-[24rem] tablet:text-[48rem] wide:text-[72rem]'>st</span>
            </div>
            <div className='text-[16rem] font-medium leading-tight text-white/80 tablet:text-[24rem] wide:text-[32rem]'>
              company in
              <br /> the CIS market
            </div>
          </figure>
          {/* // * violet cube */}
          <figure
            data-aos='zoom-out-right'
            data-aos-duration='500'
            className='relative h-[158rem] overflow-hidden rounded-[24rem] bg-d-violet p-[24rem] tablet:size-[290rem] tablet:p-[40rem] desktop:row-start-2 desktop:size-[376rem] wide:size-[493rem]'
          >
            <img
              src='/images/illustration_star.png'
              className='absolute bottom-[-46rem] right-[-35rem] h-auto w-[155rem] rotate-[14deg] opacity-60 mix-blend-soft-light tablet:bottom-[-83rem] tablet:right-[-48rem] tablet:w-[210rem] tablet:rotate-0 desktop:bottom-[-47rem] desktop:right-[-24rem] wide:bottom-[-75rem] wide:right-[-43rem] wide:w-[289rem]'
              alt='illustration'
            />
            <div className='mb-[16rem] flex items-start font-poppins text-[40rem] font-semibold leading-none text-white tablet:text-[80rem] wide:text-[120rem]'>8.5</div>
            <div className='text-[16rem] font-medium leading-tight text-white/80 tablet:text-[24rem] wide:text-[32rem]'>
              average final
              <br /> exam score{' '}
            </div>
          </figure>
          {/* // * gray furry */}
          <figure
            data-aos='zoom-out-left'
            data-aos-duration='500'
            className='relative col-span-2 h-[158rem] rounded-[24rem] bg-d-black p-[24rem] tablet:col-span-1 tablet:row-span-2 tablet:h-auto tablet:overflow-hidden tablet:p-[40rem] desktop:col-start-3'
          >
            <img
              src='/images/illustration_hairycurl.png'
              className='absolute bottom-[7rem] right-[29rem] h-auto w-[131rem] max-w-none rotate-[3deg] opacity-80 mix-blend-luminosity tablet:bottom-[38rem] tablet:right-[-99rem] tablet:w-[343rem] tablet:rotate-[1deg] desktop:bottom-[-11rem] desktop:right-[-71rem] desktop:w-[385rem] wide:bottom-[-51rem] wide:right-[-93rem] wide:w-[506rem]'
              alt='illustration'
            />
            <div className='mb-[16rem] flex items-start font-poppins text-[40rem] font-semibold leading-none text-white tablet:text-[80rem] wide:text-[120rem]'>91%</div>
            <div className='text-[16rem] font-medium leading-tight text-white/80 tablet:text-[24rem] wide:text-[32rem]'>approval rate</div>
          </figure>
          {/* // * reviews */}
          <div
            data-aos='zoom-out-down'
            data-aos-duration='500'
            className='col-span-2 rounded-[24rem] bg-white p-[24rem] tablet:col-span-2 tablet:h-[466rem] tablet:rounded-[40rem] tablet:p-[40rem] desktop:col-span-1 desktop:col-start-2 desktop:row-span-2 desktop:row-start-1 desktop:h-auto'
          >
            <Carousel setApi={setApi}>
              <CarouselContent>
                {[1, 2].map(() => (
                  <CarouselItem>
                    <div className='mb-[24rem] pr-[14rem] text-[16rem] font-medium leading-tight tracking-[-0.2rem] text-d-black/80 tablet:mb-[70rem] tablet:pr-[100rem] tablet:text-[24rem] desktop:mb-0 desktop:h-[575rem] desktop:pr-0 wide:h-[810rem] wide:text-[32rem]'>
                      “Thanks to this platform, I've seen a <span className='font-semibold text-d-violet'>significant improvement in my skills</span>, and I'm actually
                      having fun while preparing for the IELTS exam. Highly recommend it to anyone looking for a{' '}
                      <span className='font-semibold text-d-violet'>stress-free and effective way to achieve their IELTS goals!</span>”
                    </div>
                    <div className='flex items-center gap-x-[10rem]'>
                      <img src='/images/photo_review--01.png' className='size-[40rem] rounded-full tablet:size-[56rem] wide:size-[64rem]' alt='photo' />
                      <div className='flex flex-col gap-y-[8rem] tablet:gap-y-[12rem] wide:gap-y-[14rem]'>
                        <div className='text-[14rem] font-medium leading-none tablet:text-[24rem] wide:text-[32rem]'>Isabella Johnson</div>
                        <div className='text-[14rem] font-medium leading-none text-d-black/80 tablet:text-[24rem] wide:text-[32rem]'>Stanford University</div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className='mx-auto mt-[24rem] flex justify-center gap-x-[6rem] tablet:mt-[40rem] tablet:gap-x-[8rem]'>
                {[1, 2].map((_, index: number) => (
                  <div key={index} className={`size-[12rem] rounded-full tablet:size-[16rem] ${current === index + 1 ? 'bg-d-black' : 'bg-[#D9D9D9]'}`} />
                ))}
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};
