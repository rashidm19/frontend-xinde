
'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

type SkeletonShapeProps = {
  className?: string;
};

type ListSkeletonProps = {
  count?: number;
  className?: string;
};

export function Skeleton({ className, ...props }: DivProps) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-muted/60', className)} {...props} />;
}

export function SkeletonText({ className }: SkeletonShapeProps) {
  return <Skeleton className={cn('h-4 w-24 rounded-md', className)} />;
}

export function SkeletonAvatar({ className }: SkeletonShapeProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
}

export function SkeletonButton({ className }: SkeletonShapeProps) {
  return <Skeleton className={cn('h-9 w-32 rounded-full', className)} />;
}

export function CardSkeleton({ className }: SkeletonShapeProps) {
  return (
    <div className={cn('space-y-3 rounded-lg border border-muted/40 bg-card/30 p-4', className)}>
      <SkeletonText className='h-5 w-2/3 rounded-md' />
      <SkeletonText className='w-full rounded-md' />
      <SkeletonText className='w-5/6 rounded-md' />
    </div>
  );
}

export function ListSkeleton({ count = 3, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='flex items-center gap-3'>
          <SkeletonAvatar className='h-8 w-8' />
          <SkeletonText className='h-4 flex-1 rounded-md' />
        </div>
      ))}
    </div>
  );
}
