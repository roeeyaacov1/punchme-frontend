import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { focusRing, LinkButton } from "../kit";
import { cn } from "../../lib/cn";
import { LanguageSwitch } from "../../routes/public/LanguageSwitch";
import logo from "../../assets/logo.png";
import { column } from "./column";

/**
 * The thin bar over the wizard: the mark home at the start; at the end, a
 * quiet way to sign in while signed out, and the other language, named in
 * itself (Phase 8's `LanguageSwitch`). Nothing else competes with the
 * question below it, and none of it is a stop on the road. With large text
 * the two links wrap under the mark rather than push it off the screen.
 */
export function TopBar({ showSignIn = false }: { showSignIn?: boolean }) {
  const { t } = useTranslation();
  return (
    <header className={cn(column, "flex min-h-16 flex-wrap items-center justify-between gap-x-2")}>
      {/* The mark dims under a finger, on the kit's press timing: the tap's
          own flash is off in the wizard. */}
      <Link
        to="/"
        className={cn(
          "inline-flex min-h-11 items-center rounded-lg transition-opacity duration-press ease-out-strong active:opacity-70",
          focusRing,
        )}
      >
        <img src={logo} alt={t("app.name")} className="logo-mark h-7 w-auto" />
      </Link>
      <div className="-me-3 ms-auto flex flex-wrap items-center justify-end">
        {showSignIn && (
          <LinkButton to="/login" variant="quiet">
            {t("auth.signInCta")}
          </LinkButton>
        )}
        <LanguageSwitch />
      </div>
    </header>
  );
}
