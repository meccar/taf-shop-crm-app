import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export interface BackendErrorBody {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    details?: Record<string, string[]>;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
  }
}

const KNOWN_ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]{2,}$/;

export function normalizeApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const raw = body as BackendErrorBody;
    const statusCode =
      typeof raw.statusCode === "number" ? raw.statusCode : status;
    const rawError = typeof raw.error === "string" ? raw.error : "";
    const code = KNOWN_ERROR_CODE_PATTERN.test(rawError)
      ? rawError
      : `HTTP_${statusCode}`;

    let message = "";
    if (Array.isArray(raw.message)) {
      message = raw.message
        .filter((item) => typeof item === "string")
        .join(", ");
    } else if (typeof raw.message === "string") {
      message = raw.message;
    } else if (rawError) {
      message = rawError;
    } else {
      message = `Request failed (${statusCode})`;
    }

    const details =
      raw.details && typeof raw.details === "object" ? raw.details : undefined;

    return new ApiError({
      statusCode,
      code,
      message,
      details,
    });
  }

  const rawText = typeof body === "string" ? body.trim() : "";
  const isHtml =
    rawText.length > 0 && /<(?:!doctype|html|head|body)\b/i.test(rawText);

  return new ApiError({
    statusCode: status,
    code: status === 0 ? "NETWORK_ERROR" : `HTTP_${status}`,
    message: rawText && !isHtml ? rawText : `Request failed (${status})`,
  });
}

type ErrorTranslator = ((key: string) => string) & {
  has?: (key: string) => boolean;
};

export function getErrorMessage(
  error: unknown,
  tErrors: ErrorTranslator,
): string {
  if (error instanceof ApiError) {
    const codeKey = `codes.${error.code}`;
    if (typeof tErrors.has === "function" && tErrors.has(codeKey)) {
      return tErrors(codeKey);
    }
    try {
      const translated = tErrors(codeKey);
      if (
        translated &&
        translated !== codeKey &&
        !translated.endsWith(`.${codeKey}`)
      ) {
        return translated;
      }
    } catch {
      // Fall through to backend message or generic fallback
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return tErrors("fallback");
}

export function applyFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  allowedFields: readonly string[],
): void {
  if (!(error instanceof ApiError) || !error.details) return;

  const allowedSet = new Set(allowedFields);
  for (const [field, messages] of Object.entries(error.details)) {
    if (
      !allowedSet.has(field) ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      continue;
    }
    const firstMessage = messages.find(
      (m) => typeof m === "string" && m.trim().length > 0,
    );
    if (firstMessage) {
      setError(field as Path<TFieldValues>, {
        type: "server",
        message: firstMessage,
      });
    }
  }
}
