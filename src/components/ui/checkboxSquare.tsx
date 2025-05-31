'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const CheckboxSquare = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer flex size-[16rem] shrink-0 items-center justify-center !rounded-[2rem] border-[2rem] border-d-black/80 bg-d-light-gray ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('size-[80%] rounded-[2rem] bg-d-black text-current')}></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);
CheckboxSquare.displayName = CheckboxPrimitive.Root.displayName;

export { CheckboxSquare };
