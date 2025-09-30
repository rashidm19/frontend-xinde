'use client';

import React, { useEffect, useState } from 'react';

import { CheckboxSquare } from '@/components/ui/checkboxSquare';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { transformStringToArrayV4 } from '@/lib/utils';
import { mockStore } from '@/stores/mock';
import nProgress from 'nprogress';

type FormValues = {
  [key: string]: string | undefined;
};

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('p1');

  const { mockData, setTimer } = mockStore();
  const data = mockData.listening;

  if (!data) {
    return router.push('/mock/');
  }

  const formSchema = z.object({
    ...Object.fromEntries(Array.from({ length: 41 }, (_, i) => [(i + 1).toString(), z.string().optional()])),
  }) satisfies z.ZodType<FormValues>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   const formattedValues = {
  //     answers: Object.entries(values).map(([question, answer]) => ({
  //       question: parseInt(question),
  //       answer: answer,
  //     })),
  //   };

  //   // Выписываем все номера вопросов типа чекбокс
  //   let checkboxQuestionBlocks: number[][] = [];
  //   [1, 2, 3, 4].map(p =>
  //     data[`part_${p}`].blocks
  //       .filter((block: any) => block.kind === 'checkboxes')
  //       .forEach((block: any) => {
  //         checkboxQuestionBlocks.push(block.answers.map((q: any) => q.number));
  //       })
  //   );
  //   // В финальном ответе для бека, все чекбоксы вопросы, которые записаны как A|B|C - переделываем в одиночные ответы
  //   checkboxQuestionBlocks.forEach((block: number[]) => {
  //     block.forEach((question: number, index: number) => {
  //       // question - 1 - потому что массив начинается с index 0 и соответсвенно имеем виде [ {0: {question: 1, answer: 'some answer'}}, ...]
  //       if (formattedValues.answers[question - 1].answer?.includes('|')) {
  //         formattedValues.answers[question - 1].answer = formattedValues.answers[question - 1].answer!.split('|')[index];
  //       }
  //     });
  //   });

  //   const response = await fetch(`${API_URL}/practice/listening/1`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json;',
  //       Authorization: `Bearer ${localStorage.getItem('token')}`,
  //     },
  //     body: JSON.stringify(formattedValues),
  //   });

  //   if (response.ok) {
  //     const result = await response.json();
  //     router.push(`/practice/reading/results/${result.id}`);
  //     console.log(result);
  //   } else {
  //     router.push('/error500');
  //   }
  // }

  // const values = form.watch();

  const values = form.watch();

  async function onSubmit() {
    nProgress.start();
    router.push('/mock/exam/reading/rules');
  }

  const questionsCountString = () => {
    if (activeTab === 'p1') {
      return `1 – ${data['part_1'].questions_count}`;
    } else if (activeTab === 'p2') {
      return `${1 + data['part_1'].questions_count} – ${data['part_1'].questions_count + data['part_2'].questions_count}`;
    } else if (activeTab === 'p3') {
      return `${1 + data['part_1'].questions_count + data['part_2'].questions_count} – ${data['part_1'].questions_count + data['part_2'].questions_count + data['part_3'].questions_count}`;
    } else if (activeTab === 'p4') {
      return `${1 + data['part_1'].questions_count + data['part_2'].questions_count + data['part_3'].questions_count} – ${data['part_1'].questions_count + data['part_2'].questions_count + data['part_3'].questions_count + data['part_4'].questions_count}`;
    }
  };

  useEffect(() => {
    setTimer(1800000);
  }, []);

  return (
    <>
      <HeaderDuringTest title='Mock exam' tag='Listening' audio={data.audio_url} />
      <main className='min-h-screen overflow-hidden bg-d-light-gray'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue='p1'
              className='container flex min-h-[100dvh] max-w-[1440rem] flex-col px-[40rem] pb-[24rem] pt-[40rem]'
            >
              {/* // * Навигация */}
              <div className='mb-[40rem] flex items-start justify-between'>
                {/* // * Навигация по частям */}
                <TabsList className='practice-tabs-shadow relative flex w-fit items-center gap-x-[8rem] rounded-[64rem] bg-white p-[8rem] text-[14rem] font-medium leading-[26rem] tracking-[-0.2rem] text-d-black'>
                  <TabsTrigger
                    value='p1'
                    className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                  >
                    Part 1
                  </TabsTrigger>
                  <TabsTrigger
                    value='p2'
                    className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                  >
                    Part 2
                  </TabsTrigger>
                  <TabsTrigger
                    value='p3'
                    className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                  >
                    Part 3
                  </TabsTrigger>
                  <TabsTrigger
                    value='p4'
                    className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                  >
                    Part 4
                  </TabsTrigger>
                </TabsList>

                {/* // * Навигация по вопросам */}
                {[
                  Array.from({ length: data[`part_1`].questions_count }).map((_, index) => index + 1),
                  Array.from({ length: data[`part_2`].questions_count }).map((_, index) => data[`part_1`].questions_count + index + 1),
                  Array.from({ length: data[`part_3`].questions_count }).map((_, index) => data[`part_1`].questions_count + data[`part_2`].questions_count + index + 1),
                  Array.from({ length: data[`part_4`].questions_count }).map(
                    (_, index) => data[`part_1`].questions_count + data[`part_2`].questions_count + data[`part_3`].questions_count + index + 1
                  ),
                ].map((tab: number[], tabIndex: number) => (
                  <TabsContent
                    key={`questions-nav-tab-${tabIndex + 1}`}
                    value={`p${tabIndex + 1}`}
                    className='practice-tabs-shadow relative flex w-fit items-center rounded-[64rem] bg-white p-[8rem] text-[14rem] font-semibold leading-[26rem] tracking-[-0.2rem] text-d-black data-[state=inactive]:hidden'
                  >
                    {tab.map(qNumber => (
                      <div
                        key={`question-nav-link-${qNumber}`}
                        // href={`#${qNumber}`}
                        className='group flex h-[58rem] w-[56rem] flex-col items-center justify-center rounded-[64rem]'
                      >
                        <span>{qNumber}</span>
                        <div
                          className='h-[4rem] w-[16rem] rounded-[16rem] bg-d-light-gray data-[state=active]:bg-d-green'
                          data-state={values[qNumber] ? 'active' : 'inactive'}
                        />
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </div>

              {/* // * Инструкция */}
              <div className='relative mb-[40rem] flex w-full items-center justify-center rounded-[13rem] bg-white py-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                Listen and answer questions {questionsCountString()}
              </div>

              {[1, 2, 3, 4].map(tab => (
                <TabsContent
                  key={`questions-content-tab-${tab}`}
                  value={`p${tab}`}
                  className='flex w-full flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[40rem] data-[state=inactive]:hidden'
                >
                  {/* // *  Текст */}
                  {data[`part_${tab}`].blocks.map((block: any, index: number) => (
                    <div key={`questions-block-${index}`}>
                      <div className='mb-[40rem] flex flex-col items-center justify-center rounded-[13rem] bg-d-gray p-[20rem]'>
                        <p className='mb-[8rem] text-[20rem] font-bold leading-[24rem] tracking-[-0.2rem] text-d-black'>{block.task_questions} </p>
                        <p className='text-[16rem] font-medium leading-[19rem] text-[listening_0606060]'>{block.task}</p>
                      </div>
                      {/* A,B,C,D тесты */}
                      {block.kind === 'test' && (
                        <div className='flex flex-col gap-y-[48rem]'>
                          {block.questions.map((q: any) => (
                            <div key={`listening_${q.number}`}>
                              <div className='mb-[24rem] flex items-start gap-x-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                                <div className='w-[25rem] shrink-0 text-center'>{q.number}</div>
                                <div>{q.question}</div>
                              </div>

                              {q.picture ? (
                                <div className='flex items-center justify-between gap-x-[52rem]'>
                                  <img src={q.picture} alt={q.question} className='h-auto max-w-[500rem]' />
                                  <FormField
                                    control={form.control}
                                    name={q.number.toString()}
                                    render={({ field }) => (
                                      <FormControl>
                                        <RadioGroup {...field} onValueChange={value => field.onChange(value)} className='flex flex-col items-start'>
                                          {['A', 'B', 'C', 'D'].map(c => (
                                            <div
                                              className={`flex w-[640rem] items-center space-x-[30rem] rounded-[8rem] py-[12rem] pl-[6rem] pr-[10rem] ${field.value?.includes(c) && 'bg-d-light-gray'}`}
                                              key={`listening_${q.number}_${c}`}
                                            >
                                              <RadioGroupItem value={c} id={`listening_${q.number}_${c}`} />
                                              <Label
                                                htmlFor={`listening_${q.number}_${c}`}
                                                className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'
                                              >
                                                Picture {c}
                                              </Label>
                                            </div>
                                          ))}
                                        </RadioGroup>
                                      </FormControl>
                                    )}
                                  />
                                </div>
                              ) : (
                                <FormField
                                  control={form.control}
                                  name={q.number.toString()}
                                  render={({ field }) => (
                                    <FormControl>
                                      <RadioGroup {...field} onValueChange={value => field.onChange(value)} className='flex flex-col items-start'>
                                        {q.choices.map((c: any) => (
                                          <div
                                            className={`flex w-[640rem] items-center space-x-[30rem] rounded-[8rem] py-[12rem] pl-[6rem] pr-[10rem] ${field.value?.includes(c.answer) && 'bg-d-light-gray'}`}
                                            key={`reading_${q.number}_${c.answer}`}
                                          >
                                            <RadioGroupItem value={c.answer} id={`reading_${q.number}_${c.answer}`} />
                                            <Label
                                              htmlFor={`reading_${q.number}_${c.answer}`}
                                              className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'
                                            >
                                              {c.choice}
                                            </Label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </FormControl>
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Подставьте слова */}
                      {block.kind === 'words' && (
                        <div className='flex flex-col items-start gap-y-[18rem]'>
                          <div className='text-[16rem] leading-relaxed text-d-black'>
                            {transformStringToArrayV4(block.text).map((str: any, index: number) => {
                              if (str.type === 'input') {
                                return (
                                  <FormField
                                    control={form.control}
                                    name={block.questions[str.index].number.toString()}
                                    render={({ field }) => (
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type='text'
                                          placeholder={block.questions[str.index].number}
                                          className={`my-[4rem] inline-flex h-[32rem] w-[300rem] items-center justify-center rounded-[8rem] border-[1.5rem] !border-d-black/60 p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-light-gray focus-visible:border-d-black ${values[block.questions[str.index].number] ? 'bg-d-light-gray' : ''}`}
                                        />
                                      </FormControl>
                                    )}
                                  />
                                );
                              } else if (str.type === 'string') {
                                return <span key={`span-${index}`}>{str.value}</span>;
                              } else if (str.type === 'break') {
                                return <br key={`break-${index}`} />;
                              }
                            })}
                          </div>
                        </div>
                      )}
                      {/* Чекбоксы */}
                      {block.kind === 'checkboxes' && (
                        <div className='flex flex-col items-start'>
                          {block.text && <div className='mb-[12rem] text-[20rem] font-medium text-d-black'>{block.text}</div>}
                          {block.choices.map((c: any) => (
                            <div key={`question-checkboxes-${c.choice}-${block.answers[0].number}`} className=''>
                              <FormField
                                control={form.control}
                                // Name контрола - номер первого вопроса, для остальных вопросов прокидываем ( дублируем ) значение через в onChange функции
                                name={block.answers[0].number.toString()}
                                render={({ field }) => (
                                  <FormControl>
                                    <div
                                      className={`flex w-[640rem] items-center gap-x-[24rem] rounded-[8rem] py-[14rem] pl-[6rem] pr-[10rem] ${field.value?.includes(c.answer) && 'bg-d-light-gray'}`}
                                    >
                                      <CheckboxSquare
                                        id={`listening_${block.task_questions}_${c.answer}`}
                                        checked={field.value?.includes(c.answer)}
                                        // Чекбокс работает по принципу селекта, если отмечен, то добавляется в массив, если нет, то удаляется
                                        onCheckedChange={checked => {
                                          const currentValue = field.value ? field.value.split('|') : [];
                                          if (checked) {
                                            block.answers.forEach((a: any) => form.setValue(a.number.toString(), [...currentValue, c.answer].join('|')));
                                          } else {
                                            block.answers.forEach((a: any) =>
                                              form.setValue(a.number.toString(), currentValue.filter((val: string) => val !== c.answer).join('|'))
                                            );
                                          }
                                        }}
                                        // Если отмечено такое же количество ответов, как в block.kind, то новых варианты тыкнуть нельзя
                                        disabled={!field.value?.includes(c.answer) && field.value?.split('|').length === block.answers.length}
                                      />
                                      <Label
                                        htmlFor={`listening_${block.task_questions}_${c.answer}`}
                                        className={'text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'}
                                      >
                                        {c.choice}
                                      </Label>
                                    </div>
                                  </FormControl>
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Старая вёрстка, мб пригодится */}
                      {block.kind === 'unexisting' && (
                        <div className='flex w-full flex-col rounded-[16rem] bg-white p-[40rem]'>
                          <div className='mb-[40rem] flex flex-col items-center justify-center rounded-[13rem] bg-d-gray p-[20rem]'>
                            <p className='mb-[8rem] text-[20rem] font-bold leading-[24rem] tracking-[-0.2rem] text-d-black'>Questions 1-10 </p>
                            <p className='text-[16rem] font-medium leading-[19rem] text-[listening_0606060]'>
                              Complete the notes. Write <span className='font-semibold uppercase text-d-black'>ONE WORD AND/OR A NUMBER</span> for each answer.
                            </p>
                          </div>

                          <div className='mb-[32rem] flex items-start gap-x-[32rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                            Phone call about second-hand furniture
                          </div>
                          <div className='mb-[24rem] flex items-start gap-x-[32rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>Items</div>

                          <div className='mb-[34rem] flex w-full items-start'>
                            {/* // * Тема */}

                            <div className='mt-[4rem] w-[200rem] text-[16rem] font-medium leading-[19rem] tracking-[-0.2rem] text-d-black/80'>Dining table:</div>
                            <div className='w-full'>
                              {/* // * Ответы */}
                              <ul className='flex list-outside list-none flex-col items-start justify-start gap-y-[24rem]'>
                                <li id='listening_01' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  -{' '}
                                  <Input
                                    type='text'
                                    placeholder='1'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  shape
                                </li>
                                <li className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>- medium size</li>
                                <li id='listening_02' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  -{' '}
                                  <Input
                                    type='text'
                                    placeholder='2'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  old
                                </li>
                                <li id='listening_01' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - price: £25.00
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className='mb-[34rem] flex w-full items-start'>
                            {/* // * Тема */}
                            <div className='mt-[4rem] w-[200rem] text-[16rem] font-medium leading-[19rem] tracking-[-0.2rem] text-d-black/80'>Dining chairs:</div>
                            <div className='w-full'>
                              {/* // * Ответы */}
                              <ul className='flex list-outside list-none flex-col items-start justify-start gap-y-[24rem]'>
                                <li id='listening_03' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - set of{' '}
                                  <Input
                                    type='text'
                                    placeholder='3'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  chairs
                                </li>

                                <li id='listening_04' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - seats covered in{' '}
                                  <Input
                                    type='text'
                                    placeholder='4'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  material
                                </li>

                                <li id='listening_05' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - in{' '}
                                  <Input
                                    type='text'
                                    placeholder='5'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  old
                                </li>

                                <li className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>- price: £20.00</li>
                              </ul>
                            </div>
                          </div>

                          <div className='mb-[34rem] flex w-full items-start'>
                            {/* // * Тема */}
                            <div className='mt-[4rem] w-[200rem] text-[16rem] font-medium leading-[19rem] tracking-[-0.2rem] text-d-black/80'>Desk:</div>
                            <div className='w-full'>
                              {/* // * Ответы */}
                              <ul className='flex list-outside list-none flex-col items-start justify-start gap-y-[24rem]'>
                                <li className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>- length: 1 metre 20</li>

                                <li id='listening_06' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - 3 drawers. Top drawer has a{' '}
                                  <Input
                                    type='text'
                                    placeholder='6'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />
                                </li>

                                <li id='listening_07' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - price: £{' '}
                                  <Input
                                    type='text'
                                    placeholder='7'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className='mb-[34rem] flex w-full items-start'>
                            {/* // * Тема */}
                            <div className='mt-[4rem] flex w-[200rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>Address:</div>
                            <div className='w-full'>
                              {/* // * Ответы */}
                              <ul className='flex list-outside list-none flex-col items-start justify-start gap-y-[24rem]'>
                                <li id='listening_08' className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  -{' '}
                                  <Input
                                    type='text'
                                    placeholder='8'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  Old Lane, Stonethorpe
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className='mb-[34rem] flex w-full items-start'>
                            {/* // * Тема */}
                            <div className='mt-[4rem] flex w-[200rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>Directions:</div>
                            <div className='w-full'>
                              {/* // * Ответы */}
                              <ul className='flex list-outside list-none flex-col items-start justify-start gap-y-[24rem]'>
                                <li className='scroll-target text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black/80'>
                                  - Take the Hawcroft road out of Stonethorpe. Go past the secondary school, then turn{' '}
                                  <Input
                                    id='listening_09'
                                    type='text'
                                    placeholder='9'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                  at the crossroads. House is down this road, opposite the{' '}
                                  <Input
                                    id='listening_10'
                                    type='text'
                                    placeholder='10'
                                    className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                  />{' '}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}

              {activeTab === 'p1' && (
                <button
                  type='button'
                  onClick={() => {
                    setActiveTab('p2');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className='my-[24rem] flex h-[71rem] w-full max-w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                >
                  Next
                </button>
              )}
              {activeTab === 'p2' && (
                <button
                  type='button'
                  onClick={() => {
                    setActiveTab('p3');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className='my-[24rem] flex h-[71rem] w-full max-w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                >
                  Next
                </button>
              )}
              {activeTab === 'p3' && (
                <button
                  type='button'
                  onClick={() => {
                    setActiveTab('p4');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className='my-[24rem] flex h-[71rem] w-full max-w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                >
                  Next
                </button>
              )}
              {activeTab === 'p4' && (
                <button
                  type='submit'
                  className='my-[24rem] flex h-[71rem] w-full max-w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                >
                  Submit listening section ( you can't go back )
                </button>
              )}
            </Tabs>
          </form>
        </Form>
      </main>
    </>
  );
}
