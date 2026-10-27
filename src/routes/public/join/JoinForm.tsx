import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { Button, Checkbox, Input, LitPanel, Notice, Sheet, focusRing } from "../../../components/kit";
import { cn } from "../../../lib/cn";
import { toNameCase } from "../../../lib/name";
import type { JoinFlow } from "./useJoinFlow";

/**
 * The details, phone first and the only one required. `noValidate`, so the
 * browser's own bubble never speaks: an error is said under its field, tied
 * to it, and the field takes focus; what belongs to no field is a notice
 * over the button.
 *
 * The legal pair is here word for word: the marketing consent as its own
 * unticked box (Spam Law), and the privacy notice (s.11) one tap away, in a
 * sheet, so reading it never moves the form or the button.
 */
export function JoinForm({ flow, band }: { flow: JoinFlow; band?: ReactNode }) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const noticeRow = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState(false);

  // The sign gave way to this: the heading says where the reader is now.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  // A refused phone takes focus, every time it is refused.
  const { phone: phoneError, seq } = flow.errors;
  useEffect(() => {
    if (phoneError) phone.current?.focus();
  }, [phoneError, seq]);

  return (
    <div className="flex flex-col gap-5">
      {band}
      <h1 ref={heading} tabIndex={-1} className="type-title text-balance outline-none">
        {t("enroll.form.heading")}
      </h1>
      <LitPanel as="section" className="p-5 sm:p-6">
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
            value={flow.name}
            onChange={(e) => flow.setName(e.target.value)}
            // Cased on the way out of the field, not silently at submit: the
            // name is going on a wallet pass, so the customer should see what
            // it will say while they can still argue with it.
            onBlur={() => flow.setName((n) => toNameCase(n))}
          />
          <Input
            label={t("enroll.birthdayLabel")}
            hint={t("enroll.birthdayHint")}
            type="date"
            dir="ltr"
            value={flow.birthday}
            onChange={(e) => flow.setBirthday(e.target.value)}
          />
          <Checkbox checked={flow.optIn} onChange={flow.setOptIn} label={t("enroll.marketingOptIn")} />
          <button
            ref={noticeRow}
            type="button"
            onClick={() => setNotice(true)}
            className={cn(
              "type-body flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-start text-ink",
              focusRing,
            )}
          >
            <span className="underline decoration-1 underline-offset-[3px]">{t("enroll.privacySummary")}</span>
            <ChevronRight aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
          </button>
          {flow.errors.form && (
            <Notice tone="danger" role="alert">
              {t(flow.errors.form)}
            </Notice>
          )}
          <Button type="submit" size="lg" busy={flow.busy} className="w-full !whitespace-normal">
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
