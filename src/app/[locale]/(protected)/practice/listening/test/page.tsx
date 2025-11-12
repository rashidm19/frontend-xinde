'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMediaQuery } from 'usehooks-ts';
import { z } from 'zod';

import { GET_practice_listening_id } from '@/api/GET_practice_listening_id';
import { PracticeLeaveGuard } from '@/components/PracticeLeaveGuard';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { AudioBar, type AudioBarHandle, type AudioBarState, type AudioCuePoint } from '@/components/practice/listening/mobile/AudioBar';
import { QuestionCard } from '@/components/practice/listening/mobile/QuestionCard';
import { CheckboxOptionRow, RadioOptionRow, TextAnswerInput } from '@/components/practice/listening/mobile/AnswerInputs';
import { UnifiedBottomNav } from '@/components/practice/listening/mobile/UnifiedBottomNav';
import { MobileContextBar } from '@/components/practice/reading/mobile/MobileContextBar';
import { PartSheet } from '@/components/practice/reading/mobile/PartSheet';
import { QuestionsMapSheet } from '@/components/practice/reading/mobile/QuestionsMapSheet';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import axiosInstance from '@/lib/axiosInstance';
import { cn, transformStringToArrayV4 } from '@/lib/utils';
import type { ListeningBlock, ListeningCheckboxesBlock, PracticeListeningResult } from '@/types/PracticeListening';
import { CheckboxSquare } from '@/components/ui/checkboxSquare';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';
import { format } from 'date-fns';
import { mockStore } from '@/stores/mock';

type FormValues = {
  [key: string]: string | undefined;
};

const PART_IDS = ['p1', 'p2', 'p3', 'p4'] as const;
type PartTab = (typeof PART_IDS)[number];

const optionVariants = {
  idle: { scale: 1, opacity: 0.96 },
  selected: { scale: 1.02, opacity: 1 },
};

const optionTransition = { type: 'spring', stiffness: 360, damping: 28, mass: 0.45 } as const;

const PROGRESS_PRECISION = 100;

const isCheckboxesBlock = (block: ListeningBlock): block is ListeningCheckboxesBlock => {
  if (!block || typeof block !== 'object') {
    return false;
  }

  const candidate = block as ListeningCheckboxesBlock;
  return candidate.kind === 'checkboxes' && Array.isArray(candidate.answers);
};

export default function Page() {
  const router = useRouter();
  const { t, tCommon, tActions } = useCustomTranslations('practice.listening.test');

  const isMobile = useMediaQuery('(max-width: 767px)');
  const { timer } = mockStore();

  const [activeTab, setActiveTab] = useState<PartTab>('p1');
  const [isPartSheetOpen, setPartSheetOpen] = useState(false);
  const [isQuestionsMapOpen, setQuestionsMapOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const audioBarRef = useRef<AudioBarHandle | null>(null);
  const [audioState, setAudioState] = useState<AudioBarState>('idle');

  const scrollPositionsRef = useRef<Record<PartTab, number>>({ p1: 0, p2: 0, p3: 0, p4: 0 });
  const pendingScrollRef = useRef<number | null>(null);
  const pendingQuestionRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);

  const { data, status } = useQuery({
    queryKey: ['practice-listening', 3],
    queryFn: () => GET_practice_listening_id('1'),
  });

  const formSchema = z.object({
    ...Object.fromEntries(Array.from({ length: 41 }, (_, i) => [(i + 1).toString(), z.string().optional()])),
  }) satisfies z.ZodType<FormValues>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (!data) {
        return;
      }

      const formattedValues = {
        answers: Object.entries(values).map(([question, answer]) => ({
          question: parseInt(question, 10),
          answer,
        })),
      };

      const checkboxQuestionBlocks: number[][] = [];
      PART_IDS.forEach(partId => {
        const part = getPartFromData(data, partId);
        part.blocks.forEach(block => {
          if (isCheckboxesBlock(block)) {
            checkboxQuestionBlocks.push(block.answers.map(answer => answer.number));
          }
        });
      });

      checkboxQuestionBlocks.forEach(blockNumbers => {
        blockNumbers.forEach((question, index) => {
          const entryIndex = question - 1;
          const entry = formattedValues.answers?.[entryIndex];
          if (entry?.answer?.includes('|')) {
            formattedValues.answers[entryIndex].answer = entry.answer.split('|')[index];
          }
        });
      });

      formattedValues.answers = formattedValues.answers.filter(item => item.answer);

      const response = await axiosInstance.post<PracticeListeningResult>('/practice/listening/1', formattedValues, {
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        router.push(`/practice/listening/results/${response.data.id}`);
      } else {
        router.push('/error500');
      }
    },
    [data, router]
  );

  const values = form.watch();

  const answeredQuestions = useMemo(() => {
    const collected = new Set<number>();

    Object.entries(values).forEach(([key, answer]) => {
      if (typeof answer !== 'string' || !answer.trim()) {
        return;
      }

      const numericKey = Number(key);
      if (Number.isFinite(numericKey)) {
        collected.add(numericKey);
      }
    });

    return collected;
  }, [values]);

  const partRanges = useMemo(() => {
    if (!data) {
      return null as null | Record<PartTab, { start: number; end: number }>;
    }

    const part1 = { start: 1, end: data.part_1.questions_count };
    const part2 = {
      start: part1.end + 1,
      end: part1.end + data.part_2.questions_count,
    };
    const part3 = {
      start: part2.end + 1,
      end: part2.end + data.part_3.questions_count,
    };
    const part4 = {
      start: part3.end + 1,
      end: part3.end + data.part_4.questions_count,
    };

    return {
      p1: part1,
      p2: part2,
      p3: part3,
      p4: part4,
    } satisfies Record<PartTab, { start: number; end: number }>;
  }, [data]);

  const partOptions = useMemo(() => {
    if (!partRanges) {
      return [] as { id: PartTab; label: string; subtitle: string }[];
    }

    return PART_IDS.map((partId, index) => {
      const range = partRanges[partId];
      return {
        id: partId,
        label: tCommon('partNumber', { number: index + 1 }),
        subtitle: t('mobile.rangeLabel', { from: range.start, to: range.end }),
      };
    });
  }, [partRanges, t, tCommon]);

  const activeRange = partRanges ? partRanges[activeTab] : null;
  const totalQuestions = useMemo(() => {
    if (!partRanges) {
      return 0;
    }

    return partRanges.p4.end;
  }, [partRanges]);

  const progress = useMemo(() => {
    if (totalQuestions === 0) {
      return 0;
    }

    return (answeredQuestions.size / totalQuestions) * PROGRESS_PRECISION;
  }, [answeredQuestions.size, totalQuestions]);

  const rangeLabelFormatted = activeRange ? t('mobile.rangeLabel', { from: activeRange.start, to: activeRange.end }) : '';
  const primaryLabel = activeTab === 'p4' ? tActions('submit') : tActions('next');

  const mobileStrings = {
    progressAccessibility: t('mobile.progressAccessibility', { percent: Math.round(progress) }),
    partSheetTitle: t('mobile.partSheet.title'),
    partSheetSubtitle: t('mobile.partSheet.subtitle'),
    partSheetClose: t('mobile.partSheet.close'),
    questionsMapTitle: t('mobile.questionsMap.title'),
    questionsMapSubtitle: t('mobile.questionsMap.subtitle'),
    questionsMapClose: t('mobile.questionsMap.close'),
    questionsMapAnswered: t('mobile.questionsMap.answered'),
    questionsMapOpenLabel: t('mobile.questionsMap.open'),
    questionsMapQuestionAria: (number: number) => t('mobile.questionsMap.questionAria', { number }),
    questionsMapSectionLabel: (part: number, from: number, to: number) => t('mobile.questionsMap.sectionLabel', { part, from, to }),
    contextHint: activeRange ? t('mobile.contextBar.hint', { range: `${activeRange.start}–${activeRange.end}` }) : undefined,
    audioTitle: t('mobile.audio.title'),
    audioHint: t('mobile.audio.hint'),
    scrollTop: t('mobile.scrollTop'),
    audioStopWarning: t('mobile.audio.stopWarning'),
    instructionDesktop: t('instructionDesktop'),
  };

  const questionSections = useMemo(() => {
    if (!partRanges) {
      return [] as { label: string; questions: number[] }[];
    }

    return PART_IDS.map((partId, index) => {
      const range = partRanges[partId];
      const questions = Array.from({ length: range.end - range.start + 1 }, (_, idx) => range.start + idx);
      return {
        label: mobileStrings.questionsMapSectionLabel(index + 1, range.start, range.end),
        questions,
      };
    });
  }, [partRanges, mobileStrings]);

  const effectiveCurrentQuestion = currentQuestion ?? activeRange?.start ?? null;

  const handleQuestionFocus = useCallback((questionNumber: number) => {
    setCurrentQuestion(questionNumber);
  }, []);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const submitForm = useCallback(() => {
    void form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  const navigateToPart = useCallback(
    (nextTab: PartTab, options?: { targetQuestion?: number; scrollTop?: boolean }) => {
      if (nextTab === activeTab) {
        if (options?.targetQuestion) {
          pendingQuestionRef.current = options.targetQuestion;
        }
        return;
      }

      if (isMobile) {
        // if ((audioState === 'playing' || audioState === 'loading') && audioBarRef.current) {
        //   const shouldStop = window.confirm(mobileStrings.audioStopWarning);
        //   if (!shouldStop) {
        //     return;
        //   }
        //   audioBarRef.current.stop();
        // }

        scrollPositionsRef.current[activeTab] = window.scrollY;

        if (options?.targetQuestion) {
          pendingQuestionRef.current = options.targetQuestion;
          pendingScrollRef.current = null;
        } else if (options?.scrollTop) {
          pendingScrollRef.current = 0;
        } else {
          pendingScrollRef.current = scrollPositionsRef.current[nextTab] ?? 0;
        }
      }

      setActiveTab(nextTab);

      if (!isMobile && options?.scrollTop && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [activeTab, audioState, isMobile, mobileStrings.audioStopWarning]
  );

  const handlePrimaryAction = useCallback(() => {
    if (activeTab === 'p4') {
      submitForm();
      return;
    }

    const nextIndex = PART_IDS.indexOf(activeTab) + 1;
    const nextTab = PART_IDS[nextIndex];
    if (nextTab) {
      navigateToPart(nextTab, { scrollTop: true });
    }
  }, [activeTab, navigateToPart, submitForm]);

  const getPartByQuestionNumber = useCallback(
    (questionNumber: number): PartTab => {
      if (!partRanges) {
        return 'p1';
      }

      for (const partId of PART_IDS) {
        const range = partRanges[partId];
        if (questionNumber >= range.start && questionNumber <= range.end) {
          return partId;
        }
      }

      return 'p1';
    },
    [partRanges]
  );

  const handleSelectQuestion = useCallback(
    (questionNumber: number) => {
      const targetPart = getPartByQuestionNumber(questionNumber);
      navigateToPart(targetPart, { targetQuestion: questionNumber });
    },
    [getPartByQuestionNumber, navigateToPart]
  );

  const handleCueReach = useCallback((cue: AudioCuePoint) => {
    if (!cue?.questionNumber) {
      return;
    }

    const node = document.getElementById(`question-${cue.questionNumber}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentQuestion(cue.questionNumber);
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowScrollTop(false);
      return;
    }

    const handleScroll = () => {
      const current = window.scrollY;
      lastScrollYRef.current = current;
      setShowScrollTop(current > window.innerHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      pendingQuestionRef.current = null;
      pendingScrollRef.current = null;
      return;
    }

    if (pendingQuestionRef.current != null) {
      const questionNumber = pendingQuestionRef.current;
      pendingQuestionRef.current = null;

      const questionId = `question-${questionNumber}`;

      const attemptScroll = () => {
        const node = document.getElementById(questionId);

        if (node) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setCurrentQuestion(questionNumber);
        } else {
          requestAnimationFrame(attemptScroll);
        }
      };

      requestAnimationFrame(attemptScroll);
      return;
    }

    if (pendingScrollRef.current != null) {
      const target = pendingScrollRef.current;
      pendingScrollRef.current = null;
      window.scrollTo({ top: target, behavior: 'auto' });
    }
  }, [activeTab, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    scrollPositionsRef.current[activeTab] = window.scrollY;
  }, [activeTab, isMobile]);

  const timerLabel = useMemo(() => {
    if (timer == null) {
      return null;
    }

    try {
      return format(new Date(timer), 'mm:ss');
    } catch (error) {
      return null;
    }
  }, [timer]);

  const questionsCountString = useCallback(() => {
    if (!activeRange) {
      return '';
    }

    return `${activeRange.start} – ${activeRange.end}`;
  }, [activeRange]);

  if (status === 'pending' || status === 'error' || !data || !partRanges) {
    return <></>;
  }

  const instructionRange = questionsCountString();

  const renderDesktopTestQuestion = (question: any) => {
    const questionId = `question-${question.number}`;
    const questionLabelId = `listening_${question.number}`;

    const renderChoices = (choices: any[], choiceRenderer: (choice: any) => React.ReactNode) => (
      <FormField
        control={form.control}
        name={question.number.toString()}
        render={({ field }) => (
          <FormControl>
            <RadioGroup
              {...field}
              onValueChange={value => {
                field.onChange(value);
                handleQuestionFocus(question.number);
              }}
              className='flex w-full flex-col gap-[12rem]'
            >
              {choices.map(choiceRenderer)}
            </RadioGroup>
          </FormControl>
        )}
      />
    );

    return (
      <div key={question.number} id={questionId} className='flex flex-col gap-[18rem]'>
        <div className='flex flex-col gap-[12rem]'>
          <div className='flex items-start gap-[16rem]'>
            <div className='mt-[2rem] w-[25rem] shrink-0 text-center text-[18rem] font-semibold text-d-black'>{question.number}</div>
            <div className='text-[16rem] font-medium leading-[22rem] text-d-black'>{question.question}</div>
          </div>
        </div>

        {question.picture ? (
          <div className='flex flex-col gap-[20rem] tablet:flex-row tablet:items-start tablet:gap-[52rem]'>
            <img src={question.picture} alt={question.question} className='h-auto w-full max-w-[500rem] rounded-[12rem] border border-d-black/10 object-contain' />
            {renderChoices(['A', 'B', 'C', 'D'], (choice: string) => {
              const isSelected = form.getValues(question.number.toString())?.includes(choice);
              const inputId = `${questionLabelId}_${choice}`;
              return (
                <motion.div
                  key={choice}
                  layout
                  variants={optionVariants}
                  animate={isSelected ? 'selected' : 'idle'}
                  transition={optionTransition}
                  className={cn(
                    'flex w-full items-center gap-[16rem] rounded-[12rem] border border-transparent bg-white px-[10rem] py-[12rem] text-[16rem] font-normal text-d-black shadow-[0_8rem_24rem_rgba(56,56,56,0.08)]',
                    isSelected ? 'border-d-green/70 bg-d-light-gray' : 'hover:bg-d-light-gray/60'
                  )}
                >
                  <RadioGroupItem value={choice} id={inputId} onFocus={() => handleQuestionFocus(question.number)} />
                  <Label htmlFor={inputId} className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'>
                    Picture {choice}
                  </Label>
                </motion.div>
              );
            })}
          </div>
        ) : (
          renderChoices(question.choices, (choice: any) => {
            const isSelected = form.getValues(question.number.toString())?.includes(choice.answer);
            const inputId = `${questionLabelId}_${choice.answer}`;
            return (
              <motion.div
                key={choice.answer}
                layout
                variants={optionVariants}
                animate={isSelected ? 'selected' : 'idle'}
                transition={optionTransition}
                className={cn(
                  'flex w-full items-center gap-[16rem] rounded-[12rem] border border-transparent bg-white px-[10rem] py-[12rem] text-[16rem] font-normal text-d-black shadow-[0_8rem_24rem_rgba(56,56,56,0.08)]',
                  isSelected ? 'border-d-green/70 bg-d-light-gray' : 'hover:bg-d-light-gray/60'
                )}
              >
                <RadioGroupItem value={choice.answer} id={inputId} onFocus={() => handleQuestionFocus(question.number)} />
                <Label htmlFor={inputId} className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'>
                  {choice.choice}
                </Label>
              </motion.div>
            );
          })
        )}
      </div>
    );
  };

  const renderMobileTestQuestion = (question: any) => {
    const fieldName = question.number.toString();
    const baseId = `listening_${question.number}`;

    const renderChoices = (choices: any[], valueExtractor: (choice: any) => string, labelExtractor: (choice: any) => React.ReactNode) => (
      <FormField
        key={`mobile-test-${fieldName}`}
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={value => {
                field.onChange(value);
                handleQuestionFocus(question.number);
              }}
              className='flex w-full flex-col gap-[12rem]'
            >
              {choices.map(choice => {
                const value = valueExtractor(choice);
                const id = `${baseId}_${value}`;
                return (
                  <RadioOptionRow
                    key={id}
                    id={id}
                    value={value}
                    label={labelExtractor(choice)}
                    selected={field.value === value}
                    onFocus={() => handleQuestionFocus(question.number)}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        )}
      />
    );

    return (
      <div key={`mobile-question-${question.number}`} id={`question-${question.number}`} className='flex flex-col gap-[16rem]'>
        <div className='flex items-start gap-[16rem]'>
          <span className='mt-[2rem] w-[26rem] shrink-0 text-center text-[18rem] font-semibold text-d-black'>{question.number}</span>
          <p className='text-[16rem] font-medium leading-[22rem] text-d-black'>{question.question}</p>
        </div>

        {question.picture ? (
          <div className='flex flex-col gap-[16rem]'>
            <img src={question.picture} alt={question.question} className='w-full rounded-[12rem] border border-d-black/10 object-contain' />
            {renderChoices(
              ['A', 'B', 'C', 'D'],
              letter => letter,
              letter => `Picture ${letter}`
            )}
          </div>
        ) : (
          renderChoices(
            question.choices,
            (choice: any) => choice.answer,
            (choice: any) => choice.choice
          )
        )}
      </div>
    );
  };

  const renderDesktopWordsBlock = (block: any) => (
    <div className='flex flex-col gap-[12rem]'>
      {block.text ? (
        <div className='text-[16rem] leading-[22rem] text-d-black'>
          {transformStringToArrayV4(block.text).map((str: any, index: number) => {
            if (str.type === 'input') {
              const question = block.questions[str.index];
              if (!question) {
                return null;
              }
              return (
                <FormField
                  key={`words-${index}`}
                  control={form.control}
                  name={question.number.toString()}
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder={question.number.toString()}
                        id={`question-${question.number}`}
                        className={cn(
                          'mx-[4rem] inline-flex h-[32rem] min-w-[120rem] max-w-[240rem] items-center justify-center rounded-[8rem] border border-d-black/60 px-[10rem] text-center text-[16rem] font-normal text-d-black shadow-[0_4rem_16rem_rgba(56,56,56,0.12)]',
                          field.value ? 'bg-d-light-gray' : 'bg-white'
                        )}
                        onFocus={() => handleQuestionFocus(question.number)}
                        onChange={event => {
                          field.onChange(event.target.value);
                          handleQuestionFocus(question.number);
                        }}
                      />
                    </FormControl>
                  )}
                />
              );
            }

            if (str.type === 'break') {
              return <br key={`words-break-${index}`} />;
            }

            return <span key={`words-span-${index}`}>{str.value}</span>;
          })}
        </div>
      ) : null}
    </div>
  );

  const renderDesktopCheckboxesBlock = (block: any) => (
    <div className='flex flex-col gap-[16rem]'>
      {block.text ? <p className='text-[16rem] font-medium leading-[22rem] text-d-black'>{block.text}</p> : null}
      <div className='flex flex-col gap-[12rem]'>
        {block.choices.map((choice: any) => (
          <div key={`checkbox-choice-${choice.choice}-${block.answers[0].number}`} className='flex flex-col gap-[6rem]'>
            <FormField
              control={form.control}
              name={block.answers[0].number.toString()}
              render={({ field }) => (
                <FormControl>
                  <div
                    className={cn(
                      'flex w-full items-center gap-[16rem] rounded-[12rem] border border-transparent bg-white px-[10rem] py-[12rem] text-[16rem] font-normal text-d-black shadow-[0_8rem_24rem_rgba(56,56,56,0.08)]',
                      field.value?.includes(choice.answer) ? 'border-d-green/70 bg-d-light-gray' : 'hover:bg-d-light-gray/60'
                    )}
                  >
                    <CheckboxSquare
                      id={`listening_${block.task_questions}_${choice.answer}`}
                      checked={field.value?.includes(choice.answer)}
                      onCheckedChange={checked => {
                        const currentValue = field.value ? field.value.split('|') : [];
                        if (checked) {
                          block.answers.forEach((answer: any) => form.setValue(answer.number.toString(), [...currentValue, choice.answer].join('|')));
                        } else {
                          block.answers.forEach((answer: any) =>
                            form.setValue(answer.number.toString(), currentValue.filter((val: string) => val !== choice.answer).join('|'))
                          );
                        }
                        handleQuestionFocus(block.answers[0].number);
                      }}
                      disabled={!field.value?.includes(choice.answer) && field.value?.split('|').length === block.answers.length}
                    />
                    <Label
                      htmlFor={`listening_${block.task_questions}_${choice.answer}`}
                      className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'
                    >
                      {choice.choice}
                    </Label>
                  </div>
                </FormControl>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMobileWordsBlock = (block: any) => (
    <div className='flex flex-col gap-[16rem] text-[16rem] leading-[22rem] text-d-black'>
      {block.text
        ? transformStringToArrayV4(block.text).map((token: any, index: number) => {
            if (token.type === 'input') {
              const question = block.questions[token.index];
              if (!question) {
                return null;
              }

              return (
                <FormField
                  key={`mobile-words-${index}`}
                  control={form.control}
                  name={question.number.toString()}
                  render={({ field }) => (
                    <FormControl>
                      <TextAnswerInput
                        {...field}
                        placeholder={question.number.toString()}
                        id={`question-${question.number}`}
                        className={cn('mx-[4rem] w-[200rem]', field.value ? 'bg-d-light-gray' : 'bg-white')}
                        onFocus={() => handleQuestionFocus(question.number)}
                        onChange={event => {
                          field.onChange(event.target.value);
                          handleQuestionFocus(question.number);
                        }}
                      />
                    </FormControl>
                  )}
                />
              );
            }

            if (token.type === 'break') {
              return <br key={`mobile-words-break-${index}`} />;
            }

            return <span key={`mobile-words-string-${index}`}>{token.value}</span>;
          })
        : null}
    </div>
  );

  const renderMobileCheckboxesBlock = (block: any) => (
    <FormField
      key={`mobile-checkbox-${block.task_questions}`}
      control={form.control}
      name={block.answers[0].number.toString()}
      render={({ field }) => {
        const selections = field.value ? field.value.split('|').filter(Boolean) : [];

        const updateSelections = (checked: boolean, answerValue: string) => {
          const current = new Set(selections);
          if (checked) {
            current.add(answerValue);
          } else {
            current.delete(answerValue);
          }

          const nextValue = Array.from(current).join('|');
          block.answers.forEach((item: any) => form.setValue(item.number.toString(), nextValue));
          handleQuestionFocus(block.answers[0].number);
        };

        return (
          <FormControl>
            <div className='flex flex-col gap-[12rem]'>
              {block.text ? <p className='text-[15rem] font-medium leading-[20rem] text-d-black/80'>{block.text}</p> : null}
              {block.choices.map((choice: any) => {
                const isChecked = selections.includes(choice.answer);
                const atLimit = !isChecked && selections.length >= block.answers.length;
                const checkboxId = `listening_mobile_${block.task_questions}_${choice.answer}`;

                return (
                  <CheckboxOptionRow
                    key={checkboxId}
                    id={checkboxId}
                    label={choice.choice}
                    value={choice.answer}
                    checked={isChecked}
                    disabled={atLimit}
                    onChange={(checked, value) => updateSelections(checked, value)}
                    onFocus={() => handleQuestionFocus(block.answers[0].number)}
                  />
                );
              })}
            </div>
          </FormControl>
        );
      }}
    />
  );

  const renderBlock = (block: any, index: number) => {
    if (isMobile) {
      return (
        <QuestionCard key={`questions-block-${index}`} title={block.task_questions} subtitle={block.task}>
          {block.kind === 'test' ? block.questions.map(renderMobileTestQuestion) : null}
          {block.kind === 'words' ? renderMobileWordsBlock(block) : null}
          {block.kind === 'checkboxes' ? renderMobileCheckboxesBlock(block) : null}
        </QuestionCard>
      );
    }

    return (
      <div
        key={`questions-block-${index}`}
        className={cn(
          'flex w-full flex-col gap-[32rem] rounded-[18rem] border border-[#cdecd6] bg-white px-[20rem] py-[24rem] text-d-black shadow-[0_18rem_44rem_rgba(56,56,56,0.1)]',
          'tablet:gap-y-[48rem] tablet:rounded-[16rem] tablet:border-none tablet:px-[40rem] tablet:py-[40rem] tablet:shadow-none'
        )}
      >
        <div className='flex flex-col gap-[12rem]'>
          <p className='text-[18rem] font-semibold leading-[22rem] text-d-black tablet:text-[20rem]'>{block.task_questions}</p>
          <p className='whitespace-pre-line text-[14rem] leading-[20rem] text-d-black/70 tablet:text-[16rem] tablet:leading-[19rem]'>{block.task}</p>
        </div>

        {block.kind === 'test' ? <div className='flex flex-col gap-[32rem]'>{block.questions.map(renderDesktopTestQuestion)}</div> : null}
        {block.kind === 'words' ? renderDesktopWordsBlock(block) : null}
        {block.kind === 'checkboxes' ? renderDesktopCheckboxesBlock(block) : null}
      </div>
    );
  };

  return (
    <PracticeLeaveGuard>
      <div className='hidden tablet:block'>
        <HeaderDuringTest title={tCommon('practice')} tag={tCommon('listening')} audio={data.audio_url} />
      </div>

      <MobileHeader
        title={tCommon('practice')}
        tag={tCommon('reading')}
        timerLabel={timerLabel}
        closeAs={'link'}
        exitLabel={tActions('exit')}
        closeHref='/m/practice'
        variant='listening'
      />

      <main className={cn('min-h-screen overflow-hidden', isMobile ? 'bg-[#F7FFF9]' : 'bg-d-light-gray')}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isMobile ? (
              <MobileContextBar
                partLabel={partOptions.find(option => option.id === activeTab)?.label ?? ''}
                onPartPress={() => setPartSheetOpen(true)}
                timerLabel={null}
                instructionText={mobileStrings.contextHint}
                className='[&>div]:border-[#cdecd6] [&>div]:bg-white [&>div]:shadow-[0_18rem_36rem_rgba(56,56,56,0.12)] [&_button]:border-[#cdecd6] [&_button]:bg-[#E9FFF2]'
              />
            ) : null}

            <Tabs
              value={activeTab}
              onValueChange={value => navigateToPart(value as PartTab)}
              defaultValue='p1'
              className={cn(
                'flex min-h-[100dvh] w-full flex-col',
                isMobile ? 'px-[16rem] pb-[240rem] pt-[20rem]' : 'container max-w-[1440rem] px-[40rem] pb-[24rem] pt-[40rem]'
              )}
            >
              {!isMobile ? (
                <div className='mb-[40rem] flex items-start justify-between'>
                  <TabsList className='practice-tabs-shadow relative hidden w-fit items-center gap-x-[8rem] rounded-[64rem] bg-white p-[8rem] text-[14rem] font-medium leading-[26rem] tracking-[-0.2rem] text-d-black tablet:flex'>
                    {PART_IDS.map((partId, index) => (
                      <TabsTrigger
                        key={partId}
                        value={partId}
                        className='flex h-[58rem] w-[101rem] items-center justify-center rounded-[64rem] bg-white data-[state=active]:bg-d-green hover:bg-d-green'
                      >
                        {tCommon('partNumber', { number: index + 1 })}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {PART_IDS.map(partId => {
                    const range = partRanges[partId];
                    const questions = Array.from({ length: range.end - range.start + 1 }, (_, idx) => range.start + idx);
                    return (
                      <TabsContent
                        key={`questions-nav-tab-${partId}`}
                        value={partId}
                        className='practice-tabs-shadow relative hidden w-fit items-center rounded-[64rem] bg-white p-[8rem] text-[14rem] font-semibold leading-[26rem] tracking-[-0.2rem] text-d-black data-[state=inactive]:hidden tablet:flex'
                      >
                        {questions.map(qNumber => (
                          <div key={`question-nav-link-${qNumber}`} className='group flex h-[58rem] w-[56rem] flex-col items-center justify-center rounded-[64rem]'>
                            <span>{qNumber}</span>
                            <div
                              data-state={values[qNumber] ? 'active' : 'inactive'}
                              className='h-[4rem] w-[16rem] rounded-[16rem] bg-d-light-gray data-[state=active]:bg-d-green'
                            />
                          </div>
                        ))}
                      </TabsContent>
                    );
                  })}
                </div>
              ) : null}

              {!isMobile ? (
                <div className='relative mb-[40rem] flex w-full items-center justify-center rounded-[13rem] bg-white py-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                  {mobileStrings.instructionDesktop} {instructionRange}
                </div>
              ) : null}

              {PART_IDS.map(partId => {
                const part = getPartFromData(data, partId);
                return (
                  <TabsContent
                    key={`questions-content-${partId}`}
                    value={partId}
                    className='flex flex-col gap-[24rem] tablet:flex-row tablet:items-start tablet:justify-between'
                  >
                    <div className='flex w-full flex-col gap-y-[16rem]'>
                      {part.blocks.map((block: any, index: number) => renderBlock(block, index))}

                      {!isMobile ? (
                        <div className='flex flex-col gap-[16rem]'>
                          {partId !== 'p1' ? (
                            <button
                              type='button'
                              onClick={() => navigateToPart(PART_IDS[Math.max(PART_IDS.indexOf(partId) - 1, 0)], { scrollTop: true })}
                              className='hidden h-[64rem] w-full items-center justify-center rounded-[40rem] border border-d-black/20 bg-white text-[18rem] font-medium text-d-black transition hover:bg-d-green/20 tablet:flex'
                            >
                              {tActions('back')}
                            </button>
                          ) : null}

                          {partId !== 'p4' ? (
                            <button
                              type='button'
                              onClick={() => navigateToPart(PART_IDS[Math.min(PART_IDS.indexOf(partId) + 1, PART_IDS.length - 1)], { scrollTop: true })}
                              className='hidden h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black tablet:flex'
                            >
                              {tActions('next')}
                            </button>
                          ) : (
                            <button
                              type='submit'
                              className='hidden h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black tablet:flex'
                            >
                              {tActions('submit')}
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </form>
        </Form>
      </main>

      <PartSheet
        open={isPartSheetOpen}
        onOpenChange={setPartSheetOpen}
        options={partOptions}
        activeId={activeTab}
        onSelect={id => navigateToPart(id as PartTab, { scrollTop: true })}
        title={mobileStrings.partSheetTitle}
        subtitle={mobileStrings.partSheetSubtitle}
        closeLabel={mobileStrings.partSheetClose}
      />

      <QuestionsMapSheet
        open={isQuestionsMapOpen}
        onOpenChange={setQuestionsMapOpen}
        sections={questionSections}
        answered={answeredQuestions}
        currentQuestion={effectiveCurrentQuestion}
        onSelectQuestion={handleSelectQuestion}
        title={mobileStrings.questionsMapTitle}
        subtitle={mobileStrings.questionsMapSubtitle}
        closeLabel={mobileStrings.questionsMapClose}
        answeredLabel={mobileStrings.questionsMapAnswered}
        questionAriaLabel={mobileStrings.questionsMapQuestionAria}
      />

      {isMobile ? (
        <>
          <UnifiedBottomNav
            hidden={!data}
            audioSlot={
              <AudioBar
                ref={instance => {
                  audioBarRef.current = instance;
                }}
                src={data.audio_url}
                title={mobileStrings.audioTitle}
                hint={mobileStrings.audioHint}
                onCueReach={handleCueReach}
                onStateChange={setAudioState}
              />
            }
            onOpenMap={() => setQuestionsMapOpen(true)}
            mapLabel={mobileStrings.questionsMapOpenLabel}
            rangeLabel={rangeLabelFormatted}
            primaryLabel={primaryLabel}
            onPrimaryAction={handlePrimaryAction}
            primaryDisabled={form.formState.isSubmitting}
            ariaPrimaryLabel={primaryLabel}
            progress={progress}
            progressLabel={mobileStrings.progressAccessibility}
          />

          <AnimatePresence>
            {showScrollTop ? (
              <motion.button
                key='scroll-top'
                type='button'
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                onClick={handleScrollTop}
                className='fixed bottom-[calc(188rem+env(safe-area-inset-bottom))] right-[16rem] z-50 inline-flex size-[48rem] items-center justify-center rounded-full border border-[#dacfae] bg-white text-d-black shadow-[0_14rem_32rem_rgba(56,56,56,0.2)] transition hover:-translate-y-[2rem] hover:shadow-[0_18rem_40rem_rgba(56,56,56,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60'
                aria-label={mobileStrings.scrollTop}
              >
                <ArrowUp className='size-[22rem]' aria-hidden='true' />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </PracticeLeaveGuard>
  );
}

function getPartFromData(data: Awaited<ReturnType<typeof GET_practice_listening_id>>, partId: PartTab) {
  if (partId === 'p1') {
    return data.part_1;
  }
  if (partId === 'p2') {
    return data.part_2;
  }
  if (partId === 'p3') {
    return data.part_3;
  }
  return data.part_4;
}
