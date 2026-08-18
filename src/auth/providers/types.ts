export interface AuthProviderButtonProps {
  onSuccess: (idToken: string, provider: "google" | "apple") => void;
  onError?: (error: unknown) => void;
  /** What the provider's button says. Sign-in and sign-up are the same call
   * on our side; this only makes the label match the screen it sits on. */
  text?: "signin_with" | "signup_with" | "continue_with";
}
