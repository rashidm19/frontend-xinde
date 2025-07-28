import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import Link from 'next/link';
import { PricesModal } from './PricesModal';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface Props {
  name?: string;
  avatar?: string;
}

export const Header = ({ name, avatar }: Props) => {
  const pathname = usePathname();
  const { t, tImgAlts, tActions, tCommon } = useCustomTranslations('header');

  const links = ['/practice', '/mock', '/notes'];

  return (
    <header className='h-[93rem] rounded-b-[32rem] bg-white'>
      <nav className='container flex h-full max-w-[1440rem] items-center px-[40rem]'>
        <Link href='/profile' className='mr-[90rem] flex items-center gap-x-[6rem]'>
          <img src='/images/logo.svg' className='size-[36rem]' alt={tImgAlts('logo')} />
          <div className='font-poppins text-[21rem] font-semibold'>studybox</div>
        </Link>

        <div className='flex h-full'>
          {links.map((link, index) =>
            link.includes('practice') ? (
              <Link
                key={index}
                href={link}
                className={`${pathname.includes(link) ? 'border-d-black' : 'border-transparent'} flex h-full items-center border-b-2 px-[20rem] text-[14rem] font-medium`}
              >
                {t(`menu.link_${index + 1}`)}
              </Link>
            ) : (
              <span
                key={index}
                style={{ userSelect: 'none', color: '#9C9C9C' }}
                className='flex h-full items-center border-b-2 border-transparent px-[20rem] text-[14rem] font-medium'
              >
                <span className="relative">
                  <div className='opacity-65 font-light absolute left-auto right-[-75%] top-[-75%] flex h-[20rem] w-[40rem] items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] text-[10rem] text-white'>
                    {tCommon('soon')}
                  </div>
                  {t(`menu.link_${index + 1}`)}
                </span>
              </span>
            )
          )}
        </div>

        <div className='ml-auto flex gap-x-[22rem]'>
          <Link
            href='/profile'
            className={`flex h-[93rem] items-center gap-x-[12rem] border-b-2 px-[16rem] ${pathname.includes('profile') ? 'border-d-black' : 'border-white'}`}
          >
            <Avatar className='size-[46rem] border border-d-gray bg-d-gray'>
              <AvatarImage src={avatar} />
              <AvatarFallback className='text-[14rem]'>{name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className='text-[14rem] font-semibold'>{name}</span>
          </Link>

          <div className='flex items-center gap-x-[16rem]'>
            {/*<a*/}
            {/*  href='mailto:info@studybox.kz'*/}
            {/*  className='flex h-[46rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-gray px-[24rem] hover:bg-d-green/40'*/}
            {/*>*/}
            {/*  <img src='/images/icon_support.svg' alt='stars' className='size-[14rem]' />*/}
            {/*  <span className='text-[14rem] font-semibold'>{t('support')}</span>*/}
            {/*</a>*/}

            <Dialog>
              <DialogTrigger className='flex h-[46rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-green px-[24rem] hover:bg-d-green/40'>
                <img src='/images/icon_stars--black.svg' alt='stars' className='size-[14rem]' />
                <span className='text-[14rem] font-semibold'>{tActions('upgradePlan')}</span>
              </DialogTrigger>

              <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center'>
                <PricesModal />
              </DialogContent>
            </Dialog>

            {/* <Link href='' className='flex h-[46rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-green px-[24rem] hover:bg-d-green/40'>
              <img src='/images/icon_stars--black.svg' alt='stars' className='size-[14rem]' />
              <span className='text-[14rem] font-semibold'>Upgrade plan</span>
            </Link> */}
          </div>
        </div>
      </nav>
    </header>
  );
};
