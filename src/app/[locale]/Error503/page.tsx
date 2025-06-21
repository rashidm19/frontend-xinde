import React from 'react';
import Image from 'next/image';

export default async function Error500() {
  return (
    <div className='overrflow-visible relative flex h-[100vh] flex-col items-start justify-center pl-[120rem]'>
      <div className='relative z-40'>
        <h2 className='mb-[32rem] font-poppins text-[56rem] font-semibold leading-normal -tracking-[0.2rem]'>No internet connection</h2>

        <p className='mb-[32rem] text-[24rem] leading-[26rem] -tracking-[0.2rem] text-d-black/80'>
          Your device is currently unable to reach the <br />
          internet. Once your connection is restored, try <br />
          accessing the platform again and start the <br />
          exam over.
        </p>
        <a
          href='/public'
          className='flex h-[65rem] w-[393rem] items-center justify-center rounded-[32rem] bg-white text-[24rem] font-medium leading-[29rem] -tracking-[0.2rem] text-d-black hover:bg-white/40'
        >
          Back to the homepage
        </a>
      </div>
      <div className='absolute -right-[0rem] bottom-[30rem] aspect-[1063/1452] w-[708rem] -rotate-[10deg]'>
        <Image fill src='/images/illustration_503.png' alt='Illustration Sphere' className='object-cover' />
      </div>
    </div>
  );
}
