/**
 * A draft that survives a customer walking in: kept in this tab's
 * `sessionStorage` under the screen it belongs to, put back on return
 * within the tab, and dropped once it is sent, saved, removed or let go.
 *
 * Storage can be missing or refuse (a private window, a full quota, a
 * blocked site), so every touch is guarded and the screen works without it.
 */
const PREFIX = "punchme.draft:";

export function readDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Not kept, and nothing else changes.
  }
}

export function dropDraft(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to drop.
  }
}
