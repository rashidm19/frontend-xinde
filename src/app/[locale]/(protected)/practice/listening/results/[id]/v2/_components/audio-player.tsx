'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { Check, ChevronDown, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  shouldReduceMotion: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x', sublabel: 'Slow' },
  { value: 0.75, label: '0.75x', sublabel: null },
  { value: 1, label: '1x', sublabel: 'Normal' },
  { value: 1.25, label: '1.25x', sublabel: null },
  { value: 1.5, label: '1.5x', sublabel: null },
  { value: 2, label: '2x', sublabel: 'Fast' },
] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ src, shouldReduceMotion }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery('(max-width: 767px)');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState<(typeof PLAYBACK_RATES)[number]>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [speedSheetOpen, setSpeedSheetOpen] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (!isDraggingProgress) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, isDraggingProgress]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      setError('Playback failed');
    }
  }, [isPlaying]);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !audioRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleProgressDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!progressRef.current || !audioRef.current || !isDraggingProgress) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * duration;
      setCurrentTime(newTime);
    },
    [duration, isDraggingProgress]
  );

  const handleProgressDragEnd = useCallback(() => {
    if (audioRef.current && isDraggingProgress) {
      audioRef.current.currentTime = currentTime;
    }
    setIsDraggingProgress(false);
  }, [currentTime, isDraggingProgress]);

  // Mouse events for progress drag
  useEffect(() => {
    if (!isDraggingProgress) return;

    const handleMouseMove = (e: MouseEvent) => handleProgressDrag(e);
    const handleMouseUp = () => handleProgressDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress, handleProgressDrag, handleProgressDragEnd]);

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
    if (percent > 0) setIsMuted(false);
  }, []);

  const handleVolumeDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!volumeRef.current || !isDraggingVolume) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(percent);
      if (percent > 0) setIsMuted(false);
    },
    [isDraggingVolume]
  );

  // Mouse events for volume drag
  useEffect(() => {
    if (!isDraggingVolume) return;

    const handleMouseMove = (e: MouseEvent) => handleVolumeDrag(e);
    const handleMouseUp = () => setIsDraggingVolume(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVolume, handleVolumeDrag]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleSpeedSelect = useCallback((rate: (typeof PLAYBACK_RATES)[number]) => {
    setPlaybackRate(rate);
    setSpeedSheetOpen(false);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    },
    [togglePlay, skip, toggleMute]
  );

  if (error) {
    return (
      <div className='rounded-[32rem] border border-[#E1D6B4] bg-white px-[24rem] py-[20rem] text-center text-[14rem] text-d-black/70 shadow-[0_18rem_48rem_-30rem_rgba(56,56,56,0.18)]'>
        {error}
      </div>
    );
  }

  return (
    <motion.section
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.4, ease: 'easeOut' }}
      className='rounded-[32rem] border border-[#E1D6B4] bg-white px-[24rem] py-[20rem] shadow-[0_18rem_48rem_-30rem_rgba(56,56,56,0.18)] tablet:px-[32rem] tablet:py-[24rem]'
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='region'
      aria-label='Audio player'
    >
      <div className={cn('flex flex-col gap-[16rem]', isMobile ? '' : 'gap-[20rem]')}>
        {/* Header */}
        <div className='flex items-center gap-[8rem]'>
          <span className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-[#85784A]'>Audio Recording</span>
          {isLoading && <span className='size-[12rem] animate-pulse rounded-full bg-[#4C7A3A]' aria-label='Loading' />}
        </div>

        {/* Main controls */}
        <div className={cn('flex items-center gap-[12rem]', isMobile ? 'flex-wrap justify-center' : 'justify-start')}>
          {/* Skip back */}
          <button
            type='button'
            onClick={() => skip(-10)}
            className='flex size-[44rem] items-center justify-center rounded-full bg-[#F3EDD3] text-[#6F6335] transition hover:bg-[#E1D6B4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2'
            aria-label='Skip back 10 seconds'
          >
            <RotateCcw className='size-[18rem]' />
          </button>

          {/* Play/Pause */}
          <button
            type='button'
            onClick={togglePlay}
            disabled={isLoading}
            className={cn(
              'flex size-[56rem] items-center justify-center rounded-full bg-[#4C7A3A] text-white transition',
              'hover:bg-[#3C612E] disabled:opacity-50 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E25] focus-visible:ring-offset-2'
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className='size-[24rem]' /> : <Play className='ml-[2rem] size-[24rem]' />}
          </button>

          {/* Skip forward */}
          <button
            type='button'
            onClick={() => skip(10)}
            className='flex size-[44rem] items-center justify-center rounded-full bg-[#F3EDD3] text-[#6F6335] transition hover:bg-[#E1D6B4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2'
            aria-label='Skip forward 10 seconds'
          >
            <RotateCw className='size-[18rem]' />
          </button>

          {/* Time display */}
          <div className={cn('flex items-center gap-[6rem] text-[13rem] font-medium text-d-black/70', isMobile ? 'w-full justify-center mt-[8rem]' : 'ml-[8rem]')}>
            <span className='tabular-nums'>{formatTime(currentTime)}</span>
            <span>/</span>
            <span className='tabular-nums'>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className='flex items-center gap-[12rem]'>
          <div
            ref={progressRef}
            role='slider'
            aria-label='Audio progress'
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            tabIndex={0}
            className='relative h-[8rem] flex-1 cursor-pointer rounded-full bg-[#E1D6B4]'
            onClick={handleProgressClick}
            onMouseDown={() => setIsDraggingProgress(true)}
          >
            <div
              className='absolute left-0 top-0 h-full rounded-full bg-[#4C7A3A] transition-[width]'
              style={{ width: `${progressPercent}%`, transition: isDraggingProgress ? 'none' : undefined }}
            />
            <div
              className='absolute top-1/2 size-[16rem] -translate-y-1/2 rounded-full border-[2rem] border-white bg-[#4C7A3A] shadow-[0_2rem_6rem_rgba(0,0,0,0.2)] transition-[left]'
              style={{ left: `calc(${progressPercent}% - 8rem)`, transition: isDraggingProgress ? 'none' : undefined }}
            />
          </div>
        </div>

        {/* Speed and volume controls */}
        <div className={cn('flex items-center gap-[16rem] justify-between')}>
          {/* Speed controls */}
          {isMobile ? (
            <button
              type="button"
              onClick={() => setSpeedSheetOpen(true)}
              className="inline-flex items-center gap-[6rem] rounded-[999rem] bg-[#F3EDD3] px-[14rem] py-[10rem] text-[13rem] font-semibold text-[#6F6335] transition hover:bg-[#E1D6B4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2"
              aria-haspopup="dialog"
              aria-expanded={speedSheetOpen}
            >
              <span>Speed</span>
              <span className="rounded-[6rem] bg-[#4C7A3A] px-[8rem] py-[2rem] text-[12rem] text-white">{playbackRate}x</span>
              <ChevronDown className="size-[14rem]" />
            </button>
          ) : (
            <div className="flex items-center gap-[6rem]">
              <span className="mr-[4rem] text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#85784A]">Speed</span>
              {PLAYBACK_RATES.map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={cn(
                    'min-w-[40rem] rounded-[8rem] px-[10rem] py-[6rem] text-[12rem] font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1',
                    playbackRate === rate ? 'bg-[#4C7A3A] text-white' : 'bg-[#F3EDD3] text-[#6F6335] hover:bg-[#E1D6B4]'
                  )}
                  aria-pressed={playbackRate === rate}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}

          {/* Volume controls */}
          <div className={cn('flex items-center gap-[10rem]', isMobile ? 'w-full justify-center' : '')}>
            <button
              type='button'
              onClick={toggleMute}
              className='flex size-[36rem] items-center justify-center rounded-full text-[#6F6335] transition hover:bg-[#F3EDD3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1'
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className='size-[18rem]' /> : <Volume2 className='size-[18rem]' />}
            </button>
            <div
              ref={volumeRef}
              role='slider'
              aria-label='Volume'
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volumePercent}
              aria-valuetext={`${Math.round(volumePercent)}% volume`}
              tabIndex={0}
              className='relative h-[6rem] w-[80rem] cursor-pointer rounded-full bg-[#E1D6B4]'
              onClick={handleVolumeClick}
              onMouseDown={() => setIsDraggingVolume(true)}
            >
              <div
                className='absolute left-0 top-0 h-full rounded-full bg-[#4C7A3A] transition-[width]'
                style={{ width: `${volumePercent}%`, transition: isDraggingVolume ? 'none' : undefined }}
              />
              <div
                className='absolute top-1/2 size-[14rem] -translate-y-1/2 rounded-full border-[2rem] border-white bg-[#4C7A3A] shadow-[0_2rem_6rem_rgba(0,0,0,0.2)] transition-[left]'
                style={{ left: `calc(${volumePercent}% - 7rem)`, transition: isDraggingVolume ? 'none' : undefined }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Speed Selection BottomSheet */}
      {isMobile && (
        <BottomSheet open={speedSheetOpen} onOpenChange={setSpeedSheetOpen}>
          <BottomSheetContent className="px-[4rem]">
            <div className="flex h-full flex-col">
              {/* Header */}
              <header className="sticky top-0 z-[1] flex items-center justify-between gap-[12rem] border-b border-[#E1D6B4] bg-white/95 px-[12rem] py-[14rem] backdrop-blur">
                <div className="space-y-[2rem] text-left">
                  <span className="text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]">Audio Settings</span>
                  <h2 className="text-[18rem] font-semibold text-d-black">Playback Speed</h2>
                </div>
                <BottomSheetClose asChild>
                  <button
                    type="button"
                    className="inline-flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#D9CDA9] bg-white text-[#6F6335] transition hover:bg-d-yellow-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2"
                    aria-label="Close"
                  >
                    <span className="text-[16rem] font-semibold">×</span>
                  </button>
                </BottomSheetClose>
              </header>

              {/* Options */}
              <div className="flex-1 overflow-y-auto px-[12rem] py-[20rem]">
                <ul className="flex flex-col gap-[8rem]" role="radiogroup" aria-label="Playback speed">
                  {SPEED_OPTIONS.map(option => {
                    const isActive = playbackRate === option.value;
                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          onClick={() => handleSpeedSelect(option.value as (typeof PLAYBACK_RATES)[number])}
                          className={cn(
                            'flex w-full items-center justify-between rounded-[16rem] border px-[18rem] py-[14rem] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2',
                            isActive ? 'border-[#5e7a3f] bg-[#F0F6E8] text-[#2F5E25]' : 'border-[#E1D6B4] text-[#4B4628] hover:bg-d-yellow-secondary/50'
                          )}
                        >
                          <div className="flex items-center gap-[12rem]">
                            <span
                              className={cn(
                                'flex size-[20rem] items-center justify-center rounded-full border-[2rem]',
                                isActive ? 'border-[#4C7A3A] bg-[#4C7A3A]' : 'border-[#D9CDA9] bg-white'
                              )}
                            >
                              {isActive && <Check className="size-[12rem] text-white" />}
                            </span>
                            <span className="text-[15rem] font-semibold">{option.label}</span>
                            {option.sublabel && <span className="text-[12rem] font-medium text-[#85784A]">{option.sublabel}</span>}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      )}
    </motion.section>
  );
}
