import type { ApiErrorPayload } from "@/lib/api/types";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.errorCode = payload.error;
    this.details = payload.details;
  }

  public isNotFound(): boolean {
    return this.statusCode === 404;
  }

  public isConflict(): boolean {
    return this.statusCode === 409;
  }

  public isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }
}

export async function createApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as Partial<ApiErrorPayload> & {
        message?: string | string[];
      };

      const normalizedMessage = Array.isArray(data.message)
        ? data.message.join(", ")
        : typeof data.message === "string" && data.message.length > 0
          ? data.message
          : `Request failed with status ${response.status}`;

      return new ApiError({
        statusCode: data.statusCode ?? response.status,
        message: normalizedMessage,
        error: data.error ?? response.statusText ?? "API_ERROR",
        details: data.details,
      });
    } catch {
      // Fallback if response JSON is malformed
    }
  }

  const fallbackText = await response.text().catch(() => "");
  return new ApiError({
    statusCode: response.status,
    message:
      fallbackText.trim().length > 0
        ? fallbackText
        : `Request failed with status ${response.status}`,
    error: response.statusText || "HTTP_ERROR",
  });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
