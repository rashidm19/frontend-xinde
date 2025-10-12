export interface PracticeListeningResultQuestion {
  answer: string | null;
  correct_answer: string;
  correct: boolean;
}

export interface PracticeListeningResult {
  id: number;
  listening_id: number;
  score: number;
  questions: PracticeListeningResultQuestion[];
  correct_answers_count: number;
}

export type PracticeListeningFullFeedback = PracticeListeningResult;

export interface ListeningChoice {
  choice: string;
  answer: string;
}

export interface ListeningQuestion {
  number: number;
  question: string;
  picture?: string | null;
  choices: ListeningChoice[];
}

export interface ListeningTestBlock {
  kind: 'test';
  task_questions: string;
  task: string;
  questions: ListeningQuestion[];
}

export interface ListeningWordsPlaceholder {
  type: 'input' | 'string' | 'break';
  value?: string;
  index?: number;
}

export interface ListeningWordsQuestion {
  number: number;
  answer?: string | null;
}

export interface ListeningWordsBlock {
  kind: 'words';
  text: string;
  task_questions: string;
  task: string;
  questions: ListeningWordsQuestion[];
}

export interface ListeningCheckboxChoice {
  choice: string;
  answer: string;
}

export interface ListeningCheckboxAnswer {
  number: number;
}

export interface ListeningCheckboxesBlock {
  kind: 'checkboxes';
  text?: string;
  choices: ListeningCheckboxChoice[];
  answers: ListeningCheckboxAnswer[];
}

export type ListeningBlock = ListeningTestBlock | ListeningWordsBlock | ListeningCheckboxesBlock | Record<string, unknown>;

export interface ListeningPart {
  questions_count: number;
  blocks: ListeningBlock[];
}

export interface ListeningOut {
  rules: string;
  audio_url: string;
  questions_count: number;
  part_1: ListeningPart;
  part_2: ListeningPart;
  part_3: ListeningPart;
  part_4: ListeningPart;
}
