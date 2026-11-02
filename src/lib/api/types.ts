import type { ZodType } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, string[]>;
}

export type QueryParamValue = string | number | boolean | undefined | null;

export interface ApiRequestOptions<TResponse = unknown, TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  params?: Record<string, QueryParamValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  schema?: ZodType<TResponse>;
}
