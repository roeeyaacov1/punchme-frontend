import { describe, expect, it } from "vitest";
import { rootClasses } from "./useDashboardTheme";

describe("rootClasses", () => {
  it("takes the old pair off when a page claims Lightbox, as the pre-paint script put it there", () => {
    expect(rootClasses({ lightbox: true, isDark: false })).toEqual({
      "theme-lightbox": true,
      "theme-purple": false,
      "theme-raised": false,
      "theme-night": false,
    });
  });

  it("wears the old pair and not Lightbox for a page that hasn't moved, with night after dark", () => {
    expect(rootClasses({ lightbox: false, isDark: true })).toEqual({
      "theme-lightbox": false,
      "theme-purple": true,
      "theme-raised": true,
      "theme-night": true,
    });
  });
});
