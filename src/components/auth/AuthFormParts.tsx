import { useLayoutEffect, useRef, useState } from "react";
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

/** Google draws its button at the width it is given and ignores its box, so
 * the box is measured: its own 320px where the column has room, the
 * column's width where it doesn't (303px at 375, 248px at 320), never under
 * the 200px Google allows. Re-measured once a resize settles. */
function useGoogleWidth() {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(Math.min(320, Math.max(200, Math.floor(el.clientWidth))));
    measure();
    let settle = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(settle);
      settle = window.setTimeout(measure, 150);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
    };
  }, []);
  return { box, width };
}

/**
 * Under the submit button: the other mode, then Google.
 *
 * Google's script can fail to load (no connection, a network or an
 * extension that blocks it). Then the divider and the empty box give way
 * to one quiet line in their place, and the form above stays as it was:
 * that is no sign-in error, and nothing was sent. It stays that way until
 * the page loads again: the failed script stays in the page, and a second
 * button would wait on it for ever.
 */
export function AuthAlternatives({
  mode,
  onToggleMode,
  onGoogle,
}: {
  mode: AuthMode;
  onToggleMode: () => void;
  onGoogle: (idToken: string) => void;
  /** No longer called: a button that can't load says so in its own place,
   * where the pages used to show a sign-in error over a form nobody had
   * sent. Kept so the account step, which this phase leaves alone, still
   * passes it. */
  onGoogleError?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const google = useGoogleWidth();
  const [googleFailed, setGoogleFailed] = useState(false);
  return (
    <div className="theme-lightbox flex flex-col gap-3 text-ink">
      <button
        type="button"
        onClick={onToggleMode}
        className={cn(linkText, "type-body inline-flex min-h-11 items-center self-center px-2")}
      >
        {mode === "signup" ? t("auth.toggleToSignIn") : t("auth.toggleToSignUp")}
      </button>
      {!googleFailed && (
        <div className="type-body flex items-center gap-3 text-ink-muted">
          <span aria-hidden className="h-px flex-1 bg-border" />
          {t("auth.orDivider")}
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>
      )}
      {/* The box follows the page's direction. Forcing it left to right
          reversed Google's Hebrew label. It stays when the button can't
          load, so the column's measure holds still. */}
      <div ref={google.box} className="flex justify-center">
        {/* Google renders the button once per mount; a change of language,
            mode or width needs a fresh mount to redraw it. The label speaks
            the page's language, not the browser's. */}
        {googleFailed ? (
          <p className="type-body text-pretty text-center text-ink-muted">{t("auth.googleUnavailable")}</p>
        ) : (
          google.width !== null && (
            <GoogleAuthButton
              key={`${i18n.resolvedLanguage}-${mode}-${google.width}`}
              text={mode === "signup" ? "signup_with" : "signin_with"}
              width={google.width}
              locale={i18n.resolvedLanguage}
              onSuccess={onGoogle}
              onError={() => setGoogleFailed(true)}
            />
          )
        )}
      </div>
    </div>
  );
}
