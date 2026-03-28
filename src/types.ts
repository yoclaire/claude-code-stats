export interface DailyTokens {
  date: string; // YYYY-MM-DD
  tokens: number;
}

export interface InstanceData {
  instanceName: string;
  lastUpdated: string; // YYYY-MM-DD
  totalTokens: number;
  modelUsage: Record<string, number>;
  dailyTokens: DailyTokens[];
}

export interface AggregatedStats {
  totalTokens: number;
  favouriteModel: string;
  activeSince: string; // "Month YYYY"
  instanceCount: number;
  dailyTokens: DailyTokens[];
  recentTokens: number; // sum of tokens in heatmap window
}

export interface HeatmapCell {
  date: string;
  dayOfWeek: number; // 0=Mon, 6=Sun
  weekIndex: number;
  tokens: number;
  level: number; // 0-4 intensity
}

export interface HeatmapGrid {
  cells: HeatmapCell[];
  weekCount: number;
  monthLabels: { label: string; weekIndex: number }[];
}
