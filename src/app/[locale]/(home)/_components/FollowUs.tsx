import React from 'react';

export const FollowUs = () => {
  return (
    <section className='overflow-hidden tablet:rounded-t-[40rem] tablet:bg-d-black'>
      {/* // * Socials mobile */}
      <div className='mb-[40rem] flex flex-col items-center gap-y-[24rem] tablet:hidden'>
        <h2 data-aos='fade-up' data-aos-duration='500' className='font-poppins text-[24rem] font-semibold leading-none'>
          Follow us on
        </h2>
        <a href='/public' target='_blank' className='flex size-[48rem] items-center justify-center rounded-full bg-d-green hover:bg-d-green/40'>
          <img src='/images/icon_instagram.svg' className='size-[32rem]' alt='isntagramm' />
        </a>
      </div>

      <div className='container relative rounded-t-[40rem] bg-d-black p-[20rem] pt-[32rem] tablet:max-w-none tablet:p-[40rem] tablet:pt-[48rem] desktop:max-w-[1440rem] wide:max-w-[1920rem] wide:p-[80rem] wide:pt-[56rem]'>
        <img
          src='/images/illustration_flowerOrange.png'
          alt='illustration'
          className='pointer-events-none absolute right-[-108rem] hidden desktop:bottom-[-190rem] desktop:block desktop:w-[528rem] wide:bottom-[-111rem] wide:right-[20rem]'
        />
        <div className='mb-[40rem] tablet:mb-[80rem] tablet:flex tablet:justify-between desktop:mb-[148rem] wide:mb-[120rem]'>
          {/* // * Subscribtion form */}
          <div className='tablet:w-[462rem] desktop:w-[612rem] wide:w-[870rem]'>
            <h2
              data-aos='fade-up'
              data-aos-duration='500'
              className='mb-[8rem] font-poppins text-[24rem] font-semibold leading-none tracking-[-1rem] text-white tablet:mb-[16rem] tablet:text-[40rem] wide:text-[56rem]'
            >
              Don't miss the latest IELTS news
            </h2>
            <p
              data-aos='fade-right'
              data-aos-duration='500'
              data-aos-dealy='200'
              className='mb-[24rem] text-[16rem] font-medium leading-tight text-white/80 tablet:mb-[40rem] tablet:text-[24rem] wide:text-[32rem]'
            >
              Subscribe for exclusive tips, practice resources, exam strategies delivered straight to your inbox
            </p>
            <form className='desktop:w-[472rem] wide:w-[612rem]'>
              <input
                type='email'
                name='email'
                placeholder='E-mail'
                className='mb-[8rem] w-full rounded-full bg-[#888888] px-[16rem] py-[18rem] text-[16rem] font-medium leading-tight text-white placeholder:text-white tablet:px-[24rem] tablet:py-[21.5rem] tablet:text-[24rem]'
              />
              <button className='flex w-full items-center justify-center gap-x-[8rem] rounded-full bg-[#C9FF55] px-[32rem] py-[18rem] text-[16rem] font-medium leading-tight hover:bg-[#C9FF55]/40 tablet:py-[21.5rem] tablet:text-[24rem]'>
                Subscribe
              </button>
            </form>
          </div>
          {/* // * Socials tablet and above */}
          <div className='hidden tablet:mr-[66rem] tablet:flex tablet:flex-col tablet:gap-y-[24rem] desktop:mr-[272rem] wide:mr-[280rem]'>
            <h2 data-aos='fade-down' data-aos-duration='500' className='font-poppins font-semibold leading-none text-white tablet:text-[40rem] wide:text-[56rem]'>
              Follow us on
            </h2>
            <a href='/public' target='_blank' className='flex items-center justify-center rounded-full bg-d-green hover:bg-d-green/40 tablet:size-[48rem] wide:size-[68rem]'>
              <img src='/images/icon_instagram.svg' className='tablet:size-[40rem] wide:size-[48rem]' alt='isntagramm' />
            </a>
          </div>
        </div>
        {/* // * Nav & Logo */}
        <nav>
          <div className='mb-[18rem] flex gap-x-[16rem] tablet:mb-[40rem]'>
            <a
              data-aos='fade-right'
              data-aos-duration='500'
              href='#'
              className='text-[16rem] font-medium leading-tight text-white/80 tablet:text-[24rem] wide:text-[32rem]'
            >
              About
            </a>
            <a
              data-aos='fade-right'
              data-aos-duration='500'
              data-aos-delay='200'
              href='#'
              className='text-[16rem] font-medium leading-tight text-white/80 tablet:text-[24rem] wide:text-[32rem]'
            >
              Prices
            </a>
            <a
              data-aos='fade-right'
              data-aos-duration='500'
              data-aos-delay='400'
              href='#'
              className='text-[16rem] font-medium leading-tight text-white/80 tablet:text-[24rem] wide:text-[32rem]'
            >
              Community
            </a>
          </div>
          <div className='font-poppins text-[64rem] font-semibold leading-none tracking-[-0.2rem] text-white tablet:text-[128rem] wide:text-[180rem]'>STUDYBOX</div>
        </nav>
      </div>
    </section>
  );
};
