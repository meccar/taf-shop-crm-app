"use client";

import * as React from "react";
import { authApi } from "@/features/auth/api/auth.api";
import type {
  AuthContextValue,
  AuthUser,
  LoginDto,
} from "@/features/auth/types/auth.type";
import { tokenManager } from "@/lib/api/token-manager";
import {
  useLogin,
  useLogout,
  useProfile,
  useRefresh,
} from "@/features/auth/api/auth.queries";

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = React.useState<string | null>(
    null,
  );
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const initGuardRef = React.useRef(false);
  const loginMutation = useLogin();
  const profileMutation = useProfile();
  const logoutMutation = useLogout();
  const refreshMutation = useRefresh();

  // Sync token to both state and in-memory token manager
  const updateAccessToken = React.useCallback((token: string | null) => {
    tokenManager.setAccessToken(token);
    setAccessTokenState(token);
  }, []);

  const refresh = React.useCallback(async (): Promise<string | null> => {
    try {
      return await tokenManager.executeRefresh();
    } catch {
      updateAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, [updateAccessToken]);

  const initialize = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const token = tokenManager.getAccessToken();

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      setAccessTokenState(token);

      const profile = await authApi.getProfile();

      setUser(profile.data);
      setIsAuthenticated(true);
    } catch {
      updateAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [updateAccessToken]);

  const login = React.useCallback(
    async (credentials: LoginDto): Promise<void> => {
      const tokenResponse = await loginMutation.mutateAsync(credentials);
      updateAccessToken(tokenResponse.data.accessToken);

      try {
        const profile = await authApi.getProfile();

        setUser(profile.data);
        setIsAuthenticated(true);
      } catch (error) {
        updateAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        throw error;
      }
    },
    [loginMutation.mutateAsync, updateAccessToken],
  );

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      // Even if network or server fails, ensure local session is revoked
      console.warn("Logout endpoint error:", err);
    } finally {
      updateAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      tokenManager.clear();
    }
  }, [updateAccessToken]);

  // Register token manager hooks on mount
  React.useEffect(() => {
    tokenManager.setRefreshHandler(async () => {
      const response = await refreshMutation.mutateAsync();
      return response.data.accessToken;
    });

    const unsubscribeToken = tokenManager.subscribeTokenChange((token) => {
      setAccessTokenState(token);
    });

    const unsubscribeFailure = tokenManager.subscribeAuthFailure(() => {
      setAccessTokenState(null);
      setUser(null);
      setIsAuthenticated(false);
    });

    return () => {
      unsubscribeToken();
      unsubscribeFailure();
    };
  }, [refreshMutation.mutateAsync]);

  // Run initialization once on mount
  React.useEffect(() => {
    if (!initGuardRef.current) {
      initGuardRef.current = true;
      initialize();
    }
  }, [initialize]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refresh,
      initialize,
      isLoggingIn: loginMutation.isPending,
    }),
    [
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refresh,
      initialize,
      loginMutation.isPending,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
