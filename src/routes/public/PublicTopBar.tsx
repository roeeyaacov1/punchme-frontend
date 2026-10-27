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
 */
export function PublicTopBar() {
  const { t } = useTranslation();
  return (
    <header className="mx-auto flex h-16 w-full max-w-[26rem] items-center justify-between px-4 sm:px-0">
      <Link to="/" className={cn("inline-flex min-h-11 items-center rounded-lg", focusRing)}>
        <img src={logo} alt={t("app.name")} className="logo-mark h-7 w-auto" />
      </Link>
      <LanguageSwitch className="-me-3" />
    </header>
  );
}
