import React, { useEffect } from 'react';

import Link from 'next/link';
import { format } from 'date-fns';
import { mockStore } from '@/stores/mock';
import { usePathname } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  tag?: string;
  time?: string;
  audio?: string;
  backHref?: string;
  backLabel?: string;
  exitHref?: string;
  onExit?: () => void;
  logoHref?: string;
}

export const HeaderDuringTest = ({ title, tag, time, audio, backHref, backLabel, exitHref = '/profile', onExit, logoHref = '/profile' }: Props) => {
  const { timer, setTimer } = mockStore();

  const pathname = usePathname();
  const { t, tImgAlts, tActions } = useCustomTranslations('headerDuringTest');
  const resolvedBackLabel = backLabel ?? 'Back to tasks';

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
          <div className='relative z-10 flex w-auto items-center gap-x-[12rem]'>
            {backHref ? (
              <Link
                href={backHref}
                className='flex items-center gap-x-[8rem] rounded-[32rem] border border-d-gray/50 bg-white px-[18rem] py-[10rem] text-[14rem] font-semibold text-d-black transition hover:border-d-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-gray/80 focus-visible:ring-offset-2'
              >
                <ArrowLeft className='size-[16rem]' aria-hidden='true' />
                <span>{resolvedBackLabel}</span>
              </Link>
            ) : null}
            <Link href={logoHref} className='flex items-center gap-x-[6rem]'>
              <img src='/images/logo.svg' className='size-[36rem]' alt='logo' />
              <div className='font-poppins text-[21rem] font-semibold'>studybox</div>
            </Link>
          </div>

          <div className='absolute left-0 top-0 flex h-[93rem] w-[1440rem] items-center justify-center text-center text-[20rem] font-medium'>{title}</div>

          <div className='relative z-10 flex justify-end gap-x-[22rem]'>
            <div className='flex items-center gap-x-[16rem]'>
              {audio && (
                <div className='flex h-[42rem] items-center justify-center gap-x-[8rem] rounded-[40rem] border-2 border-d-gray bg-white px-[24rem]'>
                  <img src='/images/icon_listeningSection.svg' className='size-[16rem]' alt={tImgAlts('audio')} />
                  <span className='text-[14rem] font-semibold'>{t('audioIsPlaying')}</span>
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
              <Link
                href={exitHref}
                onClick={event => {
                  if (onExit) {
                    event.preventDefault();
                    onExit();
                  }
                }}
                className='flex h-[42rem] w-[94rem] items-center justify-center rounded-[40rem] bg-d-gray px-[16rem] text-center transition hover:bg-d-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-gray/80 focus-visible:ring-offset-2'
              >
                <span className='text-[14rem] font-semibold'>{tActions('exit')}</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
