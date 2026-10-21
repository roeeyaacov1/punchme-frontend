import { describe, expect, it } from "vitest";
import type { CustomerListItem } from "../../api/loyalty";
import { matchesSearch, nationalNumber, phoneForDisplay } from "./customerSearch";

function customer(over: Partial<CustomerListItem> = {}): CustomerListItem {
  return {
    card_id: "card-1",
    customer_display_name: "נועה כהן",
    customer_phone: "+972500009242",
    stamp_count: 3,
    stamps_required: 8,
    status: "active",
    template_name: "כרטיסיית קפה",
    created_at: "2026-10-01T09:00:00Z",
    ...over,
  };
}

describe("nationalNumber", () => {
  it("turns the country code back into the trunk zero", () => {
    expect(nationalNumber("+972500009242")).toBe("0500009242");
    expect(nationalNumber("00972500009242")).toBe("0500009242");
  });

  it("reads a number the way it is said, dashes and spaces and all", () => {
    expect(nationalNumber("050-000-9242")).toBe("0500009242");
    expect(nationalNumber("+972 50 000 9242")).toBe("0500009242");
  });

  it("keeps one zero when the trunk zero was typed after the code", () => {
    expect(nationalNumber("+972 050-000-9242")).toBe("0500009242");
  });

  it("leaves a fragment as typed, so the last four digits still find a number", () => {
    expect(nationalNumber("9242")).toBe("9242");
    expect(nationalNumber("500009242")).toBe("500009242");
  });

  it("is empty for the country code alone, rather than matching every zero", () => {
    expect(nationalNumber("+972")).toBe("");
    expect(nationalNumber("")).toBe("");
  });
});

describe("phoneForDisplay", () => {
  it("shows a mobile number as an Israeli reads it", () => {
    expect(phoneForDisplay("+972500009242")).toBe("050-000-9242");
  });

  it("shows a landline with its two-digit area code", () => {
    expect(phoneForDisplay("+97231234567")).toBe("03-123-4567");
  });

  it("leaves anything that isn't a whole Israeli number as stored", () => {
    expect(phoneForDisplay("+447700900123")).toBe("+447700900123");
    expect(phoneForDisplay("12345")).toBe("12345");
  });
});

describe("matchesSearch", () => {
  const noa = customer();

  it("finds the stored +972 number however it is typed", () => {
    for (const typed of ["050-000-9242", "0500009242", "+972 50 000 9242", "500009242", "9242"]) {
      expect(matchesSearch(noa, typed)).toBe(true);
    }
  });

  it("does not find a different number", () => {
    expect(matchesSearch(noa, "050-000-9243")).toBe(false);
  });

  it("finds a name in part, ignoring case and accents", () => {
    expect(matchesSearch(noa, "נועה")).toBe(true);
    expect(matchesSearch(customer({ customer_display_name: "José María" }), "jose")).toBe(true);
    expect(matchesSearch(customer({ customer_display_name: "Bartholomew" }), "BART")).toBe(true);
  });

  it("still finds the card by its name", () => {
    expect(matchesSearch(noa, "קפה")).toBe(true);
  });

  it("matches everyone on an empty search", () => {
    expect(matchesSearch(noa, "   ")).toBe(true);
  });

  it("never matches a number against a customer who left none", () => {
    expect(matchesSearch(customer({ customer_phone: null }), "050")).toBe(false);
  });
});
