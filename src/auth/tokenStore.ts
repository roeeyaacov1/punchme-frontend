/**
 * Access token lives in memory only (lost on reload). Refresh token is
 * persisted to localStorage since the backend returns both as plain JSON,
 * not httpOnly cookies — there's no other persistence option without a
 * backend change. See the frontend plan's Decision Points for the tradeoff.
 */
const REFRESH_TOKEN_KEY = "punchme.refreshToken";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: { access: string; refresh: string }): void {
  setAccessToken(tokens.access);
  setRefreshToken(tokens.refresh);
}

export function clearTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}
