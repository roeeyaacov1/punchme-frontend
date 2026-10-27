import { describe, expect, it } from "vitest";
import type { DesignField } from "../../api/designs";
import {
  addableKinds,
  backState,
  changesBetween,
  kindOf,
  newField,
  nextCustomBinding,
  sampleStart,
  textColourChoice,
  withBackground,
  withFaceLabel,
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

describe("backState", () => {
  it("follows when the back says the saved reward", () => {
    expect(backState(SAVED.design, "קפה חינם", false)).toEqual({ kind: "follows" });
  });

  it("follows when the back says nothing", () => {
    const design = { fields: [{ ...FIELDS[2], default_value: "" }] };
    expect(backState(design, "קפה חינם", false)).toEqual({ kind: "follows" });
  });

  it("is left alone, and said, when the back says something else", () => {
    const design = { fields: [{ ...FIELDS[2], default_value: "קפה שמיני חינם" }] };
    expect(backState(design, "קפה חינם", false)).toEqual({ kind: "differs", text: "קפה שמיני חינם" });
  });

  it("follows once the owner asks it to", () => {
    const design = { fields: [{ ...FIELDS[2], default_value: "קפה שמיני חינם" }] };
    expect(backState(design, "קפה חינם", true)).toEqual({ kind: "follows" });
  });

  it("has nothing to follow on a card without the field", () => {
    expect(backState({ fields: FIELDS.slice(0, 2) }, "קפה חינם", false)).toEqual({ kind: "none" });
  });
});

describe("withRewardOnBack", () => {
  it("writes the new reward into the back field when it follows", () => {
    const draft = { ...SAVED, reward_description: "מאפה חינם" };
    const sent = withRewardOnBack(draft, SAVED.reward_description, false);
    expect(sent.design.fields?.find((f) => f.binding === "universal.info")?.default_value).toBe("מאפה חינם");
  });

  it("never overwrites words the back says of its own", () => {
    const design = { ...SAVED.design, fields: [FIELDS[0], { ...FIELDS[2], default_value: "קפה שמיני חינם" }] };
    const draft = { ...SAVED, design, reward_description: "מאפה חינם" };
    expect(withRewardOnBack(draft, SAVED.reward_description, false)).toBe(draft);
  });

  it("adds no field to a card that has none", () => {
    const draft = { ...SAVED, design: { fields: FIELDS.slice(0, 2) }, reward_description: "מאפה חינם" };
    expect(withRewardOnBack(draft, SAVED.reward_description, false).design.fields).toHaveLength(2);
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

describe("withFaceLabel", () => {
  it("renames a face field in place", () => {
    const fields = withFaceLabel(FIELDS, "person.displayName", "SECONDARY_FIELDS", "שם");
    expect(fields[0].label).toBe("שם");
    expect(fields).toHaveLength(3);
  });

  it("adds the field when the card has none, and drops it again when cleared", () => {
    const without = FIELDS.slice(1);
    const added = withFaceLabel(without, "person.displayName", "SECONDARY_FIELDS", "שם");
    expect(added).toHaveLength(3);
    expect(withFaceLabel(added, "person.displayName", "SECONDARY_FIELDS", "")).toHaveLength(2);
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
    const draft = { ...SAVED, design: { ...SAVED.design, fields: withFaceLabel(FIELDS, "members.member.points", "AUXILIARY_FIELDS", "ביקורים") } };
    expect(changesBetween(SAVED, draft)).toEqual(["names"]);
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

  it("counts the back asked to follow as the reward", () => {
    const design = { ...SAVED.design, fields: [FIELDS[0], FIELDS[1], { ...FIELDS[2], default_value: "קפה שמיני חינם" }] };
    const saved = { ...SAVED, design };
    expect(changesBetween(saved, saved, {}, true)).toEqual(["reward"]);
  });
});
