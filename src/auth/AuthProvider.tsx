import { createContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, type TokenPair, type User } from "../api/auth";
import { setTokens, clearTokens } from "./tokenStore";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: TokenPair) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If a refresh token is cached, api/client's 401-retry logic will use
    // it to silently mint a fresh access token before this resolves.
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Every cached query belongs to whoever was signed in when it was fetched,
  // and the cache outlives the components that read it. Clearing it on both
  // ends of a session is what keeps one owner's data out of the next one's
  // screen: ["business","me"] is inside its 30s staleTime after a sign-out,
  // so without this the next owner is served the previous owner's Business
  // from cache with no refetch at all — RequireBusiness waves them onto that
  // dashboard even when they own nothing. Clearing on login too (not just on
  // logout) covers sessions that end without the button: a failed token
  // refresh drops the tokens straight from api/client.
  function login(tokens: TokenPair) {
    queryClient.clear();
    setTokens({ access: tokens.access, refresh: tokens.refresh });
    setUser(tokens.user);
  }

  function logout() {
    clearTokens();
    setUser(null);
    queryClient.clear();
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
