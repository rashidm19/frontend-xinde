'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PricesModal } from '@/components/PricesModal';
import Link from 'next/link';
import React, { useState } from 'react';
import Button from './Button';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedWrapper } from './AnimatedWrapper';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

const menu = {
  open: {
    width: '392rem',

    height: '100dvh',

    top: '0rem',

    right: '-16rem',
    scale: 1,
    transition: { duration: 0.75, type: 'tween', ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    width: '38rem',

    height: '38rem',

    top: '26rem',

    right: '26rem',

    scale: 0,

    transition: { duration: 0.75, delay: 0.35, type: 'tween', ease: [0.76, 0, 0.24, 1] },
  },
};

export const Header = () => {
  const { t } = useCustomTranslations('home');

  const [isActive, setIsActive] = useState(false);

  return (
    <header>
      <div className='container flex items-center justify-between p-[20rem] pb-0 tablet:max-w-[1024rem] tablet:px-[56rem] tablet:pt-[22rem] desktop:max-w-[1440rem] desktop:px-[80rem] wide:max-w-[1920rem] wide:px-[160rem]'>
        <div className='flex items-center gap-x-[40rem]'>
          <figure className='relative z-[190] flex items-center gap-x-[6rem]'>
            <img src='/images/logo.svg' className='size-[28rem] wide:size-[34rem]' alt={t('common.logo')} />
            <div className='font-poppins text-[17rem] font-semibold leading-none wide:text-[20rem]'>studybox</div>
          </figure>
          <div className='hidden gap-x-[18rem] tablet:flex'>
            <Link href='#about' className='flex text-[14rem] font-medium leading-none text-d-black wide:text-[20rem]'>
              {t('menu.about')}
            </Link>

            <Dialog>
              <DialogTrigger className='flex text-[14rem] font-medium leading-none text-d-black wide:text-[20rem]'>{t('menu.prices')}</DialogTrigger>

              <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[390rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center tablet:w-[740rem] desktop:w-[1280rem]'>
                <PricesModal />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className='hidden tablet:flex tablet:gap-x-[16rem]'>
          <Link
            href='/registration'
            className='width-[86rem] flex items-center justify-center gap-x-[8rem] rounded-full bg-d-green px-[32rem] py-[16rem] text-[14rem] font-medium leading-none hover:bg-d-green/40 desktop:px-[32rem] wide:px-[40rem] wide:py-[18rem] wide:text-[20rem]'
          >
            {t('actions.try')}
          </Link>
          <Link
            href='/login'
            className='flex w-[128rem] items-center justify-center gap-x-[8rem] rounded-full bg-white px-[32rem] py-[16rem] text-[14rem] font-medium leading-none hover:bg-white/40 desktop:px-[32rem] wide:w-[166rem] wide:px-[40rem] wide:py-[18rem] wide:text-[20rem]'
          >
            <img src='/images/icon_login.svg' alt={t('actions.login')} className='size-[20rem]' />
            {t('actions.login')}
          </Link>
        </div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              exit='closed'
              animate='open'
              variants={menu}
              initial='closed'
              className='absolute right-[26rem] top-[26rem] z-[180] flex h-[100dvh] w-[392rem] origin-top-right flex-col items-center justify-center gap-y-[34rem] bg-d-green p-[30rem] tablet:hidden'
              style={{ perspective: '100px', perspectiveOrigin: 'top' }} // Use bottom origin for diagonal skew
            >
              <AnimatedWrapper index={0}>
                <Link href='#about' onClick={() => setIsActive(false)} className='flex text-[36rem] font-medium leading-none text-d-black'>
                  {t('menu.about')}
                </Link>
              </AnimatedWrapper>
              <AnimatedWrapper index={1}>
                <Dialog>
                  <DialogTrigger className='flex text-[36rem] font-medium leading-none text-d-black'>{t('menu.prices')}</DialogTrigger>
                  <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[390rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center tablet:w-[740rem] desktop:w-[1280rem]'>
                    <PricesModal />
                  </DialogContent>
                </Dialog>
              </AnimatedWrapper>
              <AnimatedWrapper index={2}>
                <Link href='/login' className='relative flex text-[36rem] font-medium leading-none text-d-black'>
                  {t('actions.login')}
                </Link>
              </AnimatedWrapper>
              <AnimatedWrapper index={2}>
                <Link href='/registration' className='relative flex text-[36rem] font-medium leading-none text-d-black'>
                  {t('actions.tryForFree')}
                </Link>
              </AnimatedWrapper>
              <span className='absolute bottom-[24rem] left-[60rem] text-[16rem] text-d-black/50'>{t('header.desktopOnlyText')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          isActive={isActive}
          toggleMenu={() => {
            setIsActive(!isActive);
          }}
        />

        {/* // * Burger menu for mobile */}
        {/* <button className='flex size-[24rem] items-center justify-center tablet:hidden'>
          <img src='/images/icon_burger.svg' className='h-[12rem] w-[16rem]' alt='menu' />
        </button> */}
      </div>
    </header>
  );
};
