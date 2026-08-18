import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { CardTemplateIn } from "../../api/businesses";
import { getPresets, type Preset } from "../../api/presets";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";
import {
  ART_KEY,
  DRAFT_KEY,
  buildTemplateInput,
  clearDraft,
  draftPreviewValue,
  emptyDraft,
  loadArt,
  loadDraft,
  resolveDraft,
  saveArt,
  saveDraft,
  clearArt,
  type OnboardingDraft,
  type ResolvedDraft,
  type StoredArt,
} from "./draft";

export interface DraftContextValue {
  draft: OnboardingDraft;
  /** Merge a patch into the draft; persisted on every change. */
  update: (patch: Partial<OnboardingDraft>) => void;
  /** Wipe the draft and its picture — done once the wizard is finished. */
  clear: () => void;
  /** The picture behind an emoji/image stamp, if we still have it. */
  art: StoredArt | null;
  /** Store a new picture. Returns false when it only fits in memory. */
  setArt: (art: StoredArt | null) => boolean;
  /** False after a quota failure: the picture is here, but only until the
   * tab closes. */
  artPersisted: boolean;
  hasArt: (hash: string) => boolean;
  presets: Preset[] | undefined;
  /** The draft with every blank filled by the trade's defaults. */
  resolved: ResolvedDraft;
  /** What `POST .../templates` would receive right now. */
  templateInput: CardTemplateIn;
  /** What the phone shows — the draft, unless a later step has something
   * truer (the wallet step swaps in the published card once it exists). */
  preview: CardPreviewValue;
  setPreviewOverride: (value: CardPreviewValue | null) => void;
  /** The current picture's data URL, when the stamp is a picture. */
  artUrl: string | undefined;
}

export const DraftContext = createContext<DraftContextValue | null>(null);

export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";

  // Hydrated synchronously so the forward guard never sees an empty draft on
  // a reload.
  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft() ?? emptyDraft());
  const [art, setArtState] = useState<StoredArt | null>(() => loadArt());
  const [artPersisted, setArtPersisted] = useState(true);
  const [previewOverride, setPreviewOverride] = useState<CardPreviewValue | null>(null);

  const { data: presets } = useQuery({
    queryKey: ["presets"],
    queryFn: () => getPresets(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (draft.updatedAt) saveDraft(draft);
  }, [draft]);

  // A second tab that signed up (or cleared) must not leave this one with a
  // stale picture of the world — it would treat the owner as returning and
  // offer to discard the very design they just saved.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === DRAFT_KEY) setDraft(loadDraft() ?? emptyDraft());
      if (e.key === ART_KEY) setArtState(loadArt());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((current) => ({ ...current, ...patch, updatedAt: Date.now() }));
  }, []);

  const clear = useCallback(() => {
    clearDraft();
    setDraft(emptyDraft());
    setArtState(null);
    setPreviewOverride(null);
  }, []);

  const setArt = useCallback((next: StoredArt | null) => {
    setArtState(next);
    if (!next) {
      clearArt();
      setArtPersisted(true);
      return true;
    }
    const ok = saveArt(next);
    setArtPersisted(ok);
    return ok;
  }, []);

  const hasArt = useCallback((hash: string) => art?.hash === hash, [art]);

  const resolved = useMemo(() => resolveDraft(draft, presets, t), [draft, presets, t]);
  const templateInput = useMemo(
    () => buildTemplateInput(resolved, presets, lang, t),
    [resolved, presets, lang, t],
  );
  const artUrl =
    resolved.stamp.kind !== "glyph" && art?.hash === resolved.stamp.hash ? art.dataUrl : undefined;
  const preview = useMemo(
    () => previewOverride ?? draftPreviewValue(resolved, lang, t, artUrl),
    [previewOverride, resolved, lang, t, artUrl],
  );

  const value: DraftContextValue = {
    draft,
    update,
    clear,
    art,
    setArt,
    artPersisted,
    hasArt,
    presets,
    resolved,
    templateInput,
    preview,
    setPreviewOverride,
    artUrl,
  };

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}
