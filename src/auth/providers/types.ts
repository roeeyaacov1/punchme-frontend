export interface AuthProviderButtonProps {
  onSuccess: (idToken: string, provider: "google" | "apple") => void;
  onError?: (error: unknown) => void;
  /** What the provider's button says. Sign-in and sign-up are the same call
   * on our side; this only makes the label match the screen it sits on. */
  text?: "signin_with" | "signup_with" | "continue_with";
  /** The button's width in px, which Google draws exactly (it doesn't follow
   * its box). 320 unless the caller measures its column. */
  width?: number;
  /** The language of the label, such as "he". Without it Google picks from
   * the browser, which may not be the page's language. */
  locale?: string;
}
