'use client';

import React, { useEffect, useRef, useState } from 'react';

import { AudioVisualizer } from 'react-audio-visualize';
import { useReactMediaRecorder } from 'react-media-recorder';

interface RecordProps {
  setFieldValue: any;
  currentQuestionNumber: number;
}

export default function Record({ setFieldValue, currentQuestionNumber }: RecordProps) {
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>();
  const [playStatus, setPlayStatus] = useState<'paused' | 'playing'>('paused');
  const [fetchStatus, setFetchStatus] = useState<boolean>(false);

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: false });

  useEffect(() => {
    const fetchAudioFile = async () => {
      const response = await fetch(mediaBlobUrl as string);
      const blob = await response.blob();
      setAudioBlob(blob);
      setFetchStatus(false);
    };

    if (mediaBlobUrl !== undefined && status === 'stopped') {
      setFetchStatus(true);
      fetchAudioFile();
    }
  }, [mediaBlobUrl]);

  return (
    <>
      {/* // * Recording process */}
      {(status === 'idle' || status === 'recording' || status === 'acquiring_media' || status === 'stopping') && (
        <div className='flex w-full items-center justify-between gap-x-[24rem]'>
          <div className='text-[14rem] font-medium leading-none text-d-black/80'>
            {status === 'idle' && 'Press the button to start recording'}
            {status === 'recording' && 'Recording...'}
          </div>
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
        </div>
      )}
      {/* // * Seclection */}
      {audioBlob && mediaBlobUrl && (
        <>
          <div className='flex w-full flex-col items-end gap-y-[24rem]'>
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

            <div className='flex items-center gap-x-[24rem]'>
              <AudioVisualizer
                ref={visualizerRef}
                blob={audioBlob}
                width={200}
                height={62}
                barWidth={2}
                gap={2}
                barColor={'#383838'}
                barPlayedColor={'#000'}
                currentTime={currentTimestamp || 0}
              />
              <button
                type='button'
                onClick={() => {
                  setFieldValue(currentQuestionNumber.toString(), {
                    audioBlob: audioBlob,
                    recordingUrl: mediaBlobUrl,
                  });
                }}
                disabled={fetchStatus}
                className='flex size-[72rem] items-center justify-center rounded-full bg-d-green'
              >
                {fetchStatus ? (
                  <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                ) : (
                  <img src='/images/icon_arrow--right.svg' className='size-[24rem] rotate-[-90deg]' alt='next' />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
