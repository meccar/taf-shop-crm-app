import type { ZodType, ZodTypeDef } from "zod";
import { ApiError, normalizeApiError } from "./errors";
import { clearActiveStoreId, getActiveStoreId } from "./store-context";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./token-store";
import { getApiBaseUrl } from "./config";
import { parseApiEnvelope } from "./types";

export interface BlobResponse {
  blob: Blob;
  filename: string | null;
}

export type QueryParamValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions<T> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryParamValue>;
  body?: unknown;
  headers?: Record<string, string>;
  responseType?: "json" | "blob";
  schema?: ZodType<T, ZodTypeDef, unknown>;
  skipAuth?: boolean;
  includeStoreHeader?: boolean;
  signal?: AbortSignal;
}

const AUTH_NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
]);

let refreshPromise: Promise<string | null> | null = null;

function buildUrl(
  path: string,
  query?: Record<string, QueryParamValue>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  const fullPath = `${base}${normalizedPath}`;

  if (!query) return fullPath;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }

  const qs = searchParams.toString();
  return qs ? `${fullPath}?${qs}` : fullPath;
}

function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;\r\n]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/^["']|["']$/g, ""));
    } catch {
      return utf8Match[1];
    }
  }

  const basicMatch = header.match(/filename="?([^";\r\n]+)"?/i);
  if (basicMatch?.[1]) {
    return basicMatch[1].trim();
  }

  return null;
}

function handleSessionExpired(): void {
  clearAccessToken();
  clearActiveStoreId();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

async function refreshAccessTokenSingleFlight(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(buildUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          return null;
        }

        const text = await res.text();
        if (!text) return null;

        const parsed = JSON.parse(text) as any;
        const payload = parsed?.data ?? parsed;
        if (
          typeof payload?.accessToken === "string" &&
          payload.accessToken.length > 0
        ) {
          setAccessToken(payload.accessToken);
          return payload.accessToken;
        }
        return null;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function refreshSessionToken(): Promise<string | null> {
  return refreshAccessTokenSingleFlight();
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const json = await res.json();
      return normalizeApiError(res.status, json);
    } catch {
      return normalizeApiError(res.status, null);
    }
  }

  try {
    const text = await res.text();
    return normalizeApiError(res.status, text);
  } catch {
    return normalizeApiError(res.status, null);
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions<T> = {},
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    headers: customHeaders,
    responseType = "json",
    schema,
    skipAuth = false,
    includeStoreHeader = true,
    signal,
  } = options;

  const url = buildUrl(path, query);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const executeFetch = async (
    tokenOverride?: string | null,
  ): Promise<Response> => {
    const headers = new Headers(customHeaders);

    if (!headers.has("Accept")) {
      headers.set(
        "Accept",
        responseType === "blob" ? "*/*" : "application/json",
      );
    }

    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!skipAuth) {
      const token = tokenOverride ?? getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    if (includeStoreHeader) {
      const activeStoreId = getActiveStoreId();
      if (activeStoreId && !headers.has("x-store-id")) {
        headers.set("x-store-id", activeStoreId);
      }
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      requestBody = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    return fetch(url, {
      method,
      headers,
      body: requestBody,
      credentials: "include",
      signal,
    });
  };

  let res: Response;
  try {
    res = await executeFetch();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new ApiError({
      statusCode: 0,
      code: "NETWORK_ERROR",
      message: err instanceof Error ? err.message : "Network request failed",
    });
  }

  if (
    res.status === 401 &&
    !skipAuth &&
    !AUTH_NO_REFRESH_PATHS.has(normalizedPath)
  ) {
    const newToken = await refreshAccessTokenSingleFlight();
    if (!newToken) {
      handleSessionExpired();
      throw await parseErrorResponse(res);
    }
    res = await executeFetch(newToken);
    if (res.status === 401) {
      handleSessionExpired();
      throw await parseErrorResponse(res);
    }
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (responseType === "blob") {
    const blob = await res.blob();
    const filename = parseContentDispositionFilename(
      res.headers.get("content-disposition"),
    );
    return { blob, filename } satisfies BlobResponse as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError({
      statusCode: res.status,
      code: "INVALID_RESPONSE",
      message: "Received an unexpected non-JSON response from the server.",
    });
  }

  return parseApiEnvelope<T>(json, schema);
}
