import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";
import { Button, LinkButton, LitPanel } from "../../components/kit";
import { PublicPage } from "./PublicPage";

/** The panel's sides, and the links' in it, hold at their 100% widths on a
 * phone as the text grows, as on /login and /invite; a link's words wrap
 * rather than widen the page. */
const PANEL_SIDES = "p-5 sm:p-6 max-sm:px-[min(1.25rem,20px)]";
const WAY = "max-w-full !whitespace-normal text-center max-sm:px-[min(1.25rem,20px)]";

/** On a narrow phone with large text the title stops growing at 12vw, as on
 * /login and /invite; a word wider than even that breaks rather than run
 * out of the panel. */
const TITLE = "type-title text-balance break-words text-[length:min(1.75rem,12vw)]";

/**
 * An address no route has: a link that is old, mistyped or cut short, from
 * a chat, a print or a bookmark. Said in the visitor's language, on the
 * frame the public pages share, rather than on React Router's English
 * developer page; and said, never a silent bounce to the home page, which
 * would look like a broken link. The ways on are the home page, and sign-in
 * for an owner, whom /login sends straight on when already signed in.
 *
 * Addresses under /dashboard have the shell's own (`DashboardNotFound`),
 * and the wizard's lead back to its start, so this answers the rest.
 *
 * Nothing here asks for an answer, so the heading doesn't take focus as
 * /login's does: the first Tab lands on the skip link.
 */
export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Missing title={t("notFound.title")} body={t("notFound.body")}>
      <LinkButton to="/" variant="secondary" className={WAY}>
        {t("notFound.home")}
      </LinkButton>
      <LinkButton to="/login" variant="secondary" className={WAY}>
        {t("auth.signInCta")}
      </LinkButton>
    </Missing>
  );
}

/**
 * A page that threw while it drew itself, or whose code didn't arrive,
 * where nothing nearer catches it: the root route's error element. The
 * dashboard's pages fail inside the shell (`DashboardPageError`); this
 * takes the rest, from the landing page to the wizard, on the same frame
 * as the page with no page rather than on the router's English developer
 * page. "Try again" reloads, because the router only clears its error when
 * the address changes; the other way on is the home page.
 *
 * What went wrong still goes to the console, as the router's own page sent
 * it there: a page whose code didn't arrive is said nowhere else.
 */
export function PageErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  useEffect(() => {
    console.error("A page didn't load", error);
  }, [error]);
  return (
    <Missing title={t("pageError.title")} body={t("pageError.body")}>
      <Button onClick={() => window.location.reload()} className={WAY}>
        {t("common.retry")}
      </Button>
      <LinkButton to="/" variant="secondary" className={WAY}>
        {t("notFound.home")}
      </LinkButton>
    </Missing>
  );
}

/** The team's frame, the mark home and the language switch, over one lit
 * panel on /login's column: the full width on a phone, at most 26rem and
 * centred from 640px. */
function Missing({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <PublicPage variant="team" title={title} className="items-stretch pb-16 pt-2 sm:items-center sm:pt-8">
      <div className="flex w-full flex-col sm:max-w-[26rem]">
        <LitPanel as="section" aria-labelledby="missing-title" className={`flex flex-col gap-3 ${PANEL_SIDES}`}>
          <h1 id="missing-title" className={TITLE}>
            {title}
          </h1>
          <p className="type-body text-pretty text-ink-muted">{body}</p>
          <div className="mt-2 flex flex-wrap gap-3">{children}</div>
        </LitPanel>
      </div>
    </PublicPage>
  );
}
