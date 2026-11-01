import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { focusRing } from "../../components/kit";
import { cn } from "../../lib/cn";
import logo from "../../assets/logo.png";
import { LanguageSwitch } from "./LanguageSwitch";

/**
 * The row over the team's pages, `/login` and `/invite`: the mark home and
 * the language, nothing else, over the same column as the panel below. The
 * wizard keeps its own `TopBar`; Phase 4 can take this one or leave it.
 *
 * It keeps to the column with large text too. From 640px the column is
 * 26rem, or the screen less its gutters where that is narrower, as at 200%
 * text on a 768px screen. Where the mark and the language don't fit side by
 * side, the language goes under the mark, as in the wizard's bar, rather
 * than squeeze the mark.
 */
export function PublicTopBar() {
  const { t } = useTranslation();
  return (
    <header className="mx-auto flex min-h-16 w-full max-w-[26rem] flex-wrap items-center justify-between px-4 sm:max-w-[min(26rem,calc(100%-2rem))] sm:px-0">
      {/* The mark dims under a finger, on the kit's press timing: the tap's
          own flash is off here. */}
      <Link
        to="/"
        className={cn(
          "inline-flex min-h-11 items-center rounded-lg transition-opacity duration-press ease-out-strong active:opacity-70",
          focusRing,
        )}
      >
        <img src={logo} alt={t("app.name")} className="logo-mark h-7 w-auto" />
      </Link>
      <LanguageSwitch className="-me-3 ms-auto" />
    </header>
  );
}
