import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { CardTemplateIn } from "../../api/businesses";
import { getPresets, getPublicStickers, type Preset } from "../../api/presets";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";
import { studioStickers, type StudioStickers } from "../../components/card-studio/designOptions";
import { looksOffered } from "./looks";
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
  /** The picture behind a picture stamp, if we still have it. */
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
  /** The wallet's stickers, as the public list gives them. */
  stickers: StudioStickers;
  /** The wizard opens on the card looks: the road's fifth stop, `/look`.
   * True while they are offered, and for a draft that already has one. */
  looks: boolean;
  /** Whether it is known yet. Until it is, no screen is shown. */
  looksSettled: boolean;
}

export const DraftContext = createContext<DraftContextValue | null>(null);

/** How long the wizard waits to learn whether it opens on the looks. Past
 * it, the wizard is today's for this tab: a list that doesn't answer is a
 * list that says no (card looks, brief §7.1). */
const LOOKS_PATIENCE_MS = 4000;

/** A call that gives up at the wizard's patience, or when its query does. */
async function patiently<T>(signal: AbortSignal, call: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const control = new AbortController();
  const stop = () => control.abort();
  signal.addEventListener("abort", stop);
  const timer = window.setTimeout(stop, LOOKS_PATIENCE_MS);
  try {
    return await call(control.signal);
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", stop);
  }
}

export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";

  // Hydrated synchronously so the forward guard never sees an empty draft on
  // a reload.
  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft() ?? emptyDraft());
  const [art, setArtState] = useState<StoredArt | null>(() => loadArt());
  const [artPersisted, setArtPersisted] = useState(true);
  const [previewOverride, setPreviewOverride] = useState<CardPreviewValue | null>(null);

  const presetsRead = useQuery({
    queryKey: ["presets"],
    queryFn: () => getPresets(),
    staleTime: Infinity,
  });
  const presets = presetsRead.data;

  // The public list, apart from the studio's (`["stickers"]`, a business's).
  // Asked once, and never again on a failure: the wizard doesn't wait.
  const stickersRead = useQuery({
    queryKey: ["stickers", "public"],
    queryFn: ({ signal }) => patiently(signal, (call) => getPublicStickers(call)),
    select: (list) => ({ available: list.available, stickers: list.stickers.map(({ name, url }) => ({ name, image: url })) }),
    staleTime: Infinity,
    retry: false,
  });
  const stickers = useMemo(
    () => studioStickers({ data: stickersRead.data, isError: stickersRead.isError }),
    [stickersRead.data, stickersRead.isError],
  );

  // Whether the wizard opens on the looks, decided once for the tab, as soon
  // as it can be known: when the list has answered (or failed), and the
  // catalog too where the list said yes. Or at the wizard's patience, with
  // what is known by then. Never changed after, so the road doesn't move
  // under the owner.
  const [patienceOver, setPatienceOver] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPatienceOver(true), LOOKS_PATIENCE_MS);
    return () => window.clearTimeout(timer);
  }, []);
  const knowable =
    !stickersRead.isPending && (!presetsRead.isPending || stickersRead.data?.available !== true);
  const offered = useRef<boolean | null>(null);
  if (offered.current === null && (knowable || patienceOver)) {
    offered.current = looksOffered(stickersRead.data?.available, presets);
  }
  const looksSettled = offered.current !== null;
  const looks = looksSettled && (offered.current === true || !!draft.look);

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
    () => previewOverride ?? draftPreviewValue(resolved, lang, t, artUrl, templateInput.name),
    [previewOverride, resolved, lang, t, artUrl, templateInput.name],
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
    stickers,
    looks,
    looksSettled,
  };

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}
