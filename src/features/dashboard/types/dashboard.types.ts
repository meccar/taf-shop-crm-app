import { QuickAction } from "@/components/shared/quick-actions-menu";
import type { Product } from "@/features/products/types/product.types";
import type { Store } from "@/features/stores/types/store.types";
import { FolderTree, Plus, StoreIcon } from "lucide-react";

export type ActivityEntityType = "STORE" | "PRODUCT" | "CATEGORY" | "SYSTEM";

export interface ActivityLogItem {
  id: string;
  entityType: ActivityEntityType;
  entityName: string;
  action: string;
  actorName: string;
  storeCode: string | null;
  timestamp: string;
}

export interface DashboardSummary {
  activeStore: Store;
  metrics: {
    totalStores: number;
    activeStores: number;
    storeProductsCount: number;
    networkProductsCount: number;
    storeCategoriesCount: number;
    totalCategoriesCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  lowStockItems: Product[];
  recentlyUpdatedProducts: Product[];
  recentActivity: ActivityLogItem[];
}
