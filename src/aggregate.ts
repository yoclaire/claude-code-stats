import { InstanceData, AggregatedStats } from "./types.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function aggregateInstances(
  instances: InstanceData[]
): AggregatedStats {
  const totalTokens = instances.reduce((sum, i) => sum + i.totalTokens, 0);

  // Merge daily tokens, summing same dates
  const dailyMap = new Map<string, number>();
  for (const instance of instances) {
    for (const day of instance.dailyTokens) {
      dailyMap.set(day.date, (dailyMap.get(day.date) ?? 0) + day.tokens);
    }
  }
  const dailyTokens = Array.from(dailyMap.entries())
    .map(([date, tokens]) => ({ date, tokens }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Favourite model: sum across instances
  const modelTotals = new Map<string, number>();
  for (const instance of instances) {
    for (const [model, tokens] of Object.entries(instance.modelUsage)) {
      modelTotals.set(model, (modelTotals.get(model) ?? 0) + tokens);
    }
  }
  let favouriteModel = "unknown";
  let maxTokens = 0;
  for (const [model, tokens] of modelTotals) {
    if (tokens > maxTokens) {
      maxTokens = tokens;
      favouriteModel = model;
    }
  }

  // Active since: earliest date
  const earliestDate = dailyTokens[0]?.date ?? "unknown";
  let activeSince = "unknown";
  if (earliestDate !== "unknown") {
    const d = new Date(earliestDate + "T00:00:00");
    activeSince = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  return {
    totalTokens,
    favouriteModel,
    activeSince,
    instanceCount: instances.length,
    dailyTokens,
    recentTokens: 0,
  };
}
