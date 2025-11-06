"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

export type AudioBarState = "idle" | "loading" | "ready" | "playing" | "finished" | "error";

export interface AudioCuePoint {
  time: number;
  questionNumber?: number;
  id?: string;
}

export interface AudioBarHandle {
  stop: () => void;
}

export interface AudioBarProps {
  src: string;
  title?: string;
  cuePoints?: AudioCuePoint[];
  onCueReach?: (cue: AudioCuePoint) => void;
  onStateChange?: (state: AudioBarState) => void;
  className?: string;
  hint?: string;
  onRetry?: () => void;
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const indicatorTransition = { duration: 0.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } as const;

export const AudioBar = React.forwardRef<AudioBarHandle, AudioBarProps>(
  ({ src, title, cuePoints, onCueReach, onStateChange, className, hint = "Start audio when you’re ready", onRetry }, ref) => {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [state, setState] = React.useState<AudioBarState>("idle");
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const hasPlayedRef = React.useRef(false);
    const lastCueIndexRef = React.useRef(-1);

    const sortedCuePoints = React.useMemo(() => {
      if (!cuePoints?.length) {
        return [] as AudioCuePoint[];
      }
      return [...cuePoints].sort((a, b) => a.time - b.time);
    }, [cuePoints]);

    const changeState = React.useCallback(
      (next: AudioBarState) => {
        setState(next);
        onStateChange?.(next);
      },
      [onStateChange],
    );

    const resetPlaybackPosition = React.useCallback(() => {
      const node = audioRef.current;
      if (!node) {
        return;
      }
      node.pause();
      node.currentTime = 0;
      setCurrentTime(0);
    }, []);

    const handleRetry = React.useCallback(() => {
      resetPlaybackPosition();
      setErrorMessage(null);
      changeState(duration > 0 ? "ready" : "idle");
      onRetry?.();
    }, [changeState, duration, onRetry, resetPlaybackPosition]);

    const handlePlayRequest = React.useCallback(async () => {
      const node = audioRef.current;
      if (!node) {
        return;
      }

      if (state === "playing" || state === "loading") {
        return;
      }

      setErrorMessage(null);
      changeState("loading");

      try {
        await node.play();
        hasPlayedRef.current = true;
        changeState("playing");
      } catch (error) {
        setErrorMessage("Unable to start playback. Tap retry.");
        changeState("error");
      }
    }, [changeState, state]);

    const stopPlayback = React.useCallback(() => {
      resetPlaybackPosition();
      changeState(duration > 0 ? "ready" : "idle");
    }, [changeState, duration, resetPlaybackPosition]);

    React.useImperativeHandle(ref, () => ({ stop: stopPlayback }), [stopPlayback]);

    React.useEffect(() => {
      const node = audioRef.current;
      if (!node) {
        return;
      }

      node.autoplay = false;
      node.pause();
      node.currentTime = 0;
      lastCueIndexRef.current = -1;
      hasPlayedRef.current = false;
      setDuration(0);
      setCurrentTime(0);
      setErrorMessage(null);
      changeState("idle");
    }, [changeState, src]);

    React.useEffect(() => {
      const node = audioRef.current;
      if (!node) {
        return;
      }

      const handleLoadedMetadata = () => {
        setDuration(node.duration);
        if (state === "idle" || state === "loading") {
          changeState("ready");
        }
      };

      const handleTimeUpdate = () => {
        setCurrentTime(node.currentTime);

        if (!sortedCuePoints.length) {
          return;
        }

        const nextIndex = lastCueIndexRef.current + 1;
        const nextCue = sortedCuePoints[nextIndex];
        if (nextCue && node.currentTime >= nextCue.time) {
          lastCueIndexRef.current = nextIndex;
          onCueReach?.(nextCue);
        }
      };

      const handleEnded = () => {
        changeState("finished");
        setCurrentTime(node.duration || 0);
      };

      const handlePlaying = () => {
        changeState("playing");
      };

      const handleWaiting = () => {
        if (state === "playing") {
          changeState("loading");
        }
      };

      const handleError = () => {
        setErrorMessage("Audio failed to load. Tap retry.");
        changeState("error");
      };

      node.addEventListener("loadedmetadata", handleLoadedMetadata);
      node.addEventListener("timeupdate", handleTimeUpdate);
      node.addEventListener("ended", handleEnded);
      node.addEventListener("playing", handlePlaying);
      node.addEventListener("waiting", handleWaiting);
      node.addEventListener("error", handleError);

      return () => {
        node.removeEventListener("loadedmetadata", handleLoadedMetadata);
        node.removeEventListener("timeupdate", handleTimeUpdate);
        node.removeEventListener("ended", handleEnded);
        node.removeEventListener("playing", handlePlaying);
        node.removeEventListener("waiting", handleWaiting);
        node.removeEventListener("error", handleError);
      };
    }, [changeState, onCueReach, sortedCuePoints, state]);

    React.useEffect(() => {
      return () => {
        audioRef.current?.pause();
      };
    }, []);

    const showPlayButton = state === "idle" || state === "ready" || state === "error" || state === "finished";
    const showHint = state === "idle" || state === "ready";
    const showLoader = state === "loading" && !errorMessage;
    const isReplay = state === "finished" && hasPlayedRef.current;

    return (
      <div
        className={cn(
          "flex w-full flex-col gap-[10rem] rounded-[18rem] border border-[#e1d6b4] bg-[#FEFBEA]/60 px-[16rem] py-[14rem] text-d-black shadow-[0_12rem_32rem_rgba(56,56,56,0.16)]",
          className,
        )}
      >
        <div className="flex items-center gap-[14rem]">
          {showPlayButton ? (
            <button
              type="button"
              onClick={state === "error" ? handleRetry : handlePlayRequest}
              className={cn(
                "flex size-[44rem] items-center justify-center rounded-full border border-[#dacfae] bg-white text-d-black transition",
                "hover:bg-d-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60",
              )}
              aria-label={isReplay ? "Replay audio" : "Play audio"}
            >
              <Play className="size-[18rem]" aria-hidden="true" />
            </button>
          ) : (
            <motion.div
              className="flex size-[44rem] items-center justify-center rounded-full border border-[#dacfae] bg-white"
              animate={{ scale: [1, 0.94, 1] }}
              transition={indicatorTransition}
              aria-hidden="true"
            >
              <div className="size-[12rem] rounded-full bg-d-green" />
            </motion.div>
          )}

          <div className="flex flex-1 flex-col gap-[6rem]">
            {title ? <span className="truncate text-[13rem] font-semibold text-d-black/80">{title}</span> : null}
            {showHint ? <span className="text-[12rem] font-medium text-d-black/60">{hint}</span> : null}
            {showLoader ? (
              <motion.span
                className="h-[8rem] w-full rounded-full bg-[#f3edd3]"
                layout
                transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
              />
            ) : (
              <div className="relative h-[8rem] w-full overflow-hidden rounded-full bg-[#f3edd3]">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
                  transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.7 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-[#C9FF55]"
                />
              </div>
            )}
            {errorMessage ? <span className="text-[12rem] font-semibold text-[#B42318]">{errorMessage}</span> : null}
          </div>

          <div className="flex shrink-0 flex-col items-end justify-center text-[12rem] font-semibold text-d-black/70">
            <span aria-live="polite">{formatTime(currentTime)}</span>
            <span className="text-d-black/45">{formatTime(duration)}</span>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          autoPlay={false}
          onCanPlay={() => {
            if (state === "loading" && !hasPlayedRef.current) {
              changeState("ready");
            }
          }}
        />
      </div>
    );
  },
);

AudioBar.displayName = "AudioBar";
