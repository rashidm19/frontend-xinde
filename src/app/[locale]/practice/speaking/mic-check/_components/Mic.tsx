'use client';

import React, { useEffect, useRef, useState } from 'react';

import { AudioVisualizer } from 'react-audio-visualize';
import { useReactMediaRecorder } from 'react-media-recorder';
import axiosInstance from '@/lib/axiosInstance';

export default function Mic() {
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>();
  const [playStatus, setPlayStatus] = useState<'paused' | 'playing'>('paused');

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ video: false });

  useEffect(() => {
    const fetchAudioFile = async () => {
      const { data } = await axiosInstance.get(mediaBlobUrl as string, {
        responseType: 'blob',
      });
      setAudioBlob(data);
    };

    if (mediaBlobUrl !== undefined && status === 'stopped') {
      fetchAudioFile();
    }
  }, [mediaBlobUrl]);

  return (
    <>
      {/* // * Recording process */}
      {(status === 'idle' || status === 'recording' || status === 'acquiring_media' || status === 'stopping') && (
        <div className='flex items-center justify-start gap-x-[24rem]'>
          <button
            type='button'
            onClick={() => {
              if (status === 'idle') {
                startRecording();
              } else if (status === 'recording') {
                stopRecording();
              }
            }}
            className='flex size-[72rem] items-center justify-center rounded-full bg-d-green hover:bg-d-green-secondary'
          >
            {status === 'idle' && <img src='/images/icon_speakingSection.svg' className='size-[24rem]' alt='recordc' />}
            {status === 'recording' && <img src='/images/icon_audioPause.svg' className='size-[24rem]' alt='recordc' />}
          </button>
          <div className='w-[362px] text-[20rem] font-medium leading-none text-d-black/80'>
            {status === 'idle' && 'Press the button to start recording'}
            {status === 'recording' && 'Recording... Try to say a few words.'}
          </div>
        </div>
      )}
      {/* // * Seclection */}
      {audioBlob && mediaBlobUrl && (
        <>
          <div className='flex flex-col gap-y-[24rem]'>
            <audio
              controls
              ref={audioRef}
              onTimeUpdate={() => setCurrentTimestamp(audioRef?.current?.currentTime)}
              onPause={() => setPlayStatus('paused')}
              onPlay={() => setPlayStatus('playing')}
              className='hidden'
            >
              <source src={mediaBlobUrl} />
            </audio>

            <div className='flex items-center justify-start gap-x-[24rem]'>
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
                height={62}
                barWidth={2}
                gap={2}
                barColor={'#383838'}
                barPlayedColor={'#C9FF55'}
                currentTime={currentTimestamp || 0}
              />
            </div>
          </div>
          <button type='button' onClick={clearBlobUrl} className='mb-[-40rem] text-center text-[15rem] font-semibold text-d-black'>
            Try to record again
          </button>
        </>
      )}
    </>
  );
}
