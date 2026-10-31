import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Check, Copy, Mail } from "lucide-react";
import { Button, LinkButton, LitPanel, linkText } from "../../components/kit";
import { cn } from "../../lib/cn";
import { InfoPage } from "./InfoPage";
import { InfoSections } from "./InfoSections";
import { SUPPORT_EMAIL, type InfoSection } from "./infoCopy";

/**
 * Copies the address, for a computer with no mail app behind `mailto:`.
 * The button says so for a moment, and a screen reader hears it once. A
 * browser that refuses the clipboard leaves the button as it was: the
 * address is on screen to select.
 */
function CopyAddress() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(SUPPORT_EMAIL).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return (
    <>
      <Button
        variant="secondary"
        icon={copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        onClick={copy}
      >
        {copied ? t("info.copied") : t("info.copy")}
      </Button>
      <span role="status" className="sr-only">
        {copied ? t("info.copied") : ""}
      </span>
    </>
  );
}

/**
 * Where to write, and who to ask first. A card holder's question about a
 * reward belongs to the shop that set it, so the page says that before
 * anything else; everything else comes to the one support address. No
 * phone line and no form: the address is the whole of the support there is.
 */
export function ContactPage() {
  const { t } = useTranslation();
  const title = t("info.contact.title");
  const sections = t("info.contact.sections", { returnObjects: true }) as InfoSection[];

  return (
    <InfoPage title={title}>
      <div className="max-w-[36rem]">
        <h1 className="type-headline text-balance text-ink">{title}</h1>
        <p className="type-lead mt-4 text-pretty text-ink">{t("info.contact.lead")}</p>

        <LitPanel className="mt-8 p-6 sm:p-8">
          <p className="type-label text-ink-muted">{t("info.emailLabel")}</p>
          <p className="type-sign mt-2 select-all break-words text-ink">
            <bdi dir="ltr">{SUPPORT_EMAIL}</bdi>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href={`mailto:${SUPPORT_EMAIL}`} variant="primary" icon={<Mail aria-hidden />}>
              {t("info.write")}
            </LinkButton>
            <CopyAddress />
          </div>
        </LitPanel>

        <InfoSections page="contact" sections={sections} />

        <div className="pt-10 sm:pt-12">
          <p className="type-prose text-pretty text-ink">{t("info.contact.more")}</p>
          <ul className="mt-2 flex flex-wrap gap-x-6">
            <li>
              <Link to="/privacy" className={cn(linkText, "type-body inline-flex min-h-11 items-center")}>
                {t("info.privacy.title")}
              </Link>
            </li>
            <li>
              <Link to="/terms" className={cn(linkText, "type-body inline-flex min-h-11 items-center")}>
                {t("info.terms.title")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </InfoPage>
  );
}
