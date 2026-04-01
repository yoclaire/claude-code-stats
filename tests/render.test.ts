import { describe, it, expect } from "vitest";
import { renderSvg } from "../src/render.js";
import { AggregatedStats } from "../src/types.js";

const stats: AggregatedStats = {
  totalTokens: 34_415_843,
  favouriteModel: "claude-opus-4-6",
  activeSince: "March 2026",
  instanceCount: 3,
  dailyTokens: [
    { date: "2026-03-10", tokens: 500 },
    { date: "2026-03-11", tokens: 120_000 },
    { date: "2026-03-12", tokens: 17_000 },
  ],
  recentTokens: 137_500,
};

describe("renderSvg", () => {
  it("returns a valid SVG string", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/<\/svg>$/);
  });

  it("includes the total token count formatted", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("34.4M");
  });

  it("includes the favourite model with friendly name", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("Claude Opus 4.6");
  });

  it("includes the active since date", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("March 2026");
  });

  it("includes the instance count", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("Aggregated across 3 instances");
  });

  it("includes heatmap cells as rects", () => {
    const svg = renderSvg(stats, "2026-03-27");
    const rectCount = (svg.match(/<rect /g) || []).length;
    expect(rectCount).toBeGreaterThan(100);
  });

  it("includes month labels", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("Oct");
    expect(svg).toContain("Mar");
  });

  it("includes day-of-week labels", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("Mon");
    expect(svg).toContain("Wed");
    expect(svg).toContain("Fri");
  });

  it("includes the legend", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toContain("Less");
    expect(svg).toContain("More");
  });

  it("includes the recent tokens summary", () => {
    const svg = renderSvg(stats, "2026-03-27");
    expect(svg).toMatch(/tokens in the last year/);
  });
});
