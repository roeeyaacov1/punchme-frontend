/**
 * This browser's own random id, for referral attribution.
 *
 * A friend scans a member's card today and joins next week; the only thing
 * that ties the two together is a value this browser kept in the meantime.
 * It identifies nothing — a random string minted here, sent as-is, and
 * hashed with a server-side key before it is stored — and it is optional by
 * design: a chat app's in-app browser may keep no storage at all, in which
 * case the join is attributed to the card whose page it came from and the
 * device-based fraud rules simply do not apply.
 */

export const DEVICE_ID_KEY = "punchme.deviceId";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const ID_SHAPE = /^[A-Za-z0-9_-]{16,64}$/;

function mint(): string {
  const bytes = new Uint8Array(16);
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The stored id, minting one on first use. `null` when storage is
 * unavailable or refuses the write — never a throw, never a made-up value
 * that would not survive to the next visit. */
export function getDeviceId(storage: StorageLike | null | undefined): string | null {
  if (!storage) return null;
  try {
    const existing = storage.getItem(DEVICE_ID_KEY);
    if (existing && ID_SHAPE.test(existing)) return existing;
    const fresh = mint();
    storage.setItem(DEVICE_ID_KEY, fresh);
    return storage.getItem(DEVICE_ID_KEY) === fresh ? fresh : null;
  } catch {
    return null;
  }
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/** Convenience for components: the real browser's storage. */
export function currentDeviceId(): string | null {
  return getDeviceId(browserStorage());
}
