'use client';

import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <main className='min-h-screen overflow-hidden bg-d-light-gray'>
        <div className='container relative min-h-[100dvh] max-w-[1440rem] px-[270rem] py-[80rem]'>
          <img src='/images/illustration_bread.png' alt='illustration' className='absolute right-[81rem] top-[67rem] h-auto w-[238rem] opacity-60 mix-blend-multiply' />
          <img
            src='/images/illustration_abstract.png'
            alt='illustration'
            className='absolute left-[-11rem] top-[738rem] h-auto w-[303rem] opacity-60 mix-blend-multiply'
          />

          <div className='relative flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-primary'>
            {/* // * Cancel practice  */}
            <Link href='/practice' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
              <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
            </Link>
            {/* // * Header */}
            <header className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[52rem] items-center justify-center bg-d-mint'>
                <img src='/images/icon_listeningSection.svg' className='size-[24rem]' alt='listening' />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>Listening</div>
                <div className='text-[20rem] font-medium leading-none'>30 min</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>Parts</div>
                <div className='text-[20rem] font-medium leading-none'>4</div>
              </div>
            </header>

            {/* // * Selection */}
            <section>
              {/*<h1 className='mb-[40rem] text-[32rem] font-medium leading-none'>Tasks selection</h1>*/}
              {/* // * Accent Selection */}
              {/*<div className='mb-[32rem]'>*/}
              {/*  <label className='mb-[16rem] block text-[20rem] leading-none'>Please select the accent in which the audio will be played</label>*/}
              {/*  <Select defaultValue='random' value={selectedTopic} onValueChange={setSelectedTopic}>*/}
              {/*    <SelectTrigger className='h-[70rem] rounded-[16rem] bg-d-light-gray px-[40rem] text-[20rem] font-medium leading-normal data-[state=open]:rounded-b-none'>*/}
              {/*      <SelectValue placeholder='Random' className='placeholder:text-d-black/60' />*/}
              {/*    </SelectTrigger>*/}

              {/*    <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>*/}
              {/*      <SelectItem value='random' className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>*/}
              {/*        Random*/}
              {/*      </SelectItem>*/}
              {/*      <SelectItem value='britain' className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>*/}
              {/*        British*/}
              {/*      </SelectItem>*/}
              {/*      <SelectItem value='australian' className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>*/}
              {/*        Australian*/}
              {/*      </SelectItem>*/}
              {/*      <SelectItem value='American' className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>*/}
              {/*        American*/}
              {/*      </SelectItem>*/}
              {/*    </SelectContent>*/}
              {/*  </Select>*/}
              {/*</div>*/}
              {/* // * User agreement */}
              <div className='mb-[56rem] flex items-center gap-x-[12rem]'>
                <Checkbox className='size-[20rem]' checked />
                <div className='text-[16rem] font-medium leading-none'>
                  I accept the{' '}
                  <Link href='/user-agreement' className='border-b border-d-black'>
                    user agreement
                  </Link>
                </div>
              </div>
              {/* // * Next */}
              <Link
                href='/practice/listening/rules'
                className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
              >
                Continue
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
