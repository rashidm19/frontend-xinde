// Base types
type ListeningBlockKind = 'words' | 'test' | 'titles' | 'matching' | 'checkboxes' | 'table';

interface ListeningChoice {
  answer: string;
  choice: string;
}

// Question feedback types (enriched with user answers)
interface ListeningQuestionFeedbackBase {
  number: number;
  user_answer: string | null;
  correct_answer: string;
  correct: boolean;
}

interface ListeningQuestionWordsFeedback extends ListeningQuestionFeedbackBase {
  question: string;
  hint: string;
}

interface ListeningQuestionTestFeedback extends ListeningQuestionFeedbackBase {
  question: string;
  choices: ListeningChoice[] | null;
  picture: string | null;
}

interface ListeningQuestionTitlesFeedback extends ListeningQuestionFeedbackBase {
  question: string;
}

interface ListeningQuestionCheckboxesFeedback extends ListeningQuestionFeedbackBase {
  // Checkboxes questions only have number
}

interface ListeningBlockTableQuestionFeedback extends ListeningQuestionFeedbackBase {
  x: number;
  y: number;
}

// Block base type
interface ListeningBlockBase {
  kind: ListeningBlockKind;
  task: string;
  task_questions: string | null;
  task_questions_count: number | null;
  text: string;
  hint: string | null;
  picture: string | null;
}

// Block feedback types
interface ListeningBlockWordsFeedback extends ListeningBlockBase {
  kind: 'words';
  questions: ListeningQuestionWordsFeedback[];
}

interface ListeningBlockTestFeedback extends ListeningBlockBase {
  kind: 'test';
  questions: ListeningQuestionTestFeedback[];
}

interface ListeningBlockTitlesFeedback extends ListeningBlockBase {
  kind: 'titles' | 'matching';
  choices_label: string;
  choices: ListeningChoice[];
  answers_label: string;
  answers: ListeningQuestionTitlesFeedback[];
}

interface ListeningBlockCheckboxesFeedback extends ListeningBlockBase {
  kind: 'checkboxes';
  choices: ListeningChoice[];
  answers: ListeningQuestionCheckboxesFeedback[];
}

interface ListeningBlockTableFeedback extends ListeningBlockBase {
  kind: 'table';
  cells: string[][];
  questions: ListeningBlockTableQuestionFeedback[];
}

// Union type for all block feedback types
type ListeningBlockFeedback =
  | ListeningBlockWordsFeedback
  | ListeningBlockTestFeedback
  | ListeningBlockTitlesFeedback
  | ListeningBlockCheckboxesFeedback
  | ListeningBlockTableFeedback;

// Part feedback type
interface ListeningPartFeedback {
  questions_count: number;
  blocks: ListeningBlockFeedback[];
}

// Main listening feedback structure
interface ListeningFeedback {
  rules: string;
  audio_url: string;
  questions_count: number;
  part_1: ListeningPartFeedback;
  part_2: ListeningPartFeedback;
  part_3: ListeningPartFeedback;
  part_4: ListeningPartFeedback;
}

// Root response type
export interface PracticeListeningResultV2 {
  id: number;
  listening_id: number;
  title: string;
  completed_at: string | null; // ISO 8601 datetime
  score: number | null;
  correct_answers_count: number;
  listening: ListeningFeedback;
}
