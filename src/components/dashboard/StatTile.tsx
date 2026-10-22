import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Figure } from "../kit/Figure";
import { LitPanel } from "../kit/LitPanel";
import { focusRingInset, linkText, noTapFlash } from "../kit/classes";
import { useReducedMotion } from "../kit/motion";
import { cn } from "../../lib/cn";

/**
 * One of the Overview's four numbers: a label, the figure, and at most one
 * line under it. The figure is printed, never counted up, and when it is
 * only the least the page can prove it says "at least" in words above it
 * rather than wearing a "+" that reads as growth.
 *
 * A tile that goes somewhere is one link round its label and figure, so the
 * line under it can be a link of its own without nesting one in the other.
 * That link is a control, so it presses like the kit's rows: the 6% ink
 * well under a finger, no wait for a double tap, and a long press neither
 * opens the link's callout nor selects its words.
 */
export function StatTile({
  label,
  value,
  floor,
  line,
  to,
  lit,
  arrive,
}: {
  label: string;
  /** Already formatted in the page's language. */
  value: string;
  /** Only the least the page can prove. */
  floor?: boolean;
  line?: ReactNode;
  to?: string;
  /** The band's light: the verdict, the dashboard's one loud surface. */
  lit?: boolean;
  /**
   * Its figures arrive by light: 240ms, rising 8px, or the 150ms fade with
   * reduced motion. Only what it says arrives, never the panel, which
   * already stood in the same place, lit the same way, as its placeholder.
   */
  arrive?: boolean;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const arriving = arrive ? (reduced ? "animate-gentle-in" : "animate-lights-on") : undefined;
  const head = (
    <>
      <span className="type-label text-ink-muted">{label}</span>
      <span className="flex flex-col">
        {floor && <span className="type-tag text-ink-muted">{t("dashboard.overview.atLeast")}</span>}
        <Figure size="stat" value={value} />
      </span>
    </>
  );
  return (
    <LitPanel light={lit ? "band" : "panel"} className="flex min-w-0 flex-col p-4 sm:p-5">
      <div className={cn("flex min-w-0 flex-col gap-2", arriving)}>
        {to ? (
          <Link
            to={to}
            className={cn(
              "-m-2 flex min-h-11 touch-manipulation select-none flex-col gap-2 rounded-field p-2 transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5 [-webkit-touch-callout:none]",
              noTapFlash,
              focusRingInset,
            )}
          >
            {head}
          </Link>
        ) : (
          <div className="flex flex-col gap-2">{head}</div>
        )}
        {line && <div className="text-sm leading-snug">{line}</div>}
      </div>
    </LitPanel>
  );
}

/** The line under a tile, as a link of its own: "28 one stamp away". */
export function TileLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={cn(linkText, "inline-flex min-h-11 items-center text-sm")}>
      {children}
    </Link>
  );
}
