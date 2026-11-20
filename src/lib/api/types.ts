import { z, ZodTypeDef, type ZodType } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue = string | number | boolean | null | undefined;
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}

export interface BlobResponse {
  blob: Blob;
  filename: string | null;
}

export interface ApiRequestOptions<TResponse = unknown, TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  query?: Record<string, QueryParamValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  schema?: ZodType<TResponse>;
  skipAuth?: boolean;
  includeStoreHeader?: boolean;
  responseType?: "json" | "blob";
}

export interface ApiEnvelope<T> {
  status: number;
  data: T;
}

export function parseApiEnvelope<T>(
  json: unknown,
  schema?: ZodType<T, ZodTypeDef, unknown>,
): T {
  const envelope = z
    .object({
      status: z.number(),
      data: z.unknown(),
    })
    .parse(json);

  return schema ? schema.parse(envelope.data) : (envelope.data as T);
}
