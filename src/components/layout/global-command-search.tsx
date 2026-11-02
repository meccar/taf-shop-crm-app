"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  LayoutGrid,
  Package,
  Plus,
  Settings,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useActiveStore } from "@/stores/active-store-context";
import { useProducts } from "@/features/products/api/product.queries";
import { useCategories } from "@/features/categories/api/category.queries";
import { formatCurrency } from "@/lib/utils";

interface GlobalCommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalCommandSearch({
  open,
  onOpenChange,
}: GlobalCommandSearchProps) {
  const router = useRouter();
  const { activeStoreId, activeStore, stores, setActiveStoreId } =
    useActiveStore();

  const { data: productsData } = useProducts({
    storeId: activeStoreId,
    page: 1,
    pageSize: 50,
  });

  const { data: categoriesData } = useCategories({
    storeId: activeStoreId,
    page: 1,
    pageSize: 50,
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runAction = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Search products, SKUs, categories, or switch stores..." />
        <CommandList>
          <CommandEmpty>
            No matching stores, products, or categories found.
          </CommandEmpty>

          <CommandGroup heading="Quick Navigation & Actions">
            <CommandItem onSelect={() => runAction(() => router.push("/"))}>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span>Overview Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runAction(() => router.push("/stores/new"))}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Create New Retail Store</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runAction(() => router.push("/products/new"))}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Add Product to {activeStore?.name ?? "Active Store"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runAction(() => router.push("/categories/new"))}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Create Catalog Category</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runAction(() => router.push("/settings"))}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Workspace Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Switch Store Context">
            {stores.map((store) => (
              <CommandItem
                key={store.id}
                value={`${store.name} ${store.code} ${store.cityStateZip}`}
                onSelect={() =>
                  runAction(() => {
                    setActiveStoreId(store.id);
                    toast.success(`Switched active store to ${store.name}`);
                  })
                }
              >
                <StoreIcon className="h-4 w-4 text-brand-navy" />
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span>{store.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {store.code}
                    {store.id === activeStoreId ? " · Current" : ""}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          {(productsData?.data.length ?? 0) > 0 && (
            <CommandGroup
              heading={`Products in ${activeStore?.name ?? "Active Store"}`}
            >
              {productsData?.data.slice(0, 8).map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.sku} ${product.categoryName}`}
                  onSelect={() =>
                    runAction(() => router.push(`/products/${product.id}`))
                  }
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-1 items-center justify-between gap-2 truncate">
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {product.sku} · {formatCurrency(product.price)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {(categoriesData?.data.length ?? 0) > 0 && (
            <CommandGroup heading="Catalog Categories">
              {categoriesData?.data.map((category) => (
                <CommandItem
                  key={category.id}
                  value={`${category.name} ${category.slug}`}
                  onSelect={() =>
                    runAction(() => router.push(`/categories/${category.id}`))
                  }
                >
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span>{category.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      /{category.slug} · {category.productCount} SKUs
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
