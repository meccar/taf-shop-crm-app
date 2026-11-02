import {
  Archive,
  Gift,
  Lamp,
  Layers,
  PenTool,
  Shirt,
  Sparkles,
  Sun,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIconKey } from "@/features/categories/types/category.types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  utensils: Utensils,
  shirt: Shirt,
  lamp: Lamp,
  "pen-tool": PenTool,
  sparkles: Sparkles,
  sun: Sun,
  gift: Gift,
  archive: Archive,
  layers: Layers,
};

export const CATEGORY_ICON_OPTIONS: Array<{
  value: CategoryIconKey;
  label: string;
}> = [
  { value: "utensils", label: "Kitchenware & Dining" },
  { value: "shirt", label: "Apparel & Softgoods" },
  { value: "lamp", label: "Home & Lighting" },
  { value: "pen-tool", label: "Stationery & Desk" },
  { value: "sparkles", label: "Wellness & Care" },
  { value: "sun", label: "Seasonal & Outdoor" },
  { value: "gift", label: "Gifts & Bundles" },
  { value: "archive", label: "Archive & Clearance" },
  { value: "layers", label: "General Merchandise" },
];

interface CategoryIconProps {
  iconKey: CategoryIconKey;
  className?: string;
}

export function CategoryIcon({ iconKey, className }: CategoryIconProps) {
  const IconComponent = ICON_MAP[iconKey] ?? Layers;
  return <IconComponent className={cn("h-4 w-4", className)} />;
}
