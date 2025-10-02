'use client';

import React, { useEffect, useRef, useState } from 'react';

import { AudioVisualizer } from 'react-audio-visualize';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

export default function Page() {
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>();
  const [playStatus, setPlayStatus] = useState<'paused' | 'playing'>('paused');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  useEffect(() => {
    const fetchAudioFile = async () => {
      const absoluteSrc = `${window.location.origin}/files/audio-check.mp3`;
      const { data } = await axiosInstance.get(absoluteSrc, {
        responseType: 'blob',
      });
      setAudioBlob(data);
    };

    fetchAudioFile();
  }, []);

  return (
    <main className='min-h-screen overflow-hidden bg-d-red-secondary'>
      <div className='container relative max-w-[1440rem] px-[248rem] pb-[48rem] pt-[64rem]'>
        <img
          src='/images/illustration_halfspheres.png'
          alt='illustration'
          className='pointer-events-none absolute right-[120rem] top-[140rem] h-auto w-[264rem] rotate-[14deg] opacity-20 mix-blend-multiply'
        />
        <img
          src='/images/illustration_flowerOrange.png'
          alt='illustration'
          className='pointer-events-none absolute left-[-60rem] top-[716rem] h-auto w-[392rem] rotate-[-16deg] opacity-20 mix-blend-multiply'
        />

        <div className='relative z-10 flex flex-col items-center gap-[56rem] rounded-[16rem] bg-white p-[64rem] shadow-card'>
          {/* // * Cancel practice  */}
          <Link href='/mock' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
            <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
          </Link>

          {/* // * Header */}
          <header className='flex items-center gap-x-[12rem]'>
            <div className='w-full text-center text-[32rem] font-medium leading-none'>Check your audio system</div>
          </header>
          {/* // * Seclection */}

          {audioBlob && audioRef && (
            <div className='flex flex-col gap-y-[24rem]'>
              <audio
                controls
                ref={audioRef}
                onTimeUpdate={() => setCurrentTimestamp(audioRef?.current?.currentTime)}
                onPause={() => setPlayStatus('paused')}
                onPlay={() => setPlayStatus('playing')}
                className='hidden'
              >
                <source src='/files/audio-check.mp3' />
              </audio>

              <div className='text-center text-[20rem] font-medium leading-none text-d-black/80'>Test record: 1:54</div>

              <div className='flex items-center gap-x-[8rem]'>
                <button
                  type='button'
                  onClick={() => (playStatus === 'paused' ? audioRef?.current?.play() : audioRef?.current?.pause())}
                  className='flex size-[72rem] items-center justify-center rounded-full bg-d-green'
                >
                  {playStatus === 'playing' ? (
                    <img src='/images/icon_audioPause.svg' className='size-[24rem]' alt='pause' />
                  ) : (
                    <img src='/images/icon_audioPlay.svg' className='size-[24rem]' alt='play' />
                  )}
                </button>

                <AudioVisualizer
                  ref={visualizerRef}
                  blob={audioBlob}
                  width={362}
                  height={52}
                  barWidth={2}
                  gap={2}
                  barColor={'#EAEAEA'}
                  barPlayedColor={'#383838'}
                  currentTime={currentTimestamp || 0}
                />
              </div>
            </div>
          )}

          <Link
            href='/mock/exam/speaking/mic-check/'
            onClick={async event => {
              if (isCheckingAccess) {
                event.preventDefault();
                return;
              }

              const canStart = await requireSubscription();

              if (!canStart) {
                event.preventDefault();
              }
            }}
            className={`mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 ${
              isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
            }`}
          >
            {isCheckingAccess ? '...' : 'Continue'}
          </Link>
          <SubscriptionAccessLabel className='text-center' />
        </div>
      </div>
    </main>
  );
}
