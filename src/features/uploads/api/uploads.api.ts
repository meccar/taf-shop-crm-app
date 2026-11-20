import { apiRequest } from "@/lib/api/client";
import {
  PresignUploadResponse,
  presignUploadResponseSchema,
  ConfirmUploadResponse,
  confirmUploadResponseSchema,
} from "../schemas/uploads.schema";

export async function presignProductImageUpload(params: {
  fileName: string;
  contentType: string;
  fileSize: number;
  storeId?: string | null;
}): Promise<PresignUploadResponse> {
  return apiRequest<PresignUploadResponse>("/uploads/presign", {
    method: "POST",
    headers: params.storeId ? { "x-store-id": params.storeId } : undefined,
    body: {
      fileName: params.fileName,
      contentType: params.contentType,
      fileSize: params.fileSize,
    },
    schema: presignUploadResponseSchema,
  });
}

export async function confirmProductImageUpload(params: {
  key: string;
  storeId?: string | null;
}): Promise<ConfirmUploadResponse> {
  return apiRequest<ConfirmUploadResponse>("/uploads/confirm", {
    method: "POST",
    headers: params.storeId ? { "x-store-id": params.storeId } : undefined,
    body: {
      key: params.key,
    },
    schema: confirmUploadResponseSchema,
  });
}

export function uploadFileWithProgress(params: {
  uploadUrl: string;
  file: File;
  headers?: Record<string, string>;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", params.uploadUrl);
    xhr.setRequestHeader("Content-Type", params.file.type);
    if (params.headers) {
      for (const [key, val] of Object.entries(params.headers)) {
        if (key.toLowerCase() !== "content-type") {
          xhr.setRequestHeader(key, val);
        }
      }
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.min(
          100,
          Math.round((event.loaded / event.total) * 100),
        );
        params.onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network upload error"));
    xhr.onabort = () =>
      reject(new DOMException("Upload aborted", "AbortError"));

    if (params.signal) {
      if (params.signal.aborted) {
        xhr.abort();
        return;
      }
      params.signal.addEventListener("abort", () => xhr.abort(), {
        once: true,
      });
    }

    xhr.send(params.file);
  });
}
