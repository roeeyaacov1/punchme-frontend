import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";
import {
  clearTokens,
  getAccessToken,
  setTokens,
} from "../auth/tokenStore";

const storage = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, String(v)),
  removeItem: (k: string) => void storage.delete(k),
  clear: () => storage.clear(),
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const isRefresh = (url: unknown) => String(url).includes("/api/auth/refresh");

beforeEach(() => {
  // Re-stubbed per test: afterEach's unstubAllGlobals drops it along with fetch.
  vi.stubGlobal("localStorage", localStorageStub);
  storage.clear();
  clearTokens();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("leaves a rejected sign-in rejected, even with a previous session's refresh token still around", async () => {
    // The dangerous shape of the sign-out/sign-in bug: a failed sign-in must
    // never fall through to the refresh-retry and hand the caller back the
    // account that was signed out of. Public endpoints opt out of that path.
    setTokens({ access: "owner-a-access", refresh: "owner-a-refresh" });
    // A refresh here would succeed — so if the client ever reached for it,
    // the rejected sign-in would silently become owner-a's session again.
    const fetchMock = vi.fn(async (url: unknown) =>
      isRefresh(url)
        ? json(200, { access: "owner-a-renewed-access" })
        : json(401, { detail: "Invalid email or password." }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      api.post(
        "/api/auth/login",
        { email: "someone-else@test.com", password: "wrong" },
        { auth: false },
      ),
    ).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password.",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.some((c) => isRefresh(c[0]))).toBe(false);
  });

  it("refreshes and retries once when the session is still the same", async () => {
    setTokens({ access: "expired-access", refresh: "good-refresh" });
    let protectedCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown) => {
        if (isRefresh(url)) return json(200, { access: "renewed-access" });
        protectedCalls += 1;
        return protectedCalls === 1
          ? json(401, { detail: "Unauthorized" })
          : json(200, { id: "biz-1" });
      }),
    );

    await expect(api.get("/api/businesses/me")).resolves.toEqual({
      id: "biz-1",
    });
    expect(getAccessToken()).toBe("renewed-access");
  });

  it("drops a token refresh that lands after the owner signed out", async () => {
    setTokens({ access: "expired-access", refresh: "owner-a-refresh" });

    let landRefresh!: (res: Response) => void;
    const refreshInFlight = new Promise<Response>((resolve) => {
      landRefresh = resolve;
    });
    const fetchMock = vi.fn(async (url: unknown) =>
      isRefresh(url) ? refreshInFlight : json(401, { detail: "Unauthorized" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const pending = api.get("/api/businesses/me").catch((err) => err);
    await vi.waitFor(() =>
      expect(fetchMock.mock.calls.some((c) => isRefresh(c[0]))).toBe(true),
    );

    // Sign-out wins the race; the refresh answers a session that is over.
    clearTokens();
    landRefresh(json(200, { access: "owner-a-renewed-access" }));

    await expect(pending).resolves.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBeNull();
  });
});
