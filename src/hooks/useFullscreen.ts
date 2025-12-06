'use client';

import { useCallback, useEffect, useState } from 'react';

interface FullscreenAPI {
  requestFullscreen: string;
  exitFullscreen: string;
  fullscreenElement: string;
  fullscreenEnabled: string;
  fullscreenchange: string;
}

const getFullscreenAPI = (): FullscreenAPI | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const apis: FullscreenAPI[] = [
    {
      requestFullscreen: 'requestFullscreen',
      exitFullscreen: 'exitFullscreen',
      fullscreenElement: 'fullscreenElement',
      fullscreenEnabled: 'fullscreenEnabled',
      fullscreenchange: 'fullscreenchange',
    },
    {
      requestFullscreen: 'webkitRequestFullscreen',
      exitFullscreen: 'webkitExitFullscreen',
      fullscreenElement: 'webkitFullscreenElement',
      fullscreenEnabled: 'webkitFullscreenEnabled',
      fullscreenchange: 'webkitfullscreenchange',
    },
    {
      requestFullscreen: 'mozRequestFullScreen',
      exitFullscreen: 'mozCancelFullScreen',
      fullscreenElement: 'mozFullScreenElement',
      fullscreenEnabled: 'mozFullScreenEnabled',
      fullscreenchange: 'mozfullscreenchange',
    },
    {
      requestFullscreen: 'msRequestFullscreen',
      exitFullscreen: 'msExitFullscreen',
      fullscreenElement: 'msFullscreenElement',
      fullscreenEnabled: 'msFullscreenEnabled',
      fullscreenchange: 'MSFullscreenChange',
    },
  ];

  for (const api of apis) {
    if (api.fullscreenEnabled in document) {
      return api;
    }
  }

  return null;
};

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

export function useFullscreen(): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [api] = useState<FullscreenAPI | null>(() => getFullscreenAPI());

  const isSupported = api !== null;

  const checkFullscreen = useCallback(() => {
    if (!api) {
      return false;
    }
    return !!(document as any)[api.fullscreenElement];
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(checkFullscreen());
    };

    document.addEventListener(api.fullscreenchange, handleFullscreenChange);

    setIsFullscreen(checkFullscreen());

    return () => {
      document.removeEventListener(api.fullscreenchange, handleFullscreenChange);
    };
  }, [api, checkFullscreen]);

  const enter = useCallback(async () => {
    if (!api) {
      return;
    }

    try {
      const element = document.documentElement as any;
      if (element[api.requestFullscreen]) {
        await element[api.requestFullscreen]();
      }
    } catch (error) {
      console.warn('[useFullscreen] Failed to enter fullscreen:', error);
    }
  }, [api]);

  const exit = useCallback(async () => {
    if (!api) {
      return;
    }

    try {
      const doc = document as any;
      if (doc[api.exitFullscreen]) {
        await doc[api.exitFullscreen]();
      }
    } catch (error) {
      console.warn('[useFullscreen] Failed to exit fullscreen:', error);
    }
  }, [api]);

  const toggle = useCallback(async () => {
    if (checkFullscreen()) {
      await exit();
    } else {
      await enter();
    }
  }, [checkFullscreen, enter, exit]);

  return {
    isFullscreen,
    isSupported,
    enter,
    exit,
    toggle,
  };
}
