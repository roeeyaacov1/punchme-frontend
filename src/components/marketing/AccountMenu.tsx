import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { cn } from "../../lib/cn";
import { focusRing, focusRingInset } from "../kit";
import { noTapFlash } from "../kit/classes";
import { signedInAs } from "./signedInAs";

/**
 * The signed-in owner's corner of the landing header: their initial, and
 * behind it the one thing this page can still do for them — sign out.
 *
 * A disclosure, not a `role="menu"`. There is one item, so `aria-expanded`
 * on the button says everything a menu's arrow keys would, and Tab reaches
 * the item on its own because it follows the button in the DOM. It is an
 * overlay, so it is the one thing on the page that lifts.
 */
export function AccountMenu({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Pointerdown rather than click: the panel should be gone by the time the
  // thing underneath reacts, and a drag that starts outside counts as away.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  // The first character, not the first UTF-16 unit, so a name that opens
  // with an emoji or another astral letter shows it whole.
  const initial = (Array.from(user.first_name.trim() || user.email)[0] ?? "").toUpperCase();

  return (
    // Stretched to the header row's full height on purpose: it makes
    // `top-full` the bottom of the header rather than the bottom of the
    // avatar, so the panel clears the header's edge instead of crossing it.
    <div ref={wrapRef} className={cn("relative items-center self-stretch", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="landing-account-menu"
        aria-label={t("dashboard.groups.account")}
        className={cn("inline-flex size-11 items-center justify-center rounded-full", noTapFlash, focusRing)}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-9 items-center justify-center rounded-full border bg-surface font-heading text-sm font-medium text-ink transition-colors duration-gentle ease-out",
            open ? "border-field" : "border-border-strong",
          )}
        >
          {initial}
        </span>
      </button>

      {open && (
        <div
          id="landing-account-menu"
          className="absolute end-0 top-full z-50 mt-2 w-64 rounded-panel border border-border bg-surface p-1.5 shadow-panel-lift"
        >
          <p className="truncate px-3 py-2 text-sm text-ink-muted">{signedInAs(t, user.email)}</p>
          <div aria-hidden className="mx-2 mb-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className={cn(
              "flex min-h-11 w-full items-center gap-2 rounded-field px-3 text-start font-heading text-base font-medium text-ink transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
              noTapFlash,
              focusRingInset,
            )}
          >
            <LogOut aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
            {t("dashboard.nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
