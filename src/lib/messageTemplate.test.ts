import { describe, expect, it } from "vitest";
import {
  daysPhrase,
  findUnknownPlaceholders,
  findUnsupportedPlaceholders,
  insertAtCaret,
  mentionsGift,
  placeholdersFor,
  recipeBody,
  renderMessage,
  sampleContext,
} from "./messageTemplate";

const ctx = { name: "דנה", business: "קפה ארומה", reward: "קפה חינם", days: "30 יום" };

describe("renderMessage", () => {
  it("renders both spellings of every placeholder", () => {
    expect(renderMessage("היי {שם}, {ימים} — {פרס} ב{עסק}", ctx)).toBe(
      "היי דנה, 30 יום — קפה חינם בקפה ארומה",
    );
    expect(renderMessage("Hi {name}, {days} — {reward} at {business}", ctx)).toBe(
      "Hi דנה, 30 יום — קפה חינם at קפה ארומה",
    );
  });

  it("drops an unknown name cleanly", () => {
    expect(renderMessage("היי {שם}, מה נשמע?", { ...ctx, name: "" })).toBe("היי, מה נשמע?");
  });

  it("leaves unknown tokens alone", () => {
    expect(renderMessage("שלום {כלום}", ctx)).toBe("שלום {כלום}");
  });
});

describe("findUnknownPlaceholders", () => {
  it("flags unknown tokens and days on kinds without a day count", () => {
    expect(findUnknownPlaceholders("{שם} {כלום}", "inactive")).toEqual(["{כלום}"]);
    expect(findUnknownPlaceholders("{שם} {ימים}", "birthday")).toEqual(["{ימים}"]);
    expect(findUnknownPlaceholders("{name} {days}", "reward_waiting")).toEqual([]);
  });
});

describe("daysPhrase + sampleContext", () => {
  it("follows the Hebrew counting rule", () => {
    expect(daysPhrase(1, "HE")).toBe("יום אחד");
    expect(daysPhrase(2, "HE")).toBe("יומיים");
    expect(daysPhrase(7, "HE")).toBe("7 ימים");
    expect(daysPhrase(30, "HE")).toBe("30 יום");
    expect(daysPhrase(1, "EN")).toBe("1 day");
    expect(daysPhrase(14, "EN")).toBe("14 days");
  });

  it("builds the sample customer per language and kind", () => {
    const he = sampleContext("HE", { business: "ב", reward: "פ", kind: "inactive", days: 45 });
    expect(he).toEqual({ name: "דנה", business: "ב", reward: "פ", days: "45 יום" });
    const en = sampleContext("EN", { business: "B", reward: "R", kind: "birthday" });
    expect(en.name).toBe("Dana");
    expect(en.days).toBe("");
  });
});

describe("placeholdersFor", () => {
  it("offers days only where it means something, in the card's language", () => {
    expect(placeholdersFor("birthday", "HE").map((p) => p.token)).toEqual([
      "{שם}",
      "{עסק}",
      "{פרס}",
    ]);
    expect(placeholdersFor("inactive", "EN").map((p) => p.token)).toEqual([
      "{name}",
      "{business}",
      "{reward}",
      "{days}",
    ]);
  });

  it("never offers the customer's name on a broadcast", () => {
    // One message is published to a whole card design, so it cannot greet
    // each holder by name. The API refuses it, and the chip used to walk
    // owners straight into that refusal after they'd written the message.
    expect(placeholdersFor("broadcast", "HE").map((p) => p.token)).toEqual(["{עסק}", "{פרס}"]);
    expect(placeholdersFor("broadcast", "EN").map((p) => p.token)).toEqual([
      "{business}",
      "{reward}",
    ]);
  });
});

describe("findUnsupportedPlaceholders", () => {
  it("flags the customer's name in a broadcast, in either spelling", () => {
    expect(findUnsupportedPlaceholders("היי {שם}, יש מבצע", "broadcast")).toEqual(["{שם}"]);
    expect(findUnsupportedPlaceholders("Hi {name}", "broadcast")).toEqual(["{name}"]);
  });

  it("leaves what the kind may use alone", () => {
    expect(findUnsupportedPlaceholders("{עסק} {פרס}", "broadcast")).toEqual([]);
    expect(findUnsupportedPlaceholders("היי {שם}", "inactive")).toEqual([]);
  });

  it("leaves days to findUnknownPlaceholders, which is how the API reports it", () => {
    expect(findUnsupportedPlaceholders("{ימים}", "broadcast")).toEqual([]);
    expect(findUnknownPlaceholders("{ימים}", "broadcast")).toEqual(["{ימים}"]);
  });
});

describe("insertAtCaret", () => {
  it("inserts at the caret with breathing room", () => {
    const { text, caret } = insertAtCaret("היי, מה נשמע", "{שם}", 3, 3);
    expect(text).toBe("היי {שם}, מה נשמע");
    expect(caret).toBe("היי {שם}".length);
  });

  it("appends when there is no selection", () => {
    expect(insertAtCaret("היי", "{שם}", null, null).text).toBe("היי {שם}");
  });
});

describe("recipe helpers", () => {
  it("swaps the starter body with the gift", () => {
    const recipe = { body_with_gift: "עם מתנה", body_without_gift: "בלי" };
    expect(recipeBody(recipe, true)).toBe("עם מתנה");
    expect(recipeBody(recipe, false)).toBe("בלי");
    expect(mentionsGift("הוספנו לך ניקוב במתנה")).toBe(true);
    expect(mentionsGift("נשמח לראות אותך")).toBe(false);
  });
});
