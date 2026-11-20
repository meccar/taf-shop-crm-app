"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/api/errors";
import {
  confirmProductImageUpload,
  presignProductImageUpload,
  uploadFileWithProgress,
} from "../api/uploads.api";
import {
  MAX_PRODUCT_IMAGES,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "../schemas/uploads.schema";

export interface ImageUploadTask {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "uploading" | "finalizing" | "error";
  errorMessage?: string;
}

export function useImageUpload({
  storeId,
  attachedKeys,
  onAttachedKeysChange,
}: {
  storeId: string | null;
  attachedKeys: string[];
  onAttachedKeysChange: (keys: string[]) => void;
}) {
  const tUpload = useTranslations("products.upload");
  const tErrors = useTranslations("errors");

  const [tasks, setTasks] = useState<ImageUploadTask[]>([]);
  const [localPreviewsByKey, setLocalPreviewsByKey] = useState<
    Record<string, string>
  >({});

  const tasksRef = useRef<ImageUploadTask[]>([]);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const objectUrlsRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const attachedKeysRef = useRef(attachedKeys);
  useEffect(() => {
    attachedKeysRef.current = attachedKeys;
  }, [attachedKeys]);

  const onAttachedKeysChangeRef = useRef(onAttachedKeysChange);
  useEffect(() => {
    onAttachedKeysChangeRef.current = onAttachedKeysChange;
  }, [onAttachedKeysChange]);

  useEffect(() => {
    const controllers = abortControllersRef.current;
    const urls = objectUrlsRef.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const runUpload = useCallback(
    async (task: ImageUploadTask) => {
      const controller = new AbortController();
      abortControllersRef.current.set(task.id, controller);

      try {
        const presign = await presignProductImageUpload({
          fileName: task.file.name,
          contentType: task.file.type,
          fileSize: task.file.size,
          storeId,
        });

        await uploadFileWithProgress({
          uploadUrl: presign.uploadUrl,
          file: task.file,
          headers: presign.headers,
          signal: controller.signal,
          onProgress: (pct) => {
            setTasks((prev) =>
              prev.map((item) =>
                item.id === task.id ? { ...item, progress: pct } : item,
              ),
            );
          },
        });

        setTasks((prev) =>
          prev.map((item) =>
            item.id === task.id
              ? { ...item, status: "finalizing", progress: 100 }
              : item,
          ),
        );

        const confirmed = await confirmProductImageUpload({
          key: presign.key,
          storeId,
        });

        setLocalPreviewsByKey((prev) => ({
          ...prev,
          [confirmed.key]: task.previewUrl,
        }));
        setTasks((prev) => prev.filter((item) => item.id !== task.id));

        const nextKeys = attachedKeysRef.current.includes(confirmed.key)
          ? attachedKeysRef.current
          : [...attachedKeysRef.current, confirmed.key];
        attachedKeysRef.current = nextKeys;
        onAttachedKeysChangeRef.current(nextKeys);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = getErrorMessage(err, tErrors);
        setTasks((prev) =>
          prev.map((item) =>
            item.id === task.id
              ? { ...item, status: "error", errorMessage: message }
              : item,
          ),
        );
      } finally {
        abortControllersRef.current.delete(task.id);
      }
    },
    [storeId, tErrors],
  );

  const enqueueFiles = useCallback(
    (fileList: FileList): { rejectedMessages: string[] } => {
      const rejectedMessages: string[] = [];
      const incoming = Array.from(fileList);
      let remainingSlots =
        MAX_PRODUCT_IMAGES -
        attachedKeysRef.current.length -
        tasksRef.current.length;

      const acceptedTasks: ImageUploadTask[] = [];

      for (const file of incoming) {
        if (remainingSlots <= 0) {
          rejectedMessages.push(
            tUpload("maxFilesReached", { max: MAX_PRODUCT_IMAGES }),
          );
          break;
        }
        if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
          rejectedMessages.push(tUpload("invalidType", { name: file.name }));
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          rejectedMessages.push(
            tUpload("fileTooLarge", {
              name: file.name,
              maxMb: MAX_IMAGE_SIZE_MB,
            }),
          );
          continue;
        }

        remainingSlots -= 1;
        const previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(previewUrl);
        acceptedTasks.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          previewUrl,
          progress: 0,
          status: "uploading",
        });
      }

      if (acceptedTasks.length > 0) {
        tasksRef.current = [...tasksRef.current, ...acceptedTasks];
        setTasks(tasksRef.current);
        acceptedTasks.forEach((task) => {
          void runUpload(task);
        });
      }

      return { rejectedMessages };
    },
    [runUpload, tUpload],
  );

  const cancelTask = useCallback((taskId: string) => {
    const controller = abortControllersRef.current.get(taskId);
    controller?.abort();
    abortControllersRef.current.delete(taskId);
    setTasks((prev) => {
      const target = prev.find((item) => item.id === taskId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        objectUrlsRef.current.delete(target.previewUrl);
      }
      const next = prev.filter((item) => item.id !== taskId);
      tasksRef.current = next;
      return next;
    });
  }, []);

  const retryTask = useCallback(
    (taskId: string) => {
      const target = tasksRef.current.find((item) => item.id === taskId);
      if (!target) return;
      const resetTask: ImageUploadTask = {
        ...target,
        progress: 0,
        status: "uploading",
        errorMessage: undefined,
      };
      setTasks((prev) => {
        const next = prev.map((item) =>
          item.id === taskId ? resetTask : item,
        );
        tasksRef.current = next;
        return next;
      });
      void runUpload(resetTask);
    },
    [runUpload],
  );

  const removeAttachedKey = useCallback((key: string) => {
    setLocalPreviewsByKey((prev) => {
      const url = prev[key];
      if (!url) return prev;
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
      const next = { ...prev };
      delete next[key];
      return next;
    });
    const nextKeys = attachedKeysRef.current.filter((item) => item !== key);
    attachedKeysRef.current = nextKeys;
    onAttachedKeysChangeRef.current(nextKeys);
  }, []);

  const isUploading = tasks.some(
    (task) => task.status === "uploading" || task.status === "finalizing",
  );
  const hasErrors = tasks.some((task) => task.status === "error");

  return {
    tasks,
    localPreviewsByKey,
    enqueueFiles,
    cancelTask,
    retryTask,
    removeAttachedKey,
    isUploading,
    hasErrors,
  };
}
