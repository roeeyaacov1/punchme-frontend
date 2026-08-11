import { describe, expect, it } from "vitest";
import { csvText, toCsv } from "./csv";

describe("toCsv", () => {
  it("joins plain cells without quoting", () => {
    expect(toCsv([["a", "b"], ["c", "d"]])).toBe("a,b\r\nc,d");
  });

  it("quotes cells containing a delimiter, quote, or newline", () => {
    expect(toCsv([["a,b"]])).toBe('"a,b"');
    expect(toCsv([['say "hi"']])).toBe('"say ""hi"""');
    expect(toCsv([["two\nlines"]])).toBe('"two\nlines"');
  });

  it("neutralises leading characters a spreadsheet would run as a formula", () => {
    expect(toCsv([["=HYPERLINK(\"http://evil\")"]])).toBe(
      "\"'=HYPERLINK(\"\"http://evil\"\")\"",
    );
    for (const lead of ["=", "+", "-", "@"]) {
      expect(toCsv([[`${lead}cmd`]])).toBe(`'${lead}cmd`);
    }
  });

  it("leaves an empty cell empty", () => {
    expect(toCsv([["", "x"]])).toBe(",x");
  });
});

describe("csvText", () => {
  it("keeps the leading zero of an Israeli mobile number", () => {
    expect(csvText("0501234567")).toBe("'0501234567");
  });

  it("does not turn an empty cell into a lone apostrophe", () => {
    expect(csvText("")).toBe("");
  });
});
