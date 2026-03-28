import { describe, it, expect } from "vitest";
import { formatTokens } from "../src/format.js";

describe("formatTokens", () => {
  it("formats numbers under 1000 as-is", () => {
    expect(formatTokens(0)).toBe("0");
    expect(formatTokens(999)).toBe("999");
  });

  it("formats thousands with K suffix", () => {
    expect(formatTokens(1000)).toBe("1.0K");
    expect(formatTokens(1500)).toBe("1.5K");
    expect(formatTokens(12345)).toBe("12.3K");
    expect(formatTokens(999999)).toBe("1000.0K");
  });

  it("formats millions with M suffix", () => {
    expect(formatTokens(1000000)).toBe("1.0M");
    expect(formatTokens(34415843)).toBe("34.4M");
    expect(formatTokens(999999999)).toBe("1000.0M");
  });

  it("formats billions with B suffix", () => {
    expect(formatTokens(1000000000)).toBe("1.0B");
    expect(formatTokens(2500000000)).toBe("2.5B");
  });
});
