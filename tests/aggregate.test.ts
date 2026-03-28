import { describe, it, expect } from "vitest";
import { aggregateInstances } from "../src/aggregate.js";
import { InstanceData } from "../src/types.js";

const local: InstanceData = {
  instanceName: "local",
  lastUpdated: "2026-03-27",
  totalTokens: 10_000_000,
  modelUsage: { "claude-opus-4-6": 8_000_000, "claude-sonnet-4-6": 2_000_000 },
  dailyTokens: [
    { date: "2026-03-10", tokens: 500 },
    { date: "2026-03-11", tokens: 120_000 },
  ],
};

const homelab: InstanceData = {
  instanceName: "homelab",
  lastUpdated: "2026-03-26",
  totalTokens: 5_000_000,
  modelUsage: { "claude-opus-4-6": 5_000_000 },
  dailyTokens: [
    { date: "2026-03-11", tokens: 30_000 },
    { date: "2026-03-12", tokens: 80_000 },
  ],
};

describe("aggregateInstances", () => {
  it("sums totalTokens across instances", () => {
    const result = aggregateInstances([local, homelab]);
    expect(result.totalTokens).toBe(15_000_000);
  });

  it("merges dailyTokens, summing same dates", () => {
    const result = aggregateInstances([local, homelab]);
    const mar11 = result.dailyTokens.find((d) => d.date === "2026-03-11");
    expect(mar11?.tokens).toBe(150_000);
  });

  it("keeps unique dates from each instance", () => {
    const result = aggregateInstances([local, homelab]);
    const mar10 = result.dailyTokens.find((d) => d.date === "2026-03-10");
    const mar12 = result.dailyTokens.find((d) => d.date === "2026-03-12");
    expect(mar10?.tokens).toBe(500);
    expect(mar12?.tokens).toBe(80_000);
  });

  it("sorts dailyTokens by date ascending", () => {
    const result = aggregateInstances([local, homelab]);
    const dates = result.dailyTokens.map((d) => d.date);
    expect(dates).toEqual(["2026-03-10", "2026-03-11", "2026-03-12"]);
  });

  it("picks favourite model by highest total tokens", () => {
    const result = aggregateInstances([local, homelab]);
    expect(result.favouriteModel).toBe("claude-opus-4-6");
  });

  it("computes activeSince from earliest daily date", () => {
    const result = aggregateInstances([local, homelab]);
    expect(result.activeSince).toBe("March 2026");
  });

  it("counts instances", () => {
    const result = aggregateInstances([local, homelab]);
    expect(result.instanceCount).toBe(2);
  });

  it("handles a single instance", () => {
    const result = aggregateInstances([local]);
    expect(result.totalTokens).toBe(10_000_000);
    expect(result.instanceCount).toBe(1);
  });
});
