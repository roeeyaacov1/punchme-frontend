import { useTranslation } from "react-i18next";
import { Button, EmptyState, LinkButton } from "../../kit";
import { useLightboxPage } from "../../../theme/lightboxPage";
import { usePageTitle } from "./pageTitle";

/** A way out whose words wrap, as "To the Overview" must at 200% text on a
 * 320px phone, rather than widen the page. */
const WRAPS = "max-w-full !whitespace-normal text-center";

/**
 * No page here: an address under /dashboard that names no page, an old link
 * or a mistyped one. Said inside the shell, so the bar or the rail stays
 * and Scan is still one tap away, rather than dropping out to the router's
 * English developer page.
 */
export function DashboardNotFound() {
  const { t } = useTranslation();
  useLightboxPage();
  usePageTitle(t("dashboard.notFound.title"));
  return (
    <EmptyState
      titleAs="h1"
      title={t("dashboard.notFound.title")}
      body={t("dashboard.notFound.body")}
      action={
        <LinkButton to="/dashboard" variant="secondary" className={WRAPS}>
          {t("dashboard.toOverview")}
        </LinkButton>
      }
      className="mx-auto mt-2 max-w-xl sm:mt-8"
    />
  );
}

/**
 * A page that threw while it drew itself. The router's error element sits
 * between the shell and the pages, so this shows inside the shell. "Try
 * again" reloads the page, because the router only clears its error when
 * the address changes; the other way out is the Overview.
 */
export function DashboardPageError() {
  const { t } = useTranslation();
  useLightboxPage();
  usePageTitle(t("dashboard.pageError.title"));
  return (
    <EmptyState
      titleAs="h1"
      title={t("dashboard.pageError.title")}
      body={t("dashboard.pageError.body")}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()} className={WRAPS}>
            {t("common.retry")}
          </Button>
          <LinkButton to="/dashboard" variant="secondary" className={WRAPS}>
            {t("dashboard.toOverview")}
          </LinkButton>
        </div>
      }
      className="mx-auto mt-2 max-w-xl sm:mt-8"
    />
  );
}
