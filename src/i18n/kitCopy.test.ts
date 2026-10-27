import { describe, expect, it } from "vitest";
import en from "./locales/en/common.json";
import he from "./locales/he/common.json";

/**
 * The copy the redesign's kit and style guide add, and the pages it has
 * rebuilt whole, checked in both languages at once: every key that exists
 * in one exists in the other, and every counted string has the plural
 * forms its language needs. A missing Hebrew key doesn't fail anything
 * else — the page just prints the key.
 */

type Tree = { [key: string]: string | Tree };

const PLURAL = /_(zero|one|two|few|many|other)$/;
const NAMESPACES = ["kit", "styleGuide", "standee", "messaging", "referrals", "team", "billing", "auth"] as const;
const SINGLE_KEYS = ["common.close", "language.he", "language.en"] as const;

/** Leaf paths under a subtree, each mapped to the plural forms it carries. */
function forms(tree: unknown, prefix: string, out = new Map<string, Set<string>>()) {
  if (!tree || typeof tree !== "object") return out;
  for (const [key, value] of Object.entries(tree as Tree)) {
    const path = `${prefix}.${key}`;
    if (typeof value === "string") {
      const plural = key.match(PLURAL);
      const base = plural ? path.slice(0, -plural[0].length) : path;
      const set = out.get(base) ?? new Set<string>();
      set.add(plural ? plural[1] : "");
      out.set(base, set);
    } else {
      forms(value, path, out);
    }
  }
  return out;
}

function leaf(tree: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (node, key) => (node && typeof node === "object" ? (node as Tree)[key] : undefined),
    tree,
  );
}

function strings(tree: unknown, prefix: string): [string, string][] {
  if (!tree || typeof tree !== "object") return [];
  return Object.entries(tree as Tree).flatMap(([key, value]) =>
    typeof value === "string" ? [[`${prefix}.${key}`, value]] : strings(value, `${prefix}.${key}`),
  );
}

describe.each(NAMESPACES)("the %s copy", (namespace) => {
  const english = forms(leaf(en, namespace), namespace);
  const hebrew = forms(leaf(he, namespace), namespace);

  it("has the same keys in English and Hebrew", () => {
    expect([...hebrew.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it("gives every counted string its plural forms in both languages", () => {
    for (const [key, englishForms] of english) {
      if (englishForms.has("")) continue;
      expect([...englishForms].sort(), key).toEqual(["one", "other"]);
      expect([...(hebrew.get(key) ?? [])].sort(), key).toEqual(["many", "one", "other", "two"]);
    }
  });

  it("has no empty strings", () => {
    for (const [key, value] of [...strings(leaf(en, namespace), namespace), ...strings(leaf(he, namespace), namespace)]) {
      expect(value.trim(), key).not.toBe("");
    }
  });
});

/**
 * The owner pages' and the public pages' Hebrew, where a one-letter prefix
 * before a Latin word ("ב-Stripe", "ה-QR") takes a word joiner after its
 * hyphen: without it a line can break there and leave the prefix alone at
 * the end of a line.
 */
const JOINED = ["team", "billing", "auth"] as const;

describe.each(JOINED)("the %s Hebrew", (namespace) => {
  it("keeps a prefix with the Latin word after it", () => {
    for (const [key, value] of strings(leaf(he, namespace), namespace)) {
      expect(value, key).not.toMatch(/[א-ת]-[A-Za-z]/);
    }
  });
});

describe("the kit's single keys", () => {
  it.each(SINGLE_KEYS)("%s is in Hebrew wherever it is in English", (path) => {
    if (leaf(en, path) === undefined) return;
    expect(typeof leaf(he, path), path).toBe("string");
  });
});
