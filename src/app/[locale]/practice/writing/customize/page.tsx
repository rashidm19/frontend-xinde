'use client';

import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import nProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import axiosInstance from '@/lib/axiosInstance';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import type { PracticeWritingListResponse } from '@/types/PracticeWriting';

interface WritingCategoryTag {
  id: string;
  name: string;
}

interface WritingCategory {
  name: string;
  tags: WritingCategoryTag[];
}

interface WritingCategoriesResponse {
  data: WritingCategory[];
}

export default function Page() {
  const router = useRouter();
  const { t, tImgAlts, tCommon, tCommonRich, tActions, tForm } = useCustomTranslations('practice.writing.customize');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const { data } = useQuery<WritingCategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get<WritingCategoriesResponse>('/practice/writing/categories').then(res => res.data),
  });

  const [selectedPart, setSelectedPart] = useState<1 | 2>(1);
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
      console.log(data);
      const topicParam = selectedTopic === 'random' ? randomTopic() : selectedTopic;
      const params: Record<string, string | number> = {
        part: selectedPart,
      };

      if (topicParam) {
        params.tag_id = topicParam;
      }

      const result = await axiosInstance.get<PracticeWritingListResponse>('/practice/writing', {
        params,
        validateStatus: () => true,
      });
      if (result.status >= 200 && result.status < 300) {
        nProgress.start();
        const payload = result.data;
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * payload.data.length);
          const randomWritingId = payload.data[randomIndex].writing_id;
          localStorage.setItem('practiceWritingId', String(randomWritingId));
          router.push('/practice/writing/rules/');
        } else {
          console.error('Нет доступных writing_id');
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  const categoriesByPart = useMemo(() => {
    if (!data) {
      return [] as WritingCategoryTag[];
    }

    return data.data.find(category => category.name === `writing_part_${selectedPart}`)?.tags ?? [];
  }, [data, selectedPart]);

  const randomTopic = () => {
    if (categoriesByPart.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * categoriesByPart.length);
    return categoriesByPart[randomIndex]?.id ?? null;
  };

  return (
    <main className='realtive min-h-screen bg-d-blue-secondary'>
      <img src='/images/illustration_torusArray--02.png' alt={tImgAlts('flower')} className='absolute bottom-0 left-0 h-auto w-[320rem] opacity-80' />
      <img src='/images/illustration_molecule.png' alt={tImgAlts('molecule')} className='absolute right-0 top-0 h-auto w-[250rem] opacity-50' />s
      {data && (
        <div className='container min-h-[100dvh] max-w-[1440rem] px-[270rem] pt-[80rem]'>
          <div className='shadow-car flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem]'>
            {/* // * Header */}
            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[52rem] items-center justify-center bg-d-blue-secondary'>
                <img src='/images/icon_writingSection.svg' className='size-[24rem]' alt={tImgAlts('writing')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('writing')}</div>
                <div className='text-[20rem] font-medium leading-none'>{tCommon('minCount', { count: 60 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[20rem] font-medium leading-none'>2</div>
              </div>
            </div>
            {/* // * Seclection */}
            <div>
              <h1 className='mb-[40rem] text-[32rem] font-medium leading-none'>{tCommon('tasksSelection')}</h1>
              {/* // * Part Selection */}
              <div className='mb-[32rem]'>
                <label className='mb-[16rem] block text-[20rem] leading-none'>{t('subtitle')}</label>
                <div className='grid grid-cols-2 gap-x-[16rem]'>
                  <button
                    type='button'
                    className={`flex h-[70rem] items-center justify-center rounded-[16rem] border-[3rem] border-d-light-gray text-[20rem] font-medium ${selectedPart === 1 ? 'bg-d-light-gray' : 'bg-transparent'}`}
                    onClick={() => {
                      selectedPart !== 1 ? setSelectedTopic('random') : null;
                      setSelectedPart(1);
                    }}
                  >
                    {tCommon('partNumber', { number: 1 })}
                  </button>
                  <button
                    type='button'
                    className={`flex h-[70rem] items-center justify-center rounded-[16rem] border-[3rem] border-d-light-gray text-[20rem] font-medium ${selectedPart === 2 ? 'bg-d-light-gray' : 'bg-transparent'}`}
                    onClick={() => {
                      selectedPart !== 2 ? setSelectedTopic('random') : null;
                      setSelectedPart(2);
                    }}
                  >
                    {tCommon('partNumber', { number: 2 })}
                  </button>
                </div>
              </div>

              {/* // * Topic Selection */}
              <div className='mb-[32rem]'>
                <label className='mb-[16rem] block text-[20rem] leading-none'>{tCommon('pleaseSelectTopic')}</label>
                <Select defaultValue='random' value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className='h-[70rem] rounded-[16rem] bg-d-light-gray px-[40rem] text-[20rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                    <SelectValue placeholder={tForm('placeholders.random')} className='placeholder:text-d-black/60' />
                  </SelectTrigger>

                  <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                    <SelectItem value='random' className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                      {tCommon('random')}
                    </SelectItem>

                    {categoriesByPart.map(tag => (
                      <SelectItem key={tag.id} value={String(tag.id)} className='h-[50rem] px-[40rem] text-[20rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* // * Without part selection */}
              {/*
                <div className='mb-[32rem]'>
                  <label className='mb-[16rem] block text-[20rem] leading-none'>Please select a type of visual information you want to describe in Part 1</label>
                  <Select>
                    <SelectTrigger className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                      <SelectValue placeholder='Random' className='placeholder:text-d-black/60' />
                    </SelectTrigger>

                    <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                      <SelectItem value='rand' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Random
                      </SelectItem>
                      <SelectItem value='kz' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Graph
                      </SelectItem>
                      <SelectItem value='kg' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Map
                      </SelectItem>
                      <SelectItem value='md' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Diagramm
                      </SelectItem>
                      <SelectItem value='md' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Table
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='mb-[48rem]'>
                  <label className='mb-[16rem] block text-[20rem] leading-none'>Please select a topic you want to write about in Part 2</label>
                  <Select>
                    <SelectTrigger className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                      <SelectValue placeholder='Random' className='placeholder:text-d-black/60' />
                    </SelectTrigger>

                    <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                      <SelectItem value='random' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Random
                      </SelectItem>
                      <SelectItem value='Health' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Health
                      </SelectItem>
                      <SelectItem value='Culure' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Culure
                      </SelectItem>
                      <SelectItem value='Politics' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Politics
                      </SelectItem>
                      <SelectItem value='Work' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Work
                      </SelectItem>
                      <SelectItem value='Life' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                        Life
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              */}

              <div className='mb-[56rem] flex items-center gap-x-[12rem]'>
                <Checkbox className='size-[20rem]' checked />
                <div className='text-[16rem] font-medium leading-none'>
                  {tCommonRich('acceptUserAgreement', {
                    link: (chunks: any) => (
                      <a target='_blank' href='https://www.studybox.kz/en/privacy' className='border-b border-d-black'>
                        {chunks}
                      </a>
                    ),
                  })}
                </div>
              </div>
              <button
                onClick={startPractice}
                disabled={isStarting || isCheckingAccess}
                className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
              >
                {isStarting || isCheckingAccess ? '...' : tActions('continue')}
              </button>
              <SubscriptionAccessLabel className='mt-[12rem] text-center' />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
