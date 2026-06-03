import React from 'react';
import { cn } from '@/lib/utils';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  width: number;
  height: number;
  strokeWidth: number;
  circleColor: string;
  progressGradient: {
    startColor: string;
    endColor: string;
  };
  textColor: string;
  no_results_text: string;
  containerClassName?: string;
}

export const HorseshoeProgressBar: React.FC<ProgressBarProps> = ({
  value,
  no_results_text,
  maxValue,
  width,
  height,
  strokeWidth,
  circleColor,
  progressGradient,
  textColor,
  containerClassName,
}) => {
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - strokeWidth / 2;
  const startAngle = Math.PI * 0.8; // 144 degrees
  const endAngle = Math.PI * 2.2; // 396 degrees

  const { tCommon } = useCustomTranslations();

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
  const progressAngle = startAngle + (endAngle - startAngle) * (value / maxValue);
  const progressPath = arc(startAngle, progressAngle);

  const gradientId = React.useId();
  const gradientDefinitionId = `progressGradient-${gradientId}`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', containerClassName)} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientDefinitionId} x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor={progressGradient.startColor} />
            <stop offset='100%' stopColor={progressGradient.endColor} />
          </linearGradient>
        </defs>
        <path d={backgroundPath} fill='none' stroke={circleColor} strokeWidth={strokeWidth} strokeLinecap='round' />
        <path d={progressPath} fill='none' stroke={`url(#${gradientDefinitionId})`} strokeWidth={strokeWidth} strokeLinecap='round' />
      </svg>
      <div className='absolute text-center' style={{ color: textColor }}>
        {value > 0 ? (
          <div className='flex flex-col'>
            <div className='text-[20rem] font-semibold tracking-[-0.2rem]'>{value.toFixed(1)}</div>
            <div className='-mt-[6rem] text-[14rem] tracking-[-0.2rem]'>{tCommon('points')}</div>
          </div>
        ) : (
          <div className='max-w-[80rem] text-[14rem] tracking-[-0.2rem]'>{no_results_text}</div>
        )}
      </div>
    </div>
  );
};
