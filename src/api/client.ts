import { env } from "../lib/env";
import { ApiError } from "./errors";
import { endsSession } from "../auth/endsSession";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "../auth/tokenStore";

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Multipart body (file uploads) — sent as-is, browser sets the boundary
   * header itself; mutually exclusive with `body`. */
  formData?: FormData;
  /** Set false for public endpoints — skips attaching the Authorization header and the 401-refresh-retry. */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, env.apiOrigin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The session couldn't be renewed just now: the refresh was answered, but
 * not with a refusal (the throttle's 429, a 5xx). The request waiting on it
 * never ran, so this is how it fails: not with its own 401, which every page
 * reads as signed out, and not with the refresh's status, which a page would
 * take for its own endpoint's answer — to a scan, a 429 is "stamped moments
 * ago". Pages show their general failure; the refresh's answer is `answer`.
 */
export class RefreshUnavailable extends Error {
  readonly answer: ApiError;

  constructor(answer: ApiError) {
    super(answer.message);
    this.name = "RefreshUnavailable";
    this.answer = answer;
  }
}

/** Every request with a 401 waits on the one refresh, so a connection that
 * dropped without the browser noticing mustn't hold them all for the minutes
 * the browser itself would wait. */
const REFRESH_PATIENCE_MS = 10_000;

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const call = new AbortController();
  const patience = setTimeout(() => call.abort(), REFRESH_PATIENCE_MS);
  try {
    // No answer at all (offline, or cut off) throws from here, before the
    // tokens are touched: nothing has said the session is over.
    const res = await fetch(buildUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      signal: call.signal,
    });

    // The session can end (sign-out) or change hands (another owner signs in)
    // while this is in flight. Applying the result then would put a live access
    // token for the *old* user back into a store that no longer belongs to
    // them; clearing on failure would wipe the new owner's tokens instead.
    // Either way the answer is stale — drop it and let the caller see its 401.
    if (getRefreshToken() !== refresh) return false;

    if (!res.ok) {
      const error = await ApiError.fromResponse(res);
      // Only a refused token ends the session. Any other answer leaves it
      // standing, and the request fails as unavailable.
      if (!endsSession(error)) throw new RefreshUnavailable(error);
      // Reading the answer took a turn; it is still only ours to clear if
      // the session hasn't changed hands in it.
      if (getRefreshToken() === refresh) clearTokens();
      return false;
    }

    const data = (await res.json()) as { access: string };
    setAccessToken(data.access);
    return true;
  } catch (error) {
    // Called off at the time limit: the same, to every request waiting, as
    // getting no answer at all.
    if (call.signal.aborted) throw new TypeError("The session's refresh got no answer");
    throw error;
  } finally {
    clearTimeout(patience);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { method = "GET", body, formData, auth = true, query } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401 && auth && !isRetry) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
  }

  if (!res.ok) {
    throw await ApiError.fromResponse(res);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...options, method: "PATCH", body }),
  postForm: <T>(
    path: string,
    formData: FormData,
    options?: Omit<RequestOptions, "method" | "body" | "formData">,
  ) => apiFetch<T>(path, { ...options, method: "POST", formData }),
  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...options, method: "DELETE" }),
};
