import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { focusRing } from "../marketing/primitives";
import logo from "../../assets/logo.png";

/** The thin bar over the wizard and the sign-in page: the mark home, the
 * language switch every layout has, and — when signed out — a way to sign
 * in. Nothing else competes with the panel below it. */
export function TopBar({ showSignIn = false }: { showSignIn?: boolean }) {
  const { t, i18n } = useTranslation();
  return (
    <header className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4 sm:max-w-lg sm:px-0">
      <Link to="/" className={cn("inline-flex min-h-[44px] items-center rounded-lg", focusRing)}>
        <img src={logo} alt={t("app.name")} className="h-7 w-auto" />
      </Link>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he")}
          className={cn(
            "inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink",
            focusRing,
          )}
        >
          {t("language.switch")}
        </button>
        {showSignIn && (
          <Link
            to="/login"
            className={cn(
              "inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink",
              focusRing,
            )}
          >
            {t("landing.nav.signIn")}
          </Link>
        )}
      </div>
    </header>
  );
}
