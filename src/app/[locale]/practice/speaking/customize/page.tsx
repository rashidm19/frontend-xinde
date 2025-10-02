'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import { GET_practice_speaking_categories } from '@/api/GET_practice_speaking_categories';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import axiosInstance from '@/lib/axiosInstance';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

export default function Page() {
  const router = useRouter();
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const { data } = useQuery({
    queryKey: ['speaking-categories'],
    queryFn: GET_practice_speaking_categories,
  });

  const [selectedPart, setSelectedPart] = useState<1 | 2 | 3>(1);
  const [selectedTopic, setSelectedTopic] = useState<string>('random');

  const [isStarting, setIsStarting] = useState(false);

  const startPractice = async () => {
    if (isStarting || isCheckingAccess) {
      return;
    }

    setIsStarting(true);

    try {
      const canStart = await requireSubscription();

      if (!canStart) {
        return;
      }

    const params = new URLSearchParams();
    params.append('part', String(selectedPart));
    params.append('tag_id', selectedTopic === 'random' ? randomTopic() : selectedTopic);

    const result = await axiosInstance.get('/practice/speaking', {
      params: Object.fromEntries(params.entries()),
      validateStatus: () => true,
    });

    if (result.status >= 200 && result.status < 300) {
      nProgress.start();
      const json = result.data;
      localStorage.setItem('practiceSpeakingId', json.data[0].speaking_id);
      localStorage.setItem('practiceSpeakingPart', String(selectedPart));
      router.push('/practice/speaking/rules/');
    }
    } finally {
      setIsStarting(false);
    }
  };

  const randomTopic = () => {
    const randomIndex = Math.floor(Math.random() * data.data.find((c: any) => c.name === `speaking_part_${selectedPart}`).tags.length);
    return data.data.find((c: any) => c.name === `speaking_part_${selectedPart}`).tags[randomIndex].id;
  };

  return (
    <main className='min-h-screen overflow-hidden bg-d-red-secondary'>
      {data && (
        <div className='container relative min-h-[100dvh] max-w-[1440rem] px-[270rem] pt-[80rem]'>
          <img
            src='/images/illustration_halfspheres.png'
            alt='illustration'
            className='pointer-events-none absolute right-[120rem] top-[140rem] h-auto w-[264rem] rotate-[14deg] opacity-20 mix-blend-multiply'
          />
          <img
            src='/images/illustration_flowerOrange.png'
            alt='illustration'
            className='pointer-events-none absolute left-[-60rem] top-[716rem] h-auto w-[392rem] rotate-[-16deg] opacity-20 mix-blend-multiply'
          />
          <div className='relative z-10 flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-card'>
            {/* // * Header */}
            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[52rem] items-center justify-center bg-d-red-secondary'>
                <img src='/images/icon_speakingSection.svg' className='size-[24rem]' alt='speaking' />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>Speaking</div>
                <div className='text-[20rem] font-medium leading-none'>~ 14 min</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>Parts</div>
                <div className='text-[20rem] font-medium leading-none'>3</div>
              </div>
            </div>
            {/* // * Seclection */}
            <div>
              <h1 className='mb-[40rem] text-[32rem] font-medium leading-none'>Tasks selection</h1>
              {/* // * Part Selection */}
              <div className='mb-[32rem]'>
                <label className='mb-[16rem] block text-[20rem] leading-none'>Please select a part of Speaking section you want to practice.</label>
                <div className='grid grid-cols-3 gap-x-[16rem]'>
                  <button
                    type='button'
                    onClick={() => {
                      selectedPart !== 1 ? setSelectedTopic('random') : null;
                      setSelectedPart(1);
                    }}
                    className={`flex h-[70rem] items-center justify-center rounded-[16rem] border-[3rem] border-d-light-gray text-[20rem] font-medium ${selectedPart === 1 ? 'bg-d-light-gray' : 'bg-transparent'}`}
                  >
                    Part 1
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      selectedPart !== 2 ? setSelectedTopic('random') : null;
                      setSelectedPart(2);
                    }}
                    className={`flex h-[70rem] items-center justify-center rounded-[16rem] border-[3rem] border-d-light-gray text-[20rem] font-medium ${selectedPart === 2 ? 'bg-d-light-gray' : 'bg-transparent'}`}
                  >
                    Part 2
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      selectedPart !== 3 ? setSelectedTopic('random') : null;
                      setSelectedPart(3);
                    }}
                    className={`flex h-[70rem] items-center justify-center rounded-[16rem] border-[3rem] border-d-light-gray text-[20rem] font-medium ${selectedPart === 3 ? 'bg-d-light-gray' : 'bg-transparent'}`}
                  >
                    Part 3
                  </button>
                </div>
              </div>

              {/* // * Topic Selection */}
              <div className='mb-[32rem]'>
                <label className='mb-[16rem] block text-[20rem] leading-none'>Please select a topic.</label>
                <Select defaultValue='random' value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className='h-[70rem] rounded-[16rem] bg-d-light-gray px-[40rem] text-[20rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                    <SelectValue placeholder='Random' className='placeholder:text-d-black/60' />
                  </SelectTrigger>

                  <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                    <SelectItem value='random' className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                      Random
                    </SelectItem>

                    {data.data
                      .find((c: any) => c.name === `speaking_part_${selectedPart}`)
                      .tags.map((tag: any) => (
                        <SelectItem value={tag.id} className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                          {tag.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='mb-[56rem] flex items-center gap-x-[12rem]'>
                <Checkbox className='size-[20rem]' checked />
                <div className='text-[16rem] font-medium leading-none'>
                  I accept the{' '}
                  <a target='_blank' href='https://www.studybox.kz/en/privacy' className='border-b border-d-black'>
                    user agreement
                  </a>
                </div>
              </div>
              <button
                onClick={startPractice}
                disabled={isStarting || isCheckingAccess}
                className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
              >
                {isStarting || isCheckingAccess ? '...' : 'Continue'}
              </button>
              <SubscriptionAccessLabel className='mt-[12rem] text-center' />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
