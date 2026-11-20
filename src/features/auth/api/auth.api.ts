import { apiRequest, refreshSessionToken } from "@/lib/api/client";
import { setAccessToken, clearAccessToken } from "@/lib/api/token-store";
import {
  LoginFormValues,
  LoginResponse,
  loginResponseSchema,
} from "../schemas/auth.schema";
import { clearActiveStoreId } from "@/lib/api/store-context";

export async function login(values: LoginFormValues): Promise<LoginResponse> {
  const result = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: {
      email: values.email.trim(),
      password: values.password,
    },
    skipAuth: true,
    includeStoreHeader: false,
    schema: loginResponseSchema,
  });
  console.log("[LOGIN] API returned:", {
    keys: Object.keys(result ?? {}),
  });
  setAccessToken(result.accessToken);
  return result;
}

export async function refreshSession(): Promise<string | null> {
  return refreshSessionToken();
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
      includeStoreHeader: false,
    });
  } catch {
    // Ignore backend errors on sign-out and always clear client session state
  } finally {
    clearAccessToken();
    clearActiveStoreId();
  }
}

export async function initializeSession(): Promise<boolean> {
  try {
    const token = await refreshSessionToken();
    return token !== null;
  } catch {
    clearAccessToken();
    return false;
  }
}
