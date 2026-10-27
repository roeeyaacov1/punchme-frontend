import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, LitPanel } from "../../../components/kit";

/**
 * The sign over the counter (the brief's §7.3, Roee's pick): one lit panel in
 * the field light that says whose card this is, what it gives and what it
 * costs, with one thing to press. The customer already chose to scan; the
 * sign confirms it in a glance, and the form follows on the same screen.
 *
 * Without the shop's face (`/join`, until the backend serves it) the sign
 * says what is true of every card. The friend's join knows the shop and
 * passes it in `lead` and `line`.
 *
 * Holding an answer (`held`), it keeps its light and says it, with nothing
 * to press: a link that leads nowhere any more, or a shop that isn't taking
 * new customers.
 */
export function JoinSign({
  lead,
  line,
  otpRequired,
  held,
  notTakingLine,
  focusHeading = false,
  onJoin,
}: {
  /** Above the heading: who invited them, and the shop. */
  lead?: ReactNode;
  /** What the card gives. */
  line?: ReactNode;
  otpRequired: boolean;
  held?: "dead" | "notTaking";
  /** The shop's own "not taking customers" sentence, when its name is known. */
  notTakingLine?: ReactNode;
  /** When the sign comes back holding an answer, its heading takes focus. */
  focusHeading?: boolean;
  onJoin: () => void;
}) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusHeading) heading.current?.focus({ preventScroll: true });
  }, [focusHeading, held]);

  const dead = held === "dead";
  return (
    <LitPanel light="field" radius="hero" className="flex w-full flex-col items-center gap-4 p-[22px] text-center">
      {!dead && lead}
      <h1 ref={heading} tabIndex={-1} className="type-headline text-balance outline-none">
        {dead ? t("enroll.dead.title") : t("enroll.sign.heading")}
      </h1>
      {dead ? (
        <p className="type-body text-pretty text-ink-muted">{t("enroll.dead.body")}</p>
      ) : (
        <p className="font-body text-[1.1875rem] font-semibold leading-snug text-pretty">
          {line ?? t("enroll.sign.line")}
        </p>
      )}
      {!held && (
        <div className="flex flex-col gap-0.5">
          <p className="type-body text-pretty text-ink">{t("standee.noApp")}</p>
          <p className="type-body text-pretty text-ink-muted">
            {t(otpRequired ? "enroll.sign.cost" : "enroll.sign.costNoCode")}
          </p>
        </div>
      )}
      {held === "notTaking" && (
        <p className="type-body text-pretty text-ink">{notTakingLine ?? t("enroll.upgradeRequired")}</p>
      )}
      {!held && (
        <Button size="lg" className="mt-1 w-full" onClick={onJoin}>
          {t("enroll.sign.join")}
        </Button>
      )}
    </LitPanel>
  );
}
