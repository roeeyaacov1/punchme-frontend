import { createContext, useEffect, useState, type ReactNode } from "react";
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

  function login(tokens: TokenPair) {
    setTokens({ access: tokens.access, refresh: tokens.refresh });
    setUser(tokens.user);
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
