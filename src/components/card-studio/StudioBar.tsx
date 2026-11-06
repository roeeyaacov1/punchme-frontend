import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge } from "../kit/Badge";
import { Button } from "../kit/Button";
import { linkText } from "../kit/classes";
import { useReducedMotion } from "../kit/motion";

export interface StudioBarProps {
  /** How many kinds of thing changed. */
  changes: number;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  /** A save that failed, in words, said under Save. */
  problem?: ReactNode;
  /** The draft came back from an earlier visit. */
  kept?: boolean;
  /** Fields in Wallet details the layout can't place. */
  fieldProblems?: number;
  onFieldProblems?: () => void;
  /** Passes in wallets were built by an older version: one save updates
   * them, even with nothing changed. */
  stale?: boolean;
  /** What the changes are, when the page says it otherwise: a catalog look
   * is on no customer's card. */
  sentence?: string;
  /** A drawing of the draft failed, and the stage shows the saved card: said
   * here too where a tray covers what the stage says, with the way to try
   * again. */
  onRedraw?: () => void;
  /** At a tray's foot, where the wallet draws the design options: once large
   * text leaves the bar narrower than 16rem, it is one row, the count of
   * changes as a badge, then Save, so the tray keeps room to scroll
   * (brief §6.9). */
  compact?: boolean;
}

/** Below this width, in rem, a compact bar stands in one row. */
const ONE_ROW_REM = 16;

/** Whether an element is narrower than `rem`, as text size and the screen
 * change it. */
function useNarrow(on: boolean, rem: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!on || !element) {
      setNarrow(false);
      return;
    }
    const measure = () => {
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setNarrow(element.clientWidth / root < rem);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [on, rem]);
  return [ref, narrow] as const;
}

/** A drawing of the draft failed: said at the bar's top, with the way to try
 * again. It lights on when the failure comes while the bar is up (the gentle
 * fade with reduced motion); a bar that opens with it says it at once. */
function RedrawLine({ onRedraw, saving, arrive }: { onRedraw: () => void; saving: boolean; arrive: boolean }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [lights] = useState(arrive);
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-sm leading-snug text-ink-muted",
        lights && (reduced ? "animate-gentle-in" : "animate-lights-on"),
      )}
    >
      <Info aria-hidden className="mt-px size-4 shrink-0" />
      <span>
        {t("studio.drawn.failedBar")}{" "}
        <button type="button" onClick={onRedraw} disabled={saving} className={cn(linkText, "text-start")}>
          {t("studio.drawn.retry")}
        </button>
      </span>
    </p>
  );
}

/**
 * Save, always in reach and saying what it does: "2 changes · not on
 * customers' cards yet", the one coral button, and a quiet "Discard changes"
 * that asks nothing, since the saved card is still there to go back to.
 *
 * Save goes busy in place (the kit's `busy`: same width, focus kept), and
 * the line over it says it is saving, once, to a screen reader too; the
 * studio holds still meanwhile. A failure is said under it, in words and an
 * icon, and announced where it happened; focus stays on Save.
 */
export const StudioBar = forwardRef<HTMLButtonElement, StudioBarProps>(function StudioBar(
  {
    changes,
    saving,
    onSave,
    onDiscard,
    problem,
    kept,
    fieldProblems = 0,
    onFieldProblems,
    stale,
    sentence,
    onRedraw,
    compact = false,
  },
  saveRef,
) {
  const { t } = useTranslation();
  const updateOnly = changes === 0 && !!stale;
  const [box, narrow] = useNarrow(compact, ONE_ROW_REM);
  // Up since its first frame: a line that comes after this is news.
  const [settled, setSettled] = useState(false);
  useEffect(() => setSettled(true), []);
  const oneRow = narrow && changes > 0;
  if (oneRow) {
    return (
      <div ref={box} className="flex flex-col gap-2">
        <p role="status" className="sr-only">
          {saving ? t("studio.bar.saving") : ""}
        </p>
        {onRedraw && <RedrawLine onRedraw={onRedraw} saving={saving} arrive={settled} />}
        <div className="flex items-center gap-2">
          {/* Discard waits in the bar under the page, a tray's close away. */}
          <Badge>{t("studio.bar.count", { count: changes })}</Badge>
          <Button ref={saveRef} busy={saving} onClick={onSave} className="ms-auto max-w-full !whitespace-normal text-center">
            {t("studio.save")}
          </Button>
        </div>
        {problem && (
          <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
            <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
            <span>{problem}</span>
          </p>
        )}
      </div>
    );
  }
  return (
    <div ref={box} className="flex flex-col gap-2">
      {/* There before it speaks, so the words are read when they come. */}
      <p role="status" className="sr-only">
        {saving ? t("studio.bar.saving") : ""}
      </p>
      {kept && changes > 0 && <p className="text-sm leading-snug text-ink-muted">{t("studio.kept")}</p>}
      {onRedraw && <RedrawLine onRedraw={onRedraw} saving={saving} arrive={settled} />}
      {saving ? (
        <p className="type-label text-ink">{t("studio.bar.saving")}</p>
      ) : changes > 0 ? (
        <p className="type-label text-ink">{sentence ?? t("studio.bar.changes", { count: changes })}</p>
      ) : (
        updateOnly && <p className="type-label text-ink">{t("studio.sync.stale")}</p>
      )}
      {fieldProblems > 0 && onFieldProblems && (
        <button
          type="button"
          onClick={onFieldProblems}
          disabled={saving}
          className={cn(linkText, "w-fit text-start text-sm")}
        >
          {t("studio.check.fieldsBar", { count: fieldProblems })}
        </button>
      )}
      {(changes > 0 || updateOnly || problem) && (
        // Each label wraps, and Save drops under Discard, rather than run off
        // a phone at 200% text.
        <div className="flex flex-wrap items-center gap-2">
          {changes > 0 && (
            <Button
              variant="quiet"
              onClick={onDiscard}
              disabled={saving}
              className="max-w-full shrink !whitespace-normal text-center"
            >
              {t("studio.bar.discard")}
            </Button>
          )}
          <Button
            ref={saveRef}
            busy={saving}
            onClick={onSave}
            className="ms-auto min-w-[7rem] max-w-full !whitespace-normal text-center"
          >
            {updateOnly ? t("studio.sync.update") : t("studio.save")}
          </Button>
        </div>
      )}
      {problem && (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
          <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
          <span>{problem}</span>
        </p>
      )}
    </div>
  );
});
