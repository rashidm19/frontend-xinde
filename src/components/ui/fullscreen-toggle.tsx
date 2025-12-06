'use client';

import { Maximize2, Minimize2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export interface FullscreenToggleProps {
  className?: string;
}

export function FullscreenToggle({ className }: FullscreenToggleProps) {
  const { isFullscreen, isSupported, toggle } = useFullscreen();
  const { tActions } = useCustomTranslations();

  if (!isSupported) {
    return null;
  }

  const label = isFullscreen ? tActions('fullscreen.exit') : tActions('fullscreen.enter');
  const Icon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isFullscreen}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-[999rem] border border-slate-200 bg-white p-[8rem] text-slate-700 transition',
        'hover:border-slate-300 hover:text-slate-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
        'tablet:p-[10rem]',
        className
      )}
    >
      <Icon className="size-[16rem]" aria-hidden="true" />
    </button>
  );
}
