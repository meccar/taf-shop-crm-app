import { dispatchMockApiRequest } from "@/lib/api/mock-adapter";
import type { ApiRequestOptions, QueryParamValue } from "@/lib/api/types";
import { createApiError } from "@/lib/api/errors";

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

/**
 * Centralized HTTP entry point for all feature API modules.
 *
 * - When `NEXT_PUBLIC_API_URL` is configured, executes real HTTP requests
 *   against the NestJS REST backend with JSON serialization, error normalization,
 *   empty response handling, and optional Zod response validation.
 * - When `NEXT_PUBLIC_API_URL` is empty during MVP frontend operation,
 *   delegates to the contract-compatible mock adapter without changing any
 *   feature API module or TanStack Query hook.
 */
export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options?: ApiRequestOptions<TResponse, TBody>,
): Promise<TResponse> {
  const baseUrl = getConfiguredApiBaseUrl();

  if (!baseUrl) {
    const mockData = await dispatchMockApiRequest<TResponse, TBody>(
      endpoint,
      options,
    );
    return options?.schema ? options.schema.parse(mockData) : mockData;
  }

  const method = options?.method ?? "GET";
  const queryString = buildQueryString(options?.params);
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}${queryString}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.headers,
  };

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body:
      options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options?.signal,
  });

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
  return options?.schema
    ? options.schema.parse(rawJson)
    : (rawJson as TResponse);
}
