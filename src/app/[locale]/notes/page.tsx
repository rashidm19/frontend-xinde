'use client';

import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/config';

export default function Notes() {
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(res => res.json()),
  });

  return (
    <>
      <Header name={data?.name} avatar={data?.avatar} />

      <main className='min-h-screen overflow-hidden bg-d-gray'>
        <div className='container mt-[40rem] flex w-[1360rem] max-w-[1440rem] flex-col rounded-[16rem] bg-white p-[40rem]'>
          <div className='mb-[40rem] flex items-start justify-between'>
            {/* // * Виды тэгов */}
            <div className='relative flex w-full items-center justify-start gap-x-[8rem] text-[14rem] font-medium leading-[26rem] tracking-[-0.2rem]'>
              <div className='group flex h-[58rem] w-fit shrink-0 items-center justify-center gap-x-[8rem] rounded-[64rem] border border-d-black/60 bg-white px-[24rem] py-[16rem] text-d-black/60 hover:border-transparent hover:bg-d-black hover:text-white'>
                Recently&nbsp;added <img src='/images/icon_close--white.svg' alt='Icon Delete' className='hidden size-[16rem] group-hover:block' />
              </div>
              <div className='group flex h-[58rem] w-fit shrink-0 items-center justify-center gap-x-[8rem] rounded-[64rem] border border-d-black/60 bg-white px-[24rem] py-[16rem] text-d-black/60 hover:border-transparent hover:bg-d-black hover:text-white'>
                Writing <img src='/images/icon_close--white.svg' alt='Icon Delete' className='hidden size-[16rem] group-hover:block' />
              </div>
              <div className='group flex h-[58rem] w-fit shrink-0 items-center justify-center gap-x-[8rem] rounded-[64rem] border border-d-black/60 bg-white px-[24rem] py-[16rem] text-d-black/60 hover:border-transparent hover:bg-d-black hover:text-white'>
                Speaking <img src='/images/icon_close--white.svg' alt='Icon Delete' className='hidden size-[16rem] group-hover:block' />
              </div>
              <div className='group flex h-[58rem] w-fit shrink-0 items-center justify-center gap-x-[8rem] rounded-[64rem] border border-d-black/60 bg-white px-[24rem] py-[16rem] text-d-black/60 hover:border-transparent hover:bg-d-black hover:text-white'>
                Last&nbsp;viewed <img src='/images/icon_close--white.svg' alt='Icon Delete' className='hidden size-[16rem] group-hover:block' />
              </div>
            </div>

            {/* // * Поиск */}
            <div className='relative'>
              <Input
                type='text'
                placeholder='Search'
                className='relative flex h-[64rem] w-[632rem] !items-center !justify-center !rounded-[40rem] !border-[1.5rem] !border-transparent bg-d-light-gray !py-[24rem] !pl-[64rem] !pr-[40rem] !text-[14rem] !font-semibold !leading-[26rem] !tracking-[-0.2rem] !text-d-black focus:!border-transparent focus-visible:!border-transparent'
              />
              <img src='/images/icon_search--gray.svg' alt='Icon Search' className='absolute left-[40rem] top-[25rem] size-[16rem]' />
            </div>
          </div>

          {/* // * Записи */}
          {/* <div className='grid w-full grid-cols-4 gap-[16rem]'>
            <div className='line-clamp-5 flex h-[136rem] flex-col justify-between rounded-[16rem] bg-d-violet-secondary p-[16rem]'>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black/60'>
                Work on improving the flow between sentences and paragraphs. Use more linking words and phrases (e.g., moreover, furthermore, in addition) to enhance
                coherence.
              </div>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black'>#Tagname</div>{' '}
            </div>
            <div className='line-clamp-5 flex h-[136rem] flex-col justify-between rounded-[16rem] bg-d-blue-secondary p-[16rem]'>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black/60'>
                Work on improving the flow between sentences and paragraphs. Use more linking words and phrases (e.g., moreover, furthermore, in addition) to enhance
                coherence.
              </div>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black'>#Tagname</div>{' '}
            </div>
            <div className='line-clamp-5 flex h-[136rem] flex-col justify-between rounded-[16rem] bg-d-red-secondary p-[16rem]'>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black/60'>
                Work on improving the flow between sentences and paragraphs. Use more linking words and phrases (e.g., moreover, furthermore, in addition) to enhance
                coherence.
              </div>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black'>#Tagname</div>{' '}
            </div>
            <div className='line-clamp-5 flex h-[136rem] flex-col justify-between rounded-[16rem] bg-d-green-secondary p-[16rem]'>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black/60'>
                Work on improving the flow between sentences and paragraphs. Use more linking words and phrases (e.g., moreover, furthermore, in addition) to enhance
                coherence.
              </div>
              <div className='text-[14rem] font-medium leading-[16rem] tracking-[-0.2rem] text-d-black'>#Tagname</div>{' '}
            </div>
          </div> */}

          <div className='text-left text-[18rem]'>
            You don't have any notes.
            <br /> You can add notes after finishing practice of speaking or writing sections, through highlighting important parts of feedback.
          </div>
        </div>
      </main>
    </>
  );
}
