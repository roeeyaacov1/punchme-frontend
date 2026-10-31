import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { focusRing, useReducedMotion } from "../../components/kit";
import { noTapFlash } from "../../components/kit/classes";
import { cn } from "../../lib/cn";
import { InfoPage } from "./InfoPage";
import { InfoSections } from "./InfoSections";
import type { InfoSection } from "./infoCopy";

/** A contents link: a thumb's height, muted until pointed at or pressed. */
const CONTENTS_LINK = cn(
  "flex min-h-11 touch-manipulation items-center rounded-sm py-1 text-ink-muted transition-colors duration-gentle ease-out active:text-ink hover-fine:text-ink",
  noTapFlash,
  focusRing,
);

function ContentsList({ sections }: { sections: InfoSection[] }) {
  return (
    <ol className="type-body">
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className={CONTENTS_LINK}>
            {section.heading}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * The sections, by name. On a phone they fold under one row at the top, so
 * the policy starts on the first screen; from 1024px they stand beside the
 * text and stay in view while it scrolls, the column at the end being
 * otherwise empty.
 */
function Contents({ sections }: { sections: InfoSection[] }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  return (
    <nav
      aria-label={t("info.toc")}
      className="mt-8 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-h-[calc(100svh-4rem)] lg:self-start lg:overflow-y-auto"
    >
      <details className="group border-y border-border-strong lg:hidden">
        <summary
          className={cn(
            "flex min-h-14 cursor-pointer touch-manipulation select-none list-none items-center justify-between gap-4 rounded-sm text-start transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5 [&::-webkit-details-marker]:hidden",
            noTapFlash,
            focusRing,
          )}
        >
          <span className="type-label text-ink">{t("info.toc")}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-5 shrink-0 text-ink group-open:rotate-180",
              !reduced && "transition-transform duration-move ease-in-out-strong",
            )}
          />
        </summary>
        <div className="pb-3">
          <ContentsList sections={sections} />
        </div>
      </details>
      <div className="hidden lg:block">
        <p className="type-label text-ink">{t("info.toc")}</p>
        <div className="mt-2">
          <ContentsList sections={sections} />
        </div>
      </div>
    </nav>
  );
}

/**
 * A legal page: its title, the date it last changed and what it covers,
 * then its sections, with their contents beside them. The text keeps to a
 * reading measure at the start of the landing page's column.
 */
function LegalPage({ page }: { page: "privacy" | "terms" }) {
  const { t } = useTranslation();
  const title = t(`info.${page}.title`);
  const sections = t(`info.${page}.sections`, { returnObjects: true }) as InfoSection[];

  return (
    <InfoPage title={title}>
      <div className="lg:grid lg:grid-cols-[minmax(0,44rem)_15rem] lg:justify-between lg:gap-x-16">
        <header className="lg:col-start-1">
          <h1 className="type-headline text-balance text-ink">{title}</h1>
          <p className="type-body mt-3 text-ink-muted">{t(`info.${page}.updated`)}</p>
          <p className="type-lead mt-6 max-w-[68ch] text-pretty text-ink">{t(`info.${page}.lead`)}</p>
        </header>
        <Contents sections={sections} />
        <div className="lg:col-start-1">
          <InfoSections page={page} sections={sections} />
        </div>
      </div>
    </InfoPage>
  );
}

export function PrivacyPage() {
  return <LegalPage page="privacy" />;
}

export function TermsPage() {
  return <LegalPage page="terms" />;
}
