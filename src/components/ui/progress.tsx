'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface Props extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  backgroundColor: string;
  barColor: string;
}
export const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, Props>(({ className, value, backgroundColor, barColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(`relative h-[14rem] w-full overflow-hidden rounded-[14rem]`, className)}
    style={{ backgroundColor }} // Apply background color here
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={`h-full flex-1 transition-all`}
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundColor: barColor, // Apply bar color inline
        width: '100%', // Ensures the width is full before the transform is applied
      }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;
