import { useLayoutEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { CircleUserRound, Languages, LayoutDashboard, LogOut } from "lucide-react";
import { Badge, Button, focusRing, List, ListRow, Sheet } from "../../components/kit";
import { useAuth } from "../../auth/useAuth";
import { usePublicGround } from "../../theme/usePublicGround";
import { cn } from "../../lib/cn";
import logo from "../../assets/logo.png";

/**
 * The staff area's frame, on Lightbox by day only: the admin area has no
 * night. Deliberately not `DashboardLayout`: a staff account doesn't
 * necessarily own a business, and nothing here reads one.
 *
 * A bar on the wall, the mark and the "Staff" tag at its start and the
 * account at its end. The email lives in the account sheet, never in the
 * bar, where one long address pushed a phone's page wider than its screen.
 * The bar runs the window's width; the pages stand in one column of at
 * most 1120px under it.
 */
export function AdminLayout() {
  const { t } = useTranslation();
  usePublicGround();
  useNoGlide();
  const [account, setAccount] = useState(false);
  const accountButton = useRef<HTMLButtonElement>(null);

  return (
    <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink [-webkit-tap-highlight-color:transparent] [&_button]:select-none">
      <a
        href="#admin-main"
        className={cn(
          "type-label sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2.5",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>
      <header className="flex min-h-16 w-full flex-wrap items-center justify-between gap-x-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* The mark dims under a finger, on the kit's press timing. */}
          <Link
            to="/admin"
            className={cn(
              "inline-flex min-h-11 items-center rounded-lg transition-opacity duration-press ease-out-strong active:opacity-70",
              focusRing,
            )}
          >
            <img src={logo} alt={t("admin.title")} className="logo-mark h-7 w-auto" />
          </Link>
          <Badge tone="brand">{t("admin.badge")}</Badge>
        </div>
        <Button
          ref={accountButton}
          variant="quiet"
          icon={<CircleUserRound aria-hidden />}
          aria-haspopup="dialog"
          aria-expanded={account}
          onClick={() => setAccount(true)}
          className="-me-3 ms-auto"
        >
          {t("dashboard.groups.account")}
        </Button>
      </header>
      <main id="admin-main" tabIndex={-1} className="mx-auto flex w-full max-w-[70rem] flex-1 flex-col px-4 pb-12 pt-2 outline-none sm:px-6">
        <Outlet />
      </main>
      <AdminAccountSheet open={account} onClose={() => setAccount(false)} returnFocus={accountButton} />
    </div>
  );
}

/**
 * No scroll the area makes is a glide, as in the dashboard's shell
 * (`useShellViewport`): `<html>` takes `scroll-behavior: auto` over the
 * landing page's smooth scroll while the area is mounted. Staff move about
 * a long list many times a day, much of it by keyboard: a Tab that brings a
 * row into view, a jump from the trades' index, focus put back on a look
 * that moved. Each lands at once.
 */
function useNoGlide() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const saved = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = saved;
    };
  }, []);
}

/** Who is signed in, the other language, the way back to the app, and the
 * way out: the dashboard's account sheet, without what only a business has. */
function AdminAccountSheet({
  open,
  onClose,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  returnFocus: React.RefObject<HTMLElement>;
}) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const other = i18n.resolvedLanguage === "he" ? "en" : "he";
  return (
    <Sheet open={open} onClose={onClose} title={t("dashboard.groups.account")} returnFocus={returnFocus}>
      <div className="flex flex-col gap-6">
        <p className="type-body text-ink">
          {/* An address is one unbroken run: it breaks anywhere rather than
              push the sheet wider, and keeps its own order inside Hebrew. */}
          <Trans
            i18nKey="invite.signedInAs"
            values={{ email: user?.email ?? "" }}
            components={{ email: <bdi dir="ltr" className="font-semibold [overflow-wrap:anywhere]" /> }}
          />
        </p>
        {/* Each row's words may wrap: the kit's row keeps one line and
            cuts the rest, and with large text on a phone "Back to app" in
            Hebrew is wider than the sheet. */}
        <List className="-mx-6 border-y border-border">
          <ListRow
            onClick={() => void i18n.changeLanguage(other)}
            leading={<Languages aria-hidden className="size-5 text-ink-muted" />}
            // The other language's own name, in its own language.
            title={
              <span lang={other} className="whitespace-normal [overflow-wrap:anywhere]">
                {t("language.switch")}
              </span>
            }
          />
          <ListRow
            to="/dashboard"
            leading={<LayoutDashboard aria-hidden className="size-5 text-ink-muted" />}
            title={<span className="whitespace-normal [overflow-wrap:anywhere]">{t("admin.backToApp")}</span>}
            chevron
          />
          <ListRow
            onClick={logout}
            leading={<LogOut aria-hidden className="size-5 text-ink-muted rtl:-scale-x-100" />}
            title={<span className="whitespace-normal [overflow-wrap:anywhere]">{t("dashboard.nav.signOut")}</span>}
          />
        </List>
      </div>
    </Sheet>
  );
}
