export interface IPracticeScoresStats {
  best_listening_score: number;
  best_reading_score: number;
  best_writing_score: number;
  best_speaking_score: number;
}

export interface MockTimeDayStat {
  date: string;
  time: number;
}

export interface MockTimeStats {
  daily_average_time: number;
  total_period_time: number;
  day_stats: MockTimeDayStat[];
}
