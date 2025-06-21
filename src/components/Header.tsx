import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import Link from 'next/link';
import { PricesModal } from './PricesModal';
import React from 'react';
import { usePathname } from 'next/navigation';

interface Props {
  name?: string;
  avatar?: string;
}

export const Header = ({ name, avatar }: Props) => {
  const pathname = usePathname();

  return (
    <header className='h-[93rem] rounded-b-[32rem] bg-white'>
      <nav className='container flex h-full max-w-[1440rem] items-center px-[40rem]'>
        <Link href='/profile' className='mr-[90rem] flex items-center gap-x-[6rem]'>
          <img src='/images/logo.svg' className='size-[36rem]' alt='logo' />
          <div className='font-poppins text-[21rem] font-semibold'>studybox</div>
        </Link>

        <div className='flex h-full'>
          <Link
            className={`${pathname.includes('practice') ? 'border-d-black' : 'border-transparent'} flex h-full items-center border-b-2 px-[20rem] text-[14rem] font-medium`}
            href='/practice'
          >
            Practice by section
          </Link>
          <Link
            className={`${pathname.includes('mock') ? 'border-d-black' : 'border-transparent'} flex h-full items-center border-b-2 px-[20rem] text-[14rem] font-medium`}
            href='/mock'
          >
            MOCK
          </Link>
          <Link
            className={`${pathname.includes('notes') ? 'border-d-black' : 'border-transparent'} flex h-full items-center border-b-2 px-[20rem] text-[14rem] font-medium`}
            href='/notes'
          >
            Notes
          </Link>
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
            <a
              href='mailto:support@studybox.kz'
              className='flex h-[46rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-gray px-[24rem] hover:bg-d-green/40'
            >
              <img src='/images/icon_support.svg' alt='stars' className='size-[14rem]' />
              <span className='text-[14rem] font-semibold'>Support</span>
            </a>

            <Dialog>
              <DialogTrigger className='flex h-[46rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-green px-[24rem] hover:bg-d-green/40'>
                <img src='/images/icon_stars--black.svg' alt='stars' className='size-[14rem]' />
                <span className='text-[14rem] font-semibold'>Upgrade plan</span>
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
