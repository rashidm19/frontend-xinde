import type {
  WritingCriterion,
  WritingFeedbackPart,
  WritingFeedbackPartKey,
  WritingFeedbackResponse,
  WritingGeneralFeedback,
} from '@/types/WritingFeedback';

export type CriterionKey = 'task' | 'coherence' | 'lexical' | 'grammar';

interface CriterionConfig {
  key: CriterionKey;
  label: string;
  scoreKey: 'task_score' | 'coherence_score' | 'lexical_score' | 'grammar_score';
  sourceKey: 'Task Achievement' | 'Coherence & Cohesion' | 'Lexical Resource' | 'Grammatical Range & Accuracy';
}

const CRITERIA_CONFIG: CriterionConfig[] = [
  { key: 'task', label: 'Task Achievement', scoreKey: 'task_score', sourceKey: 'Task Achievement' },
  { key: 'coherence', label: 'Coherence & Cohesion', scoreKey: 'coherence_score', sourceKey: 'Coherence & Cohesion' },
  { key: 'lexical', label: 'Lexical Resource', scoreKey: 'lexical_score', sourceKey: 'Lexical Resource' },
  { key: 'grammar', label: 'Grammatical Range & Accuracy', scoreKey: 'grammar_score', sourceKey: 'Grammatical Range & Accuracy' },
];

export interface NormalizedCriterionData {
  key: CriterionKey;
  label: string;
  score: number | null;
  data: WritingCriterion | null;
  summary: string;
}

export interface RewriteSegmentBase {
  type: 'text' | 'error';
}

export interface RewriteTextSegment extends RewriteSegmentBase {
  type: 'text';
  text: string;
}

export interface RewriteErrorSegment extends RewriteSegmentBase {
  type: 'error';
  original: string;
  explanation?: string;
  fixed: string;
}

export type RewriteSegment = RewriteTextSegment | RewriteErrorSegment;

export interface RewriteParseResult {
  segments: RewriteSegment[];
  plainText: string;
  hasHighlights: boolean;
}

export interface WritingFeedbackV2Normalized {
  partKey: WritingFeedbackPartKey;
  partTitle: string;
  userAnswer: string;
  wordCount: number;
  metadataMessage: string;
  overallBand: number | null;
  bandSummary: string;
  criteria: NormalizedCriterionData[];
  generalFeedback: WritingGeneralFeedback | null;
  rewrite: RewriteParseResult | null;
  idealResponse: string | null;
  taskPrompt: string;
  taskQuestion: string;
  taskText: string;
  taskPicture: string | null;
}

export function buildWritingFeedbackV2(response: WritingFeedbackResponse): WritingFeedbackV2Normalized | null {
  const partEntry = pickFeedbackPart(response);
  if (!partEntry) {
    return null;
  }

  const { key: partKey, part } = partEntry;
  const general = part.ml_output?.['General Feedback'] ?? null;

  const criteria = CRITERIA_CONFIG.map<NormalizedCriterionData>(config => {
    const criterion = part.ml_output?.[config.sourceKey] ?? null;
    const score = toScore(response[config.scoreKey]);
    return {
      key: config.key,
      label: config.label,
      score,
      data: criterion,
      summary: buildCriterionSummary(criterion?.feedback, criterion?.recommendation),
    };
  });

  const rewrite = parseRewriting(general?.rewriting);
  const idealResponse = extractIdealResponse(general, part, rewrite);

  return {
    partKey,
    partTitle: partKey === 'part_2' ? 'Writing Task 2' : 'Writing Task 1',
    userAnswer: response.user_answer ?? '',
    wordCount: countWords(response.user_answer),
    metadataMessage: mapMetadataMessage(toScore(response.score)),
    overallBand: toScore(response.score),
    bandSummary: mapBandSummary(toScore(response.score)),
    criteria,
    generalFeedback: general,
    rewrite,
    idealResponse,
    taskPrompt: (response.task ?? '').trim(),
    taskQuestion: (response.question ?? '').trim(),
    taskText: (response.text ?? '').trim(),
    taskPicture: response.picture?.trim() || null,
  };
}

function pickFeedbackPart(response: WritingFeedbackResponse): { key: WritingFeedbackPartKey; part: WritingFeedbackPart } | null {
  const entries: Array<{ key: WritingFeedbackPartKey; part: WritingFeedbackPart | null | undefined }> = [
    { key: 'part_2', part: response.part_2 },
    { key: 'part_1', part: response.part_1 },
  ];

  for (const entry of entries) {
    if (entry.part?.question && entry.part?.ml_output) {
      return { key: entry.key, part: entry.part };
    }
  }

  return null;
}

function toScore(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(1));
}

function countWords(answer: string | null | undefined): number {
  if (!answer) {
    return 0;
  }
  const words = answer
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
    .split(/\s+/);
  return words.filter(Boolean).length;
}

function mapMetadataMessage(score: number | null): string {
  if (score === null) {
    return 'Evaluation in progress';
  }
  if (score >= 7) {
    return 'Strong response';
  }
  if (score >= 5) {
    return 'Good base, needs improvement';
  }
  return 'Significant revision needed';
}

function mapBandSummary(score: number | null): string {
  if (score === null) {
    return 'We will update your band score shortly.';
  }
  if (score >= 7.5) {
    return 'Excellent performance—fine-tune nuances to reach mastery.';
  }
  if (score >= 6.5) {
    return 'Solid response with clear areas to refine further.';
  }
  if (score >= 5.5) {
    return 'Developing well—address highlighted priorities next.';
  }
  return 'Focus on fundamentals to raise clarity, structure, and accuracy.';
}

function buildCriterionSummary(feedback?: string, recommendation?: string): string {
  const source = feedback || recommendation || '';
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

function parseRewriting(rewriting?: string | null): RewriteParseResult | null {
  if (!rewriting) {
    return null;
  }

  const normalized = normalizeMarkup(rewriting);
  const segments: RewriteSegment[] = [];
  const redRegex = /<red>([\s\S]*?)<\/red>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = redRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const preceding = normalized.slice(lastIndex, match.index);
      if (preceding) {
        segments.push({ type: 'text', text: cleanupText(preceding) });
      }
    }

    const content = match[1] ?? '';
    const explanation = extractTagContent(content, 'exp');
    const fixed = cleanupText(extractTagContent(content, 'fix') ?? '');
    const originalSource = content
      .replace(/<exp>[\s\S]*?<\/exp>/gi, '')
      .replace(/<fix>[\s\S]*?<\/fix>/gi, '');
    const original = cleanupText(originalSource);

    segments.push({
      type: 'error',
      original,
      explanation: explanation ? cleanupText(explanation) : undefined,
      fixed: fixed || original,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    const trailing = normalized.slice(lastIndex);
    if (trailing) {
      segments.push({ type: 'text', text: cleanupText(trailing) });
    }
  }

  const plainText = segments.map(segment => (segment.type === 'error' ? segment.fixed : segment.text)).join('');

  return {
    segments,
    plainText,
    hasHighlights: segments.some(segment => segment.type === 'error'),
  };
}

function normalizeMarkup(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/<br\s*\/?>(\n)?/gi, '\n');
}

function extractTagContent(source: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = regex.exec(source);
  return match ? match[1] ?? '' : null;
}

function cleanupText(value: string): string {
  if (!value) {
    return '';
  }
  const withoutTags = value.replace(/<[^>]+>/g, '');
  return decodeHtmlEntities(withoutTags);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function extractIdealResponse(
  general: WritingGeneralFeedback | null,
  part: WritingFeedbackPart,
  rewrite: RewriteParseResult | null
): string | null {
  if (rewrite?.plainText) {
    return rewrite.plainText.trim() || null;
  }
  if (part.feedback) {
    return part.feedback.trim() || null;
  }
  if (general?.feedback) {
    return general.feedback.trim() || null;
  }
  return null;
}
