import { useEffect, useRef } from "react";
import { env } from "../../lib/env";
import { useTranslation } from "react-i18next";
import type { AuthProviderButtonProps } from "./types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_button?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

/** Loads Google's script, in `locale` when one is given. The button's label
 * takes the language the script was loaded in (its `hl`); `renderButton`'s
 * own `locale` option doesn't change it. So a page that switches language
 * puts the script back in the new one before the next button draws. */
function loadGoogleScript(locale?: string): Promise<void> {
  const src = locale ? `${SCRIPT_SRC}?hl=${encodeURIComponent(locale)}` : SCRIPT_SRC;
  const loaded = document.querySelector(`script[src^="${SCRIPT_SRC}"]`);
  if (loaded && loaded.getAttribute("src") !== src) {
    loaded.remove();
    // Only the sign-in goes: anything else on `window.google` (the wizard's
    // Places search, say) stays where it is.
    const google = window.google as { accounts?: unknown } | undefined;
    if (google) delete google.accounts;
  } else if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function GoogleAuthButton({
  onSuccess,
  onError,
  text = "signin_with",
  width = 320,
  locale,
}: AuthProviderButtonProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!env.googleClientId) return;
    let cancelled = false;

    loadGoogleScript(locale)
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts) return;
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (response) => onSuccess(response.credential, "google"),
          // This is a plain sign-in button, not One Tap — auto_select/prompt
          // behavior caused spurious popup attempts on mount, especially
          // under React StrictMode's double-effect in dev.
          auto_select: false,
          cancel_on_tap_outside: true,
          // Without this, the button falls back to a popup-based OAuth flow
          // that depends on third-party storage access for its postMessage
          // bridge back to this page. Browsers increasingly block that
          // silently — the picker still opens and the user can pick an
          // account, but the callback below never fires. FedCM uses the
          // browser's native account chooser instead, with no popup/bridge.
          use_fedcm_for_button: true,
        });
        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width,
          text,
          ...(locale ? { locale } : {}),
        });
      })
      .catch((err) => onError?.(err));

    return () => {
      cancelled = true;
      // `accounts` is gone for a moment while the script reloads in
      // another language.
      window.google?.accounts?.id.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!env.googleClientId) {
    return (
      <p className="text-sm text-red-600 font-mono text-center">
        {t("auth.missingClientId")}
      </p>
    );
  }

  return <div ref={containerRef} />;
}
