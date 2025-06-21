'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Header } from '@/components/Header';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export default function Page() {
  const { data, status } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      fetch(`https://api.studybox.kz/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(res => res.json()),
  });

  return (
    <>
      <Header name={data?.name} avatar={data?.avatar} />
      <main>
        <div className='container max-w-[1440rem] p-[40rem]'>
          <Tabs defaultValue='reading'>
            <TabsList className='mb-[24rem] gap-x-[8rem] rounded-[40rem] bg-white p-[8rem]'>
              <TabsTrigger className='h-[45rem] w-[118rem] gap-x-[8rem] rounded-[40rem] bg-white data-[state=active]:bg-d-blue-secondary' value='writing'>
                <img src='/images/icon_writingSection.svg' alt='writing' className='w-[14rem]' />
                <span className='text-[14rem] font-semibold'>Writing</span>
              </TabsTrigger>
              <TabsTrigger className='h-[45rem] w-[118rem] gap-x-[8rem] rounded-[40rem] bg-white data-[state=active]:bg-d-red-secondary' value='speaking'>
                <img src='/images/icon_speakingSection.svg' alt='speaking' className='w-[14rem]' />
                <span className='text-[14rem] font-semibold'>Speaking</span>
              </TabsTrigger>
              <TabsTrigger className='h-[45rem] w-[118rem] gap-x-[8rem] rounded-[40rem] bg-white data-[state=active]:bg-d-yellow-secondary' value='reading'>
                <img src='/images/icon_readingSection.svg' alt='reading' className='w-[14rem]' />
                <span className='text-[14rem] font-semibold'>Reading</span>
              </TabsTrigger>
              <TabsTrigger className='h-[45rem] w-[118rem] gap-x-[8rem] rounded-[40rem] bg-white data-[state=active]:bg-d-mint' value='listening'>
                <img src='/images/icon_listeningSection.svg' alt='listening' className='w-[14rem]' />
                <span className='text-[14rem] font-semibold'>Listening</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='writing' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-blue-secondary p-[16rem]'>
              <img
                src='/images/illustration_molecule--02.png'
                alt='illustration'
                className='pointer-events-none absolute right-0 top-0 h-auto w-[324rem] mix-blend-multiply'
              />
              <img
                src='/images/illustration_torusArray--02.png'
                alt='illustration'
                className='pointer-events-none absolute bottom-0 left-0 h-auto w-[360rem] mix-blend-multiply'
              />

              <div className='flex justify-between'>
                <div className='flex gap-x-[8rem]'>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>~ 60 minutes</div>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>2 parts</div>
                </div>
              </div>

              <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
                <h1 className='text-[32rem] font-medium leading-none'>Practice writing section</h1>
                <p className='text-center text-[14rem] font-medium leading-tight'>
                  The points received will not be displayed
                  <br /> in the overall statistics{' '}
                </p>
                <Link
                  href='/[locale]/practice/writing/customize'
                  className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
                >
                  Take the test
                </Link>
              </div>
            </TabsContent>
            <TabsContent value='speaking' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-red-secondary p-[16rem]'>
              <img
                src='/images/illustration_flowerOrange.png'
                alt='illustration'
                className='pointer-events-none absolute bottom-[-100rem] left-[-10rem] h-auto w-[392rem] rotate-[-16deg] opacity-20 mix-blend-multiply'
              />
              <img
                src='/images/illustration_halfspheres.png'
                alt='illustration'
                className='pointer-events-none absolute bottom-[-40rem] right-[40rem] h-auto w-[264rem] rotate-[-8deg] opacity-20 mix-blend-multiply'
              />

              <div className='flex justify-between'>
                <div className='flex gap-x-[8rem]'>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>~ 14 minutes</div>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>3 parts</div>
                </div>
              </div>

              <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
                <h1 className='text-[32rem] font-medium leading-none'>Practice speaking section</h1>
                <p className='text-center text-[14rem] font-medium leading-tight'>
                  The points received will not be displayed
                  <br /> in the overall statistics{' '}
                </p>
                <Link
                  href='/[locale]/practice/speaking/customize'
                  className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
                >
                  Take the test
                </Link>
              </div>
            </TabsContent>
            <TabsContent value='reading' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-yellow-secondary p-[16rem]'>
              <img
                src='/images/illustration_pyramide.png'
                alt='illustration'
                className='pointer-events-none absolute right-[28rem] top-[8rem] h-auto w-[228rem] rotate-[12deg] opacity-30 mix-blend-multiply'
              />
              <img
                src='/images/illustration_softball.png'
                alt='illustration'
                className='pointer-events-none absolute bottom-[-160rem] left-[60rem] h-auto w-[321rem] opacity-30 mix-blend-multiply'
              />

              <div className='flex justify-between'>
                <div className='flex gap-x-[8rem]'>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>~ 60 minutes</div>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>3 parts</div>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>40 questions</div>
                </div>
              </div>

              <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
                <h1 className='text-[32rem] font-medium leading-none'>Practice reading section</h1>
                <p className='text-center text-[14rem] font-medium leading-tight'>
                  The points received will not be displayed
                  <br /> in the overall statistics{' '}
                </p>
                <Link
                  href='/[locale]/practice/reading/rules'
                  className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
                >
                  Take the test
                </Link>
              </div>
            </TabsContent>
            <TabsContent value='listening' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-mint p-[16rem]'>
              <img
                src='/images/illustration_bread.png'
                alt='illustration'
                className='pointer-events-none absolute right-[37rem] top-[28rem] h-auto w-[220rem] opacity-60 mix-blend-multiply'
              />
              <img
                src='/images/illustration_abstract.png'
                alt='illustration'
                className='pointer-events-none absolute bottom-[-10rem] left-[-50rem] h-auto w-[302rem] rotate-[8deg] opacity-60 mix-blend-multiply'
              />

              <div className='flex justify-between'>
                <div className='flex gap-x-[8rem]'>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>~ 40 minutes</div>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>4 parts</div>
                  <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>40 questions</div>
                </div>
              </div>

              <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
                <h1 className='text-[32rem] font-medium leading-none'>Practice listening section</h1>
                <p className='text-center text-[14rem] font-medium leading-tight'>
                  The points received will not be displayed
                  <br /> in the overall statistics{' '}
                </p>
                <Link
                  href='/[locale]/practice/listening/rules'
                  className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
                >
                  Take the test
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className='mb-[24rem] text-center text-[12rem]'>© All rights reserved</footer>
    </>
  );
}
