import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface AnimatedProgressBarProps {
  startValue: number;
  endValue: number;
  isAnimating: boolean;
  duration: number;
  maxValue: number;
  width?: number;
  height?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressGradient: {
    startColor: string;
    endColor: string;
  };
  textColor?: string;
  no_results_text?: string;
  containerClassName?: string;
}

export const AnimatedHorseshoeProgressBar: React.FC<AnimatedProgressBarProps> = ({
  startValue,
  endValue,
  isAnimating,
  duration,
  maxValue,
  width = 400,
  height = 400,
  strokeWidth = 20,
  circleColor = '#e5e7eb',
  progressGradient,
  textColor = '#000000',
  no_results_text,
  containerClassName,
}) => {
  const { t } = useCustomTranslations('home');

  const [currentValue, setCurrentValue] = useState(startValue);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };

    const easedProgress = easeOutCubic(progress);

    // Calculate new value based on animation direction
    const newValue = isAnimating ? startValue + (endValue - startValue) * easedProgress : endValue - (endValue - startValue) * easedProgress;

    setCurrentValue(newValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    startTimeRef.current = undefined;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  // SVG drawing logic from original HorseshoeProgressBar
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - strokeWidth / 2;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInRadians: number) => {
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const arc = (start: number, end: number) => {
    const startPoint = polarToCartesian(center.x, center.y, radius, end);
    const endPoint = polarToCartesian(center.x, center.y, radius, start);
    const largeArcFlag = end - start <= Math.PI ? '0' : '1';

    return ['M', startPoint.x, startPoint.y, 'A', radius, radius, 0, largeArcFlag, 0, endPoint.x, endPoint.y].join(' ');
  };

  const backgroundPath = arc(startAngle, endAngle);
  const progressAngle = startAngle + (endAngle - startAngle) * (currentValue / maxValue);
  const progressPath = arc(startAngle, progressAngle);

  const gradientId = `progressGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', containerClassName)} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor={progressGradient.startColor} />
            <stop offset='100%' stopColor={progressGradient.endColor} />
          </linearGradient>
        </defs>
        <path d={backgroundPath} fill='none' stroke={circleColor} strokeWidth={strokeWidth} strokeLinecap='round' />
        <path d={progressPath} fill='none' stroke={`url(#${gradientId})`} strokeWidth={strokeWidth} strokeLinecap='round' />
      </svg>
      <div className='absolute text-center' style={{ color: textColor }}>
        {currentValue > 0 ? (
          <div className='flex flex-col'>
            <div className='text-[16rem] font-semibold tracking-[-0.1rem] tablet:text-[18rem] tablet:tracking-[-0.2rem] desktop:text-[24rem] desktop:tracking-[-0.3rem] wide:text-[32rem]'>
              {currentValue.toFixed(1)}
            </div>
            <div className='-mt-[3rem] text-[14rem] tracking-[-0.1rem] tablet:-mt-[6rem] tablet:text-[13rem] tablet:tracking-[-0.2rem] desktop:-mt-[8rem] desktop:text-[18rem] desktop:tracking-[-0.3rem] wide:-mt-[10rem] wide:text-[24rem]'>
              {t('common.points')}
            </div>
          </div>
        ) : (
          <div className='max-w-[40rem] text-[14rem] tracking-[-0.1rem] tablet:max-w-[80rem] tablet:text-[13rem] tablet:tracking-[-0.2rem] desktop:max-w-[100rem] desktop:text-[18rem] desktop:tracking-[-0.3rem] wide:max-w-[120rem] wide:text-[24rem]'>
            {no_results_text || t('animatedHorseshoeProgressBar.noResults')}
          </div>
        )}
      </div>
    </div>
  );
};
