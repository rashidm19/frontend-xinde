import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export const BestResults = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const AnimatedNumber = ({ endValue }: { endValue: number }) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
      if (inView) {
        const interval = setInterval(() => {
          setCount(prev => {
            if (prev >= endValue) {
              clearInterval(interval);
              return endValue;
            }
            return prev + 0.5;
          });
        }, 50);

        return () => clearInterval(interval);
      }
    }, [inView, endValue]);

    return <div className='text-[16rem] font-semibold tracking-[-0.2rem] tablet:text-[20rem]'>{count.toFixed(1)}</div>;
  };

  return (
    <div className='shrink-0' ref={ref}>
      <div className='grid grid-cols-2 gap-x-[10rem] gap-y-[10rem] tablet:grid-cols-4 tablet:gap-x-[40rem] tablet:gap-y-[24rem] desktop:grid-cols-2 desktop:gap-x-[12rem] desktop:gap-y-[16rem] wide:gap-x-[24rem]'>
        <button type='button' className='flex items-center'>
          <div className='mr-[12rem] flex size-[32rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-green-secondary tablet:size-[52rem] desktop:size-[44rem]'>
            <img src='/images/icon_listeningSection.svg' className='size-[18rem] tablet:size-[24rem]' alt='icon' />
          </div>
          <div className='flex flex-col items-start'>
            <div className='mb-[4rem] flex items-center gap-x-[8rem] desktop:mb-0'>
              <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Listening</div>
              <div
                data-aos='fade-up'
                data-aos-duration='duration-500'
                className='-ml-[10rem] -mt-[22rem] text-[11rem] font-normal tracking-[-0.2rem] text-d-blue tablet:ml-0 tablet:mt-0 tablet:text-[14rem] desktop:-ml-[6rem] desktop:-mt-[12rem] wide:ml-[10rem]'
              >
                +3.0
              </div>
            </div>
            <AnimatedNumber endValue={7.5} />
          </div>
        </button>
        <button type='button' className='flex items-center'>
          <div className='mr-[12rem] flex size-[32rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-yellow-secondary tablet:size-[52rem] desktop:size-[44rem]'>
            <img src='/images/icon_readingSection.svg' className='size-[18rem] tablet:size-[24rem]' alt='icon' />
          </div>
          <div className='flex flex-col items-start'>
            <div className='mb-[4rem] flex items-center gap-x-[8rem] desktop:mb-0'>
              <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Reading</div>
              <div
                data-aos='fade-up'
                data-aos-duration='duration-500'
                className='-ml-[10rem] -mt-[22rem] text-[11rem] font-normal tracking-[-0.2rem] text-d-blue tablet:ml-0 tablet:mt-0 tablet:text-[14rem] desktop:-ml-[6rem] desktop:-mt-[12rem] wide:ml-[10rem]'
              >
                +0.5
              </div>
            </div>
            <AnimatedNumber endValue={8.5} />
          </div>
        </button>
        <button type='button' className='flex items-center'>
          <div className='mr-[12rem] flex size-[32rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-blue-secondary tablet:size-[52rem] desktop:size-[44rem]'>
            <img src='/images/icon_writingSection.svg' className='size-[18rem] tablet:size-[24rem]' alt='icon' />
          </div>
          <div className='flex flex-col items-start'>
            <div className='mb-[4rem] flex items-center gap-x-[8rem] desktop:mb-0'>
              <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Writing</div>
              <div
                data-aos='fade-up'
                data-aos-duration='duration-500'
                className='-ml-[10rem] -mt-[22rem] text-[11rem] font-normal tracking-[-0.2rem] text-d-blue tablet:ml-0 tablet:mt-0 tablet:text-[14rem] desktop:-ml-[6rem] desktop:-mt-[12rem] wide:ml-[10rem]'
              >
                +0.5
              </div>
            </div>
            <AnimatedNumber endValue={6.5} />
          </div>
        </button>
        <button type='button' className='flex items-center'>
          <div className='mr-[12rem] flex size-[32rem] shrink-0 items-center justify-center rounded-[8rem] bg-d-violet-secondary tablet:size-[52rem] desktop:size-[44rem]'>
            <img src='/images/icon_speakingSection.svg' className='size-[18rem] tablet:size-[24rem]' alt='icon' />
          </div>
          <div className='flex flex-col items-start'>
            <div className='mb-[4rem] flex items-center gap-x-[8rem] desktop:mb-0'>
              <div className='text-[14rem] font-medium tracking-[-0.2rem] text-d-black'>Speaking</div>
              <div
                data-aos='fade-up'
                data-aos-duration='duration-500'
                className='-ml-[10rem] -mt-[22rem] text-[11rem] font-normal tracking-[-0.2rem] text-d-blue tablet:ml-0 tablet:mt-0 tablet:text-[14rem] desktop:-ml-[6rem] desktop:-mt-[12rem] wide:ml-[10rem]'
              >
                +2.5
              </div>
            </div>
            <AnimatedNumber endValue={9.0} />
          </div>
        </button>
      </div>
    </div>
  );
};
