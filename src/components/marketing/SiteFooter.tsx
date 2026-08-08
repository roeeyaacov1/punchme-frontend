import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Container, focusRing } from "./primitives";
import { NAV_ANCHORS } from "./SiteHeader";
import logo from "../../assets/logo.png";

/**
 * Three columns, not the four in the spec: there are no Terms, Privacy or
 * Contact pages in the router yet, and linking to 404s costs more trust than
 * an absent column does. Add a "Company" column here once those routes exist.
 */
export function SiteFooter() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he");

  const linkClass = cn(
    "inline-flex min-h-[44px] min-w-[44px] items-center rounded text-sm text-white/70 transition-colors hover:text-white",
    focusRing,
    "focus-visible:ring-offset-navy-deep",
  );

  return (
    <footer className="bg-navy-deep pb-8 pt-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img
              src={logo}
              alt={t("app.name")}
              className="h-7 w-auto brightness-0 invert"
            />
            <p className="mt-4 max-w-xs text-pretty text-sm text-white/60">
              {t("landing.footer.tagline")}
            </p>
          </div>

          <nav aria-label={t("landing.footer.productHeading")}>
            <h2 className="t-eyebrow text-white/60">
              {t("landing.footer.productHeading")}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_ANCHORS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkClass}>
                    {t(item.key)}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/login" className={linkClass}>
                  {t("landing.nav.signIn")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="t-eyebrow text-white/60">
              {t("landing.footer.languageHeading")}
            </h2>
            <button
              type="button"
              onClick={toggleLanguage}
              className={cn(linkClass, "mt-4 inline-flex min-h-[44px] items-center")}
            >
              {t("language.switch")}
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {t("app.name")} —{" "}
            {t("landing.footer.rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
