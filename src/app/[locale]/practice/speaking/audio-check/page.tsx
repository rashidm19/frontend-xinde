'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AudioVisualizer } from 'react-audio-visualize';
import axiosInstance from '@/lib/axiosInstance';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { PracticeWritingCard } from '@/components/practice/PracticeWritingCard';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

export default function Page() {
  const { tImgAlts, tCommon, tActions } = useCustomTranslations('practice.speaking.audioCheck');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>();
  const [playStatus, setPlayStatus] = useState<'paused' | 'playing'>('paused');

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
    <main className='relative min-h-screen bg-d-red-secondary'>
      <div className='relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('speaking')}
          headingLabel={tCommon('speaking')}
          durationLabel={tCommon('minCount', { count: 14 })}
          partsLabel={tCommon('parts')}
          partsValue='3'
          headingSlot={
            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[48rem] items-center justify-center rounded-full bg-d-red-secondary'>
                <img src='/images/icon_speakingSection.svg' className='size-[22rem]' alt={tImgAlts('speaking')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('speaking')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>{tCommon('minCount', { count: 14 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>3</div>
              </div>
            </div>
          }
          className='gap-[28rem]'
        >
          {audioBlob && audioRef && (
            <div className='flex flex-col items-center gap-[20rem]'>
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

              <div className='text-center text-[16rem] font-medium leading-none text-d-black/80'>Check your audio system</div>

              <div className='flex items-center gap-x-[12rem]'>
                <button
                  type='button'
                  onClick={() => (playStatus === 'paused' ? audioRef?.current?.play() : audioRef?.current?.pause())}
                  className='flex size-[64rem] items-center justify-center rounded-full bg-d-green text-white'
                >
                  {playStatus === 'playing' ? (
                    <img src='/images/icon_audioPause.svg' className='size-[20rem]' alt={tImgAlts('pause')} />
                  ) : (
                    <img src='/images/icon_audioPlay.svg' className='size-[20rem]' alt={tImgAlts('play')} />
                  )}
                </button>

                <AudioVisualizer
                  ref={visualizerRef}
                  blob={audioBlob}
                  width={360}
                  height={50}
                  barWidth={2}
                  gap={2}
                  barColor='#EAEAEA'
                  barPlayedColor='#383838'
                  currentTime={currentTimestamp || 0}
                />
              </div>

              <Link
                href='/practice/speaking/mic-check/'
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
                className={`mx-auto flex h-[56rem] w-[240rem] items-center justify-center rounded-[32rem] bg-d-green text-[18rem] font-semibold hover:bg-d-green/40 ${
                  isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
                }`}
              >
                {isCheckingAccess ? '...' : tActions('continue')}
              </Link>
            </div>
          )}
          <SubscriptionAccessLabel className='mt-[12rem] text-center text-[12rem]' />
        </PracticeWritingCard>
      </div>
    </main>
  );
}
