import { ApiError, createApiError } from "@/lib/api/errors";
import { dispatchMockApiRequest } from "@/lib/api/mock-adapter";
import { tokenManager } from "@/lib/api/token-manager";
import type { ApiRequestOptions, QueryParamValue } from "@/lib/api/types";

function getConfiguredApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.trim().replace(/\/+$/, "");
}

function buildQueryString(params?: Record<string, QueryParamValue>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const serialized = searchParams.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}

function isAuthBypassEndpoint(endpoint: string): boolean {
  const clean = endpoint.split("?")[0].toLowerCase();
  return (
    clean.includes("/auth/login") ||
    clean.includes("/auth/refresh") ||
    clean.includes("/auth/logout")
  );
}

/**
 * Centralized HTTP entry point for all feature API modules.
 *
 * - Attaches `Authorization: Bearer <accessToken>` from in-memory token manager.
 * - Handles 401 response detection, concurrency-safe access token refresh, and automatic single retry.
 * - When `NEXT_PUBLIC_API_URL` is configured, executes real HTTP requests
 *   against the NestJS REST backend with credentials: "include" (sending HttpOnly refresh cookies).
 * - When `NEXT_PUBLIC_API_URL` is empty during MVP frontend operation,
 *   delegates to the contract-compatible mock adapter.
 */
export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options?: ApiRequestOptions<TResponse, TBody>,
): Promise<TResponse> {
  const accessToken = !options?.skipAuth ? tokenManager.getAccessToken() : null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.headers,
  };

  console.log("apiRequest", { endpoint, options, accessToken, headers });
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const effectiveOptions: ApiRequestOptions<TResponse, TBody> = {
    ...options,
    headers,
  };

  const baseUrl = getConfiguredApiBaseUrl();

  // MOCK ADAPTER FLOW (when no remote backend configured)
  if (!baseUrl) {
    try {
      const mockData = await dispatchMockApiRequest<TResponse, TBody>(
        endpoint,
        effectiveOptions,
      );
      return effectiveOptions.schema
        ? effectiveOptions.schema.parse(mockData)
        : mockData;
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.statusCode === 401 &&
        !effectiveOptions._retry &&
        !effectiveOptions.skipAuth &&
        !isAuthBypassEndpoint(endpoint)
      ) {
        try {
          const newToken = await tokenManager.executeRefresh();
          if (newToken) {
            return await apiRequest<TResponse, TBody>(endpoint, {
              ...options,
              _retry: true,
            });
          }
        } catch {
          // Token refresh failed; rethrow original error
        }
      }
      throw err;
    }
  }

  // REAL NESTJS BACKEND FLOW
  const method = effectiveOptions.method ?? "GET";
  const queryString = buildQueryString(effectiveOptions.params);
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}${queryString}`;

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body:
      effectiveOptions.body !== undefined
        ? JSON.stringify(effectiveOptions.body)
        : undefined,
    signal: effectiveOptions.signal,
  });

  if (
    response.status === 401 &&
    !effectiveOptions._retry &&
    !effectiveOptions.skipAuth &&
    !isAuthBypassEndpoint(endpoint)
  ) {
    try {
      const nextToken = await tokenManager.executeRefresh();
      if (nextToken) {
        return await apiRequest<TResponse, TBody>(endpoint, {
          ...options,
          _retry: true,
        });
      }
    } catch {
      // Token refresh failed; clear auth state and bubble error
      tokenManager.notifyAuthFailure();
    }
  }

  if (!response.ok) {
    throw await createApiError(response);
  }

  if (response.status === 204) {
    return undefined as unknown as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text as unknown as TResponse;
  }

  const rawJson: unknown = await response.json();
  return effectiveOptions.schema
    ? effectiveOptions.schema.parse(rawJson)
    : (rawJson as TResponse);
}
