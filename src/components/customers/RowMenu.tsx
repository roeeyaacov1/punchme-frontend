import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { focusRing } from "../marketing/primitives";

export interface RowMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Paints the item as destructive. Nothing else changes — the confirmation
   * is the guard, not the colour. */
  danger?: boolean;
  onSelect: () => void;
}

const PANEL_WIDTH = 232;
const GAP = 6;
/** Kept off the viewport edge so the panel never sits flush against it. */
const MARGIN = 8;

/**
 * The per-row overflow menu: what an owner can do to one customer that is
 * too rare, or too destructive, to earn a button of its own in the row.
 *
 * **Portaled, and that is the whole reason this file exists.** Both shapes of
 * the roster clip: the phone list gives each card `overflow-hidden` for its
 * ready-edge, and the desktop table's panel is `overflow-x-auto` — and a box
 * that is not `visible` on one axis computes to `auto` on the other, so an
 * absolutely-positioned panel would be scrolled out of the last rows rather
 * than drawn over them. Fixed coordinates off the trigger's own rect escape
 * both, and cost a reposition on scroll — which we spend by closing instead,
 * since a menu whose row has moved is a menu aimed at the wrong person.
 *
 * A real `role="menu"`, unlike `AccountMenu`'s disclosure. That one could
 * lean on DOM order to make Tab reach its single item; a portal puts this
 * panel at the end of `<body>`, where Tab from the trigger lands nowhere
 * near it. So focus is moved deliberately — first item on open, arrows
 * between, Escape back to the trigger — and once focus is being managed the
 * menu roles are the honest description rather than an aspiration.
 */
export function RowMenu({
  label,
  items,
  disabled,
}: {
  /** Names the person, not the control: a screen reader hears "More for Dana
   * Cohen" on every row instead of forty identical "More" buttons. */
  label: string;
  items: RowMenuItem[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function close(refocus: boolean) {
    setOpen(false);
    setPos(null);
    if (refocus) buttonRef.current?.focus();
  }

  // Placed after the panel exists so its measured height decides whether it
  // hangs below the trigger or flips above it — the last row of a long
  // roster is the common case, not the edge one.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = buttonRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const height = panel.offsetHeight;
    const rtl = document.documentElement.dir === "rtl";

    // The panel's *end* edge lines up with the trigger's, so it opens back
    // over the row it belongs to rather than out past it — which is the
    // start edge in RTL and the end one in LTR.
    const ideal = rtl ? rect.left : rect.right - PANEL_WIDTH;
    const left = Math.max(
      MARGIN,
      Math.min(ideal, window.innerWidth - PANEL_WIDTH - MARGIN),
    );

    const below = rect.bottom + GAP;
    const top =
      below + height > window.innerHeight - MARGIN
        ? Math.max(MARGIN, rect.top - height - GAP)
        : below;

    setPos({ top, left });
  }, [open]);

  // Focus is taken only once the panel is really placed, and with
  // `preventScroll` — together, because either alone still bites. Before it
  // is measured the panel is laid out at the origin and merely invisible, so
  // focusing it there asks the browser to scroll a menu into view that is
  // about to move anyway; and that scroll is caught by the handler below,
  // which closes the menu on the very click that opened it.
  useEffect(() => {
    if (!open || !pos) return;
    itemRefs.current[0]?.focus({ preventScroll: true });
  }, [open, pos]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      close(false);
    }
    // Capture, because the roster scrolls inside its own panel as well as in
    // the page, and a scroll that starts inside the menu is still a scroll.
    function onScroll() {
      close(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  function onPanelKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      close(true);
      return;
    }
    // Tab is deliberately not trapped: it closes and lets focus carry on
    // through the page. A two-item menu is not worth a focus prison.
    if (e.key === "Tab") {
      close(false);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const focused = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    const step = e.key === "ArrowDown" ? 1 : -1;
    const next = (focused + step + items.length) % items.length;
    itemRefs.current[next]?.focus();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close(false) : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-40",
          open && "bg-ink/[0.06] text-ink",
          focusRing,
        )}
      >
        <MoreVertical size={16} aria-hidden />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label={label}
            onKeyDown={onPanelKeyDown}
            style={{
              // Hidden rather than moved off-screen for the measuring pass:
              // `visibility: hidden` still lays the panel out, so the effect
              // above can read a height off it, and it never paints at a
              // position it is about to leave.
              visibility: pos ? "visible" : "hidden",
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: PANEL_WIDTH,
            }}
            className="fixed z-50 rounded-xl border border-border-strong bg-surface p-1 shadow-lift"
          >
            {items.map((item, index) => (
              <button
                key={item.key}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitem"
                onClick={() => {
                  close(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 text-start text-sm font-semibold transition-colors",
                  item.danger
                    ? "text-danger hover:bg-danger-bg"
                    : "text-ink hover:bg-background",
                  focusRing,
                )}
              >
                <item.icon size={16} aria-hidden className="shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
