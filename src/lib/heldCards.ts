/**
 * The cards this browser has been shown as its own.
 *
 * The page behind the wallet QR (`/p/<token>`) cannot tell the card's
 * holder from a stranger: the server sees a token and, at most, a shop's
 * signed-in staff. What it can do is ask the browser. Every time a card is
 * shown to its holder — the join's success screen, the card page under the
 * pass — the token that QR carries is remembered here against the serial
 * that opens the card, and `/p/<token>` then says "this is your card"
 * instead of inviting the holder to join it.
 *
 * Best effort by design: a chat app's in-app browser, a cleared site, or a
 * different phone all forget, and the page simply falls back to what the
 * server said. The token grants nothing (it is printed on the pass), and
 * the serial stored beside it is the holder's own.
 */

export const HELD_CARDS_KEY = "punchme.heldCards";

/** The most recent cards kept; a browser is one person's, not a shop's. */
export const HELD_CARDS_MAX = 20;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{6,128}$/;

function readAll(storage: StorageLike): Record<string, string> {
  try {
    const raw = storage.getItem(HELD_CARDS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [token, serial] of Object.entries(parsed as Record<string, unknown>)) {
      if (TOKEN_SHAPE.test(token) && typeof serial === "string" && serial) out[token] = serial;
    }
    return out;
  } catch {
    return {};
  }
}

/** Remember that this browser's person holds the card behind `token`.
 * Never throws: storage that is missing or refuses the write is the same
 * as a browser that forgot. */
export function rememberHeldCard(
  storage: StorageLike | null | undefined,
  token: string | null | undefined,
  serial: string | null | undefined,
): void {
  if (!storage || !token || !serial || !TOKEN_SHAPE.test(token)) return;
  try {
    const all = readAll(storage);
    delete all[token]; // re-insert, so the newest is last
    all[token] = serial;
    const entries = Object.entries(all).slice(-HELD_CARDS_MAX);
    storage.setItem(HELD_CARDS_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* forgotten, which is allowed */
  }
}

/** The serial of the holder's card behind `token`, if this browser has
 * been shown it; `null` otherwise. */
export function heldCardSerial(
  storage: StorageLike | null | undefined,
  token: string | null | undefined,
): string | null {
  if (!storage || !token) return null;
  return readAll(storage)[token] ?? null;
}

/** The real browser's storage, or `null` where there is none. */
export function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
