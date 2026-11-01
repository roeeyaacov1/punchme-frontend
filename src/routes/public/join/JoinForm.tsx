import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { Button, Checkbox, Input, LitPanel, Notice, Sheet, focusRing } from "../../../components/kit";
import { cn } from "../../../lib/cn";
import { toNameCase } from "../../../lib/name";
import { BIRTHDAY_MIN, localDay } from "./joinRules";
import type { JoinFlow } from "./useJoinFlow";

/** The longest name the card keeps (the API's own limit). */
const NAME_MAX = 120;

/** The latest birthday the API takes: yesterday, in this phone's own day. */
function latestBirthday(): string {
  const day = new Date();
  day.setDate(day.getDate() - 1);
  return localDay(day);
}

/**
 * The details, phone first; the phone and the marketing box are required.
 * `noValidate`, so the browser's own bubble never speaks: an error is said
 * under its field, tied to it, and the field takes focus; what belongs to
 * no field is a notice over the button.
 *
 * The legal pair is here word for word: the marketing consent as its own
 * box (Spam Law), which joining needs ticked since 2026-11-01 (the club's
 * benefits come as its messages) but which is never ticked for them, and
 * the privacy notice (s.11) one tap away, in a sheet, so reading it never
 * moves the form or the button.
 */
export function JoinForm({ flow }: { flow: JoinFlow }) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const birthday = useRef<HTMLInputElement>(null);
  const optIn = useRef<HTMLInputElement>(null);
  const noticeRow = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState(false);
  const [latest] = useState(latestBirthday);

  // The sign gave way to this: the heading says where the reader is now.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  // A refused field takes focus, every time it is refused: the first of
  // them, in the form's order.
  const { phone: phoneError, birthday: birthdayError, optIn: optInError, seq } = flow.errors;
  useEffect(() => {
    if (phoneError) phone.current?.focus();
    else if (birthdayError) birthday.current?.focus();
    else if (optInError) optIn.current?.focus();
  }, [phoneError, birthdayError, optInError, seq]);

  return (
    <div className="flex flex-col gap-5">
      <h1 ref={heading} tabIndex={-1} className="type-title text-balance outline-none">
        {t("enroll.form.heading")}
      </h1>
      {/* The panel's sides and the button's hold at their 100% widths on a
          phone as the text grows, so the button keeps its words at 200%. */}
      <LitPanel as="section" className="p-5 sm:p-6 max-sm:px-[min(1.25rem,20px)]">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void flow.submitDetails();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            ref={phone}
            label={t("enroll.phoneRequiredLabel")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            value={flow.phone}
            onChange={(e) => flow.setPhone(e.target.value)}
            error={phoneError ? t(phoneError) : undefined}
          />
          <Input
            label={t("enroll.nameLabel")}
            hint={t("enroll.nameHint")}
            autoComplete="name"
            dir="auto"
            maxLength={NAME_MAX}
            value={flow.name}
            onChange={(e) => flow.setName(e.target.value)}
            // Cased on the way out of the field, not silently at submit: the
            // name is going on a wallet pass, so the customer should see what
            // it will say while they can still argue with it.
            onBlur={() => flow.setName((n) => toNameCase(n))}
          />
          <Input
            ref={birthday}
            label={t("enroll.birthdayLabel")}
            hint={t("enroll.birthdayHint")}
            type="date"
            dir="ltr"
            // The phone can fill it in from its own card.
            autoComplete="bday"
            // The picker offers only the days the API takes; a date typed
            // past them is said under the field (`birthdayProblem`).
            min={BIRTHDAY_MIN}
            max={latest}
            value={flow.birthday}
            onChange={(e) => flow.setBirthday(e.target.value)}
            error={birthdayError ? t(birthdayError) : undefined}
          />
          <Checkbox
            ref={optIn}
            checked={flow.optIn}
            onChange={flow.setOptIn}
            label={t("enroll.marketingOptIn")}
            description={t("enroll.marketingOptInHint")}
            error={optInError ? t(optInError) : undefined}
          />
          <button
            ref={noticeRow}
            type="button"
            onClick={() => setNotice(true)}
            className={cn(
              "group type-body flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-start text-ink",
              focusRing,
            )}
          >
            {/* Its underline thickens under a finger, as a link's does. */}
            <span className="underline decoration-1 underline-offset-[3px] group-active:decoration-2">
              {t("enroll.privacySummary")}
            </span>
            <ChevronRight aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
          </button>
          {flow.errors.form && (
            <Notice tone="danger" role="alert">
              {t(flow.errors.form)}
            </Notice>
          )}
          <Button
            type="submit"
            size="lg"
            busy={flow.busy}
            className="w-full !whitespace-normal text-center max-sm:px-[min(1.75rem,28px)]"
          >
            {t(flow.otpRequired ? "enroll.sendCodeCta" : "enroll.submit")}
          </Button>
          {flow.otpRequired && (
            <p className="text-center font-body text-sm text-ink-muted">{t("enroll.form.codeNote")}</p>
          )}
        </form>
      </LitPanel>
      <Sheet
        open={notice}
        onClose={() => setNotice(false)}
        title={t("enroll.privacySummary")}
        returnFocus={noticeRow}
      >
        <p className="type-prose whitespace-pre-line text-ink">{t("enroll.privacyNotice")}</p>
      </Sheet>
    </div>
  );
}
