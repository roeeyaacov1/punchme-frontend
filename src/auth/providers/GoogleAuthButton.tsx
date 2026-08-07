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

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function GoogleAuthButton({ onSuccess, onError }: AuthProviderButtonProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!env.googleClientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (response) => onSuccess(response.credential, "google"),
          // This is a plain sign-in button, not One Tap — auto_select/prompt
          // behavior caused spurious popup attempts on mount, especially
          // under React StrictMode's double-effect in dev.
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
        });
      })
      .catch((err) => onError?.(err));

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
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
