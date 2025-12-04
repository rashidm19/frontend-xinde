// Base types
type ReadingBlockKind =
  | "tfng"
  | "paragraph"
  | "diagram"
  | "words"
  | "test"
  | "dragdrop"
  | "dragdrop-type2"
  | "cards"
  | "checkboxes"
  | "table"
  | "matching";

interface ReadingChoice {
  answer: string;
  choice: string;
}

// Question feedback types (enriched with user answers)
interface ReadingQuestionFeedbackBase {
  number: number;
  user_answer: string | null;
  correct_answer: string;
  correct: boolean;
}

interface ReadingQuestionParagraphFeedback extends ReadingQuestionFeedbackBase {
  question: string;
}

interface ReadingQuestionDiagramFeedback extends ReadingQuestionFeedbackBase {
  question: string;
}

interface ReadingQuestionWordsFeedback extends ReadingQuestionFeedbackBase {
  // Words questions only have number, no question text
}

interface ReadingQuestionTFNGFeedback extends ReadingQuestionFeedbackBase {
  question: string;
}

interface ReadingQuestionDragDropFeedback extends ReadingQuestionFeedbackBase {
  question: string;
}

interface ReadingQuestionCheckboxesFeedback extends ReadingQuestionFeedbackBase {
  // Checkboxes questions only have number
}

interface ReadingQuestionTestFeedback extends ReadingQuestionFeedbackBase {
  question: string;
  choices: ReadingChoice[];
}

interface ReadingBlockCardQuestionFeedback extends ReadingQuestionFeedbackBase {
  // Card questions only have number
}

interface ReadingBlockTableQuestionFeedback extends ReadingQuestionFeedbackBase {
  x: number;
  y: number;
}

interface ReadingQuestionMatchingFeedback extends ReadingQuestionFeedbackBase {
  question: string;
}

// Block base type
interface ReadingBlockBase {
  kind: ReadingBlockKind;
  task: string;
  task_questions: string | null;
  task_questions_count: number | null;
  text: string;
  hint: string | null;
  picture: string | null;
}

// Block feedback types
interface ReadingBlockParagraphFeedback extends ReadingBlockBase {
  kind: "paragraph";
  questions: ReadingQuestionParagraphFeedback[];
}

interface ReadingBlockDiagramFeedback extends ReadingBlockBase {
  kind: "diagram";
  diagram_url: string;
  questions: ReadingQuestionDiagramFeedback[];
}

interface ReadingBlockWordsFeedback extends ReadingBlockBase {
  kind: "words";
  questions: ReadingQuestionWordsFeedback[];
}

interface ReadingBlockTFNGFeedback extends ReadingBlockBase {
  kind: "tfng";
  questions: ReadingQuestionTFNGFeedback[];
}

interface ReadingBlockDragDropFeedback extends ReadingBlockBase {
  kind: "dragdrop" | "dragdrop-type2";
  choices: ReadingChoice[];
  questions: ReadingQuestionDragDropFeedback[];
}

interface ReadingBlockCheckboxesFeedback extends ReadingBlockBase {
  kind: "checkboxes";
  choices: ReadingChoice[];
  answers: ReadingQuestionCheckboxesFeedback[];
}

interface ReadingBlockTestFeedback extends ReadingBlockBase {
  kind: "test";
  questions: ReadingQuestionTestFeedback[];
}

interface ReadingBlockCardFeedback {
  text: string;
  questions: ReadingBlockCardQuestionFeedback[];
}

interface ReadingBlockCardsFeedback extends ReadingBlockBase {
  kind: "cards";
  cards: ReadingBlockCardFeedback[];
}

interface ReadingBlockTableFeedback extends ReadingBlockBase {
  kind: "table";
  cells: string[][];
  questions: ReadingBlockTableQuestionFeedback[];
}

interface ReadingBlockMatchingFeedback extends ReadingBlockBase {
  kind: "matching";
  choices_label: string;
  choices: ReadingChoice[];
  answers_label: string;
  answers: ReadingQuestionMatchingFeedback[];
}

// Union type for all block feedback types
export type ReadingBlockFeedback =
  | ReadingBlockParagraphFeedback
  | ReadingBlockDiagramFeedback
  | ReadingBlockWordsFeedback
  | ReadingBlockTFNGFeedback
  | ReadingBlockDragDropFeedback
  | ReadingBlockCheckboxesFeedback
  | ReadingBlockTestFeedback
  | ReadingBlockCardsFeedback
  | ReadingBlockTableFeedback
  | ReadingBlockMatchingFeedback;

// Part feedback type
export interface ReadingPartFeedback {
  task: string;
  text: string;
  picture: string | null;
  questions_count: number;
  blocks: ReadingBlockFeedback[];
}

// Main reading feedback structure
interface ReadingFeedback {
  rules: string;
  questions_count: number;
  part_1: ReadingPartFeedback;
  part_2: ReadingPartFeedback;
  part_3: ReadingPartFeedback;
}

// Root response type
export interface PracticeReadingResultV2 {
  id: number;
  reading_id: number;
  title: string;
  completed_at: string | null; // ISO 8601 datetime
  score: number | null;
  correct_answers_count: number;
  reading: ReadingFeedback;
}