import { Trans } from "react-i18next";
import { linkText } from "../../components/kit";
import { cn } from "../../lib/cn";
import { SUPPORT_EMAIL, type InfoPageKey, type InfoSection } from "./infoCopy";

/** The address, as a link that opens the reader's mail, left to right inside Hebrew. */
const EMAIL = <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className={cn(linkText, "break-words")} />;

/** One line of copy by its path, with the address in it as a link. */
function Line({ path }: { path: string }) {
  return <Trans i18nKey={path} values={{ email: SUPPORT_EMAIL }} components={{ email: EMAIL }} />;
}

/**
 * A page's sections, each a heading over its paragraphs and lists, read
 * from `info.<page>.sections`. Each section is an anchor (`#rights`) the
 * contents and other pages link to, landing clear of the top edge.
 */
export function InfoSections({ page, sections }: { page: InfoPageKey; sections: InfoSection[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const base = `info.${page}.sections.${index}.blocks`;
        return (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-6 pt-10 sm:pt-12"
          >
            <h2 id={`${section.id}-title`} className="type-card-title text-balance text-ink">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-4">
              {section.blocks.map((block, at) =>
                typeof block === "string" ? (
                  <p key={at} className="type-prose text-pretty text-ink">
                    <Line path={`${base}.${at}`} />
                  </p>
                ) : (
                  <ul key={at} className="type-prose list-disc space-y-2 ps-6 text-pretty text-ink marker:text-ink-muted">
                    {block.map((_, item) => (
                      <li key={item}>
                        <Line path={`${base}.${at}.${item}`} />
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
