import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { cn } from "../../lib/cn";
import { focusRing } from "./primitives";

/**
 * The signed-in owner's corner of the landing header: their initial, and
 * behind it the one thing this page can still do for them — sign out.
 *
 * A disclosure, not a `role="menu"`. There is one item, so `aria-expanded`
 * on the button says everything a menu's arrow keys would, and Tab reaches
 * the item on its own because it follows the button in the DOM.
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

  const initial = (user.first_name.trim() || user.email).charAt(0).toUpperCase();

  return (
    // Stretched to the header row's full height on purpose: it makes
    // `top-full` the bottom of the header rather than the bottom of the
    // avatar, so the panel clears the header's border instead of crossing it.
    <div ref={wrapRef} className={cn("relative items-center self-stretch", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="landing-account-menu"
        aria-label={t("dashboard.groups.account")}
        className={cn(
          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full",
          focusRing,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border bg-surface font-heading text-sm font-bold text-ink transition-colors",
            open ? "border-ink-subtle" : "border-border-strong",
          )}
        >
          {initial}
        </span>
      </button>

      {open && (
        <div
          id="landing-account-menu"
          className="absolute end-0 top-full z-50 mt-2 w-64 rounded-xl border border-border-strong bg-surface p-1 shadow-lift"
        >
          <p className="truncate px-3 py-2 text-xs text-ink-muted">
            {t("onboarding.account.signedInAs", { email: user.email })}
          </p>
          <div className="mx-2 mb-1 h-px bg-border" aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className={cn(
              "flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-start text-sm font-semibold text-ink transition-colors hover:bg-background",
              focusRing,
            )}
          >
            <LogOut size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            {t("dashboard.nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
