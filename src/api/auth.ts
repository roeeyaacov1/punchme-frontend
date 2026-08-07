import { api } from "./client";
import type { components } from "./generated/schema";

export type User = components["schemas"]["UserOut"];
export type TokenPair = components["schemas"]["TokenPairOut"];

export function signInWithGoogle(idToken: string) {
  return api.post<TokenPair>(
    "/api/auth/google",
    { id_token: idToken },
    { auth: false },
  );
}

export function getCurrentUser() {
  return api.get<User>("/api/auth/me");
}
