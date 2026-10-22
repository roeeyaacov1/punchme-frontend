import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { daysFrom, formatWhen, relativeWhen } from "./describe";

// Noon on 22 Oct 2026, local time, whatever zone the run is in.
const NOW = new Date(2026, 9, 22, 12, 0).getTime();
const at = (month: number, day: number, hour: number, year = 2026) => new Date(year, month - 1, day, hour, 0).toISOString();

const t = ((key: string, options?: { time?: string }) => `${key.split(".").pop()} ${options?.time}`) as unknown as TFunction;

describe("formatWhen", () => {
  it("leaves this year's year out", () => {
    expect(formatWhen(at(10, 23, 9), "en", NOW)).not.toContain("2026");
  });

  it("says the year of a date from another year, so last October isn't next week", () => {
    expect(formatWhen(at(10, 23, 9, 2025), "en", NOW)).toContain("2025");
    expect(formatWhen(at(10, 23, 9, 2025), "he", NOW)).toContain("2025");
    expect(formatWhen(at(1, 5, 9, 2027), "en", NOW)).toContain("2027");
  });

  it("is empty for no date", () => {
    expect(formatWhen(null, "en", NOW)).toBe("");
  });
});

describe("relativeWhen", () => {
  it("names today, tomorrow and yesterday, with the hour", () => {
    expect(relativeWhen(at(10, 22, 18), t, "en", NOW)).toMatch(/^today 0?6:00/i);
    expect(relativeWhen(at(10, 23, 10), t, "en", NOW)).toMatch(/^tomorrow 10:00/);
    expect(relativeWhen(at(10, 21, 10), t, "en", NOW)).toMatch(/^yesterday 10:00/);
  });

  it("dates any other day", () => {
    const later = relativeWhen(at(10, 25, 10), t, "en", NOW);
    expect(later).toContain("25");
    expect(later).not.toMatch(/today|tomorrow|yesterday/);
  });
});

describe("daysFrom", () => {
  it("counts calendar days, not 24-hour spans", () => {
    expect(daysFrom(new Date(2026, 9, 23, 0, 30), new Date(2026, 9, 22, 23, 30))).toBe(1);
    expect(daysFrom(new Date(2026, 9, 22, 0, 0), new Date(2026, 9, 22, 23, 59))).toBe(0);
    // Across the end of summer time, 25 Oct 2026 in Israel.
    expect(daysFrom(new Date(2026, 9, 26, 9, 0), new Date(2026, 9, 24, 9, 0))).toBe(2);
  });
});
