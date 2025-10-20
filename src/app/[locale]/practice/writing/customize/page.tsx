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
import type { PracticeWritingListResponse } from '@/types/PracticeWriting';
import { PracticeWritingCard } from '@/components/practice/PracticeWritingCard';

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
  const { t, tImgAlts, tCommon, tActions, tForm } = useCustomTranslations('practice.writing.customize');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const { data } = useQuery<WritingCategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get<WritingCategoriesResponse>('/practice/writing/categories').then(res => res.data),
  });

  const [selectedPart, setSelectedPart] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string>('random');

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

      const typeParam = selectedType === 'random' ? randomType() : selectedType;
      const params: Record<string, string | number> = {
        part: selectedPart,
      };

      if (typeParam) {
        params.tag_id = typeParam;
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

  const randomType = () => {
    if (categoriesByPart.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * categoriesByPart.length);
    return categoriesByPart[randomIndex]?.id ?? null;
  };

  return (
    <main className='relative min-h-screen bg-d-blue-secondary'>
      {/*<img src='/images/illustration_torusArray--02.png' alt={tImgAlts('flower')} className='pointer-events-none absolute bottom-[40rem] left-[40rem] h-auto w-[220rem] opacity-70' />*/}
      {/*<img src='/images/illustration_molecule.png' alt={tImgAlts('molecule')} className='pointer-events-none absolute right-[60rem] top-[48rem] h-auto w-[200rem] opacity-45' />*/}
      {data && (
        <div className='relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-[16rem] py-[48rem]'>
          {/*CONTENT CARD*/}
          <div className='shadow-car relative flex w-full max-w-[720rem] flex-col gap-[32rem] rounded-[20rem] border border-white/80 bg-white/95 px-[40rem] py-[36rem] backdrop-blur-sm'>
            <Link href='/practice' className='absolute right-[24rem] top-[24rem] flex size-[36rem] items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200'>
              <img src='/images/icon_cross.svg' alt={tImgAlts('close')} className='size-[18rem]' />
            </Link>

            {/* // * Header */}
            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[48rem] items-center justify-center rounded-full bg-d-blue-secondary'>
                <img src='/images/icon_writingSection.svg' className='size-[22rem]' alt={tImgAlts('writing')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('writing')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>{tCommon('minCount', { count: 60 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>2</div>
              </div>
            </div>
            {/* // * Selection */}
            <div>
              <h1 className='mb-[28rem] text-[24rem] font-semibold leading-tight text-d-black'>{tCommon('tasksSelection')}</h1>
              {/* // * Part Selection */}
              <div className='mb-[32rem]'>
                <label className='mb-[12rem] block text-[16rem] leading-snug text-d-black/80'>{t('subtitle')}</label>
                <div className='grid grid-cols-2 gap-x-[12rem]'>
                  <button
                    type='button'
                    className={`flex h-[60rem] items-center justify-center rounded-[16rem] border-[2rem] border-d-light-gray text-[18rem] font-semibold transition-colors ${selectedPart === 1 ? 'bg-d-light-gray text-d-black' : 'bg-white/10 text-d-black/70 hover:bg-d-light-gray/70'}`}
                    onClick={() => {
                      selectedPart !== 1 ? setSelectedType('random') : null;
                      setSelectedPart(1);
                    }}
                  >
                    {tCommon('partNumber', { number: 1 })}
                  </button>
                  <button
                    type='button'
                    className={`flex h-[60rem] items-center justify-center rounded-[16rem] border-[2rem] border-d-light-gray text-[18rem] font-semibold transition-colors ${selectedPart === 2 ? 'bg-d-light-gray text-d-black' : 'bg-white/10 text-d-black/70 hover:bg-d-light-gray/70'}`}
                    onClick={() => {
                      selectedPart !== 2 ? setSelectedType('random') : null;
                      setSelectedPart(2);
                    }}
                  >
                    {tCommon('partNumber', { number: 2 })}
                  </button>
                </div>
              </div>

              {/* // * Type Selection */}
              <div className='mb-[28rem]'>
                <label className='mb-[12rem] block text-[16rem] leading-snug text-d-black/80'>{tCommon('pleaseSelectType')}</label>
                <Select defaultValue='random' value={selectedType} onValueChange={setSelectedType}>
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
                  <label className='mb-[16rem] block text-[20rem] leading-none'>Please select a type you want to write about in Part 2</label>
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
