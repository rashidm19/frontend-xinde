import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import React from 'react';

export const Achievments = () => {
  return (
    <section>
      <div className='relative overflow-hidden rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        {/* // * Title & Full litst btn */}
        <div className='mb-[10rem] flex items-center justify-between'>
          <h2 className='text-[20rem] font-medium leading-normal'>Achievements</h2>
          <button type='button' className='flex h-[30rem] items-center gap-x-[4rem] px-[16rem] disabled:cursor-not-allowed' disabled>
            <span className='text-[14rem] font-medium leading-normal text-d-black/80'>View full list</span>
            <img src='/images/icon_chevron--down.svg' className='size-[14rem]' alt='icon' />
          </button>
        </div>
        {/* <div className='flex flex-col gap-y-[23rem]'>
          <div className='relative flex max-w-[90%] items-center gap-x-[12rem]'>
            <div className='flex h-[64rem] w-[64rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-green-secondary'>
              <img src='/images/icon_profile--spiral.png' className='size-[40rem]' alt='Listening' />
            </div>

            <div className='flex w-full shrink-0 flex-col gap-y-[10rem] text-d-black'>
              <div className='flex items-center justify-between'>
                <div className='text-[20rem] font-medium leading-none tracking-[-0.2rem]'>Listening</div>
                <div className='text-[14rem] font-semibold leading-none tracking-[-0.2rem]'>{2}/10</div>
              </div>
              <Progress value={23} backgroundColor={'#F4F4F4'} barColor={'#ECFFC3'} />
              <div className='text-[14rem] leading-none tracking-[-0.2rem]'>Keep going!</div>
            </div>
          </div>

          <div className='relative flex max-w-[90%] items-center gap-x-[12rem]'>
            <div className='flex h-[64rem] w-[64rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-green-secondary'>
              <img src='/images/icon_profile--spikes.png' className='size-[40rem]' alt='Reading' />
            </div>

            <div className='flex w-full shrink-0 flex-col gap-y-[10rem] text-d-black'>
              <div className='flex items-center justify-between'>
                <div className='text-[20rem] font-medium leading-none tracking-[-0.2rem]'>Reading</div>
                <div className='text-[14rem] font-semibold leading-none tracking-[-0.2rem]'>{2}/10</div>
              </div>
              <Progress value={23} backgroundColor={'#F4F4F4'} barColor={'#ECFFC3'} />
              <div className='text-[14rem] leading-none tracking-[-0.2rem]'>Keep going!</div>
            </div>
          </div>

          <div className='relative flex max-w-[90%] items-center gap-x-[12rem]'>
            <div className='flex h-[64rem] w-[64rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-green-secondary'>
              <img src='/images/icon_profile--sphere.png' className='size-[40rem]' alt='Writing' />
            </div>

            <div className='flex w-full shrink-0 flex-col gap-y-[10rem] text-d-black'>
              <div className='flex items-center justify-between'>
                <div className='text-[20rem] font-medium leading-none tracking-[-0.2rem]'>Writing</div>
                <div className='text-[14rem] font-semibold leading-none tracking-[-0.2rem]'>{2}/10</div>
              </div>
              <Progress value={23} backgroundColor={'#F4F4F4'} barColor={'#ECFFC3'} />
              <div className='text-[14rem] leading-none tracking-[-0.2rem]'>Keep going!</div>
            </div>
          </div>

          <div className='relative flex max-w-[90%] items-center gap-x-[12rem]'>
            <div className='flex h-[64rem] w-[64rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-green-secondary'>
              <img src='/images/icon_profile--flower.png' className='size-[40rem]' alt='Speaking' />
            </div>

            <div className='flex w-full shrink-0 flex-col gap-y-[10rem] text-d-black'>
              <div className='flex items-center justify-between'>
                <div className='text-[20rem] font-medium leading-none tracking-[-0.2rem]'>Speaking</div>
                <div className='text-[14rem] font-semibold leading-none tracking-[-0.2rem]'>{2}/10</div>
              </div>
              <Progress value={23} backgroundColor={'#F4F4F4'} barColor={'#ECFFC3'} />
              <div className='text-[14rem] leading-none tracking-[-0.2rem]'>Keep going!</div>
            </div>
          </div>
        </div> */}
        {/* // * Empty state */}
        <div className='mb-[140rem] mt-[110rem] flex w-full flex-col items-center gap-y-[24rem]'>
          <div className='font-poppins text-[14rem]'>You don’t have any achievements yet</div>
          <Link href='/mock' className='flex h-[50rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-light-gray px-[24rem] hover:bg-d-green/40'>
            <span className='text-[14rem] font-semibold'>Complete MOCK</span>
          </Link>
        </div>
        <img src='/images/illustration_flower3.png' className='pointer-events-none absolute bottom-0 right-0 h-auto w-[462rem] mix-blend-luminosity' alt='illustration' />
      </div>
    </section>
  );
};
