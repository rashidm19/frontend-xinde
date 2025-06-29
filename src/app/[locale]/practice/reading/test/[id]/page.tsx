'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Form, FormControl, FormField } from '@/components/ui/form';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckboxSquare } from '@/components/ui/checkboxSquare';
import { DndMatching } from '../components/DndMatching';
import { DndText } from '../components/DndText';
import { GET_practice_reading_id } from '@/api/GET_practice_reading_id';
import { transformStringToArrayV2, transformStringToArrayV4 } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

type FormValues = {
  [key: string]: string | undefined;
};

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t, tCommon, tActions } = useCustomTranslations('practice.reading.test');

  const [activeTab, setActiveTab] = useState<string>('p1');

  const { data, status } = useQuery({
    queryKey: ['practice-reading'],
    queryFn: () => GET_practice_reading_id(params.id),
  });

  const formSchema = z.object({
    ...Object.fromEntries(Array.from({ length: 40 }, (_, i) => [(i + 1).toString(), z.string().optional()])),
  }) satisfies z.ZodType<FormValues>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   '1': 'A',
    //   '2': 'E',
    //   '3': 'R',
    //   '4': 'L',
    //   '5': 'O',
    //   '6': 'R',
    //   '7': 'M',
    //   '8': 'B',
    //   '9': 'B',
    //   '10': 'F',
    //   '11': 'D',
    //   '12': 'H',
    //   '13': 'G',
    //   '14': 'G',
    //   '15': 'C',
    //   '16': 'True',
    //   '17': 'True',
    //   '18': 'False',
    //   '19': 'Not given',
    //   '20': 'Not given',
    //   '21': 'False',
    //   '22': 'False',
    //   '23': 'C',
    //   '24': 'B',
    //   '25': 'A',
    //   '26': 'A|B|D',
    //   '27': 'A|B|D',
    //   '28': 'A|B|D',
    //   '29': 'B',
    //   '30': 'D',
    //   '31': 'G',
    //   '32': 'A',
    //   '33': 'F',
    //   '34': 'test',
    //   '35': 'test',
    //   '36': 'test',
    //   '37': 'test',
    //   '38': 'test',
    //   '39': 'test',
    //   '40': 'test',
    // },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      answers: Object.entries(values).map(([question, answer]) => ({
        question: parseInt(question),
        answer: answer,
      })),
    };

    // Выписываем все номера вопросов типа чекбокс
    let checkboxQuestionBlocks: number[][] = [];
    [1, 2, 3].map(p =>
      data[`part_${p}`].blocks
        .filter((block: any) => block.kind === 'checkboxes')
        .forEach((block: any) => {
          checkboxQuestionBlocks.push(block.answers.map((q: any) => q.number));
        })
    );
    // В финальном ответе для бека, все чекбоксы вопросы, которые записаны как A|B|C - переделываем в одиночные ответы
    checkboxQuestionBlocks.forEach((block: number[]) => {
      block.forEach((question: number, index: number) => {
        // question - 1 - потому что массив начинается с index 0 и соответсвенно имеем виде [ {0: {question: 1, answer: 'some answer'}}, ...]
        if (formattedValues.answers[question - 1].answer?.includes('|')) {
          formattedValues.answers[question - 1].answer = formattedValues.answers[question - 1].answer!.split('|')[index];
        }
      });
    });

    const response = await fetch('https://api.studybox.kz/practice/reading/2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(formattedValues),
    });

    if (response.ok) {
      const result = await response.json();
      router.push(`/practice/reading/results/${result.id}`);
    } else {
      router.push('/error500');
    }
  }

  const values = form.watch();

  const questionsCountString = () => {
    if (activeTab === 'p1') {
      return `1 – ${data['part_1'].questions_count}`;
    } else if (activeTab === 'p2') {
      return `${1 + data['part_1'].questions_count} – ${data['part_1'].questions_count + data['part_2'].questions_count}`;
    } else if (activeTab === 'p3') {
      return `${1 + data['part_1'].questions_count + data['part_2'].questions_count} – ${data['part_1'].questions_count + data['part_2'].questions_count + data['part_3'].questions_count}`;
    }
  };

  if (status === 'pending') {
    return <></>;
  }

  if (status === 'error') {
    return <></>;
  }

  return (
    <>
      <HeaderDuringTest title={tCommon('practice')} tag={tCommon('reading')} />

      <main className='min-h-screen overflow-hidden bg-d-yellow-secondary'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              defaultValue='p1'
              value={activeTab}
              onValueChange={setActiveTab}
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
                    {tCommon('partNumber', { number: 1 })}
                  </TabsTrigger>
                  <TabsTrigger
                    value='p2'
                    className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                  >
                    {tCommon('partNumber', { number: 2 })}
                  </TabsTrigger>
                  <TabsTrigger
                    value='p3'
                    className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                  >
                    {tCommon('partNumber', { number: 3 })}
                  </TabsTrigger>
                </TabsList>

                {/* // * Навигация по вопросам */}
                {[
                  Array.from({ length: data[`part_1`].questions_count }).map((_, index) => index + 1),
                  Array.from({ length: data[`part_2`].questions_count }).map((_, index) => data[`part_1`].questions_count + index + 1),
                  Array.from({ length: data[`part_3`].questions_count }).map((_, index) => data[`part_1`].questions_count + data[`part_2`].questions_count + index + 1),
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
                          data-state={values[qNumber] ? 'active' : 'inactive'}
                          className='h-[4rem] w-[16rem] rounded-[16rem] bg-d-light-gray data-[state=active]:bg-d-green'
                        />
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </div>

              {/* // * Инструкция */}
              <div className='relative mb-[40rem] flex w-full items-center justify-center rounded-[13rem] bg-d-light-gray py-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                {t('readTextAndAnswerQuestions')} {questionsCountString()}
              </div>

              {[1, 2, 3].map(tab => (
                <TabsContent key={`questions-content-tab-${tab}`} value={`p${tab}`} className='flex items-start justify-between'>
                  {/* // * Текст */}
                  <div className='w-[672rem] whitespace-pre-line rounded-[16rem] bg-white p-[40rem] text-[16rem] font-normal leading-tight'>
                    {data[`part_${tab}`].text}
                  </div>

                  <div className='flex w-[672rem] flex-col gap-y-[16rem]'>
                    {data[`part_${tab}`].blocks.map((block: any, index: number) => (
                      <div key={`questions-block-${index}`} className='flex w-full flex-col gap-y-[48rem] rounded-[16rem] bg-white p-[40rem]'>
                        <div className='flex flex-col'>
                          <p className='mb-[16rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>{block.task_questions}</p>
                          <p className='whitespace-pre-line text-[16rem] font-normal leading-[19rem] text-[#606060]'>{block.task}</p>
                        </div>
                        {/* Параграф */}
                        {block.kind === 'paragraph' && (
                          <ul className='ml-[20rem] flex list-outside list-disc flex-col items-start gap-y-[18rem]'>
                            {block.questions.map((q: any) => (
                              <li id={q.question} className='scroll-target text-[16rem] font-normal leading-[30rem] tracking-[-0.2rem] text-d-black'>
                                {q.question}{' '}
                                <FormField
                                  control={form.control}
                                  name={q.number.toString()}
                                  render={({ field }) => (
                                    <FormControl>
                                      <Input
                                        {...field}
                                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                                        type='text'
                                        placeholder={q.number}
                                        className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal uppercase !leading-[25rem] !tracking-[-0.2rem] !text-d-black placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                      />
                                    </FormControl>
                                  )}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                        {/* Подставьте слова */}
                        {block.kind === 'words' && (
                          <div className='flex flex-col items-start gap-y-[18rem]'>
                            <div className='text-[16rem] leading-relaxed text-d-black'>
                              {transformStringToArrayV4(block.hint).map((str: any, index: number) => {
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
                        {/* True/false/not given */}
                        {block.kind === 'tfng' && (
                          <>
                            {block.questions.map((q: any) => (
                              <div key={`question-${q.number}`}>
                                <div className='mb-[24rem] flex items-start gap-x-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                                  <div className='w-[25rem] shrink-0'>{q.number}</div>
                                  <div>{q.question}</div>
                                </div>

                                <FormField
                                  control={form.control}
                                  name={q.number.toString()}
                                  render={({ field }) => (
                                    <FormControl>
                                      <RadioGroup {...field} onValueChange={value => field.onChange(value)} className='flex flex-col items-start'>
                                        <div
                                          className={`flex w-full items-center space-x-[24rem] rounded-[8rem] py-[14rem] pl-[6rem] pr-[10rem] ${field.value?.includes('True') && 'bg-d-yellow-secondary'}`}
                                        >
                                          <RadioGroupItem value='True' id={`reading_${q.number}_true`} />
                                          <Label
                                            htmlFor={`reading_${q.number}_true`}
                                            className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'
                                          >
                                            True
                                          </Label>
                                        </div>
                                        <div
                                          className={`flex w-full items-center space-x-[24rem] rounded-[8rem] py-[14rem] pl-[6rem] pr-[10rem] ${field.value?.includes('False') && 'bg-d-yellow-secondary'}`}
                                        >
                                          <RadioGroupItem value='False' id={`reading_${q.number}_false`} />
                                          <Label
                                            htmlFor={`reading_${q.number}_false`}
                                            className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'
                                          >
                                            False
                                          </Label>
                                        </div>
                                        <div
                                          className={`flex w-full items-center space-x-[24rem] rounded-[8rem] py-[12rem] pl-[6rem] pr-[10rem] ${field.value?.includes('Not given') && 'bg-d-yellow-secondary'}`}
                                        >
                                          <RadioGroupItem value='Not given' id={`reading_${q.number}_not_given`} />
                                          <Label
                                            htmlFor={`reading_${q.number}_not_given`}
                                            className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'
                                          >
                                            Not given
                                          </Label>
                                        </div>
                                      </RadioGroup>
                                    </FormControl>
                                  )}
                                />
                              </div>
                            ))}
                          </>
                        )}
                        {/* ABCD тесты */}
                        {block.kind === 'test' && (
                          <>
                            {block.questions.map((q: any) => (
                              <div key={`reading_${q.number}`}>
                                <div className='mb-[24rem] flex items-start gap-x-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                                  <div className='w-[25rem] shrink-0'>{q.number}</div>
                                  <div>{q.question}</div>
                                </div>
                                <FormField
                                  control={form.control}
                                  name={q.number.toString()}
                                  render={({ field }) => (
                                    <FormControl>
                                      <RadioGroup {...field} onValueChange={value => field.onChange(value)} className='flex w-full flex-col items-start'>
                                        {q.choices.map((c: any) => (
                                          <div
                                            className={`flex w-full items-center space-x-[24rem] rounded-[8rem] py-[12rem] pl-[6rem] pr-[10rem] ${field.value?.includes(c.answer) && 'bg-d-yellow-secondary'}`}
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
                              </div>
                            ))}
                          </>
                        )}
                        {/* Чекбоксы */}
                        {block.kind === 'checkboxes' && (
                          <div className='flex flex-col items-start'>
                            {block.choices.map((c: any) => (
                              <div key={`question-checkboxes-${c.choice}-${block.answers[0].number}`} className={`w-full`}>
                                <FormField
                                  control={form.control}
                                  // Name контрола - номер первого вопроса, для остальных вопросов прокидываем ( дублируем ) значение через в onChange функции
                                  name={block.answers[0].number.toString()}
                                  render={({ field }) => (
                                    <FormControl>
                                      <div
                                        className={`flex w-auto items-center gap-x-[24rem] rounded-[8rem] py-[14rem] pl-[6rem] pr-[10rem] ${field.value?.includes(c.answer) && 'bg-d-yellow-secondary'}`}
                                      >
                                        <CheckboxSquare
                                          id={`reading_${block.task_questions}_${c.answer}`}
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
                                          htmlFor={`reading_${block.task_questions}_${c.answer}`}
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
                        {/* Таблица с ради-баттонами */}
                        {block.kind === 'table' && (
                          <div className={`grid grid-cols-${block.cells[0].length} rounded-[8rem] border border-d-black`}>
                            {/* 1st row */}
                            {block.cells.map((row: string[], rowIndex: number) =>
                              row.map((cell: string, cellIndex: number) => (
                                <div
                                  className={`flex h-auto flex-col items-center justify-center hyphens-auto text-wrap border-b border-b-d-black p-[16rem] text-center text-[14rem] leading-[120%] tracking-[-0.2rem] text-d-black ${rowIndex === 0 ? 'font-semibold' : ''} ${cellIndex !== 0 ? 'border-l' : ''}`}
                                  lang='en'
                                >
                                  {cell === '___' && (
                                    <FormField
                                      control={form.control}
                                      name={block.questions.find((q: any) => q.x === cellIndex && q.y === rowIndex)?.number.toString()}
                                      render={({ field }) => (
                                        <FormControl>
                                          <Input
                                            {...field}
                                            type='text'
                                            placeholder={block.questions.find((q: any) => q.x === cellIndex && q.y === rowIndex)?.number}
                                            className='inline h-[32rem] w-full items-center justify-center rounded-[8rem] !border !border-d-black p-[10rem] text-center text-[14rem] font-normal lowercase leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                          />
                                        </FormControl>
                                      )}
                                    />
                                  )}

                                  {cell !== '___' &&
                                    cell.includes('___') &&
                                    transformStringToArrayV2(cell).map(s => (
                                      <>
                                        {s === '___' ? (
                                          <FormField
                                            control={form.control}
                                            name={block.questions.find((q: any) => q.x === cellIndex && q.y === rowIndex)?.number.toString()}
                                            render={({ field }) => (
                                              <FormControl>
                                                <Input
                                                  {...field}
                                                  type='text'
                                                  placeholder={block.questions.find((q: any) => q.x === cellIndex && q.y === rowIndex)?.number}
                                                  className='my-[2rem] inline h-[32rem] w-full !items-center justify-center rounded-[8rem] !border-[1.5rem] !border-d-black/60 p-[10rem] text-center text-[14rem] font-normal lowercase leading-tight tracking-[-0.2rem] !text-d-black placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                                />
                                              </FormControl>
                                            )}
                                          />
                                        ) : (
                                          <div>{s}</div>
                                        )}
                                      </>
                                    ))}

                                  {!cell.includes('___') && cell}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        {/* Таблица с ради-баттонами */}
                        {block.kind === 'table2' && (
                          <div>
                            <div className='mb-[48rem] flex flex-col items-start gap-y-[16rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                              <div>Questions 1-5</div>

                              <div className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'>
                                Complete the table. Write <span className='font-semibold'>NO MORE THAN THREE WORDS </span>from the text for each answer.{' '}
                              </div>
                            </div>
                            <div className='grid grid-cols-4 rounded-[8rem] border border-d-black'>
                              {/* 1st row */}
                              <div className='h-[76rem] border-b border-b-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Species
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black'>
                                French
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Spanish
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black'>
                                South African ball roller
                              </div>

                              {/* 2nd row */}
                              <div className='h-[76rem] border-b border-b-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Preferred climate
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                cool
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                <Input
                                  id='reading_01'
                                  type='text'
                                  placeholder='1'
                                  className='!inline !h-[32rem] !w-full !items-center !justify-center !rounded-[8rem] !border !border-d-black !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                />
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                <Input
                                  id='reading_02'
                                  type='text'
                                  placeholder='2'
                                  className='!inline !h-[32rem] !w-full !items-center !justify-center !rounded-[8rem] !border !border-d-black !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                />
                              </div>

                              {/* 3d row */}
                              <div className='h-[76rem] border-b border-b-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Complementary species{' '}
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Spanish
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'></div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                <Input
                                  id='reading_03'
                                  type='text'
                                  placeholder='3'
                                  className='!inline !h-[32rem] !w-full !items-center !justify-center !rounded-[8rem] !border !border-d-black !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                />
                              </div>

                              {/* 4th row */}
                              <div className='h-[76rem] border-b border-b-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Start of active period{' '}
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                late spring
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                {' '}
                                <Input
                                  id='reading_04'
                                  type='text'
                                  placeholder='4'
                                  className='!inline !h-[32rem] !w-full !items-center !justify-center !rounded-[8rem] !border !border-d-black !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                />
                              </div>
                              <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'></div>

                              {/* 5th row */}
                              <div className='h-[76rem] px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                Number of generations per year
                              </div>
                              <div className='h-[76rem] border-l border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                1 - 2
                              </div>
                              <div className='h-[76rem] border-l border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                {' '}
                                <Input
                                  id='reading_03'
                                  type='text'
                                  placeholder='3'
                                  className='!inline !h-[32rem] !w-full !items-center !justify-center !rounded-[8rem] !border !border-d-black !p-[10rem] text-center !text-[16rem] !font-normal !leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                />
                              </div>
                              <div className='h-[76rem] border-l border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'></div>
                            </div>
                          </div>
                        )}
                        {/* Драг-н-дроп списки */}
                        {block.kind === 'dragdrop' && <DndMatching value={form.getValues()} block={block} setFieldValue={form.setValue} />}
                        {/* Драг-н-дроп текст */}
                        {block.kind === 'dragdrop-type2' && <DndText value={form.getValues()} block={block} setFieldValue={form.setValue} />}
                      </div>
                    ))}

                    {activeTab === 'p1' && (
                      <button
                        type='button'
                        onClick={() => {
                          setActiveTab('p2');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className='flex h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                      >
                        {tActions('next')}
                      </button>
                    )}
                    {activeTab === 'p2' && (
                      <button
                        type='button'
                        onClick={() => {
                          setActiveTab('p3');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className='flex h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                      >
                        {tActions('next')}
                      </button>
                    )}
                    {activeTab === 'p3' && (
                      <button
                        type='submit'
                        className='flex h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black'
                      >
                        {tActions('submit')}
                      </button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </form>
        </Form>
      </main>
    </>
  );
}
