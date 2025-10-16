export interface IPracticeScoresStats {
  best_listening_score: number;
  best_reading_score: number;
  best_writing_score: number;
  best_speaking_score: number;
}

export interface PracticeTimeDayStat {
  date: string;
  time: number;
}

export interface PracticeTimeStats {
  daily_average_time: number;
  total_period_time: number;
  day_stats: PracticeTimeDayStat[];
}

export interface PracticeHistoryEntry {
  id: number;
  section: PracticeSectionKey;
  score: number | null;
  completed_at: string;
  created_at: string;
  practice: PracticeSectionHistory;
}

export interface PracticeSectionHistory {
  title?: string;
  part?: number;
  tag?: string;
}

export type PracticeSectionKey = 'writing' | 'reading' | 'listening' | 'speaking';
