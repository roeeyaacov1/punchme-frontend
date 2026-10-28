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

// Storage can be switched off (Safari blocking every cookie, a QR reader's
// web view), and then touching it throws. Every page reads the session,
// so asking must not take them down: blocked storage reads as no session,
// and a sign-in then lasts as long as this tab's access token.
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Nowhere to keep it; see above.
  }
}

export function setTokens(tokens: { access: string; refresh: string }): void {
  setAccessToken(tokens.access);
  setRefreshToken(tokens.refresh);
}

export function clearTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}
