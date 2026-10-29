import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Button, focusRing } from "../kit";
import { noTapFlash } from "../kit/classes";
import { column } from "./landingLayout";
import { NAV_ANCHORS } from "./SiteHeader";
import logo from "../../assets/logo.png";

const LINK = cn(
  "inline-flex min-h-11 items-center rounded-full px-1 font-heading text-[0.9375rem] font-medium text-ink-muted transition-colors duration-gentle ease-out hover-fine:text-ink",
  noTapFlash,
  focusRing,
);

/**
 * The foot of the page, on the wall like the rest: the wordmark, the page's
 * sections, sign in, the other language and the year. No Terms, Privacy or
 * Contact yet: those pages don't exist, and a link to a 404 costs more trust
 * than an absent one. A contact line comes the day there is a number to put
 * in it.
 */
export function SiteFooter() {
  const { t, i18n } = useTranslation();
  const other = i18n.resolvedLanguage === "he" ? "en" : "he";

  return (
    <footer className="mt-20 border-t border-border pb-10 pt-10 sm:mt-24 lg:mt-36">
      <div className={cn(column, "flex flex-col gap-8")}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className={cn("inline-flex min-h-11 items-center self-start rounded-full", focusRing)}>
            <img src={logo} alt={t("app.name")} className="h-7 w-auto" />
          </Link>
          <nav aria-label={t("landing.footer.productHeading")}>
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {NAV_ANCHORS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={LINK}>
                    {t(item.key)}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/login" className={LINK}>
                  {t("landing.nav.signIn")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="type-body text-ink-muted">
            <bdi dir="ltr">{t("landing.footer.copyright", { year: new Date().getFullYear() })}</bdi>
          </p>
          <Button
            variant="quiet"
            lang={other}
            onClick={() => void i18n.changeLanguage(other)}
            className="-me-3 px-3"
          >
            {t("language.switch")}
          </Button>
        </div>
      </div>
    </footer>
  );
}
