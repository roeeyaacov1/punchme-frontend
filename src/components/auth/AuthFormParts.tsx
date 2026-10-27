import { useTranslation } from "react-i18next";
import { GoogleAuthButton } from "../../auth/providers/GoogleAuthButton";
import { Input, linkText } from "../kit";
import { cn } from "../../lib/cn";
import type { AuthMode } from "./useEmailPasswordAuth";

/**
 * The two fields, on the kit: 48px, a Field Edge that measures 3.35:1 on the
 * wall, the label always above. Meant to sit inside a form that brings its
 * own submit button and error: `/login` and `/invite` build theirs from the
 * kit, the wizard's account step is a `StepShell`.
 *
 * Both parts wear `theme-lightbox` themselves, because the kit's field
 * tokens exist only inside that scope. On the public pages the scope is all
 * around them already; in the account step, which keeps the old purple
 * panel until Phase 4, they are a small Lightbox island.
 */
export function AuthFields({
  mode,
  email,
  password,
  onEmail,
  onPassword,
}: {
  /** No longer used: the kit's `Field` ties each label to its field. Kept so
   * the account step, which this phase leaves alone, still passes it. */
  idPrefix?: string;
  mode: AuthMode;
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}) {
  const { t } = useTranslation();
  const signup = mode === "signup";
  return (
    <div className="theme-lightbox flex flex-col gap-4 text-ink">
      <Input
        label={t("auth.emailLabel")}
        type="email"
        autoComplete="email"
        inputMode="email"
        dir="ltr"
        required
        value={email}
        onChange={(e) => onEmail(e.target.value)}
      />
      <Input
        label={t("auth.passwordLabel")}
        // The rule is said before anything is pressed, not discovered in a
        // refusal afterwards.
        hint={signup ? t("auth.passwordHint") : undefined}
        type="password"
        autoComplete={signup ? "new-password" : "current-password"}
        dir="ltr"
        required
        minLength={signup ? 8 : undefined}
        value={password}
        onChange={(e) => onPassword(e.target.value)}
      />
    </div>
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
    <div className="theme-lightbox flex flex-col gap-3 text-ink">
      <button
        type="button"
        onClick={onToggleMode}
        className={cn(linkText, "type-body inline-flex min-h-11 items-center self-center px-2")}
      >
        {mode === "signup" ? t("auth.toggleToSignIn") : t("auth.toggleToSignUp")}
      </button>
      <div className="type-body flex items-center gap-3 text-ink-muted">
        <span aria-hidden className="h-px flex-1 bg-border" />
        {t("auth.orDivider")}
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      {/* The box follows the page's direction. Forcing it left to right
          reversed Google's Hebrew label. */}
      <div className="flex justify-center">
        {/* Google renders the button once per mount; a language or mode change
            needs a fresh mount to relabel it. */}
        <GoogleAuthButton
          key={`${i18n.resolvedLanguage}-${mode}`}
          text={mode === "signup" ? "signup_with" : "signin_with"}
          onSuccess={onGoogle}
          onError={onGoogleError}
        />
      </div>
    </div>
  );
}
