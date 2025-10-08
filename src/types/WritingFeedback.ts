export type WritingFeedbackPartKey = 'part_1' | 'part_2';

export interface WritingFeedbackResponse {
  task: string;
  text: string;
  theme: string | null;
  question: string;
  picture: string | null;
  score: number;
  task_score: number;
  coherence_score: number;
  lexical_score: number;
  grammar_score: number;
  part_1?: WritingFeedbackPart | null;
  part_2?: WritingFeedbackPart | null;
  feedback: string;
  user_answer: string;
}

export interface WritingFeedbackPart {
  question: string;
  feedback: string;
  ml_output: WritingMlOutput;
}

export interface WritingMlOutput {
  'General Feedback': WritingGeneralFeedback;
  'Coherence & Cohesion': WritingCriterion;
  'Lexical Resource': WritingCriterion;
  'Grammatical Range & Accuracy': WritingCriterion;
  'Task Achievement': WritingCriterion;
}

export interface WritingGeneralFeedback {
  feedback: string;
  recommendation: string;
  score: number;
  rewriting?: string;
  error_analysis?: Record<string, unknown>;
  strength_analysis?: Record<string, unknown>;
}

export interface WritingCriterion {
  feedback: string;
  recommendation: string;
  breakdown: WritingBreakdownItem[];
  score: number;
}

export interface WritingBreakdownItem {
  feedback: string;
  recommendation: string;
  name: string;
  score: number;
}
