import { useEffect, useState } from "react";
import { DRAFT_KEY, type OnboardingDraft } from "./draft";

/** The wizard's own key, written and taken away again to see whether this
 * phone's storage takes a write at all. Never the draft's keys. */
const CHECK_KEY = "punchme.onboardingStorageCheck";

export type StorageVerdict = "kept" | "full";

/**
 * Whether a reload would lose what is on screen. `probe` is whether a write
 * of the wizard's own key went through; `stored` the draft as storage holds
 * it now; `written` the draft as it was last written, or null before the
 * owner has changed anything. Storage that refuses the probe, or still holds
 * an older draft than the one written, is full: the draft lives in memory
 * only (`draft.ts` falls back to it without a word).
 */
export function storageVerdict({
  probe,
  stored,
  written,
}: {
  probe: boolean;
  stored: string | null;
  written: string | null;
}): StorageVerdict {
  if (!probe) return "full";
  if (written !== null && stored !== written) return "full";
  return "kept";
}

function probeWrite(): boolean {
  try {
    window.localStorage.setItem(CHECK_KEY, String(Date.now()));
    window.localStorage.removeItem(CHECK_KEY);
    return true;
  } catch {
    return false;
  }
}

function storedDraft(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

/**
 * True while this phone isn't keeping the wizard's draft. Checked as it
 * mounts and whenever the picture reports it couldn't be kept (a write of
 * the wizard's own key), and after every change: the draft read back,
 * since `DraftContext` doesn't report a failed write, and the wizard's key
 * written again, so a warning goes with the first change that is kept once
 * the phone has room again, not only on the next screen.
 */
export function useStorageFull(draft: OnboardingDraft, artPersisted: boolean): boolean {
  const [probe, setProbe] = useState(true);
  const [readBack, setReadBack] = useState<{ stored: string | null; written: string | null }>({
    stored: null,
    written: null,
  });

  useEffect(() => {
    setProbe(probeWrite());
  }, [artPersisted]);

  // Read back on the next tick, once the provider's own save has run (its
  // effect, a parent's, runs after this one), and judged against the draft
  // that save wrote, so a keystroke never reads as a failure in between.
  useEffect(() => {
    const written = draft.updatedAt ? JSON.stringify(draft) : null;
    const id = window.setTimeout(() => {
      if (written !== null) setProbe(probeWrite());
      setReadBack({ written, stored: written === null ? null : storedDraft() });
    }, 0);
    return () => window.clearTimeout(id);
  }, [draft]);

  return storageVerdict({ probe, ...readBack }) === "full";
}
