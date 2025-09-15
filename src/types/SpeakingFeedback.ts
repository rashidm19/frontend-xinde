export interface ISpeakingPracticeFeedback {
  score: number
  grammar_score: number
  vocabulary_score: number
  fluency_score: number
  parts: Part[]
  feedback: string
}

export interface Part {
  questions: Question[]
  questions_grouped: QuestionsGrouped
  feedback: string
  ml_output: MlOutput
}

export interface Question {
  question: string
  answer_audio: string
}

export interface QuestionsGrouped {
  Introductions: Introduction[]
}

export interface Introduction {
  question: string
  answer_audio: string
}

export interface MlOutput {
  "Fluency & Coherence": FluencyCoherence
  "Lexical Resource": LexicalResource
  "Grammatical Range & Accuracy": GrammaticalRangeAccuracy
  "General Feedback": GeneralFeedback
}

export interface FluencyCoherence {
  feedback: string
  recommendation: string
  breakdown: Breakdown[]
  score: number
}

export interface Breakdown {
  feedback: string
  recommendation: string
  name: string
  score: number
}

export interface LexicalResource {
  feedback: string
  recommendation: string
  breakdown: Breakdown2[]
  score: number
}

export interface Breakdown2 {
  feedback: string
  recommendation: string
  name: string
  score: number
}

export interface GrammaticalRangeAccuracy {
  feedback: string
  recommendation: string
  breakdown: Breakdown3[]
  score: number
}

export interface Breakdown3 {
  feedback: string
  recommendation: string
  name: string
  score: number
}

export interface GeneralFeedback {
  feedback: string
  recommendation: string
  transcription: string[]
  score: number
}
