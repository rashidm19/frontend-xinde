import type { ListeningOut } from './PracticeListening';
import type { PracticeReadingContent } from './PracticeReading';
import type { PracticeWritingDetails } from './PracticeWriting';
import type { PracticeSpeakingPartResponse } from './PracticeSpeaking';

export interface MockWritingData {
  part_1: PracticeWritingDetails | null;
  part_2: PracticeWritingDetails | null;
}

export interface MockSpeakingData {
  part_1: PracticeSpeakingPartResponse | null;
  part_2: PracticeSpeakingPartResponse | null;
  part_3?: PracticeSpeakingPartResponse | null;
}

export interface MockOut {
  listening: ListeningOut | null;
  reading: PracticeReadingContent | null;
  writing: MockWritingData | null;
  speaking: MockSpeakingData | null;
}
