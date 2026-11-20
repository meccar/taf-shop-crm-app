"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImageUpload } from "../hooks/use-image-upload";
import { MAX_PRODUCT_IMAGES } from "../schemas/uploads.schema";

interface ImageUploaderProps {
  storeId: string | null;
  value: string[];
  onChange: (keys: string[]) => void;
  onPendingStateChange?: (isPendingOrError: boolean) => void;
}

export function ImageUploader({
  storeId,
  value,
  onChange,
  onPendingStateChange,
}: ImageUploaderProps) {
  const t = useTranslations("products.upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    tasks,
    localPreviewsByKey,
    enqueueFiles,
    cancelTask,
    retryTask,
    removeAttachedKey,
    isUploading,
    hasErrors,
  } = useImageUpload({
    storeId,
    attachedKeys: value,
    onAttachedKeysChange: onChange,
  });

  const isBlocked = isUploading || hasErrors;
  const onPendingStateChangeRef = useRef(onPendingStateChange);
  useEffect(() => {
    onPendingStateChangeRef.current = onPendingStateChange;
  });
  useEffect(() => {
    onPendingStateChangeRef.current?.(isBlocked);
  }, [isBlocked]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { rejectedMessages } = enqueueFiles(files);
    rejectedMessages.forEach((msg) => toast.error(msg));
  };

  const canAddMore = value.length + tasks.length < MAX_PRODUCT_IMAGES;

  return (
    <div className="space-y-3">
      {canAddMore ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
            isDragging
              ? "border-action bg-surface-selected"
              : "border-line bg-canvas hover:border-line-strong hover:bg-surface-subtle/50",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-line text-muted">
            <ImagePlus className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-ink">{t("dropzoneTitle")}</p>
          <p className="mt-1 text-xs text-muted">{t("dropzoneHint")}</p>
        </div>
      ) : null}

      {value.length > 0 || tasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {value.map((key) => {
            const preview = localPreviewsByKey[key];
            const label = key.split("/").pop() ?? key;
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2.5"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-surface-subtle flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt={label}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink font-mono">
                    {label}
                  </p>
                  <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{t("ready")}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("removeImage")}
                  onClick={() => removeAttachedKey(key)}
                >
                  <Trash2 className="h-4 w-4 text-muted hover:text-destructive" />
                </Button>
              </div>
            );
          })}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-surface-subtle">
                  <img
                    src={task.previewUrl}
                    alt={task.file.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">
                    {task.file.name}
                  </p>
                  {task.status === "error" ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive truncate">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {task.errorMessage ?? t("failed")}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-action tabular-nums">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>
                        {task.status === "finalizing"
                          ? t("finalizing")
                          : `${t("uploading")} ${task.progress}%`}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {task.status === "error" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("retryUpload")}
                      onClick={() => retryTask(task.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("cancelUpload")}
                    onClick={() => cancelTask(task.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {task.status !== "error" ? (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full bg-action transition-all duration-150"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {isBlocked ? (
        <p className="text-xs text-warning">{t("waitPending")}</p>
      ) : null}
    </div>
  );
}
