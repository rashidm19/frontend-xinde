'use client';

import { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { StateContainer } from '@/components/feedback/StateContainer';
import axiosInstance from '@/lib/axiosInstance';

import { GET_practice_writing_feedback_id } from '@/api/GET_practice_writing_feedback_id';
import type {
  WritingBreakdownItem,
  WritingFeedbackPart,
  WritingFeedbackPartKey,
  WritingFeedbackResponse,
  WritingGeneralFeedback,
  WritingMlOutput,
} from '@/types/WritingFeedback';
import { PracticeWritingPassed } from '@/types/WritingFeedback';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

import { type CriteriaKey, type NormalizedWritingFeedback, WritingFeedbackView } from './_components/writing-feedback-view';

type FeedbackQueryError = Error & { status?: number };

type CriterionSourceKey = Exclude<keyof WritingMlOutput, 'General Feedback'>;

const CRITERIA_DEFINITIONS: Array<{
  key: CriteriaKey;
  title: string;
  description: string;
  source: CriterionSourceKey;
}> = [
  { key: 'task', title: 'Task Achievement', description: 'Addresses the task with clear, accurate reporting.', source: 'Task Achievement' },
  { key: 'coherence', title: 'Coherence & Cohesion', description: 'Organisation, paragraphing, and logical flow.', source: 'Coherence & Cohesion' },
  { key: 'lexical', title: 'Lexical Resource', description: 'Vocabulary range and precision.', source: 'Lexical Resource' },
  { key: 'grammar', title: 'Grammatical Range & Accuracy', description: 'Control of grammar and sentence variety.', source: 'Grammatical Range & Accuracy' },
];

export default function Page({ params }: { params: { id: string } }) {
  const { tImgAlts } = useCustomTranslations('practice.writing.feedback');

  const {
    data: passedData,
    status: passedStatus,
    error: passedError,
    refetch: refetchPassed,
  } = useQuery<PracticeWritingPassed, FeedbackQueryError>({
    queryKey: ['practice-writing-feedbacks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/practice/writing/passed');
      return response.data as PracticeWritingPassed;
    },
    enabled: !!params.id,
    retry: false,
    refetchInterval: query => {
      const found = query?.state.data?.data.find(item => String(item.id) === params.id);
      return found?.feedback_ready ? false : 3000;
    },
  });

  const isFeedbackReady = passedData?.data.some(item => String(item.id) === params.id && item.feedback_ready) ?? false;

  const {
    data: feedbackData,
    status: feedbackStatus,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery<WritingFeedbackResponse, FeedbackQueryError>({
    queryKey: ['practice-writing-feedback', params.id],
    queryFn: () => GET_practice_writing_feedback_id(params.id),
    retry: false,
    enabled: isFeedbackReady,
  });

  const [part, setPart] = useState<WritingFeedbackPartKey | undefined>(undefined);

  useEffect(() => {
    if (feedbackData?.part_1?.question) {
      setPart('part_1');
    } else if (feedbackData?.part_2?.question) {
      setPart('part_2');
    } else {
      setPart(undefined);
    }
  }, [feedbackData]);

  const activePart = part && feedbackData ? (feedbackData[part] ?? null) : null;

  const partOptions = useMemo(() => {
    if (!feedbackData) return [];
    const options: Array<{ key: WritingFeedbackPartKey; label: string }> = [];
    if (feedbackData.part_1?.question) options.push({ key: 'part_1', label: 'Task 1' });
    if (feedbackData.part_2?.question) options.push({ key: 'part_2', label: 'Task 2' });
    return options;
  }, [feedbackData]);

  const normalizedFeedback = useMemo<NormalizedWritingFeedback | null>(() => {
    if (!feedbackData || !part || !activePart) return null;
    return buildNormalizedFeedback({
      response: feedbackData,
      partKey: part,
      part: activePart,
      taskImageAlt: tImgAlts('writing'),
    });
  }, [feedbackData, activePart, part, tImgAlts]);

  if (passedStatus === 'error') {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='error'
        title='We could not confirm your writing attempt.'
        description={passedError?.message ?? 'Please retry loading this page.'}
        actionLabel='Try again'
        onAction={refetchPassed}
      />
    );
  }

  if (!isFeedbackReady) {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='info'
        title='Evaluating your response'
        description='We will notify you as soon as your writing band score is ready.'
        section='writing'
      />
    );
  }

  if (feedbackStatus === 'error') {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='error'
        title='We were unable to load your feedback.'
        description={feedbackError?.message ?? 'Please check your connection and try again.'}
        actionLabel='Try again'
        onAction={refetchFeedback}
      />
    );
  }

  if (feedbackStatus === 'pending' || !feedbackData) {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='info'
        title='Fetching feedback details'
        description='Just a moment while we prepare your writing feedback.'
        section='writing'
      />
    );
  }

  if (!normalizedFeedback || !part || !activePart) {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='info'
        title='Feedback is not ready yet'
        description='Your writing responses are still being evaluated. Please give it a little more time.'
        section='writing'
      />
    );
  }

  return <WritingFeedbackView data={normalizedFeedback} activePart={part} partOptions={partOptions} onPartChange={setPart} />;
}

interface BuildNormalizedArgs {
  response: WritingFeedbackResponse;
  partKey: WritingFeedbackPartKey;
  part: WritingFeedbackPart;
  taskImageAlt: string;
}

function buildNormalizedFeedback({ response, partKey, part, taskImageAlt }: BuildNormalizedArgs): NormalizedWritingFeedback {
  const criteria = CRITERIA_DEFINITIONS.map(definition => {
    const criterion = part.ml_output[definition.source];
    return {
      key: definition.key,
      title: definition.title,
      description: definition.description,
      score: toScore(criterion?.score),
      feedback: criterion?.feedback ?? undefined,
      recommendation: criterion?.recommendation ?? undefined,
      breakdown: (criterion?.breakdown ?? []).map(mapBreakdownItem),
    };
  });

  const general = part.ml_output['General Feedback'];

  const taskPrompt = buildTaskPrompt(response, part);

  return {
    sectionTitle: partKey === 'part_1' ? 'Writing Task 1' : 'Writing Task 2',
    essayText: response.user_answer ?? '',
    essayWordCount: countWords(response.user_answer),
    bandScore: toScore(response.score) || 0,
    bandStatus: determineBandStatus(toScore(response.score)),
    criteria,
    generalFeedback: general
      ? {
          overall: general.feedback,
          recommendation: general.recommendation,
          strengths: flattenAnalysis(general.strength_analysis, 'strength'),
          weaknesses: flattenAnalysis(general.error_analysis, 'issue'),
        }
      : null,
    idealResponse: general?.rewriting ? { text: sanitizeIdealResponse(general.rewriting) } : null,
    task: {
      title: partKey === 'part_1' ? 'Writing Task 1 prompt' : 'Writing Task 2 prompt',
      prompt: taskPrompt,
      instruction: response.task || null,
      media: response.picture ? [{ url: response.picture, alt: taskImageAlt }] : undefined,
    },
  };
}

function mapBreakdownItem(item: WritingBreakdownItem) {
  return {
    name: item.name,
    score: toScore(item.score),
    feedback: item.feedback,
    recommendation: item.recommendation,
  };
}

function toScore(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(1));
}

function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  return words.filter(Boolean).length;
}

function determineBandStatus(score: number | null): string {
  if (score === null) {
    return 'Evaluation in progress';
  }
  if (score >= 7.5) {
    return 'Excellent performance - keep refining the details.';
  }
  if (score >= 6.5) {
    return 'Strong response with focused improvements ahead.';
  }
  if (score >= 5.5) {
    return 'Developing well - address the highlighted priorities next.';
  }
  return 'Significant revision needed - follow the targeted guidance.';
}

function sanitizeIdealResponse(source: string): string {
  return source
    .replace(/<br\s*\/?>(\r?\n)?/gi, '\n')
    .replace(/<fix>(.*?)<\/fix>/gi, '$1')
    .replace(/<exp>.*?<\/exp>/gi, '')
    .replace(/<\/?gr>/gi, '')
    .replace(/<\/?red>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildTaskPrompt(response: WritingFeedbackResponse, part: WritingFeedbackPart): string {
  const segments = [part.question, response.text].filter(Boolean);
  if (segments.length === 0) {
    return 'Task prompt unavailable.';
  }
  return segments.join('\n\n');
}

type AnalysisRecord = WritingGeneralFeedback['strength_analysis'];

function flattenAnalysis(record: AnalysisRecord | WritingGeneralFeedback['error_analysis'], type: 'strength' | 'issue'): string[] {
  if (!record) return [];
  const prefix = type === 'strength' ? 'Strength' : 'Issue';

  return Object.entries(record).flatMap(([domain, metrics]) => {
    if (!metrics) return [];
    return Object.entries(metrics).map(([label, count]) => {
      const domainLabel = capitalizePhrase(domain);
      const metricLabel = capitalizePhrase(label);
      const suffix = typeof count === 'number' && count > 1 ? ' (x' + count + ')' : '';
      return prefix + ': ' + domainLabel + ' - ' + metricLabel + suffix;
    });
  });
}

function capitalizePhrase(value: string): string {
  return value
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
