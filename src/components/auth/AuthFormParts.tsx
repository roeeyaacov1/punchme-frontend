import { useTranslation } from "react-i18next";
import { GoogleAuthButton } from "../../auth/providers/GoogleAuthButton";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import type { AuthMode } from "./useEmailPasswordAuth";

const fieldClass = cn(
  "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink placeholder:text-ink-subtle/70",
  focusRing,
);

/** The two fields. Meant to sit inside a `StepShell`, which supplies the
 * form element, the submit button and the error line. */
export function AuthFields({
  idPrefix,
  mode,
  email,
  password,
  onEmail,
  onPassword,
}: {
  idPrefix: string;
  mode: AuthMode;
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-email`} className="text-sm font-medium text-ink">
          {t("auth.emailLabel")}
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-password`} className="text-sm font-medium text-ink">
          {t("auth.passwordLabel")}
        </label>
        <input
          id={`${idPrefix}-password`}
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          dir="ltr"
          required
          minLength={mode === "signup" ? 8 : undefined}
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          className={fieldClass}
        />
      </div>
    </>
  );
}

/** Under the submit button: the other mode, then Google. */
export function AuthAlternatives({
  mode,
  onToggleMode,
  onGoogle,
  onGoogleError,
}: {
  mode: AuthMode;
  onToggleMode: () => void;
  onGoogle: (idToken: string) => void;
  onGoogleError: () => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <>
      <button
        type="button"
        onClick={onToggleMode}
        className={cn(
          "inline-flex min-h-[44px] items-center self-center rounded-lg px-2 text-sm text-ink-muted underline underline-offset-2 hover:text-ink",
          focusRing,
        )}
      >
        {mode === "signup" ? t("auth.toggleToSignIn") : t("auth.toggleToSignUp")}
      </button>
      <div className="flex items-center gap-3 text-sm text-ink-subtle">
        <span className="h-px flex-1 bg-border" />
        {t("auth.orDivider")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex justify-center" dir="ltr">
        {/* Google renders the button once per mount; a language change needs
            a fresh mount to relabel it. */}
        <GoogleAuthButton key={i18n.resolvedLanguage} onSuccess={onGoogle} onError={onGoogleError} />
      </div>
    </>
  );
}
