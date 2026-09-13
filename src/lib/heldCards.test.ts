import { describe, expect, it } from "vitest";
import { HELD_CARDS_KEY, HELD_CARDS_MAX, heldCardSerial, rememberHeldCard } from "./heldCards";

function memory(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    dump: () => map.get(HELD_CARDS_KEY),
  };
}

describe("heldCards", () => {
  it("knows nothing until a card is shown", () => {
    expect(heldCardSerial(memory(), "Zk3yQ9wXb2vLp7Rt4Nm8sA")).toBeNull();
  });

  it("answers with the serial once the card has been shown", () => {
    const storage = memory();
    rememberHeldCard(storage, "Zk3yQ9wXb2vLp7Rt4Nm8sA", "PM-1111-2222-3333");

    expect(heldCardSerial(storage, "Zk3yQ9wXb2vLp7Rt4Nm8sA")).toBe("PM-1111-2222-3333");
    expect(heldCardSerial(storage, "AnotherTokenEntirely00")).toBeNull();
  });

  it("keeps several cards and forgets the oldest past the cap", () => {
    const storage = memory();
    for (let i = 0; i < HELD_CARDS_MAX + 3; i += 1) {
      rememberHeldCard(storage, `token-${String(i).padStart(3, "0")}`, `serial-${i}`);
    }

    expect(heldCardSerial(storage, "token-000")).toBeNull();
    expect(heldCardSerial(storage, "token-002")).toBeNull();
    expect(heldCardSerial(storage, "token-003")).toBe("serial-3");
    expect(heldCardSerial(storage, `token-${String(HELD_CARDS_MAX + 2).padStart(3, "0")}`)).toBe(
      `serial-${HELD_CARDS_MAX + 2}`,
    );
  });

  it("re-showing a card moves it to the newest slot", () => {
    const storage = memory();
    rememberHeldCard(storage, "token-first-000000", "serial-first");
    rememberHeldCard(storage, "token-second-00000", "serial-second");
    rememberHeldCard(storage, "token-first-000000", "serial-first");

    expect(Object.keys(JSON.parse(storage.dump()!))).toEqual([
      "token-second-00000",
      "token-first-000000",
    ]);
  });

  it("ignores garbage in storage and values that are not tokens", () => {
    const storage = memory({ [HELD_CARDS_KEY]: "not json" });
    expect(heldCardSerial(storage, "Zk3yQ9wXb2vLp7Rt4Nm8sA")).toBeNull();

    rememberHeldCard(storage, "has spaces in it", "serial");
    rememberHeldCard(storage, "", "serial");
    rememberHeldCard(storage, "Zk3yQ9wXb2vLp7Rt4Nm8sA", "");
    expect(storage.dump()).toBe("not json");

    const list = memory({ [HELD_CARDS_KEY]: JSON.stringify(["Zk3yQ9wXb2vLp7Rt4Nm8sA"]) });
    expect(heldCardSerial(list, "Zk3yQ9wXb2vLp7Rt4Nm8sA")).toBeNull();
  });

  it("never throws without storage or with storage that refuses", () => {
    expect(heldCardSerial(null, "Zk3yQ9wXb2vLp7Rt4Nm8sA")).toBeNull();
    expect(() => rememberHeldCard(null, "Zk3yQ9wXb2vLp7Rt4Nm8sA", "serial")).not.toThrow();
    const refusing = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => rememberHeldCard(refusing, "Zk3yQ9wXb2vLp7Rt4Nm8sA", "serial")).not.toThrow();
  });
});
