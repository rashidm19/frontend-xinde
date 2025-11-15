'use client';

import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { IS_NOT_PROD_BUILD } from '@/lib/config';

type AudioVisualizerType = (typeof import('react-audio-visualize'))['AudioVisualizer'];
type AudioVisualizerProps = ComponentProps<AudioVisualizerType>;

const AudioVisualizerClient = (props: AudioVisualizerProps) => {
  const [Visualizer, setVisualizer] = useState<AudioVisualizerType | null>(null);

  useEffect(() => {
    let active = true;

    void import('react-audio-visualize')
      .then(module => {
        if (active) {
          setVisualizer(() => module.AudioVisualizer);
        }
      })
      .catch(error => {
        if (IS_NOT_PROD_BUILD) {
          console.error('Failed to load audio visualizer', error);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!Visualizer) {
    return null;
  }

  return <Visualizer {...props} />;
};

export default AudioVisualizerClient;
