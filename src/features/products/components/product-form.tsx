"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { APP_ASSETS } from "@/lib/constants/assets";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product.schema";
import type { Product } from "@/features/products/types/product.types";
import type { Category } from "@/features/categories/types/category.types";
import type { Store } from "@/features/stores/types/store.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductThumbnail } from "@/components/shared/product-thumbnail";

interface ProductFormProps {
  activeStore: Store;
  categories: Category[];
  initialData?: Product;
  defaultLowStockThreshold?: number;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (values: ProductFormValues) => void;
  onCancel?: () => void;
}

const PRESET_GALLERY = [
  {
    label: "Stoneware Kettle",
    url: APP_ASSETS.products.ceramicKettle,
  },
  {
    label: "Canvas Tote",
    url: APP_ASSETS.products.canvasTote,
  },
  {
    label: "Aroma Diffuser",
    url: APP_ASSETS.products.aromaDiffuser,
  },
];

export function ProductForm({
  activeStore,
  categories,
  initialData,
  defaultLowStockThreshold = 10,
  isSubmitting,
  submitLabel = "Save Product",
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const defaultCategoryId = initialData?.categoryId ?? categories[0]?.id ?? "";

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      storeId: initialData?.storeId ?? activeStore.id,
      categoryId: defaultCategoryId,
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? 28.0,
      stockQuantity: initialData?.stockQuantity ?? 24,
      lowStockThreshold:
        initialData?.lowStockThreshold ?? defaultLowStockThreshold,
      status: initialData?.status ?? "ACTIVE",
      imageUrl: initialData?.imageUrl ?? "",
    },
  });

  // Ensure categoryId gets populated once categories finish loading
  React.useEffect(() => {
    if (!watch("categoryId") && categories.length > 0) {
      setValue("categoryId", categories[0].id);
    }
  }, [categories, setValue, watch]);

  const currentImageUrl = watch("imageUrl");
  const currentName = watch("name");
  const currentSku = watch("sku");

  const handleGenerateSku = () => {
    const storePrefix = activeStore.code.replace(/[^A-Z0-9]/gi, "").slice(0, 5);
    const nameTokens = currentName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const itemToken =
      nameTokens.length > 0
        ? nameTokens
            .slice(0, 2)
            .map((w) => w.slice(0, 3))
            .join("-")
        : "SKU";
    const suffix = String(Math.floor(100 + Math.random() * 900));
    setValue("sku", `${storePrefix}-${itemToken}-${suffix}`, {
      shouldValidate: true,
    });
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid PNG, JPG, or WebP image file");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Image file size must be under 1.5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("imageUrl", reader.result, { shouldValidate: true });
        toast.success(`Attached image "${file.name}"`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("storeId")} />

      <div className="rounded-lg border border-border bg-accent/55 px-3.5 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          Target Store Catalog:{" "}
          <strong className="font-semibold text-brand-navy">
            {activeStore.name}
          </strong>
        </span>
        <span className="font-mono font-semibold text-primary tabular-nums">
          {activeStore.code}
        </span>
      </div>

      {/* Product Name & SKU */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-5">
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor="prod-name">Product Name *</Label>
          <Input
            id="prod-name"
            placeholder="e.g. Hand-Glazed Stoneware Mug"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prod-sku">SKU *</Label>
            <button
              type="button"
              onClick={handleGenerateSku}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Auto-SKU
            </button>
          </div>
          <Input
            id="prod-sku"
            placeholder="STR01-MUG-204"
            className="font-mono uppercase tabular-nums"
            {...register("sku")}
          />
          {errors.sku && (
            <p className="text-xs text-destructive">{errors.sku.message}</p>
          )}
        </div>
      </div>

      {/* Category & Status */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Assigned Category *</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} (/{cat.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-xs text-destructive">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Catalog Status *</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (POS Visible)</SelectItem>
                  <SelectItem value="DRAFT">Draft (Staging)</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="prod-price">Unit Price (USD) *</Label>
          <Input
            id="prod-price"
            type="number"
            step="0.01"
            min="0.01"
            className="tabular-nums"
            {...register("price")}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prod-stock">Stock Quantity *</Label>
          <Input
            id="prod-stock"
            type="number"
            step="1"
            min="0"
            className="tabular-nums"
            {...register("stockQuantity")}
          />
          {errors.stockQuantity && (
            <p className="text-xs text-destructive">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prod-threshold">Low-Stock Alert Threshold *</Label>
          <Input
            id="prod-threshold"
            type="number"
            step="1"
            min="0"
            className="tabular-nums"
            {...register("lowStockThreshold")}
          />
          {errors.lowStockThreshold && (
            <p className="text-xs text-destructive">
              {errors.lowStockThreshold.message}
            </p>
          )}
        </div>
      </div>

      {/* Image Upload & Studio Presets */}
      <div className="space-y-2">
        <Label>Product Imagery</Label>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3.5 sm:flex-row sm:items-center">
          <ProductThumbnail
            imageUrl={currentImageUrl}
            name={currentName || "Product preview"}
            sku={currentSku}
            size="md"
            className="h-20 w-20 rounded-lg"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processImageFile(file);
            }}
            className={`flex-1 rounded-lg border border-dashed p-3 transition-colors ${
              isDragging
                ? "border-primary bg-accent"
                : "border-slate-300 bg-card"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processImageFile(file);
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Upload studio photo or drag & drop
                </p>
                <p className="text-[11px]">PNG, JPG, WebP up to 1.5 MB</p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Browse
                </Button>
                {currentImageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("imageUrl", "")}
                    title="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <ImagePlus className="h-3 w-3" />
                Catalog presets:
              </span>
              {PRESET_GALLERY.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setValue("imageUrl", preset.url, { shouldValidate: true })
                  }
                  className="rounded border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {errors.imageUrl && (
          <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="prod-desc">Catalog Description</Label>
        <Textarea
          id="prod-desc"
          rows={2}
          placeholder="Material specifications, care instructions, and POS display notes..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
