import React, { useEffect } from 'react';

import Link from 'next/link';
import { format } from 'date-fns';
import { mockStore } from '@/stores/mock';
import { usePathname } from 'next/navigation';

interface Props {
  title: string;
  tag?: string;
  time?: string;
  audio?: string;
}

export const HeaderDuringTest = ({ title, tag, time, audio }: Props) => {
  const { timer, setTimer } = mockStore();

  const pathname = usePathname();

  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      setTimer(timer - 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, setTimer]);

  const formatTime = (ms: number) => {
    const date = new Date(ms);
    return format(date, 'mm:ss');
  };

  const backgroundColor = () => {
    if (pathname.includes('reading')) {
      return 'bg-d-yellow-secondary';
    } else if (pathname.includes('listening')) {
      return 'bg-d-light-gray';
    } else if (pathname.includes('speaking')) {
      return 'bg-d-red-secondary';
    } else if (pathname.includes('writing')) {
      return 'bg-d-blue-secondary';
    }
  };
  return (
    <header className={`${backgroundColor()}`}>
      <div className='relative z-10 h-[93rem] rounded-b-[32rem] bg-white'>
        <nav className='container relative flex h-full max-w-[1440rem] items-center justify-between px-[40rem]'>
          <Link href='/profile' className='relative z-10 flex w-auto items-center gap-x-[6rem]'>
            <img src='/images/logo.svg' className='size-[36rem]' alt='logo' />
            <div className='font-poppins text-[21rem] font-semibold'>studybox</div>
          </Link>

          <div className='absolute left-0 top-0 flex h-[93rem] w-[1440rem] items-center justify-center text-center text-[20rem] font-medium'>{title}</div>

          <div className='relative z-10 flex justify-end gap-x-[22rem]'>
            <div className='flex items-center gap-x-[16rem]'>
              {audio && (
                <div className='flex h-[42rem] items-center justify-center gap-x-[8rem] rounded-[40rem] border-2 border-d-gray bg-white px-[24rem]'>
                  <img src='/images/icon_listeningSection.svg' className='size-[16rem]' alt='audio' />
                  <span className='text-[14rem] font-semibold'>Audio is playing</span>
                  <audio src={audio} autoPlay className='h-0 w-0' />
                </div>
              )}
              {tag && (
                <div className='flex h-[42rem] items-center justify-center rounded-[40rem] border-2 border-d-gray bg-white px-[24rem]'>
                  <span className='text-[14rem] font-semibold'>{tag}</span>
                </div>
              )}
              {timer && title.includes('Mock') && (
                <div className='flex h-[42rem] items-center justify-center rounded-[40rem] border-2 border-d-gray bg-white px-[24rem]'>
                  <span className='text-[14rem] font-semibold'>{formatTime(timer)}</span>
                </div>
              )}
              <Link href='/profile' className='flex h-[42rem] w-[74rem] items-center justify-center rounded-[40rem] bg-d-gray hover:bg-d-green/40'>
                <span className='text-[14rem] font-semibold'>Exit</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
