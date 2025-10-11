'use client';

import React, { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface ILogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  showStudyboxText?: boolean;
}

export function Logo({ className, showStudyboxText, ...props }: ILogoProps) {
  return (
    <div className='flex items-center justify-center gap-x-[6rem]'>
      <img src='/images/logo.svg' alt='StudyBox' className={cn('h-[36rem]', className)} {...props} />
      {showStudyboxText && <span className='font-poppins text-[21rem] font-semibold'>studybox</span>}
    </div>
  );
}
