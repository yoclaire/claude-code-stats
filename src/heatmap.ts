import { DailyTokens, HeatmapCell, HeatmapGrid } from "./types.js";

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Returns 0=Mon through 6=Sun for a given date.
 * JS getDay() returns 0=Sun, so we convert.
 */
function mondayBasedDay(date: Date): number {
  const jsDay = date.getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1;
}

function dateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildHeatmapGrid(
  dailyTokens: DailyTokens[],
  today: string
): HeatmapGrid & { recentTokens: number } {
  const todayDate = new Date(today + "T00:00:00");

  // Start date: 6 months ago, rolled back to the previous Monday
  const startDate = new Date(todayDate);
  startDate.setMonth(startDate.getMonth() - 6);
  // Roll back to Monday
  while (mondayBasedDay(startDate) !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }

  // Build a lookup map from daily data
  const tokenMap = new Map<string, number>();
  for (const d of dailyTokens) {
    tokenMap.set(d.date, d.tokens);
  }

  // Generate all cells from startDate to today
  const cells: HeatmapCell[] = [];
  let recentTokens = 0;
  const cursor = new Date(startDate);
  let weekIndex = 0;

  while (cursor <= todayDate) {
    const dayOfWeek = mondayBasedDay(cursor);
    if (dayOfWeek === 0 && cells.length > 0) {
      weekIndex++;
    }
    const dateStr = dateToString(cursor);
    const tokens = tokenMap.get(dateStr) ?? 0;
    recentTokens += tokens;

    cells.push({
      date: dateStr,
      dayOfWeek,
      weekIndex,
      tokens,
      level: 0, // assigned below
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  // Compute intensity levels using percentiles of non-zero days
  const nonZeroTokens = cells
    .map((c) => c.tokens)
    .filter((t) => t > 0)
    .sort((a, b) => a - b);

  if (nonZeroTokens.length > 0) {
    const p25 = nonZeroTokens[Math.floor(nonZeroTokens.length * 0.25)];
    const p50 = nonZeroTokens[Math.floor(nonZeroTokens.length * 0.5)];
    const p75 = nonZeroTokens[Math.floor(nonZeroTokens.length * 0.75)];

    for (const cell of cells) {
      if (cell.tokens === 0) {
        cell.level = 0;
      } else if (cell.tokens <= p25) {
        cell.level = 1;
      } else if (cell.tokens <= p50) {
        cell.level = 2;
      } else if (cell.tokens <= p75) {
        cell.level = 3;
      } else {
        cell.level = 4;
      }
    }
  }

  // Month labels: find the first Monday of each month in the grid
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  for (const cell of cells) {
    const month = new Date(cell.date + "T00:00:00").getMonth();
    if (month !== lastMonth && cell.dayOfWeek === 0) {
      monthLabels.push({
        label: SHORT_MONTHS[month],
        weekIndex: cell.weekIndex,
      });
      lastMonth = month;
    }
  }

  return {
    cells,
    weekCount: weekIndex + 1,
    monthLabels,
    recentTokens,
  };
}
