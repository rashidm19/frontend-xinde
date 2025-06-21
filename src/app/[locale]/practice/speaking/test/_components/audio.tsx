'use client';

import React, { useEffect, useRef, useState } from 'react';

import { AudioVisualizer } from 'react-audio-visualize';

interface Props {
  src: string;
  title: string;
  blob?: Blob;
}

export const Audio = ({ src, title, blob }: Props) => {
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(blob);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>();
  const [playStatus, setPlayStatus] = useState<'paused' | 'playing'>('paused');

  useEffect(() => {
    const fetchAudioFile = async () => {
      const response = await fetch(src);
      const blob = await response.blob();
      setAudioBlob(blob);
    };

    if (!audioBlob) {
      fetchAudioFile();
    }
  }, []);

  return (
    <div className='w-[420rem] rounded-[16rem] rounded-bl-[4rem] bg-white p-[16rem] pb-[24rem]'>
      <div className='mb-[20rem] flex items-baseline justify-between'>
        <span className='text-[20rem] font-medium leading-none text-d-black/80'>{title}</span>
        <span className='text-[14rem] font-medium leading-none text-d-black/80'></span>
      </div>
      {audioBlob && audioRef && (
        <div className='flex flex-col gap-y-[24rem]'>
          <audio
            controls
            ref={audioRef}
            onTimeUpdate={e => setCurrentTimestamp(audioRef?.current?.currentTime)}
            onPause={() => setPlayStatus('paused')}
            onPlay={() => setPlayStatus('playing')}
            className='hidden'
          >
            <source src={src} />
          </audio>

          <div className='flex items-center gap-x-[8rem]'>
            <button
              type='button'
              onClick={() => (playStatus === 'paused' ? audioRef?.current?.play() : audioRef?.current?.pause())}
              className='flex size-[48rem] shrink-0 items-center justify-center rounded-full bg-d-green'
            >
              {playStatus === 'playing' ? (
                <img src='/images/icon_audioPause.svg' className='size-[16rem]' alt='pause' />
              ) : (
                <img src='/images/icon_audioPlay.svg' className='size-[16rem]' alt='play' />
              )}
            </button>

            <AudioVisualizer
              ref={visualizerRef}
              blob={audioBlob}
              width={326}
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
    </div>
  );
};
