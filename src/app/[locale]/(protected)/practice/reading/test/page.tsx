'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckboxSquare } from '@/components/ui/checkboxSquare';
import { DndMatching } from './components/DndMatching';
import { DndText } from './components/DndText';
import { GET_practice_reading_id } from '@/api/GET_practice_reading_id';
import axiosInstance from '@/lib/axiosInstance';
import { cn, transformStringToArrayV2, transformStringToArrayV4 } from '@/lib/utils';
import type { PracticeReadingContent, PracticeReadingPart, PracticeReadingResult } from '@/types/PracticeReading';

import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { PracticeLeaveGuard } from '@/components/PracticeLeaveGuard';
import { useMediaQuery } from 'usehooks-ts';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';
import { PartSheet } from '@/components/practice/reading/mobile/PartSheet';
import { QuestionsMapSheet } from '@/components/practice/reading/mobile/QuestionsMapSheet';
import { BottomNavBar } from '@/components/practice/reading/mobile/BottomNavBar';
import { CollapsiblePassage } from '@/components/practice/reading/mobile/CollapsiblePassage';
import { MobileMatching } from '@/components/practice/reading/mobile/MobileMatching';
import { MobileTextInsert } from '@/components/practice/reading/mobile/MobileTextInsert';
import { MobileContextBar } from '@/components/practice/reading/mobile/MobileContextBar';
import { HintBadge } from '@/components/practice/reading/mobile/HintBadge';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { format } from 'date-fns';
import { mockStore } from '@/stores/mock';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';

const optionVariants = {
  idle: { scale: 1, opacity: 0.96 },
  selected: { scale: 1.02, opacity: 1 },
};

const optionTransition = { type: 'spring', stiffness: 360, damping: 28, mass: 0.45 } as const;

type FormValues = {
  [key: string]: string | undefined;
};

type PartNumber = 1 | 2 | 3;

export default function Page() {
  const router = useRouter();
  const { t, tCommon, tActions } = useCustomTranslations('practice.reading.test');

  const fallbackContent = useMemo(
    () => ({
      title: t('fallback.title'),
      description: t('fallback.description'),
      actionLabel: t('fallback.action'),
    }),
    [t]
  );

  const handleFallbackNavigation = useCallback(() => {
    void router.push('/profile');
  }, [router]);

  const [activeTab, setActiveTab] = useState<'p1' | 'p2' | 'p3'>('p1');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { timer } = mockStore();
  const [isPartSheetOpen, setPartSheetOpen] = useState(false);
  const [isQuestionsMapOpen, setQuestionsMapOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollPositionsRef = useRef<Record<'p1' | 'p2' | 'p3', number>>({ p1: 0, p2: 0, p3: 0 });
  const pendingScrollRef = useRef<number | null>(null);
  const pendingQuestionRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);

  const { data, status } = useQuery<PracticeReadingContent>({
    queryKey: ['practice-reading'],
    queryFn: () => GET_practice_reading_id(localStorage.getItem('practiceReadingId') as string),
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      answers: Object.entries(values).map(([question, answer]) => ({
        question: parseInt(question),
        answer: answer,
      })),
    };
    // Выписываем все номера вопросов типа чекбокс
    let checkboxQuestionBlocks: number[][] = [];
    ([1, 2, 3] as PartNumber[]).forEach(partNumber => {
      getPart(partNumber)
        .blocks.filter((block: any) => block.kind === 'checkboxes')
        .forEach((block: any) => {
          checkboxQuestionBlocks.push(block.answers.map((q: any) => q.number));
        });
    });
    // В финальном ответе для бека, все чекбоксы вопросы, которые записаны как A|B|C - переделываем в одиночные ответы
    checkboxQuestionBlocks.forEach((block: number[]) => {
      block.forEach((question: number, index: number) => {
        // question - 1 - потому что массив начинается с index 0 и соответственно имеем виде [{0: {question: 1, answer: 'some answer'}}, ...]
        if (formattedValues.answers?.[question - 1]?.answer?.includes('|')) {
          formattedValues.answers[question - 1].answer = formattedValues.answers[question - 1].answer!.split('|')[index];
        }
      });
    });

    formattedValues.answers = formattedValues.answers.filter(item => item.answer);

    const response = await axiosInstance.post<PracticeReadingResult>(`/practice/reading/${localStorage.getItem('practiceReadingId')}`, formattedValues, {
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300) {
      const result = response.data;
      void router.push(`/practice/reading/results/${result.id}`);
    } else {
      void router.push('/error500');
    }
  }

  const values = form.watch();

  const answeredQuestions = useMemo(() => {
    const collected = new Set<number>();

    Object.entries(values).forEach(([key, answer]) => {
      if (typeof answer !== 'string') {
        return;
      }

      if (!answer.trim()) {
        return;
      }

      const numericKey = Number(key);
      if (Number.isFinite(numericKey)) {
        collected.add(numericKey);
      }
    });

    return collected;
  }, [values]);

  const totalQuestions = useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.part_1.questions_count + data.part_2.questions_count + data.part_3.questions_count;
  }, [data]);

  const progress = useMemo(() => {
    if (totalQuestions === 0) {
      return 0;
    }

    return (answeredQuestions.size / totalQuestions) * 100;
  }, [answeredQuestions, totalQuestions]);

  const partRanges = useMemo(() => {
    if (!data) {
      return null as null | Record<'p1' | 'p2' | 'p3', { start: number; end: number }>;
    }

    const part1 = { start: 1, end: data.part_1.questions_count };
    const part2 = {
      start: part1.end + 1,
      end: data.part_1.questions_count + data.part_2.questions_count,
    };
    const part3 = {
      start: part2.end + 1,
      end: data.part_1.questions_count + data.part_2.questions_count + data.part_3.questions_count,
    };

    return {
      p1: part1,
      p2: part2,
      p3: part3,
    };
  }, [data]);

  const partOptions = useMemo(() => {
    if (!partRanges) {
      return [] as { id: 'p1' | 'p2' | 'p3'; label: string; subtitle: string }[];
    }

    return (['p1', 'p2', 'p3'] as const).map((partId, index) => {
      const range = partRanges[partId];
      return {
        id: partId,
        label: tCommon('partNumber', { number: index + 1 }),
        subtitle: t('mobile.rangeLabel', { from: range.start, to: range.end }),
      };
    });
  }, [partRanges, tCommon, t]);

  const activeRange = partRanges ? partRanges[activeTab] : null;
  const rangeLabel = activeRange ? `Q${activeRange.start}–${activeRange.end}` : '';

  const activePartOption = partOptions.find(option => option.id === activeTab);
  const primaryLabel = activeTab === 'p3' ? tActions('submit') : tActions('next');

  const mobileStrings = {
    progressAccessibility: t('mobile.progressAccessibility', { percent: Math.round(progress) }),
    partSheetTitle: t('mobile.partSheet.title'),
    partSheetSubtitle: t('mobile.partSheet.subtitle'),
    partSheetClose: t('mobile.partSheet.close'),
    partSheetOpen: t('mobile.partSheet.open'),
    questionsMapTitle: t('mobile.questionsMap.title'),
    questionsMapSubtitle: t('mobile.questionsMap.subtitle'),
    questionsMapClose: t('mobile.questionsMap.close'),
    questionsMapAnswered: t('mobile.questionsMap.answered'),
    questionsMapOpenLabel: t('mobile.questionsMap.open'),
    questionsMapQuestionAria: (number: number) => t('mobile.questionsMap.questionAria', { number }),
    notesTitle: t('mobile.notes.title'),
    notesDescription: t('mobile.notes.description'),
    notesPlaceholder: t('mobile.notes.placeholder'),
    notesClear: t('mobile.notes.clear'),
    notesClose: t('mobile.notes.close'),
    notesOpen: t('mobile.notes.open'),
    passageExpand: t('mobile.passage.expand'),
    passageCollapse: t('mobile.passage.collapse'),
    scrollTop: t('mobile.scrollTop'),
  };

  const rangeLabelFormatted = activeRange ? t('mobile.rangeLabel', { from: activeRange.start, to: activeRange.end }) : rangeLabel;

  const questionSections = useMemo(() => {
    if (totalQuestions === 0) {
      return [] as { label: string; questions: number[] }[];
    }

    const generateQuestions = (start: number, end: number) => {
      const clampedEnd = Math.min(end, totalQuestions);
      if (start > clampedEnd) {
        return [] as number[];
      }

      return Array.from({ length: clampedEnd - start + 1 }, (_, index) => start + index);
    };

    const ranges: Array<{ label: string; start: number; end: number }> = [
      { label: 'Q1–15', start: 1, end: 15 },
      { label: 'Q16–28', start: 16, end: 28 },
      { label: `Q29–${totalQuestions}`, start: 29, end: totalQuestions },
    ];

    return ranges
      .map(range => ({
        label: range.label,
        questions: generateQuestions(range.start, range.end),
      }))
      .filter(section => section.questions.length > 0);
  }, [totalQuestions]);

  const effectiveCurrentQuestion = currentQuestion ?? activeRange?.start ?? null;

  const getPartByQuestionNumber = useCallback(
    (questionNumber: number): 'p1' | 'p2' | 'p3' => {
      if (!partRanges) {
        return 'p1';
      }

      if (questionNumber <= partRanges.p1.end) {
        return 'p1';
      }

      if (questionNumber <= partRanges.p2.end) {
        return 'p2';
      }

      return 'p3';
    },
    [partRanges]
  );

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
    (nextTab: 'p1' | 'p2' | 'p3', options?: { targetQuestion?: number; scrollTop?: boolean }) => {
      if (nextTab === activeTab) {
        if (options?.targetQuestion) {
          pendingQuestionRef.current = options.targetQuestion;
        }
        return;
      }

      if (isMobile) {
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
    [activeTab, isMobile]
  );

  const handlePrimaryAction = useCallback(() => {
    if (activeTab === 'p3') {
      submitForm();
      return;
    }

    const nextTab = activeTab === 'p1' ? 'p2' : 'p3';
    navigateToPart(nextTab, { scrollTop: true });
  }, [activeTab, navigateToPart, submitForm]);

  const handleSelectQuestion = useCallback(
    (questionNumber: number) => {
      const targetPart = getPartByQuestionNumber(questionNumber);
      navigateToPart(targetPart, { targetQuestion: questionNumber });
    },
    [getPartByQuestionNumber, navigateToPart]
  );

  useEffect(() => {
    if (!isMobile) {
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
      setShowScrollTop(false);
      return;
    }

    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollYRef.current;
      lastScrollYRef.current = current;

      const threshold = 22;

      setShowScrollTop(current > window.innerHeight);
    };

    lastScrollYRef.current = window.scrollY;
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  const questionsCountString = () => {
    if (!partRanges || !activeRange) {
      return '';
    }

    return `${activeRange.start} – ${activeRange.end}`;
  };

  const instructionRange = questionsCountString();
  const instructionHint = t('mobile.contextBar.hint', { range: instructionRange });

  const getQuestionAt = (block: any, x: number, y: number) => block.questions?.find((q: any) => q.x === x && q.y === y);

  const safeFieldName = (block: any, x: number, y: number) => {
    const q = getQuestionAt(block, x, y);
    return q?.number != null ? String(q.number) : `cell_${y}_${x}`;
  };

  const safePlaceholder = (block: any, x: number, y: number) => {
    const q = getQuestionAt(block, x, y);
    return q?.number != null ? String(q.number) : '';
  };

  const isBlank = (cell: unknown) => typeof cell === 'string' && cell.includes('___');

  const renderMobileTableCellContent = (cell: string, rowIndex: number, cellIndex: number, block: any) => {
    const question = getQuestionAt(block, cellIndex, rowIndex);
    const questionNumber = question?.number as number | undefined;

    if (cell === '___') {
      return (
        <FormField
          key={`cell-input-${rowIndex}-${cellIndex}`}
          control={form.control}
          name={safeFieldName(block, cellIndex, rowIndex)}
          render={({ field }) => (
            <FormControl>
              <Input
                {...field}
                type='text'
                id={questionNumber ? `question-${questionNumber}` : undefined}
                placeholder={safePlaceholder(block, cellIndex, rowIndex)}
                onFocus={() => questionNumber && handleQuestionFocus(questionNumber)}
                onChange={event => {
                  field.onChange(event.target.value);
                  if (questionNumber) {
                    handleQuestionFocus(questionNumber);
                  }
                }}
                className='!h-[32rem] !w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
              />
            </FormControl>
          )}
        />
      );
    }

    if (cell !== '___' && isBlank(cell)) {
      return transformStringToArrayV2(cell).map((segment, index) =>
        segment === '___' ? (
          <FormField
            key={`cell-fragment-${rowIndex}-${cellIndex}-${index}`}
            control={form.control}
            name={safeFieldName(block, cellIndex, rowIndex)}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  id={questionNumber && index === 0 ? `question-${questionNumber}` : undefined}
                  placeholder={safePlaceholder(block, cellIndex, rowIndex)}
                  onFocus={() => questionNumber && handleQuestionFocus(questionNumber)}
                  onChange={event => {
                    field.onChange(event.target.value);
                    if (questionNumber) {
                      handleQuestionFocus(questionNumber);
                    }
                  }}
                  className='my-[4rem] w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
                />
              </FormControl>
            )}
          />
        ) : (
          <span
            key={`cell-text-${rowIndex}-${cellIndex}-${index}`}
            className='block whitespace-normal break-words text-[14rem] font-normal leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'
          >
            {segment}
          </span>
        )
      );
    }

    if (cell === 'True' || cell === 'False') {
      return (
        <FormField
          key={`cell-radio-${rowIndex}-${cellIndex}`}
          control={form.control}
          name={safeFieldName(block, cellIndex, rowIndex)}
          render={({ field }) => (
            <FormControl>
              <RadioGroup {...field} onValueChange={value => field.onChange(value)} className='flex flex-col items-start gap-[12rem]'>
                {['True', 'False'].map(option => (
                  <div key={option} className='flex items-center space-x-[12rem]'>
                    <RadioGroupItem value={option} id={`mobile-table-${rowIndex}-${cellIndex}-${option.toLowerCase()}`} />
                    <Label
                      htmlFor={`mobile-table-${rowIndex}-${cellIndex}-${option.toLowerCase()}`}
                      className='text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black'
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
          )}
        />
      );
    }

    return (
      <span
        className='block whitespace-normal break-words text-[14rem] font-normal leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'
        key={`cell-text-${rowIndex}-${cellIndex}`}
      >
        {cell}
      </span>
    );
  };

  const renderMobileTable = (block: any) => (
    <div className='w-full overflow-x-auto'>
      <table className='w-full table-fixed border-separate border-spacing-0 text-left'>
        <tbody>
          {block.cells.map((row: string[], rowIndex: number) => (
            <tr key={`row-${rowIndex}`} className='border-b border-d-black last:border-b-0'>
              {row.map((cell: string, cellIndex: number) => {
                const isHeader = rowIndex === 0;
                const CellTag = isHeader ? 'th' : 'td';

                return (
                  <CellTag
                    key={`cell-${rowIndex}-${cellIndex}`}
                    scope={isHeader ? 'col' : undefined}
                    className={cn(
                      'border border-d-black px-[12rem] py-[10rem] align-top text-[14rem] leading-[20rem] text-d-black',
                      'whitespace-normal break-words [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]',
                      isHeader && 'bg-white font-semibold'
                    )}
                  >
                    {renderMobileTableCellContent(cell, rowIndex, cellIndex, block)}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMobileTableTwo = (_block: any) => (
    <div className='w-full overflow-x-auto'>
      <table className='w-full table-fixed border-separate border-spacing-0 text-left'>
        <thead>
          <tr className='border-b border-d-black'>
            {['Species', 'French', 'Spanish', 'South African ball roller'].map((header, index) => (
              <th
                key={`table2-header-${index}`}
                scope='col'
                className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] font-semibold leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className='border-b border-d-black'>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] font-medium leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              Preferred climate
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              cool
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              <Input
                id='reading_table2_1'
                type='text'
                placeholder='1'
                className='h-[32rem] w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
              />
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              <Input
                id='reading_table2_2'
                type='text'
                placeholder='2'
                className='h-[32rem] w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
              />
            </td>
          </tr>
          <tr className='border-b border-d-black'>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] font-medium leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              Complementary species
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              Spanish
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'></td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              <Input
                id='reading_table2_3'
                type='text'
                placeholder='3'
                className='h-[32rem] w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
              />
            </td>
          </tr>
          <tr className='border-b border-d-black'>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] font-medium leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              Start of active period
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              late spring
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              <Input
                id='reading_table2_4'
                type='text'
                placeholder='4'
                className='h-[32rem] w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
              />
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'></td>
          </tr>
          <tr>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] font-medium leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              Number of generations per year
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              1 - 2
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
              <Input
                id='reading_table2_5'
                type='text'
                placeholder='3'
                className='h-[32rem] w-full whitespace-normal break-words rounded-[8rem] border border-d-black px-[10rem] py-[8rem] text-center text-[14rem] font-normal leading-[20rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black focus-visible:outline-none'
              />
            </td>
            <td className='whitespace-normal break-words border border-d-black px-[12rem] py-[12rem] align-top text-[14rem] leading-[20rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  if (status === 'pending') {
    return <></>;
  }

  if (status === 'error') {
    return <></>;
  }

  if (!data) {
    return <></>;
  }

  const getPart = (partNumber: PartNumber): PracticeReadingPart => {
    if (partNumber === 1) {
      return data.part_1;
    }

    if (partNumber === 2) {
      return data.part_2;
    }

    return data.part_3;
  };

  return (
    <PracticeLeaveGuard>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader title={'Practice Reading'} exitLabel={tActions('exit')} onExit={() => router.push('/profile')} />
      </div>

      <MobileHeader
        title={tCommon('practice')}
        tag={tCommon('reading')}
        timerLabel={timerLabel}
        exitLabel={tActions('exit')}
        closeAs={'link'}
        closeHref='/m/practice'
        variant='reading'
      />

      <main className={cn('min-h-screen overflow-hidden', isMobile ? 'bg-[#FFFDF5]' : 'bg-d-yellow-secondary')}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isMobile ? (
              <MobileContextBar
                partLabel={activePartOption ? activePartOption.label : tCommon('partNumber', { number: Number(activeTab.replace('p', '')) })}
                onPartPress={() => setPartSheetOpen(true)}
                timerLabel={timerLabel}
                instructionText={instructionRange ? instructionHint : undefined}
              />
            ) : null}
            <Tabs
              defaultValue='p1'
              value={activeTab}
              onValueChange={value => navigateToPart(value as 'p1' | 'p2' | 'p3')}
              className={cn(
                'container flex min-h-[100dvh] w-full flex-col',
                isMobile ? 'max-w-none px-[16rem] pb-[160rem] pt-[20rem]' : 'max-w-[1440rem] px-[40rem] pb-[24rem] pt-[40rem]'
              )}
            >
              {/* // * Инструкция */}
              {!isMobile ? (
                <>
                  {/* // * Навигация */}
                  <div className='mb-[32rem] flex flex-col gap-[16rem]'>
                    {/* // * Навигация по частям */}
                    <TabsList className='practice-tabs-shadow relative hidden w-fit items-center gap-x-[8rem] rounded-[64rem] bg-white p-[8rem] text-[14rem] font-medium leading-[26rem] tracking-[-0.2rem] text-d-black tablet:flex'>
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
                      Array.from({ length: data.part_1.questions_count }).map((_, index) => index + 1),
                      Array.from({ length: data.part_2.questions_count }).map((_, index) => data.part_1.questions_count + index + 1),
                      Array.from({ length: data.part_3.questions_count }).map((_, index) => data.part_1.questions_count + data.part_2.questions_count + index + 1),
                    ].map((tab: number[], tabIndex: number) => (
                      <TabsContent
                        key={`questions-nav-tab-${tabIndex + 1}`}
                        value={`p${tabIndex + 1}`}
                        className='practice-tabs-shadow relative hidden w-fit items-center rounded-[64rem] bg-white p-[8rem] text-[14rem] font-semibold leading-[26rem] tracking-[-0.2rem] text-d-black data-[state=inactive]:hidden tablet:flex'
                      >
                        {tab.map(qNumber => (
                          <div key={`question-nav-link-${qNumber}`} className='group flex h-[58rem] w-[56rem] flex-col items-center justify-center rounded-[64rem]'>
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
                  <div className='relative mb-[40rem] flex w-full items-center justify-center rounded-[13rem] bg-d-light-gray py-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                    {t('readTextAndAnswerQuestions')} {questionsCountString()}
                  </div>
                </>
              ) : null}

              {[1, 2, 3].map(tab => {
                const part = getPart(tab as PartNumber);

                return (
                  <TabsContent
                    key={`questions-content-tab-${tab}`}
                    value={`p${tab}`}
                    className='flex flex-col gap-[24rem] tablet:flex-row tablet:items-start tablet:justify-between'
                  >
                    {/* // * Текст */}
                    <div className='hidden tablet:block tablet:w-[672rem] tablet:whitespace-pre-line tablet:rounded-[16rem] tablet:bg-white tablet:p-[40rem] tablet:text-[16rem] tablet:font-normal tablet:leading-tight'>
                      {part.text}
                    </div>

                    <div className='tablet:hidden'>
                      <CollapsiblePassage content={part.text ?? ''} expandLabel={mobileStrings.passageExpand} collapseLabel={mobileStrings.passageCollapse} />
                    </div>

                    <div className='flex w-full flex-col gap-y-[16rem] tablet:w-[672rem]'>
                      {part.blocks.map((block: any, index: number) => (
                        <div
                          key={`questions-block-${index}`}
                          className={cn(
                            'flex w-full flex-col gap-y-[32rem] rounded-[18rem] border border-[#e1d6b4] bg-white px-[20rem] py-[24rem] text-d-black shadow-[0_18rem_48rem_rgba(56,56,56,0.12)]',
                            'tablet:gap-y-[48rem] tablet:rounded-[16rem] tablet:border-none tablet:px-[40rem] tablet:py-[40rem] tablet:shadow-none'
                          )}
                        >
                          <div className='flex flex-col'>
                            <p className='mb-[16rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>{block.task_questions}</p>
                            <p className='whitespace-pre-line text-[16rem] font-normal leading-[19rem] text-[#606060]'>{block.task}</p>
                          </div>
                          {/* Параграф */}
                          {block.kind === 'paragraph' && (
                            <>
                              {isMobile ? (
                                <HintBadge icon='💬' className='self-start'>
                                  Type your answer in the field below.
                                </HintBadge>
                              ) : null}
                              <ul className='ml-[20rem] flex list-outside list-disc flex-col items-start gap-y-[18rem]'>
                                {block.questions.map((q: any) => (
                                  <li
                                    key={`paragraph-${q.number}`}
                                    id={`question-${q.number}`}
                                    className='scroll-target text-[16rem] font-normal leading-[30rem] tracking-[-0.2rem] text-d-black'
                                  >
                                    {q.question}{' '}
                                    <FormField
                                      control={form.control}
                                      name={q.number.toString()}
                                      render={({ field }) => (
                                        <FormControl>
                                          <Input
                                            {...field}
                                            type='text'
                                            placeholder={q.number}
                                            onChange={e => {
                                              field.onChange(e.target.value.toUpperCase());
                                              handleQuestionFocus(q.number);
                                            }}
                                            onFocus={() => handleQuestionFocus(q.number)}
                                            className='!inline !h-[32rem] !w-[180rem] !items-center !justify-center !rounded-[8rem] !border-[1.5rem] !border-d-black/60 !p-[10rem] text-center !text-[16rem] !font-normal uppercase !leading-[25rem] !tracking-[-0.2rem] !text-d-black placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                          />
                                        </FormControl>
                                      )}
                                    />
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {/* Подставьте слова */}
                          {block.kind === 'words' && (
                            <div className='flex flex-col items-start gap-y-[18rem]'>
                              {isMobile ? (
                                <HintBadge icon='💬' className='self-start'>
                                  Type your answer in the field below.
                                </HintBadge>
                              ) : null}
                              <div className='text-[16rem] leading-relaxed text-d-black'>
                                {transformStringToArrayV4(block.hint).map((str: any, index: number) => {
                                  if (str.type === 'input') {
                                    return (
                                      <FormField
                                        key={`words-input-${block.questions[str.index].number}`}
                                        control={form.control}
                                        name={block.questions[str.index].number.toString()}
                                        render={({ field }) => (
                                          <FormControl>
                                            <Input
                                              {...field}
                                              type='text'
                                              placeholder={block.questions[str.index].number}
                                              id={`question-${block.questions[str.index].number}`}
                                              className={`my-[4rem] inline-flex h-[32rem] w-[300rem] items-center justify-center rounded-[8rem] border-[1.5rem] !border-d-black/60 p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-light-gray focus-visible:border-d-black ${values[block.questions[str.index].number] ? 'bg-d-light-gray' : ''}`}
                                              onFocus={() => handleQuestionFocus(block.questions[str.index].number)}
                                              onChange={event => {
                                                field.onChange(event.target.value);
                                                handleQuestionFocus(block.questions[str.index].number);
                                              }}
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
                                <div key={`question-${q.number}`} id={`question-${q.number}`} className='flex flex-col gap-[18rem]'>
                                  <div className='mb-[24rem] flex items-start gap-x-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                                    <div className='w-[25rem] shrink-0'>{q.number}</div>
                                    <div>{q.question}</div>
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name={q.number.toString()}
                                    render={({ field }) => (
                                      <FormControl>
                                        <RadioGroup
                                          {...field}
                                          onValueChange={value => {
                                            field.onChange(value);
                                            handleQuestionFocus(q.number);
                                          }}
                                          className='flex flex-col items-start gap-[12rem]'
                                        >
                                          {[
                                            { label: 'True', value: 'True' },
                                            { label: 'False', value: 'False' },
                                            { label: 'Not given', value: 'Not given' },
                                          ].map(choice => {
                                            const isSelected = field.value?.includes(choice.value);
                                            const inputId = `reading_${q.number}_${choice.value.toLowerCase().replace(' ', '_')}`;

                                            return (
                                              <motion.div
                                                key={choice.value}
                                                layout
                                                variants={optionVariants}
                                                animate={isSelected ? 'selected' : 'idle'}
                                                transition={optionTransition}
                                                className={cn(
                                                  'flex w-full items-center gap-[24rem] rounded-[12rem] border border-transparent bg-white/90 py-[14rem] pl-[10rem] pr-[14rem] shadow-[0_8rem_24rem_rgba(56,56,56,0.08)]',
                                                  'tablet:shadow-none',
                                                  isSelected ? 'border-d-green/70 bg-d-yellow-secondary' : 'hover:bg-d-yellow-secondary/40'
                                                )}
                                              >
                                                <RadioGroupItem value={choice.value} id={inputId} onFocus={() => handleQuestionFocus(q.number)} />
                                                <Label htmlFor={inputId} className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'>
                                                  {choice.label}
                                                </Label>
                                              </motion.div>
                                            );
                                          })}
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
                                <div key={`reading_${q.number}`} id={`question-${q.number}`} className='flex flex-col gap-[18rem]'>
                                  <div className='mb-[24rem] flex items-start gap-x-[24rem] text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>
                                    <div className='w-[25rem] shrink-0'>{q.number}</div>
                                    <div>{q.question}</div>
                                  </div>
                                  <FormField
                                    control={form.control}
                                    name={q.number.toString()}
                                    render={({ field }) => (
                                      <FormControl>
                                        <RadioGroup
                                          {...field}
                                          onValueChange={value => {
                                            field.onChange(value);
                                            handleQuestionFocus(q.number);
                                          }}
                                          className='flex w-full flex-col items-start gap-[12rem]'
                                        >
                                          {q.choices.map((c: any) => {
                                            const isSelected = field.value?.includes(c.answer);
                                            const inputId = `reading_${q.number}_${c.answer}`;

                                            return (
                                              <motion.div
                                                key={`reading_${q.number}_${c.answer}`}
                                                layout
                                                variants={optionVariants}
                                                animate={isSelected ? 'selected' : 'idle'}
                                                transition={optionTransition}
                                                className={cn(
                                                  'flex w-full items-center gap-[24rem] rounded-[12rem] border border-transparent bg-white/90 py-[12rem] pl-[10rem] pr-[14rem] shadow-[0_8rem_24rem_rgba(56,56,56,0.08)]',
                                                  'tablet:shadow-none',
                                                  isSelected ? 'border-d-green/70 bg-d-yellow-secondary' : 'hover:bg-d-yellow-secondary/40'
                                                )}
                                              >
                                                <RadioGroupItem value={c.answer} id={inputId} onFocus={() => handleQuestionFocus(q.number)} />
                                                <Label htmlFor={inputId} className='text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black'>
                                                  {c.choice}
                                                </Label>
                                              </motion.div>
                                            );
                                          })}
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
                            <div className='flex flex-col items-start gap-[12rem]'>
                              {block.answers.map((answer: any) => (
                                <span key={`anchor-${answer.number}`} id={`question-${answer.number}`} className='sr-only'>
                                  {answer.number}
                                </span>
                              ))}
                              {block.choices.map((c: any) => (
                                <motion.div
                                  key={`question-checkboxes-${c.choice}-${block.answers[0].number}`}
                                  layout
                                  variants={optionVariants}
                                  animate={values[block.answers[0].number]?.includes(c.answer) ? 'selected' : 'idle'}
                                  transition={optionTransition}
                                  className={cn(
                                    'flex w-full items-center gap-x-[24rem] rounded-[12rem] border border-transparent bg-white/90 py-[14rem] pl-[10rem] pr-[14rem] shadow-[0_8rem_24rem_rgba(56,56,56,0.08)]',
                                    'tablet:shadow-none',
                                    values[block.answers[0].number]?.includes(c.answer) ? 'border-d-green/70 bg-d-yellow-secondary' : 'hover:bg-d-yellow-secondary/40'
                                  )}
                                >
                                  <FormField
                                    control={form.control}
                                    // Name контрола - номер первого вопроса, для остальных вопросов прокидываем (дублируем) значение через onChange функции
                                    name={block.answers[0].number.toString()}
                                    render={({ field }) => (
                                      <FormControl>
                                        <div className='flex w-auto items-center gap-x-[24rem]'>
                                          <CheckboxSquare
                                            id={`reading_${block.task_questions}_${c.answer}`}
                                            checked={field.value?.includes(c.answer)}
                                            onFocus={() => handleQuestionFocus(block.answers[0].number)}
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
                                              handleQuestionFocus(block.answers[0].number);
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
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {/* Таблица с ради-баттонами */}
                          {block.kind === 'table' &&
                            (isMobile ? (
                              <>
                                <HintBadge icon='💬' className='self-start'>
                                  Tap a cell to fill your answer.
                                </HintBadge>
                                {renderMobileTable(block)}
                              </>
                            ) : (
                              <div className='grid' style={{ gridTemplateColumns: `repeat(${block.cells[0].length}, minmax(0,1fr))` }}>
                                {block.cells.map((row: string[], rowIndex: number) =>
                                  row.map((cell: string, cellIndex: number) => {
                                    const question = getQuestionAt(block, cellIndex, rowIndex);
                                    const questionNumber = question?.number as number | undefined;

                                    return (
                                      <div
                                        key={`${rowIndex}_${cellIndex}`}
                                        lang='en'
                                        className={`flex h-auto flex-col items-center justify-center hyphens-auto text-wrap border-b border-b-d-black p-[16rem] text-center text-[14rem] leading-[120%] tracking-[-0.2rem] text-d-black ${rowIndex === 0 ? 'font-semibold' : ''} ${cellIndex !== 0 ? 'border-l' : ''}`}
                                      >
                                        {cell === '___' && (
                                          <FormField
                                            control={form.control}
                                            name={safeFieldName(block, cellIndex, rowIndex)}
                                            render={({ field }) => (
                                              <FormControl>
                                                <Input
                                                  {...field}
                                                  type='text'
                                                  id={questionNumber ? `question-${questionNumber}` : undefined}
                                                  placeholder={safePlaceholder(block, cellIndex, rowIndex)}
                                                  onFocus={() => questionNumber && handleQuestionFocus(questionNumber)}
                                                  onChange={event => {
                                                    field.onChange(event.target.value);
                                                    if (questionNumber) {
                                                      handleQuestionFocus(questionNumber);
                                                    }
                                                  }}
                                                  className='inline h-[32rem] w-full items-center justify-center rounded-[8rem] !border !border-d-black p-[10rem] text-center text-[14rem] font-normal leading-[25rem] !tracking-[-0.2rem] !text-d-black/80 placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                                />
                                              </FormControl>
                                            )}
                                          />
                                        )}

                                        {cell !== '___' &&
                                          isBlank(cell) &&
                                          transformStringToArrayV2(cell).map((s, i) => (
                                            <React.Fragment key={i}>
                                              {s === '___' ? (
                                                <FormField
                                                  control={form.control}
                                                  name={safeFieldName(block, cellIndex, rowIndex)}
                                                  render={({ field }) => (
                                                    <FormControl>
                                                      <Input
                                                        {...field}
                                                        type='text'
                                                        id={questionNumber && i === 0 ? `question-${questionNumber}` : undefined}
                                                        placeholder={safePlaceholder(block, cellIndex, rowIndex)}
                                                        onFocus={() => questionNumber && handleQuestionFocus(questionNumber)}
                                                        onChange={event => {
                                                          field.onChange(event.target.value);
                                                          if (questionNumber) {
                                                            handleQuestionFocus(questionNumber);
                                                          }
                                                        }}
                                                        className='my-[2rem] inline h-[32rem] w-full !items-center justify-center rounded-[8rem] !border-[1.5rem] !border-d-black/60 p-[10rem] text-center text-[14rem] font-normal leading-tight tracking-[-0.2rem] !text-d-black placeholder:text-center placeholder:!text-d-black focus:!border-d-black focus:bg-d-yellow-secondary focus-visible:!border-d-black'
                                                      />
                                                    </FormControl>
                                                  )}
                                                />
                                              ) : (
                                                <div>{s}</div>
                                              )}
                                            </React.Fragment>
                                          ))}

                                        {!isBlank(cell) && cell}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            ))}
                          {/* Таблица с ради-баттонами */}
                          {block.kind === 'table2' &&
                            (isMobile ? (
                              <>
                                <HintBadge icon='💬' className='self-start'>
                                  Tap a cell to fill your answer.
                                </HintBadge>
                                {renderMobileTableTwo(block)}
                              </>
                            ) : (
                              <div>
                                <div className='mb-[48rem] flex flex-col items-start gap-y-[16rem] whitespace-normal break-words text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                  <div>Questions 1-5</div>

                                  <div className='whitespace-normal break-words text-[16rem] font-normal leading-[19rem] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Complete the table. Write <span className='font-semibold'>NO MORE THAN THREE WORDS </span>from the text for each answer.{' '}
                                  </div>
                                </div>
                                <div className='grid grid-cols-4 rounded-[8rem] border border-d-black'>
                                  {/* 1st row */}
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-b-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Species
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-l border-b-d-black border-l-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    French
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-l border-b-d-black border-l-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Spanish
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-l border-b-d-black border-l-d-black p-[16rem] text-[16rem] font-semibold leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    South African ball roller
                                  </div>

                                  {/* 2nd row */}
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-b-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Preferred climate
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    cool
                                  </div>
                                  <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                    <Input
                                      id='reading_01'
                                      type='text'
                                      placeholder='1'
                                      className='inline h-[32rem] w-full items-center justify-center whitespace-normal break-words rounded-[8rem] border border-d-black p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black/80 [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] placeholder:text-center focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black'
                                    />
                                  </div>
                                  <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                    <Input
                                      id='reading_02'
                                      type='text'
                                      placeholder='2'
                                      className='inline h-[32rem] w-full items-center justify-center whitespace-normal break-words rounded-[8rem] border border-d-black p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black/80 [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] placeholder:text-center focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black'
                                    />
                                  </div>

                                  {/* 3d row */}
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-b-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Complementary species
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Spanish
                                  </div>
                                  <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'></div>
                                  <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                    <Input
                                      id='reading_03'
                                      type='text'
                                      placeholder='3'
                                      className='inline h-[32rem] w-full items-center justify-center whitespace-normal break-words rounded-[8rem] border border-d-black p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black/80 [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] placeholder:text-center focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black'
                                    />
                                  </div>

                                  {/* 4th row */}
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-b-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Start of active period
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    late spring
                                  </div>
                                  <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                    <Input
                                      id='reading_04'
                                      type='text'
                                      placeholder='4'
                                      className='inline h-[32rem] w-full items-center justify-center whitespace-normal break-words rounded-[8rem] border border-d-black p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black/80 [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] placeholder:text-center focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black'
                                    />
                                  </div>
                                  <div className='h-[76rem] border-b border-l border-b-d-black border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'></div>

                                  {/* 5th row */}
                                  <div className='h-[76rem] whitespace-normal break-words px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    Number of generations per year
                                  </div>
                                  <div className='h-[76rem] whitespace-normal break-words border-l border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word]'>
                                    1 - 2
                                  </div>
                                  <div className='h-[76rem] border-l border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'>
                                    <Input
                                      id='reading_03'
                                      type='text'
                                      placeholder='3'
                                      className='inline h-[32rem] w-full items-center justify-center whitespace-normal break-words rounded-[8rem] border border-d-black p-[10rem] text-center text-[16rem] font-normal leading-[25rem] tracking-[-0.2rem] text-d-black/80 [hyphens:auto] [overflow-wrap:anywhere] [word-break:break-word] placeholder:text-center focus:border-d-black focus:bg-d-yellow-secondary focus-visible:border-d-black'
                                    />
                                  </div>
                                  <div className='h-[76rem] border-l border-l-d-black px-[8rem] py-[8rem] text-[16rem] font-medium leading-[120%] tracking-[-0.2rem] text-d-black'></div>
                                </div>
                              </div>
                            ))}
                          {/* Matching */}
                          {block.kind === 'matching' &&
                            (isMobile ? (
                              <MobileMatching block={block} value={values} setFieldValue={form.setValue} hintMessage='Match the terms by selecting the correct pair.' />
                            ) : (
                              <DndMatching block={block} value={values} setFieldValue={form.setValue} />
                            ))}
                          {/* Драг-н-дроп списки */}
                          {block.kind === 'dragdrop' &&
                            (isMobile ? (
                              <MobileMatching block={block} value={values} setFieldValue={form.setValue} />
                            ) : (
                              <DndMatching block={block} value={values} setFieldValue={form.setValue} />
                            ))}
                          {/* Драг-н-дроп текст */}
                          {block.kind === 'dragdrop-type2' &&
                            (isMobile ? (
                              <MobileTextInsert block={block} value={values} setFieldValue={form.setValue} />
                            ) : (
                              <DndText block={block} value={values} setFieldValue={form.setValue} />
                            ))}
                        </div>
                      ))}

                      {activeTab === 'p1' && (
                        <button
                          type='button'
                          className='hidden h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black tablet:flex'
                          onClick={() => {
                            navigateToPart('p2', { scrollTop: true });
                          }}
                        >
                          {tActions('next')}
                        </button>
                      )}
                      {activeTab === 'p2' && (
                        <button
                          type='button'
                          className='hidden h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black tablet:flex'
                          onClick={() => {
                            navigateToPart('p3', { scrollTop: true });
                          }}
                        >
                          {tActions('next')}
                        </button>
                      )}
                      {activeTab === 'p3' && (
                        <button
                          type='submit'
                          className='hidden h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black tablet:flex'
                        >
                          {tActions('submit')}
                        </button>
                      )}
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
        onSelect={id => navigateToPart(id as 'p1' | 'p2' | 'p3', { scrollTop: true })}
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

      <AnimatePresence>
        {showScrollTop ? (
          <motion.button
            key='scroll-top'
            type='button'
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            onClick={handleScrollTop}
            className='fixed bottom-[120rem] right-[16rem] z-50 inline-flex size-[48rem] items-center justify-center rounded-full border border-[#dacfae] bg-white text-d-black shadow-[0_14rem_32rem_rgba(56,56,56,0.2)] transition hover:-translate-y-[2rem] hover:shadow-[0_18rem_40rem_rgba(56,56,56,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60 tablet:hidden'
            aria-label={mobileStrings.scrollTop}
          >
            <ArrowUp className='size-[22rem]' aria-hidden='true' />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <BottomNavBar
        hidden={!data}
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
    </PracticeLeaveGuard>
  );
}
