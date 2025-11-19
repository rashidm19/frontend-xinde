import type { ISpeakingPracticeFeedback, MlOutput } from '@/types/SpeakingFeedback';

export type SpeakingCriterionKey = 'fluency' | 'lexical' | 'grammar' | 'general';

interface CriterionConfig {
  key: SpeakingCriterionKey;
  label: string;
  description: string;
  sourceKey: keyof MlOutput;
}

const CRITERIA_CONFIG: CriterionConfig[] = [
  {
    key: 'fluency',
    label: 'Fluency & Coherence',
    description: 'Flow, structure, and ability to link ideas clearly.',
    sourceKey: 'Fluency & Coherence',
  },
  {
    key: 'lexical',
    label: 'Lexical Resource',
    description: 'Vocabulary range, precision, and natural usage.',
    sourceKey: 'Lexical Resource',
  },
  {
    key: 'grammar',
    label: 'Grammatical Range & Accuracy',
    description: 'Control of grammar structures and sentence accuracy.',
    sourceKey: 'Grammatical Range & Accuracy',
  },
  {
    key: 'general',
    label: 'General Feedback',
    description: 'Holistic impression and transcript insights for this attempt.',
    sourceKey: 'General Feedback',
  },
];

export interface SpeakingSubscore {
  key: 'grammar' | 'vocabulary' | 'fluency';
  label: string;
  score: number | null;
}

export interface SpeakingResponseQuestion {
  id: string;
  question: string;
  audioUrl: string;
  transcript?: string;
}

export interface SpeakingResponsePart {
  id: string;
  title: string;
  questions: SpeakingResponseQuestion[];
}

export interface SpeakingCriterionBreakdownItem {
  id: string;
  name: string;
  score: number | null;
  feedback?: string;
  recommendation?: string;
}

export interface SpeakingCriterionNormalized {
  key: SpeakingCriterionKey;
  label: string;
  description: string;
  score: number | null;
  summary: string;
  feedback?: string;
  recommendation?: string;
  breakdown: SpeakingCriterionBreakdownItem[];
}

export interface SpeakingSummaryInsights {
  mainSummary?: string;
  partSummaries: Array<{ id: string; title: string; text: string }>;
  overallFeedback?: string;
  recommendation?: string;
}

export interface SpeakingTaskSection {
  id: string;
  title: string;
  questions: string[];
}

export interface SpeakingFeedbackNormalized {
  overallScore: number | null;
  overallSummary: string;
  subscores: SpeakingSubscore[];
  responses: SpeakingResponsePart[];
  summary: SpeakingSummaryInsights;
  criteria: SpeakingCriterionNormalized[];
  tasks: SpeakingTaskSection[];
}

export function buildSpeakingFeedback(data: ISpeakingPracticeFeedback): SpeakingFeedbackNormalized {
  const parts = data.parts ?? [];

  const responses: SpeakingResponsePart[] = [];
  const taskSections: SpeakingTaskSection[] = [];

  parts.forEach((part, partIndex) => {
    const title = 'Speaking';
    const general = part.ml_output?.['General Feedback'];
    const transcripts = Array.isArray(general?.transcription) ? (general?.transcription ?? []) : [];

    const questions = (part.questions ?? []).map((question, questionIndex) => {
      const transcript = transcripts[questionIndex]?.trim();
      return {
        id: `${partIndex}-${questionIndex}`,
        question: question.question,
        audioUrl: question.answer_audio,
        transcript: transcript && transcript.length > 0 ? transcript : undefined,
      };
    });

    responses.push({
      id: `${partIndex}`,
      title,
      questions,
    });

    taskSections.push({
      id: `${partIndex}`,
      title,
      questions: questions.map(item => item.question).filter(Boolean),
    });
  });

  const summary: SpeakingSummaryInsights = {
    mainSummary: optionalText(data.feedback) || optionalText(parts[0]?.feedback),
    partSummaries: parts
      .map((part, index) => ({ id: `${index}`, title: `Part ${index + 1}`, text: optionalText(part.feedback) || '' }))
      .filter(item => item.text.length > 0),
    overallFeedback: joinSections(parts.map((part, index) => ({ title: `Part ${index + 1}`, value: optionalText(part.ml_output?.['General Feedback']?.feedback) }))),
    recommendation: joinSections(parts.map((part, index) => ({ title: `Part ${index + 1}`, value: optionalText(part.ml_output?.['General Feedback']?.recommendation) }))),
  };

  const criteria = CRITERIA_CONFIG.map<SpeakingCriterionNormalized>(config => {
    const entries = parts.reduce<CriterionEntry[]>((acc, part, index) => {
      const node = part.ml_output?.[config.sourceKey];
      if (!node) {
        return acc;
      }

      const baseId = `${config.key}-${index}`;
      const namePrefix = parts.length > 1 ? `Part ${index + 1} — ` : '';

      acc.push({
        partIndex: index,
        score: toScore((node as { score?: number }).score ?? null),
        feedback: optionalText((node as { feedback?: string }).feedback),
        recommendation: optionalText((node as { recommendation?: string }).recommendation),
        breakdown: extractBreakdown(node, namePrefix, baseId),
      });

      return acc;
    }, []);

    const scores = entries.map(entry => entry.score).filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
    const averageScore = scores.length > 0 ? Number((scores.reduce((acc, value) => acc + value, 0) / scores.length).toFixed(1)) : null;

    const feedback = joinSections(entries.map(entry => ({ title: parts.length > 1 ? `Part ${entry.partIndex + 1}` : undefined, value: entry.feedback })));
    const recommendation = joinSections(entries.map(entry => ({ title: parts.length > 1 ? `Part ${entry.partIndex + 1}` : undefined, value: entry.recommendation })));

    return {
      key: config.key,
      label: config.label,
      description: config.description,
      score: averageScore,
      summary: buildSummary(feedback || recommendation),
      feedback,
      recommendation,
      breakdown: entries.flatMap(entry => entry.breakdown),
    };
  });

  const cardSummarySource = summary.mainSummary || criteria.find(criterion => criterion.feedback)?.feedback || '';
  const overallSummary = buildSummary(cardSummarySource) || 'Band score estimated using IELTS speaking descriptors.';

  return {
    overallScore: toScore(data.score),
    overallSummary,
    subscores: [
      { key: 'fluency', label: 'Fluency', score: toScore(data.fluency_score) },
      { key: 'vocabulary', label: 'Vocabulary', score: toScore(data.vocabulary_score) },
      { key: 'grammar', label: 'Grammar', score: toScore(data.grammar_score) },
    ],
    responses,
    summary,
    criteria,
    tasks: taskSections,
  };
}

function toScore(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(1));
}

function optionalText(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .trim();
  return normalized.length > 0 ? normalized : undefined;
}

function buildSummary(source?: string): string {
  if (!source) {
    return 'Insights will appear once feedback is ready.';
  }
  const cleaned = source.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return 'Insights will appear once feedback is ready.';
  }
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  return sentences[0]?.trim() || cleaned;
}

function joinSections(entries: Array<{ title?: string; value?: string | null | undefined } | null | undefined>): string | undefined {
  const filtered: Array<{ title?: string; value: string }> = [];

  entries.forEach(entry => {
    if (!entry) {
      return;
    }
    const text = entry.value
      ?.replace(/\r\n/g, '\n')
      .replace(/\u00A0/g, ' ')
      .trim();
    if (!text) {
      return;
    }
    filtered.push({ title: entry.title, value: text });
  });

  if (filtered.length === 0) {
    return undefined;
  }

  if (filtered.length === 1) {
    return filtered[0].value;
  }

  return filtered.map(item => (item.title ? `${item.title}: ${item.value}` : item.value)).join('\n\n');
}

interface CriterionEntry {
  partIndex: number;
  score: number | null;
  feedback?: string;
  recommendation?: string;
  breakdown: SpeakingCriterionBreakdownItem[];
}

type MlNode = MlOutput[keyof MlOutput];

function extractBreakdown(node: MlNode, prefix: string, baseId: string): SpeakingCriterionBreakdownItem[] {
  if (!hasBreakdown(node)) {
    return [];
  }

  return node.breakdown.map((item, breakdownIndex) => ({
    id: `${baseId}-${breakdownIndex}`,
    name: prefix ? `${prefix}${item.name}` : item.name,
    score: toScore(item.score),
    feedback: optionalText(item.feedback),
    recommendation: optionalText(item.recommendation),
  }));
}

function hasBreakdown(node: MlNode): node is MlNode & {
  breakdown: Array<{ name: string; score: number | null | undefined; feedback?: string | null; recommendation?: string | null }>;
} {
  return Array.isArray((node as { breakdown?: unknown }).breakdown);
}
