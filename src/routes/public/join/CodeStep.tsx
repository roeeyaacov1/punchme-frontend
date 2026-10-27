import { useEffect, useRef, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button, Field, LitPanel, Notice, linkText } from "../../../components/kit";
import { fieldBox } from "../../../components/kit/classes";
import { cn } from "../../../lib/cn";
import type { JoinFlow } from "./useJoinFlow";

/**
 * The SMS code, when the code step is on. Six digits submit by themselves,
 * once for each code typed; a wrong one is said under the field and puts
 * focus back in it. "Edit number" goes back to the form with everything
 * still in it, and "Send a new code" waits out its 60 seconds, readable all
 * the while.
 */
export function CodeStep({ flow, band }: { flow: JoinFlow; band?: ReactNode }) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const tried = useRef<string | null>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  const { code: codeError, seq } = flow.errors;
  useEffect(() => {
    if (codeError) field.current?.focus();
  }, [codeError, seq]);

  const { code, busy, submitCode } = flow;
  useEffect(() => {
    if (code.length !== 6 || busy || tried.current === code) return;
    tried.current = code;
    void submitCode(code);
  }, [code, busy, submitCode]);

  return (
    <div className="flex flex-col gap-5">
      {band}
      <div className="flex flex-col gap-2">
        <h1 ref={heading} tabIndex={-1} className="type-title text-balance outline-none">
          {t("enroll.codeTitle")}
        </h1>
        <p className="type-body text-pretty text-ink-muted">
          <Trans
            i18nKey="enroll.code.sentTo"
            values={{ phone: flow.phone.trim() }}
            components={{ phone: <bdi dir="ltr" /> }}
          />
        </p>
      </div>
      <LitPanel as="section" className="p-5 sm:p-6">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            tried.current = code;
            void submitCode(code);
          }}
          className="flex flex-col gap-4"
        >
          <Field label={t("enroll.codeLabel")} error={codeError ? t(codeError) : undefined}>
            {({ id, describedBy, invalid }) => (
              <input
                ref={field}
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                value={code}
                onChange={(e) => flow.setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={6}
                // A code is the one place on this page Plex Mono may set.
                className={cn(fieldBox, "min-h-12 text-center font-mono text-xl tracking-[0.4em]")}
              />
            )}
          </Field>
          {flow.errors.form && (
            <Notice tone="danger" role="alert">
              {t(flow.errors.form)}
            </Notice>
          )}
          <Button type="submit" size="lg" busy={busy} disabled={code.length !== 6} className="w-full">
            {t("enroll.verifyCta")}
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <button
              type="button"
              onClick={flow.editPhone}
              className={cn(linkText, "type-body inline-flex min-h-11 items-center")}
            >
              {t("enroll.editPhone")}
            </button>
            <button
              type="button"
              disabled={flow.resendIn > 0 || busy}
              onClick={() => void flow.resend()}
              className={cn(
                linkText,
                "type-body inline-flex min-h-11 items-center",
                // The countdown is the one sentence saying when the next code
                // can come, so it stays at full strength while it waits.
                "disabled:cursor-default disabled:text-ink-muted disabled:no-underline",
              )}
            >
              {flow.resendIn > 0 ? t("enroll.code.resendIn", { count: flow.resendIn }) : t("enroll.resend")}
            </button>
          </div>
        </form>
      </LitPanel>
    </div>
  );
}
