import { createContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  revokeRefreshToken,
  type TokenPair,
  type User,
} from "../api/auth";
import { checkSession, type SessionCheck } from "./checkSession";
import { setTokens, clearTokens, getRefreshToken } from "./tokenStore";

/**
 * Where the session stands:
 * - `checking`: the start-up check's first try is out, for 4 s at most;
 * - `signedIn`: the server answered with the user;
 * - `signedOut`: no session was stored, or the server said it is over;
 * - `unreachable`: a session is stored, but the check couldn't get through
 *   (offline, cut off, the throttle, a 5xx). It is kept, and the check
 *   keeps trying.
 */
export type SessionStatus = "checking" | "signedIn" | "signedOut" | "unreachable";

export interface AuthContextValue {
  user: User | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  /** The start-up check hasn't answered yet: 4 s at most, so a page that
   * waits on it never waits longer. */
  isLoading: boolean;
  /** A try to reach the server is out: what "Try again" shows as busy. */
  isTrying: boolean;
  /** Asks the server again now, while it can't be reached. */
  retry: () => void;
  login: (tokens: TokenPair) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  // Nothing to check without a refresh token: the access token lives in
  // memory only, so `/api/auth/me` could only answer 401, and a visitor
  // with no session would wait on it for nothing.
  const [status, setStatus] = useState<SessionStatus>(() =>
    getRefreshToken() ? "checking" : "signedOut",
  );
  const [isTrying, setIsTrying] = useState(false);
  const check = useRef<SessionCheck | null>(null);

  useEffect(() => {
    const refresh = getRefreshToken();
    if (!refresh) return;
    // The cached refresh token is what answers: api/client's 401-retry
    // uses it to mint a fresh access token before `/api/auth/me` resolves.
    const running = checkSession({
      read: getCurrentUser,
      onUser: (me) => {
        setUser(me);
        setStatus("signedIn");
      },
      onEnded: () => {
        // Over for the session this check was about. If another tab has
        // signed in meanwhile, the stored tokens are that session's.
        if (getRefreshToken() === refresh) clearTokens();
        setUser(null);
        setStatus("signedOut");
      },
      onUnreachable: () => setStatus("unreachable"),
      onTrying: setIsTrying,
    });
    check.current = running;
    return () => {
      running.cancel();
      check.current = null;
    };
  }, []);

  // A sign-in or a sign-out settles the session itself; an answer the
  // check brings back afterwards is about one that has gone.
  function stopChecking() {
    check.current?.cancel();
    check.current = null;
    setIsTrying(false);
  }

  // Every cached query belongs to whoever was signed in when it was fetched,
  // and the cache outlives the components that read it. Clearing it on both
  // ends of a session is what keeps one owner's data out of the next one's
  // screen: ["business","me"] is inside its 30s staleTime after a sign-out,
  // so without this the next owner is served the previous owner's Business
  // from cache with no refetch at all — RequireBusiness waves them onto that
  // dashboard even when they own nothing. Clearing on login too (not just on
  // logout) covers sessions that end without the button: a refused token
  // refresh drops the tokens straight from api/client.
  function login(tokens: TokenPair) {
    stopChecking();
    queryClient.clear();
    setTokens({ access: tokens.access, refresh: tokens.refresh });
    setUser(tokens.user);
    setStatus("signedIn");
  }

  function logout() {
    // Read it before clearing, and tell the server before the local state
    // goes — otherwise the token is merely forgotten here and stays usable
    // for the rest of its fourteen days by anyone who copied it.
    const refresh = getRefreshToken();

    stopChecking();
    clearTokens();
    setUser(null);
    setStatus("signedOut");
    queryClient.clear();

    // Not awaited: signing out must be instant and must succeed offline. A
    // token that outlives a failed revoke is the same situation as before
    // this call existed, so there is nothing to report to the owner.
    if (refresh) void revokeRefreshToken(refresh).catch(() => {});
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === "signedIn",
        isLoading: status === "checking",
        isTrying,
        retry: () => check.current?.retry(),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
