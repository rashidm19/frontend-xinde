'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic as MicIcon, Pause, Play, Square } from 'lucide-react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { useMediaQuery } from 'usehooks-ts';

export default function Mic() {
  const recorderControls = useVoiceVisualizer();
  const {
    startRecording,
    stopRecording,
    recordedBlob,
    isRecordingInProgress,
    clearCanvas,
    isPausedRecordedAudio,
    startAudioPlayback,
    audioRef,
  } = recorderControls;

  const isMobile = useMediaQuery('(max-width: 767px)');
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const isReview = !!recordedBlob && !isRecordingInProgress;
  const isIdle = !isRecordingInProgress && !recordedBlob;

  const togglePlayback = () => {
    if (isPausedRecordedAudio) {
      startAudioPlayback();
    } else {
      audioRef.current?.pause();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    setContainerWidth(containerRef.current.offsetWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isRecordingInProgress, isReview]);

  return (
    <div className='my-[32rem]'>
      <div className='flex items-center justify-center gap-x-[24rem]'>
        {/* Left Action Button */}
        <button
          type='button'
          onClick={() => {
            if (isIdle) {
              startRecording();
            } else if (isRecordingInProgress) {
              stopRecording();
            } else if (isReview) {
              togglePlayback();
            }
          }}
          className='flex size-[72rem] items-center justify-center rounded-full bg-[#C9FF55] text-d-black transition hover:bg-[#b6e64d]'
        >
          {isIdle && <MicIcon className='size-[32rem] text-d-black' />}
          {isRecordingInProgress && <Square className='size-[28rem] text-d-black fill-current' />}
          {isReview && (!isPausedRecordedAudio ? <Pause className='size-[32rem]' /> : <Play className='size-[32rem]' />)}
        </button>

        {/* Right Element */}
        {isIdle && (
          <div className='w-[362rem] text-[20rem] font-medium leading-none text-d-black/80'>Press the button to start recording</div>
        )}

        {(isRecordingInProgress || isReview) && (
          <div
            ref={containerRef}
            className='relative flex h-[48rem] w-full max-w-[362rem] items-center justify-center overflow-hidden rounded-[12rem] border border-[#C9FF55]/20 bg-[#F9FFEA] tablet:h-[64rem]'
          >
            {containerWidth > 0 && (
              <VoiceVisualizer
                controls={recorderControls}
                mainBarColor='#C9FF55'
                secondaryBarColor='#ECFFC3'
                barWidth={2}
                gap={1}
                isControlPanelShown={false}
                isDefaultUIShown={false}
                onlyRecording={isRecordingInProgress}
                height={isMobile ? 48 : 64}
                width={containerWidth}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Element - Review Only */}
      {isReview && (
        <div className='mt-[24rem] flex justify-center'>
          <button type='button' onClick={clearCanvas} className='text-center text-[15rem] font-semibold text-d-black'>
            Try to record again
          </button>
        </div>
      )}
    </div>
  );
}
