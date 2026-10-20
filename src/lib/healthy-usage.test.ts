import { describe, expect, it } from "vitest";

import { clampMinutes, HEALTHY_USAGE_MAX_MINUTES, HEALTHY_USAGE_MIN_MINUTES } from "./healthy-usage";

describe("uso saudável", () => {
  it("mantém o intervalo dentro dos limites", () => {
    expect(clampMinutes(30)).toBe(30);
    expect(clampMinutes(0)).toBe(HEALTHY_USAGE_MIN_MINUTES);
    expect(clampMinutes(999)).toBe(HEALTHY_USAGE_MAX_MINUTES);
    expect(clampMinutes(Number.NaN)).toBe(30);
  });
});
