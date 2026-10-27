import { describe, expect, it } from "vitest";
import type { DesignField } from "../../api/designs";
import {
  addableKinds,
  backState,
  changesBetween,
  faceLabelFull,
  fieldsOver,
  followField,
  kindOf,
  nameMissing,
  readDesign,
  newField,
  nextCustomBinding,
  rebaseEdits,
  rewardForRow,
  sameCard,
  sampleStart,
  textColourChoice,
  withBackground,
  withFaceLabel,
  withoutSent,
  withUniqueBindings,
  withReward,
  withRewardOnBack,
  type CardStudioValue,
} from "./studioDraft";

const FIELDS: DesignField[] = [
  { binding: "person.displayName", label: "", section: "SECONDARY_FIELDS", alignment: "NATURAL" },
  { binding: "members.member.points", label: "כוסות קפה", section: "AUXILIARY_FIELDS", alignment: "NATURAL" },
  { binding: "universal.info", label: "ההטבה", section: "BACK_FIELDS", alignment: "NATURAL", default_value: "קפה חינם" },
];

const SAVED: CardStudioValue = {
  name: "כרטיסיית קפה",
  stamps_required: 8,
  reward_description: "קפה חינם",
  background_color: "#4B2E1E",
  foreground_color: "#FFFFFF",
  label_color: "#D2B48C",
  design: { fields: FIELDS, stamp: { glyph: "coffee", color: "#FFFFFF" }, pattern: "none" },
};

const backOf = (value: CardStudioValue) =>
  value.design.fields?.find((field) => field.binding === "universal.info")?.default_value;

/** The saved card, its back saying words of its own. */
const OWN_BACK: CardStudioValue = {
  ...SAVED,
  design: { ...SAVED.design, fields: [FIELDS[0], FIELDS[1], { ...FIELDS[2], default_value: "קפה שמיני חינם" }] },
};

describe("backState", () => {
  it("follows when the back says the reward", () => {
    expect(backState(SAVED.design, "קפה חינם")).toEqual({ kind: "follows" });
  });

  it("is empty when the back says nothing", () => {
    const design = { fields: [{ ...FIELDS[2], default_value: "" }] };
    expect(backState(design, "קפה חינם")).toEqual({ kind: "empty" });
  });

  it("is left alone, and said, when the back says something else", () => {
    expect(backState(OWN_BACK.design, "קפה חינם")).toEqual({ kind: "differs", text: "קפה שמיני חינם" });
  });

  it("has nothing to follow on a card without the field", () => {
    expect(backState({ fields: FIELDS.slice(0, 2) }, "קפה חינם")).toEqual({ kind: "none" });
  });
});

describe("withReward", () => {
  it("writes the new reward on the back too when the back says the reward", () => {
    expect(backOf(withReward(SAVED, "מאפה חינם"))).toBe("מאפה חינם");
  });

  it("writes it on a back that says nothing", () => {
    const empty = { ...SAVED, design: { fields: [{ ...FIELDS[2], default_value: "" }] } };
    expect(backOf(withReward(empty, "מאפה חינם"))).toBe("מאפה חינם");
  });

  it("never overwrites words the back says of its own", () => {
    const next = withReward(OWN_BACK, "מאפה חינם");
    expect(next.reward_description).toBe("מאפה חינם");
    expect(backOf(next)).toBe("קפה שמיני חינם");
  });

  it("adds no field to a card that has none", () => {
    const draft = { ...SAVED, design: { fields: FIELDS.slice(0, 2) } };
    expect(withReward(draft, "מאפה חינם").design.fields).toHaveLength(2);
  });
});

describe("withRewardOnBack", () => {
  it("puts the reward on the back in the draft, where Wallet details shows it", () => {
    expect(backOf(withRewardOnBack(OWN_BACK))).toBe("קפה חינם");
  });

  it("makes the back follow the next change of the reward", () => {
    expect(backOf(withReward(withRewardOnBack(OWN_BACK), "מאפה חינם"))).toBe("מאפה חינם");
  });

  it("lets words typed on the back afterwards win", () => {
    const put = withRewardOnBack(OWN_BACK);
    const typed = {
      ...put,
      design: { ...put.design, fields: put.design.fields?.map((f) => (f.binding === "universal.info" ? { ...f, default_value: "שתייה חמה חינם" } : f)) },
    };
    expect(backOf(withReward(typed, "מאפה חינם"))).toBe("שתייה חמה חינם");
  });
});

describe("bindings", () => {
  it("reads a numbered free-text binding as free text", () => {
    expect(kindOf("meta.custom_3")).toBe("meta.custom");
    expect(kindOf("universal.info")).toBe("universal.info");
    expect(kindOf("meta.hours")).toBeNull();
  });

  it("gives each free-text field a binding of its own", () => {
    expect(nextCustomBinding(FIELDS)).toBe("meta.custom");
    const one = [...FIELDS, newField("meta.custom", FIELDS)];
    expect(nextCustomBinding(one)).toBe("meta.custom_2");
    const two = [...one, newField("meta.custom", one)];
    expect(two.map((f) => f.binding)).toContain("meta.custom_2");
    expect(nextCustomBinding(two)).toBe("meta.custom_3");
  });

  it("offers the other kinds once each, and nothing at ten fields", () => {
    expect(addableKinds(FIELDS)).toEqual(["members.tier.name", "meta.custom"]);
    const ten = Array.from({ length: 10 }, (_, i) => ({ binding: `meta.custom_${i + 2}` }));
    expect(addableKinds(ten)).toEqual([]);
  });
});

describe("withUniqueBindings", () => {
  it("leaves a card whose fields each show their own thing as it is", () => {
    expect(withUniqueBindings(FIELDS)).toBe(FIELDS);
  });

  it("gives each repeated free-text field a binding of its own, words and all", () => {
    const repeated = [
      { binding: "meta.custom", label: "שעות", default_value: "א-ה 8-20" },
      { binding: "meta.custom", label: "כתובת", default_value: "סוקולוב 12" },
      { binding: "meta.custom_2", label: "טלפון" },
      { binding: "meta.custom", label: "אתר" },
    ];
    expect(withUniqueBindings(repeated)).toEqual([
      repeated[0],
      { ...repeated[1], binding: "meta.custom_3" },
      repeated[2],
      { ...repeated[3], binding: "meta.custom_4" },
    ]);
  });

  it("mends a design as it is read, and leaves one without fields alone", () => {
    const design = { pattern: "dots" as const, fields: [FIELDS[0], { ...FIELDS[0], label: "שם הלקוח" }] };
    expect(readDesign(design)).toEqual({ pattern: "dots", fields: [FIELDS[0]] });
    const bare = { pattern: "dots" as const };
    expect(readDesign(bare)).toBe(bare);
  });

  it("keeps the first of a kind the card shows once, since the rest show the same", () => {
    const twice = [FIELDS[0], FIELDS[2], { ...FIELDS[0], label: "שם הלקוח" }];
    expect(withUniqueBindings(twice)).toEqual([FIELDS[0], FIELDS[2]]);
  });

  it("keeps the copy on the card's face over one on the back, so the stamp count stays on the face", () => {
    const back = { ...FIELDS[1], label: "ביקורים", section: "BACK_FIELDS" as const };
    expect(withUniqueBindings([back, FIELDS[0], FIELDS[1]])).toEqual([FIELDS[0], FIELDS[1]]);
    // A field with no place is on the back, as the API reads it.
    const placeless = { binding: "members.member.points", label: "ביקורים" };
    expect(withUniqueBindings([placeless, FIELDS[1]])).toEqual([FIELDS[1]]);
    // Two on the back: the first.
    expect(withUniqueBindings([back, { ...back, label: "כוסות" }])).toEqual([back]);
  });

  it("turns a repeated line of text with words of its own into free text, words and all", () => {
    const hours = { ...FIELDS[2], label: "שעות", default_value: "א-ה 8-20" };
    expect(withUniqueBindings([...FIELDS, hours])).toEqual([...FIELDS, { ...hours, binding: "meta.custom" }]);
  });

  it("lets a repeated line of text go when it says nothing, or what the kept one says", () => {
    const empty = { ...FIELDS[2], label: "עוד", default_value: "" };
    const same = { ...FIELDS[2], label: "ההטבה שלך", default_value: " קפה חינם " };
    expect(withUniqueBindings([...FIELDS, empty, same])).toEqual(FIELDS);
  });

  it("gives the free text a binding no other field has", () => {
    const custom = { binding: "meta.custom", label: "כתובת" };
    const hours = { ...FIELDS[2], label: "שעות", default_value: "א-ה 8-20" };
    expect(withUniqueBindings([...FIELDS, custom, hours]).map((f) => f.binding)).toEqual([
      ...FIELDS.map((f) => f.binding),
      "meta.custom",
      "meta.custom_2",
    ]);
  });
});

describe("followField", () => {
  it("follows the field an editor holds to its new place", () => {
    // Read in: the name field removed elsewhere, a level added before the rest.
    const tier = { binding: "members.tier.name", label: "רמה" };
    const after = [tier, FIELDS[1], FIELDS[2]];
    expect(followField(FIELDS, after, 2)).toBe(2);
    expect(followField(FIELDS, after, 1)).toBe(1);
    expect(followField(FIELDS, [FIELDS[2], FIELDS[1]], 2)).toBe(0);
  });

  it("closes the editor when its field went", () => {
    expect(followField(FIELDS, [FIELDS[1], FIELDS[2]], 0)).toBeNull();
  });

  it("leaves a closed editor closed", () => {
    expect(followField(FIELDS, FIELDS, null)).toBeNull();
    expect(followField(FIELDS, FIELDS, 7)).toBeNull();
  });
});

describe("withFaceLabel", () => {
  it("renames a face field in place", () => {
    const fields = withFaceLabel(FIELDS, "person.displayName", "SECONDARY_FIELDS", "שם", FIELDS);
    expect(fields[0].label).toBe("שם");
    expect(fields).toHaveLength(3);
  });

  it("adds the field when the card has none, and drops it again when cleared", () => {
    const without = FIELDS.slice(1);
    const added = withFaceLabel(without, "person.displayName", "SECONDARY_FIELDS", "שם", without);
    expect(added).toHaveLength(3);
    expect(withFaceLabel(added, "person.displayName", "SECONDARY_FIELDS", "", without)).toHaveLength(2);
  });

  it("adds no eleventh field: the card holds ten", () => {
    const ten = [FIELDS[1], ...Array.from({ length: 9 }, (_, i) => ({ binding: `meta.custom_${i + 2}` }))];
    expect(faceLabelFull(ten, "person.displayName")).toBe(true);
    expect(withFaceLabel(ten, "person.displayName", "SECONDARY_FIELDS", "שם", ten)).toHaveLength(10);
    // The other face field is on the card, so its label can still change.
    expect(faceLabelFull(ten, "members.member.points")).toBe(false);
    expect(faceLabelFull(FIELDS.slice(1), "person.displayName")).toBe(false);
  });

  it("keeps a field the card came with in its place, with an empty label", () => {
    const named = FIELDS.map((f, i) => (i === 0 ? { ...f, label: "שם" } : f));
    const cleared = withFaceLabel(named, "person.displayName", "SECONDARY_FIELDS", "", named);
    expect(cleared).toHaveLength(3);
    expect(cleared[0]).toEqual({ ...FIELDS[0], label: "" });
  });
});

describe("colours", () => {
  it("moves an automatic text colour with the card colour", () => {
    const next = withBackground(SAVED, "#F5EFE6");
    expect(next.foreground_color).toBe("#000000");
  });

  it("keeps a text colour the owner chose", () => {
    const own = { ...SAVED, foreground_color: "#D2B48C" };
    expect(withBackground(own, "#F5EFE6").foreground_color).toBe("#D2B48C");
  });

  it("reads the automatic text colour as null for the shared control", () => {
    expect(textColourChoice(SAVED)).toBeNull();
    expect(textColourChoice({ ...SAVED, foreground_color: "#D2B48C" })).toBe("#D2B48C");
  });
});

describe("sampleStart", () => {
  it("opens at half the card, rounded down, at least one", () => {
    expect(sampleStart(8)).toBe(4);
    expect(sampleStart(7)).toBe(3);
    expect(sampleStart(2)).toBe(1);
  });
});

describe("rewardForRow", () => {
  it("says a short reward whole, its spaces tidied", () => {
    expect(rewardForRow("  קפה   חינם ")).toBe("קפה חינם");
  });

  it("cuts a long one at the last word that fits, without trailing punctuation", () => {
    const reward = "תספורת גברים מלאה כולל חפיפה, עיצוב זקן במכונה ובתער וטיפול פנים קצר עם מגבת חמה, לבחירתכם";
    const row = rewardForRow(reward, 40);
    expect(row).toBe("תספורת גברים מלאה כולל חפיפה, עיצוב זקן…");
    expect(row.length).toBeLessThanOrEqual(41);
  });

  it("cuts mid-word only when there's no space in the second half", () => {
    expect(rewardForRow("x".repeat(100), 20)).toBe(`${"x".repeat(20)}…`);
  });
});

describe("changesBetween", () => {
  it("is empty for the card as saved", () => {
    expect(changesBetween(SAVED, SAVED)).toEqual([]);
  });

  it("counts a reward, a colour and a glyph as three changes", () => {
    const draft = {
      ...SAVED,
      reward_description: "מאפה חינם",
      background_color: "#0E1120",
      design: { ...SAVED.design, stamp: { glyph: "star", color: "#FFFFFF" } },
    };
    expect(changesBetween(SAVED, draft)).toEqual(["reward", "colours", "stamp"]);
  });

  it("counts a colour once whichever of the four moved, and ignores case", () => {
    const draft = { ...SAVED, background_color: "#4b2e1e", label_color: "#000000" };
    expect(changesBetween(SAVED, draft)).toEqual(["colours"]);
  });

  it("counts a renamed label as a name, not as a field", () => {
    const fields = withFaceLabel(FIELDS, "members.member.points", "AUXILIARY_FIELDS", "ביקורים", FIELDS);
    expect(changesBetween(SAVED, { ...SAVED, design: { ...SAVED.design, fields } })).toEqual(["names"]);
  });

  it("counts a label cleared on a field the card came with as a name", () => {
    const fields = withFaceLabel(FIELDS, "members.member.points", "AUXILIARY_FIELDS", "", FIELDS);
    expect(changesBetween(SAVED, { ...SAVED, design: { ...SAVED.design, fields } })).toEqual(["names"]);
  });

  it("counts a field added in Wallet details as a field", () => {
    const fields = [...FIELDS, newField("meta.custom", FIELDS)];
    expect(changesBetween(SAVED, { ...SAVED, design: { ...SAVED.design, fields } })).toEqual(["fields"]);
  });

  it("counts held pictures by what they are", () => {
    expect(changesBetween(SAVED, SAVED, { logo: "data:", stamp_art: "data:", strip_base: "data:" })).toEqual([
      "stamp",
      "logo",
      "art",
    ]);
  });

  it("counts the reward put on the back as the reward", () => {
    expect(changesBetween(OWN_BACK, withRewardOnBack(OWN_BACK))).toEqual(["reward"]);
  });

  it("counts a new reward once, on the front and the back", () => {
    expect(changesBetween(SAVED, withReward(SAVED, "מאפה חינם"))).toEqual(["reward"]);
  });
});

describe("nameMissing", () => {
  it("reads a name of spaces as no name, which the API refuses", () => {
    expect(nameMissing({ ...SAVED, name: "  " })).toBe(true);
    expect(nameMissing(SAVED)).toBe(false);
  });
});

describe("withoutSent", () => {
  it("lets go of a picture once it is sent", () => {
    expect(withoutSent({ logo: "data:a", strip_base: "data:b" }, "logo", "data:a")).toEqual({ strip_base: "data:b" });
  });

  it("keeps a picture chosen again while the first was on its way", () => {
    const held = { logo: "data:new" };
    expect(withoutSent(held, "logo", "data:old")).toBe(held);
  });
});

describe("sameCard", () => {
  it("reads two copies of a card as one, whatever order their keys came in", () => {
    const reordered = { ...SAVED, design: { pattern: "none" as const, stamp: { color: "#FFFFFF", glyph: "coffee" }, fields: FIELDS } };
    expect(sameCard(SAVED, reordered)).toBe(true);
    expect(sameCard(SAVED, { ...SAVED, stamps_required: 10 })).toBe(false);
  });
});

describe("rebaseEdits", () => {
  // Saved elsewhere since the edits began: a new colour and twelve stamps.
  const FRESH: CardStudioValue = { ...SAVED, background_color: "#0E1120", stamps_required: 12 };

  it("takes the fresh card whole when the owner changed nothing", () => {
    expect(rebaseEdits(SAVED, SAVED, FRESH)).toEqual(FRESH);
  });

  it("puts the owner's own change on top, and nothing else from the old card", () => {
    const draft = { ...SAVED, reward_description: "מאפה חינם" };
    const rebased = rebaseEdits(SAVED, draft, FRESH);
    expect(rebased.reward_description).toBe("מאפה חינם");
    expect(rebased.background_color).toBe("#0E1120");
    expect(rebased.stamps_required).toBe(12);
  });

  it("keeps the owner's glyph and takes the stamp colour changed elsewhere", () => {
    const draft = { ...SAVED, design: { ...SAVED.design, stamp: { glyph: "star", color: "#FFFFFF" } } };
    const fresh = { ...SAVED, design: { ...SAVED.design, stamp: { glyph: "coffee", color: "#F0B429" } } };
    expect(rebaseEdits(SAVED, draft, fresh).design.stamp).toEqual({ glyph: "star", color: "#F0B429" });
  });

  it("merges the fields by what they show", () => {
    // Here: the stamp count's label renamed, and the name field removed.
    const draft = {
      ...SAVED,
      design: { ...SAVED.design, fields: [{ ...FIELDS[1], label: "ביקורים" }, FIELDS[2]] },
    };
    // Elsewhere: the back's words changed, and a tier field added.
    const tier = { binding: "members.tier.name", label: "רמה", section: "BACK_FIELDS" as const };
    const fresh = {
      ...SAVED,
      design: { ...SAVED.design, fields: [FIELDS[0], FIELDS[1], { ...FIELDS[2], default_value: "מאפה חינם" }, tier] },
    };
    expect(rebaseEdits(SAVED, draft, fresh).design.fields).toEqual([
      { ...FIELDS[1], label: "ביקורים" },
      { ...FIELDS[2], default_value: "מאפה חינם" },
      tier,
    ]);
  });

  it("merges a field changed on both sides property by property", () => {
    // Here: a new reward, which writes the back's words too.
    const draft = withReward(SAVED, "מאפה חינם");
    // Elsewhere: the back field's label, place and change message.
    const back = { ...FIELDS[2], label: "מה מקבלים", section: "AUXILIARY_FIELDS" as const, change_message: "חדש: %@" };
    const fresh = { ...SAVED, design: { ...SAVED.design, fields: [FIELDS[0], FIELDS[1], back] } };
    const rebased = rebaseEdits(SAVED, draft, fresh);
    expect(rebased.reward_description).toBe("מאפה חינם");
    expect(rebased.design.fields?.[2]).toEqual({ ...back, default_value: "מאפה חינם" });
  });

  it("gives a free-text field added elsewhere a binding of its own when the owner's new one took it", () => {
    const ours = { ...newField("meta.custom", FIELDS), label: "שעות" };
    const theirs = { ...newField("meta.custom", FIELDS), label: "כתובת" };
    expect(ours.binding).toBe(theirs.binding);
    const draft = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, ours] } };
    const fresh = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, theirs] } };
    expect(rebaseEdits(SAVED, draft, fresh).design.fields).toEqual([
      ...FIELDS,
      ours,
      { ...theirs, binding: "meta.custom_2" },
    ]);
  });

  it("passes over a binding the fresh card takes further on", () => {
    const ours = { binding: "meta.custom", label: "שעות" };
    const theirs = [
      { binding: "meta.custom", label: "כתובת" },
      { binding: "meta.custom_2", label: "טלפון" },
    ];
    const draft = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, ours] } };
    const fresh = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, ...theirs] } };
    expect(rebaseEdits(SAVED, draft, fresh).design.fields?.map((f) => f.binding)).toEqual([
      ...FIELDS.map((f) => f.binding),
      "meta.custom",
      "meta.custom_3",
      "meta.custom_2",
    ]);
  });

  it("adds the owner's new field once when the fresh card already has it", () => {
    // As after a save whose answer never came back, though the card took it.
    const ours = { ...newField("meta.custom", FIELDS), label: "שעות" };
    const draft = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, ours] } };
    expect(rebaseEdits(SAVED, draft, draft).design.fields).toEqual([...FIELDS, ours]);
  });

  it("keeps the owner's own of a kind the card shows once, when both sides added it", () => {
    const ours = { binding: "members.tier.name", label: "רמה", section: "BACK_FIELDS" as const };
    const theirs = { ...ours, label: "דרגה" };
    const draft = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, ours] } };
    const fresh = { ...SAVED, design: { ...SAVED.design, fields: [...FIELDS, theirs] } };
    expect(rebaseEdits(SAVED, draft, fresh).design.fields).toEqual([...FIELDS, ours]);
  });

  it("can bring in fields past the ten the API takes, and says how many", () => {
    const nine = [...FIELDS, ...Array.from({ length: 6 }, (_, i) => ({ binding: `meta.custom_${i + 2}` }))];
    const base = { ...SAVED, design: { ...SAVED.design, fields: nine } };
    const draft = { ...base, design: { ...base.design, fields: [...nine, { binding: "members.tier.name" }] } };
    const fresh = { ...base, design: { ...base.design, fields: [...nine, { binding: "meta.custom", label: "כתובת" }] } };
    expect(fieldsOver(draft)).toBe(0);
    const rebased = rebaseEdits(base, draft, fresh);
    expect(rebased.design.fields).toHaveLength(11);
    expect(fieldsOver(rebased)).toBe(1);
  });

  it("keeps a field the owner changed even where the fresh card dropped it", () => {
    const draft = { ...SAVED, design: { ...SAVED.design, fields: [FIELDS[0], { ...FIELDS[1], label: "ביקורים" }, FIELDS[2]] } };
    const fresh = { ...SAVED, design: { ...SAVED.design, fields: [FIELDS[0], FIELDS[2]] } };
    expect(rebaseEdits(SAVED, draft, fresh).design.fields?.map((f) => f.binding)).toEqual([
      "person.displayName",
      "members.member.points",
      "universal.info",
    ]);
  });
});
