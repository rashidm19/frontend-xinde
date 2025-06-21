import React from 'react';
import Image from 'next/image';

export default async function NotFound() {
  return (
    <div className='overrflow-visible relative flex h-[100vh] flex-col items-start justify-center pl-[120rem]'>
      <div className='relative z-40'>
        <h2 className='mb-[32rem] font-poppins text-[56rem] font-semibold leading-normal -tracking-[0.2rem]'>Page not found</h2>
        <p className='mb-[12rem] text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>Error 404</p>
        <p className='mb-[32rem] text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>
          The page you are trying to access doesn’t exist. <br /> Please go back and try again.
        </p>
        <a
          href='/public'
          className='flex h-[65rem] w-[393rem] items-center justify-center rounded-[32rem] bg-white text-[24rem] font-medium leading-[29rem] -tracking-[0.2rem] text-d-black hover:bg-white/40'
        >
          Back to the homepage
        </a>
      </div>
      <div className='absolute -right-[230rem] bottom-[45rem] aspect-[1380/1122] w-[789rem]'>
        <Image fill src='/images/illustration_404.png' alt='Illustration Sphere' className='object-cover' />
      </div>
    </div>
  );
}
