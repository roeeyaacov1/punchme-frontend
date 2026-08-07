export interface AuthProviderButtonProps {
  onSuccess: (idToken: string, provider: "google" | "apple") => void;
  onError?: (error: unknown) => void;
}
