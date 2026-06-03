'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SpeakingFeedbackSkeleton() {
  return (
    <div className='min-h-[100dvh] bg-d-red-secondary'>
      <div className='container w-full px-[18rem] pb-[60rem] pt-[32rem] tablet:max-w-[1600rem] tablet:px-[40rem]'>
        <div className='flex flex-col gap-[32rem]'>
          <Skeleton className='h-[120rem] rounded-[24rem]' />
          <Skeleton className='h-[320rem] rounded-[28rem]' />
          <Skeleton className='h-[240rem] rounded-[28rem]' />
          <Skeleton className='h-[380rem] rounded-[28rem]' />
        </div>
      </div>
    </div>
  );
}

