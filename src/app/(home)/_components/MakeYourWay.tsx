import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
export const MakeYourWay = () => {
  return (
    <section className='relative'>
      <div className='absolute -bottom-[30rem] -left-[6rem] -z-[10] aspect-[198/215] w-[139rem] tablet:-left-[60rem] tablet:-top-[80rem] tablet:bottom-auto tablet:w-[190rem] tablet:-rotate-[10deg] desktop:-top-[0rem] desktop:left-[0rem] desktop:w-[200rem] desktop:rotate-0 wide:-top-[300rem] wide:left-[0rem] wide:aspect-[360/536] wide:w-[360rem]'>
        <Image fill src='/images/illustration_hairycurl--tablet.png' alt='Illustration Blue Curl' quality={100} className='object-cover wide:hidden' />
        <Image fill src='/images/illustration_hairycurl--desktop.png' alt='Illustration Blue Curl' quality={100} className='hidden object-cover wide:block' />
      </div>
      <div className='container px-[20rem] py-[40rem] tablet:mx-auto tablet:max-w-none tablet:px-[56rem] tablet:py-[80rem] desktop:max-w-[1440rem] desktop:px-[134rem] desktop:py-[120rem] wide:max-w-[1920rem] wide:px-[202rem]'>
        <div className='relative mb-[8rem] flex w-full flex-col gap-y-[24rem] overflow-hidden rounded-[24rem] bg-d-blue p-[24rem] tablet:mb-[16rem] tablet:justify-between tablet:p-[40rem] desktop:h-[524rem] desktop:rounded-[40rem] wide:mb-[20rem] wide:h-[650rem]'>
          <h2
            data-aos='fade-down'
            data-aos-duration='500'
            className='font-poppins text-[40rem] font-semibold leading-[44rem] -tracking-[0.2rem] text-white tablet:mr-[155rem] tablet:text-[80rem] tablet:leading-[84rem] desktop:pr-[20rem] desktop:text-[80rem] desktop:leading-[84rem] wide:text-[120rem] wide:leading-[126rem]'
          >
            Make your way to the highest score effective and fun
          </h2>
          <Link
            href='/registration'
            data-aos='zoom-in-right'
            data-aos-duration='500'
            className='flex w-full flex-row items-center justify-center gap-x-[8rem] rounded-[32rem] bg-d-green py-[20rem] hover:bg-[#C9FF55]/70 tablet:w-[536rem]'
          >
            <span className='leading-tighter font-inter text-[16rem] font-medium text-d-black/80 tablet:text-[24rem] wide:text-[32rem]'>Start now for free</span>
            <img src='/images/icon_arrow--right.svg' className='size-[20rem]' alt='Icon Right' />
          </Link>
          <div className='absolute -bottom-[104rem] -right-[60rem] z-[30] hidden aspect-[341/366] w-[341rem] mix-blend-soft-light tablet:block desktop:-bottom-[40rem] desktop:-right-[10rem] desktop:w-[280rem] wide:-bottom-[10rem] wide:right-0'>
            <Image fill src='/images/illustration_spere-sky--desktop.png' className='object-cover' alt='illustration Sphere' />
          </div>
        </div>
        <div className='flex flex-col tablet:flex-row tablet:gap-x-[20rem]'>
          <button
            data-aos='fade-right'
            data-aos-duration='500'
            className='mb-[8rem] flex w-full items-center justify-between rounded-[32rem] bg-white p-[24rem] text-[24rem] font-medium leading-none text-d-black/80 tablet:pl-[40rem] tablet:pr-[72rem] tablet:text-[32rem] desktop:rounded-[40rem] desktop:py-[65rem] wide:text-[40rem]'
          >
            <span>About</span>
            <img src='/images/icon_arrow--right.svg' className='size-[20rem] tablet:size-[30rem]' alt='Icon Right' />
          </button>
          <button
            data-aos='fade-right'
            data-aos-delay='200'
            data-aos-duration='500'
            className='mb-[8rem] flex w-full items-center justify-between rounded-[32rem] bg-white p-[24rem] text-[24rem] font-medium leading-none text-d-black/80 tablet:pl-[40rem] tablet:pr-[72rem] tablet:text-[32rem] desktop:rounded-[40rem] desktop:py-[65rem] wide:text-[40rem]'
          >
            <span>Community</span>
            <img src='/images/icon_arrow--right.svg' className='size-[20rem] tablet:size-[30rem]' alt='Icon Right' />
          </button>
        </div>
      </div>
    </section>
  );
};
