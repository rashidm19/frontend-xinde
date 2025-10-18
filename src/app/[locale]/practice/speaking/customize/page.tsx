'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import nProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import axiosInstance from '@/lib/axiosInstance';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { GET_practice_speaking_categories } from '@/api/GET_practice_speaking_categories';
import type { PracticeSpeakingCategoriesResponse, PracticeSpeakingListResponse } from '@/types/PracticeSpeaking';

export default function Page() {
  const router = useRouter();
  const { tImgAlts, tCommon, tActions, tForm } = useCustomTranslations('practice.speaking.customize');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const { data } = useQuery<PracticeSpeakingCategoriesResponse>({
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

      const topicParam = selectedTopic === 'random' ? randomTopic() : selectedTopic;

      const params: Record<string, string | number> = {
        part: selectedPart,
      };

      if (topicParam) {
        params.tag_id = topicParam;
      }

      const result = await axiosInstance.get<PracticeSpeakingListResponse>('/practice/speaking', {
        params,
        validateStatus: () => true,
      });

      if (result.status >= 200 && result.status < 300) {
        nProgress.start();
        const json = result.data;
        if (Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem('practiceSpeakingId', json.data[0].speaking_id.toString());
          localStorage.setItem('practiceSpeakingPart', String(selectedPart));
          router.push('/practice/speaking/rules/');
        } else {
          console.error('Нет доступных speaking_id');
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  const categoriesByPart = useMemo(() => {
    if (!data) {
      return [] as PracticeSpeakingCategoriesResponse['data'][number]['tags'];
    }

    return data.data.find(category => category.name === `speaking_part_${selectedPart}`)?.tags ?? [];
  }, [data, selectedPart]);

  const randomTopic = () => {
    if (categoriesByPart.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * categoriesByPart.length);
    const randomId = categoriesByPart[randomIndex]?.id;
    return randomId != null ? String(randomId) : null;
  };

  return (
    <main className='relative min-h-screen bg-d-red-secondary'>
      {data && (
        <div className='relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-[16rem] py-[48rem]'>
          <div className='shadow-car relative flex w-full max-w-[720rem] flex-col gap-[32rem] rounded-[20rem] border border-white/80 bg-white/95 px-[40rem] py-[36rem] backdrop-blur-sm'>
            <Link href='/practice' className='absolute right-[24rem] top-[24rem] flex size-[36rem] items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200'>
              <img src='/images/icon_cross.svg' alt={tImgAlts('close')} className='size-[18rem]' />
            </Link>

            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[48rem] items-center justify-center rounded-full bg-d-red-secondary'>
                <img src='/images/icon_speakingSection.svg' className='size-[22rem]' alt={tImgAlts('speaking')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('speaking')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>{tCommon('minCount', { count: 14 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>3</div>
              </div>
            </div>

            <div>
              <h1 className='mb-[28rem] text-[24rem] font-semibold leading-tight text-d-black'>{tCommon('tasksSelection')}</h1>
              <div className='mb-[32rem]'>
                <label className='mb-[12rem] block text-[16rem] leading-snug text-d-black/80'>Please select a part of Speaking section you want to practice.</label>
                <div className='grid grid-cols-3 gap-x-[12rem]'>
                  {[1, 2, 3].map(part => (
                    <button
                      key={part}
                      type='button'
                      className={`flex h-[60rem] items-center justify-center rounded-[16rem] border-[2rem] border-d-light-gray text-[18rem] font-semibold transition-colors ${selectedPart === part ? 'bg-d-light-gray text-d-black' : 'bg-white/10 text-d-black/70 hover:bg-d-light-gray/70'}`}
                      onClick={() => {
                        if (selectedPart !== part) {
                          setSelectedTopic('random');
                          setSelectedPart(part as 1 | 2 | 3);
                        }
                      }}
                    >
                      {tCommon('partNumber', { number: part })}
                    </button>
                  ))}
                </div>
              </div>

              <div className='mb-[28rem]'>
                <label className='mb-[12rem] block text-[16rem] leading-snug text-d-black/80'>{tCommon('pleaseSelectType')}</label>
                <Select defaultValue='random' value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className='h-[58rem] rounded-[16rem] bg-d-light-gray px-[28rem] text-[18rem] font-semibold leading-normal text-d-black data-[state=open]:rounded-b-none'>
                    <SelectValue placeholder={tForm('placeholders.random')} className='placeholder:text-d-black/60' />
                  </SelectTrigger>

                  <SelectContent className='mt-0 max-h-[240rem] rounded-b-[24rem] border border-d-light-gray/70 bg-white/95 shadow-[0_18rem_45rem_-30rem_rgba(15,23,42,0.28)]'>
                    <SelectItem value='random' className='h-[48rem] px-[28rem] text-[16rem] font-medium leading-none text-d-black hover:bg-d-light-gray/70 data-[highlighted=true]:bg-d-light-gray/90'>
                      {tCommon('random')}
                    </SelectItem>

                    {categoriesByPart.map(tag => (
                      <SelectItem
                        key={tag.id}
                        value={String(tag.id)}
                        className='h-[48rem] px-[28rem] text-[16rem] font-medium leading-none text-d-black hover:bg-d-light-gray/70 data-[highlighted=true]:bg-d-light-gray/90'
                      >
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={startPractice}
                disabled={isStarting || isCheckingAccess}
                className='mx-auto flex h-[56rem] w-[240rem] items-center justify-center rounded-[32rem] bg-d-green text-[18rem] font-semibold hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
              >
                {isStarting || isCheckingAccess ? '...' : tActions('continue')}
              </button>
              <SubscriptionAccessLabel className='mt-[10rem] text-center text-[12rem]' />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
