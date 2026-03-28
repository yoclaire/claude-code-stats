import { describe, it, expect } from "vitest";
import { buildHeatmapGrid } from "../src/heatmap.js";
import { DailyTokens } from "../src/types.js";

describe("buildHeatmapGrid", () => {
  // Use a fixed "today" so tests are deterministic
  // 2026-03-27 is a Friday (dayOfWeek=4, 0-indexed Mon=0)
  const today = "2026-03-27";

  it("returns 7 rows x N weeks covering 6 months", () => {
    const grid = buildHeatmapGrid([], today);
    // 6 months back from 2026-03-27 = ~2025-09-27
    // Should have ~26 weeks
    expect(grid.weekCount).toBeGreaterThanOrEqual(25);
    expect(grid.weekCount).toBeLessThanOrEqual(27);
  });

  it("assigns correct dayOfWeek (0=Mon, 6=Sun)", () => {
    const grid = buildHeatmapGrid([], today);
    // 2026-03-27 is Friday = dayOfWeek 4
    const todayCell = grid.cells.find((c) => c.date === "2026-03-27");
    expect(todayCell?.dayOfWeek).toBe(4);
  });

  it("maps token data to cells", () => {
    const daily: DailyTokens[] = [
      { date: "2026-03-27", tokens: 50_000 },
    ];
    const grid = buildHeatmapGrid(daily, today);
    const cell = grid.cells.find((c) => c.date === "2026-03-27");
    expect(cell?.tokens).toBe(50_000);
  });

  it("assigns intensity levels 0-4 based on percentiles", () => {
    const daily: DailyTokens[] = [
      { date: "2026-03-20", tokens: 100 },
      { date: "2026-03-21", tokens: 500 },
      { date: "2026-03-22", tokens: 1000 },
      { date: "2026-03-23", tokens: 5000 },
      { date: "2026-03-24", tokens: 50_000 },
    ];
    const grid = buildHeatmapGrid(daily, today);
    // Empty days should be level 0
    const emptyCell = grid.cells.find(
      (c) => c.date === "2026-03-25" // no data
    );
    expect(emptyCell?.level).toBe(0);
    // The highest day should be level 4
    const maxCell = grid.cells.find((c) => c.date === "2026-03-24");
    expect(maxCell?.level).toBe(4);
  });

  it("generates month labels", () => {
    const grid = buildHeatmapGrid([], today);
    const labels = grid.monthLabels.map((m) => m.label);
    // Should include months in the 6-month window
    expect(labels).toContain("Oct");
    expect(labels).toContain("Mar");
  });

  it("returns recentTokens sum", () => {
    const daily: DailyTokens[] = [
      { date: "2026-03-20", tokens: 1000 },
      { date: "2026-03-21", tokens: 2000 },
      { date: "2025-01-01", tokens: 99999 }, // outside window
    ];
    const { recentTokens } = buildHeatmapGrid(daily, today);
    expect(recentTokens).toBe(3000);
  });
});
