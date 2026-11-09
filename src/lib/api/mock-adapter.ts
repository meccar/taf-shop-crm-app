import { ApiError } from "@/lib/api/errors";
import type { ApiRequestOptions, PaginationMeta } from "@/lib/api/types";
import {
  createInitialSeedState,
  type CategoryRecord,
  type MockDatabaseState,
  type ProductRecord,
  type StoreRecord,
} from "@/lib/api/mock-seed";
import type {
  Store,
  StoresListResponse,
} from "@/features/stores/types/store.types";
import type { StoreFormValues } from "@/features/stores/schemas/store.schema";
import type {
  CategoriesListResponse,
  Category,
} from "@/features/categories/types/category.types";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import type {
  Product,
  ProductSortField,
  ProductsListResponse,
  SortDirection,
} from "@/features/products/types/product.types";
import type { ProductFormValues } from "@/features/products/schemas/product.schema";
import type {
  ActivityLogItem,
  DashboardSummary,
} from "@/features/dashboard/types/dashboard.types";
import type { WorkspaceSettings } from "@/features/settings/types/settings.types";
import type { WorkspaceSettingsFormValues } from "@/features/settings/schemas/settings.schema";
import { slugify } from "@/lib/utils";

import { APP_ASSETS } from "@/lib/constants/assets";
import type {
  AuthTokensResponse,
  AuthUser,
  LoginDto,
  LogoutResponse,
} from "@/features/auth/types/auth.type";

const STORAGE_KEY = "shop_crm_mock_db_v1";
const STORAGE_AUTH_SESSION_KEY = "shop_crm_mock_auth_session";
const SIMULATED_DELAY_MS = 110;

const DEFAULT_MOCK_USER: AuthUser = {
  id: "usr-1",
  email: "sarah.j@shopcrm.internal",
  name: "Sarah Jenkins",
  role: "Operations Lead",
  avatarUrl: APP_ASSETS.userAvatar,
  customerId: "RET-994",
};

function getMockSessionStatus(): "active" | "revoked" {
  if (typeof window === "undefined") return "active";
  try {
    const status = window.localStorage.getItem(STORAGE_AUTH_SESSION_KEY);
    // If never set before, initialize as active for seamless first-load preview
    if (status === null) {
      window.localStorage.setItem(STORAGE_AUTH_SESSION_KEY, "active");
      return "active";
    }
    return status === "active" ? "active" : "revoked";
  } catch {
    return "active";
  }
}

function setMockSessionStatus(status: "active" | "revoked"): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_AUTH_SESSION_KEY, status);
    } catch {
      // Ignore storage errors
    }
  }
}

let memoryDb: MockDatabaseState | null = null;

function loadDb(): MockDatabaseState {
  if (typeof window === "undefined") {
    if (!memoryDb) {
      memoryDb = createInitialSeedState();
    }
    return memoryDb;
  }

  if (memoryDb) {
    return memoryDb;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDatabaseState;
      if (
        parsed &&
        Array.isArray(parsed.stores) &&
        Array.isArray(parsed.categories) &&
        Array.isArray(parsed.products)
      ) {
        memoryDb = parsed;
        return memoryDb;
      }
    }
  } catch {
    // Ignore storage read errors and re-seed
  }

  memoryDb = createInitialSeedState();
  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(state: MockDatabaseState): void {
  memoryDb = state;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }
}

function appendActivity(
  db: MockDatabaseState,
  entry: Omit<ActivityLogItem, "id" | "timestamp">,
): void {
  const newLog: ActivityLogItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.activityLogs = [newLog, ...db.activityLogs].slice(0, 40);
}

function buildPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    page: safePage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

function hydrateStore(record: StoreRecord, products: ProductRecord[]): Store {
  const storeProducts = products.filter((p) => p.storeId === record.id);
  const skuCount = storeProducts.length;
  const inStockItems = storeProducts.filter((p) => p.stockQuantity > 0).length;
  const lowStockCount = storeProducts.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold,
  ).length;
  const inStockRate =
    skuCount === 0 ? 0 : Math.round((inStockItems / skuCount) * 1000) / 10;

  return {
    ...record,
    skuCount,
    inStockRate,
    lowStockCount,
  };
}

function hydrateCategory(
  record: CategoryRecord,
  products: ProductRecord[],
  activeStoreId?: string,
): Category {
  const matchingProducts = products.filter((p) => p.categoryId === record.id);
  const activeStoreProductCount = activeStoreId
    ? matchingProducts.filter((p) => p.storeId === activeStoreId).length
    : matchingProducts.length;

  return {
    ...record,
    productCount: matchingProducts.length,
    activeStoreProductCount,
  };
}

function hydrateProduct(
  record: ProductRecord,
  categories: CategoryRecord[],
): Product {
  const category = categories.find((c) => c.id === record.categoryId);
  return {
    ...record,
    categoryName: category ? category.name : "Uncategorized",
  };
}

function normalizeCode(rawCode: string): string {
  const trimmed = rawCode.trim().toUpperCase();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function normalizeSlug(rawSlug: string): string {
  return rawSlug.trim().replace(/^\/+/, "").toLowerCase();
}

export async function dispatchMockApiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options?: ApiRequestOptions<TResponse, TBody>,
): Promise<TResponse> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  const method = options?.method ?? "GET";
  const params = options?.params ?? {};
  const body = options?.body;
  const cleanPath = endpoint.split("?")[0];
  const db = loadDb();

  // =========================================================================
  // AUTHENTICATION ENDPOINTS (NestJS contract compatible)
  // =========================================================================
  if (cleanPath === "/auth/login" && method === "POST") {
    const credentials = (body ?? {}) as Partial<LoginDto>;
    const email = credentials.email?.trim().toLowerCase() ?? "";
    const password = credentials.password ?? "";

    if (!email || !password || password.length < 6 || !email.includes("@")) {
      throw new ApiError({
        statusCode: 400,
        error: "BAD_REQUEST",
        message: "Email and password (minimum 6 characters) are required.",
      });
    }

    // Allow user to test invalid credential behavior explicitly
    if (email === "invalid@test.com" || password === "wrongpassword") {
      throw new ApiError({
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    setMockSessionStatus("active");
    const response: AuthTokensResponse = {
      accessToken: `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    return response as unknown as TResponse;
  }

  if (cleanPath === "/auth/refresh" && method === "POST") {
    const session = getMockSessionStatus();
    if (session !== "active") {
      throw new ApiError({
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "Session expired or invalid refresh token cookie.",
      });
    }

    const response: AuthTokensResponse = {
      accessToken: `mock-jwt-refreshed-${Date.now()}`,
    };
    return response as unknown as TResponse;
  }

  if (cleanPath === "/auth/logout" && method === "POST") {
    setMockSessionStatus("revoked");
    const response: LogoutResponse = { loggedOut: true };
    return response as unknown as TResponse;
  }

  if (
    (cleanPath === "/auth/profile" || cleanPath === "/auth/me") &&
    method === "GET"
  ) {
    const session = getMockSessionStatus();
    if (session !== "active") {
      throw new ApiError({
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "Unauthorized: Missing or invalid token.",
      });
    }

    return DEFAULT_MOCK_USER as unknown as TResponse;
  }

  // =========================================================================
  // DASHBOARD ENDPOINTS
  // =========================================================================
  if (cleanPath === "/dashboard/summary" && method === "GET") {
    const requestedStoreId =
      typeof params.storeId === "string" && params.storeId.length > 0
        ? params.storeId
        : db.stores[0]?.id;

    const storeRecord =
      db.stores.find((s) => s.id === requestedStoreId) ?? db.stores[0];

    if (!storeRecord) {
      throw new ApiError({
        statusCode: 404,
        error: "NOT_FOUND",
        message: "No stores are provisioned in this workspace.",
      });
    }

    const activeStore = hydrateStore(storeRecord, db.products);
    const storeProducts = db.products
      .filter((p) => p.storeId === storeRecord.id)
      .map((p) => hydrateProduct(p, db.categories));

    const storeCategories = db.categories.filter(
      (c) => c.appliesToAllStores || c.storeIds.includes(storeRecord.id),
    );

    const lowStockItems = storeProducts
      .filter((p) => p.stockQuantity <= p.lowStockThreshold)
      .sort((a, b) => a.stockQuantity - b.stockQuantity);

    const recentlyUpdatedProducts = [...storeProducts]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 6);

    const response: DashboardSummary = {
      activeStore,
      metrics: {
        totalStores: db.stores.length,
        activeStores: db.stores.filter((s) => s.status === "ACTIVE").length,
        storeProductsCount: storeProducts.length,
        networkProductsCount: db.products.length,
        storeCategoriesCount: storeCategories.length,
        totalCategoriesCount: db.categories.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: storeProducts.filter((p) => p.stockQuantity === 0)
          .length,
      },
      lowStockItems: lowStockItems.slice(0, 5),
      recentlyUpdatedProducts,
      recentActivity: db.activityLogs.slice(0, 8),
    };

    return response as unknown as TResponse;
  }

  if (cleanPath === "/dashboard/activity" && method === "GET") {
    return db.activityLogs as unknown as TResponse;
  }

  // =========================================================================
  // STORES ENDPOINTS
  // =========================================================================
  if (cleanPath === "/stores" && method === "GET") {
    const search =
      typeof params.search === "string"
        ? params.search.trim().toLowerCase()
        : "";
    const status = typeof params.status === "string" ? params.status : "ALL";
    const format = typeof params.format === "string" ? params.format : "ALL";
    const page =
      typeof params.page === "number" ? params.page : Number(params.page ?? 1);
    const pageSize =
      typeof params.pageSize === "number"
        ? params.pageSize
        : Number(params.pageSize ?? 10);

    const allHydrated = db.stores.map((s) => hydrateStore(s, db.products));

    const filtered = allHydrated.filter((store) => {
      if (status !== "ALL" && store.status !== status) return false;
      if (format !== "ALL" && store.format !== format) return false;
      if (search.length > 0) {
        const haystack = [
          store.name,
          store.code,
          store.address,
          store.cityStateZip,
          store.managerName,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const meta = buildPaginationMeta(filtered.length, page, pageSize);
    const start = (meta.page - 1) * meta.pageSize;
    const paginated = filtered.slice(start, start + meta.pageSize);

    const inactiveStores = allHydrated.filter((s) => s.status === "INACTIVE");

    const response: StoresListResponse = {
      data: paginated,
      meta,
      summary: {
        totalStores: allHydrated.length,
        activeStores: allHydrated.filter((s) => s.status === "ACTIVE").length,
        inactiveStores: inactiveStores.length,
        totalCatalogSkus: db.products.length,
        inactiveStoreLabel: inactiveStores[0]?.name ?? null,
      },
    };

    return response as unknown as TResponse;
  }

  if (cleanPath === "/stores" && method === "POST") {
    const payload = body as StoreFormValues;
    const formattedCode = normalizeCode(payload.code);

    const duplicateCode = db.stores.some(
      (s) => s.code.toUpperCase() === formattedCode.toUpperCase(),
    );
    if (duplicateCode) {
      throw new ApiError({
        statusCode: 409,
        error: "CONFLICT",
        message: `A store with code ${formattedCode} already exists.`,
      });
    }

    const nowIso = new Date().toISOString();
    const newStore: StoreRecord = {
      id: `store-${Date.now()}`,
      code: formattedCode,
      name: payload.name.trim(),
      slug: slugify(payload.name),
      format: payload.format,
      description: payload.description?.trim() || null,
      address: payload.address.trim(),
      cityStateZip: payload.cityStateZip.trim(),
      phone: payload.phone?.trim() || null,
      email: payload.email?.trim() || null,
      managerName: payload.managerName.trim(),
      managerEmail: payload.managerEmail.trim(),
      taxRate: Number(payload.taxRate),
      status: payload.status,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.stores = [newStore, ...db.stores];
    // Add new store to categories configured for all stores
    db.categories = db.categories.map((cat) =>
      cat.appliesToAllStores
        ? {
            ...cat,
            storeIds: Array.from(new Set([...cat.storeIds, newStore.id])),
          }
        : cat,
    );

    appendActivity(db, {
      entityType: "STORE",
      entityName: newStore.name,
      action: `Provisioned retail location ${newStore.code}`,
      actorName: "Sarah Jenkins",
      storeCode: newStore.code,
    });

    saveDb(db);
    return hydrateStore(newStore, db.products) as unknown as TResponse;
  }

  const storeIdMatch = cleanPath.match(/^\/stores\/([^/]+)$/);
  if (storeIdMatch) {
    const storeId = decodeURIComponent(storeIdMatch[1]);
    const index = db.stores.findIndex((s) => s.id === storeId);

    if (index === -1) {
      throw new ApiError({
        statusCode: 404,
        error: "NOT_FOUND",
        message: "Requested store location was not found.",
      });
    }

    if (method === "GET") {
      return hydrateStore(
        db.stores[index],
        db.products,
      ) as unknown as TResponse;
    }

    if (method === "PATCH" || method === "PUT") {
      const payload = body as Partial<StoreFormValues>;
      const existing = db.stores[index];
      const nextCode = payload.code
        ? normalizeCode(payload.code)
        : existing.code;

      const duplicateCode = db.stores.some(
        (s) =>
          s.id !== storeId && s.code.toUpperCase() === nextCode.toUpperCase(),
      );
      if (duplicateCode) {
        throw new ApiError({
          statusCode: 409,
          error: "CONFLICT",
          message: `Another store already uses code ${nextCode}.`,
        });
      }

      const updated: StoreRecord = {
        ...existing,
        name: payload.name !== undefined ? payload.name.trim() : existing.name,
        slug:
          payload.name !== undefined ? slugify(payload.name) : existing.slug,
        code: nextCode,
        format: payload.format ?? existing.format,
        description:
          payload.description !== undefined
            ? payload.description.trim() || null
            : existing.description,
        address:
          payload.address !== undefined
            ? payload.address.trim()
            : existing.address,
        cityStateZip:
          payload.cityStateZip !== undefined
            ? payload.cityStateZip.trim()
            : existing.cityStateZip,
        phone:
          payload.phone !== undefined
            ? payload.phone.trim() || null
            : existing.phone,
        email:
          payload.email !== undefined
            ? payload.email.trim() || null
            : existing.email,
        managerName:
          payload.managerName !== undefined
            ? payload.managerName.trim()
            : existing.managerName,
        managerEmail:
          payload.managerEmail !== undefined
            ? payload.managerEmail.trim()
            : existing.managerEmail,
        taxRate:
          payload.taxRate !== undefined
            ? Number(payload.taxRate)
            : existing.taxRate,
        status: payload.status ?? existing.status,
        updatedAt: new Date().toISOString(),
      };

      db.stores[index] = updated;
      appendActivity(db, {
        entityType: "STORE",
        entityName: updated.name,
        action:
          payload.status && payload.status !== existing.status
            ? `Changed store status to ${updated.status}`
            : `Updated store configuration`,
        actorName: "Sarah Jenkins",
        storeCode: updated.code,
      });
      saveDb(db);
      return hydrateStore(updated, db.products) as unknown as TResponse;
    }

    if (method === "DELETE") {
      if (db.stores.length <= 1) {
        throw new ApiError({
          statusCode: 409,
          error: "CONFLICT",
          message:
            "Cannot delete the final remaining store in the tenant workspace.",
        });
      }

      const removed = db.stores[index];
      db.stores = db.stores.filter((s) => s.id !== storeId);
      db.products = db.products.filter((p) => p.storeId !== storeId);
      db.categories = db.categories.map((c) => ({
        ...c,
        storeIds: c.storeIds.filter((id) => id !== storeId),
      }));

      appendActivity(db, {
        entityType: "STORE",
        entityName: removed.name,
        action: `Decommissioned store ${removed.code}`,
        actorName: "Sarah Jenkins",
        storeCode: removed.code,
      });
      saveDb(db);
      return { deleted: true, id: storeId } as unknown as TResponse;
    }
  }

  // =========================================================================
  // PRODUCTS ENDPOINTS
  // =========================================================================
  if (cleanPath === "/products" && method === "GET") {
    const storeId = typeof params.storeId === "string" ? params.storeId : "";
    const search =
      typeof params.search === "string"
        ? params.search.trim().toLowerCase()
        : "";
    const categoryId =
      typeof params.categoryId === "string" ? params.categoryId : "ALL";
    const status = typeof params.status === "string" ? params.status : "ALL";
    const stockHealth =
      typeof params.stockHealth === "string" ? params.stockHealth : "ALL";
    const sortBy =
      (params.sortBy as ProductSortField | undefined) ?? "updatedAt";
    const sortOrder = (params.sortOrder as SortDirection | undefined) ?? "desc";
    const page =
      typeof params.page === "number" ? params.page : Number(params.page ?? 1);
    const pageSize =
      typeof params.pageSize === "number"
        ? params.pageSize
        : Number(params.pageSize ?? 10);

    const storeScopedRecords = storeId
      ? db.products.filter((p) => p.storeId === storeId)
      : db.products;

    const allStoreProducts = storeScopedRecords.map((p) =>
      hydrateProduct(p, db.categories),
    );

    const filtered = allStoreProducts.filter((product) => {
      if (categoryId !== "ALL" && product.categoryId !== categoryId) {
        return false;
      }
      if (status !== "ALL" && product.status !== status) {
        return false;
      }
      if (
        stockHealth === "IN_STOCK" &&
        product.stockQuantity <= product.lowStockThreshold
      ) {
        return false;
      }
      if (
        stockHealth === "LOW_STOCK" &&
        (product.stockQuantity === 0 ||
          product.stockQuantity > product.lowStockThreshold)
      ) {
        return false;
      }
      if (stockHealth === "OUT_OF_STOCK" && product.stockQuantity !== 0) {
        return false;
      }
      if (search.length > 0) {
        const haystack =
          `${product.name} ${product.sku} ${product.categoryName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * multiplier;
        case "sku":
          return a.sku.localeCompare(b.sku) * multiplier;
        case "price":
          return (a.price - b.price) * multiplier;
        case "stockQuantity":
          return (a.stockQuantity - b.stockQuantity) * multiplier;
        case "updatedAt":
        default:
          return (
            (new Date(a.updatedAt).getTime() -
              new Date(b.updatedAt).getTime()) *
            multiplier
          );
      }
    });

    const meta = buildPaginationMeta(sorted.length, page, pageSize);
    const start = (meta.page - 1) * meta.pageSize;
    const paginated = sorted.slice(start, start + meta.pageSize);

    const response: ProductsListResponse = {
      data: paginated,
      meta,
      summary: {
        totalStoreProducts: allStoreProducts.length,
        activeProducts: allStoreProducts.filter((p) => p.status === "ACTIVE")
          .length,
        lowStockProducts: allStoreProducts.filter(
          (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold,
        ).length,
        outOfStockProducts: allStoreProducts.filter(
          (p) => p.stockQuantity === 0,
        ).length,
      },
    };

    return response as unknown as TResponse;
  }

  if (cleanPath === "/products" && method === "POST") {
    const payload = body as ProductFormValues;
    const normalizedSku = payload.sku.trim().toUpperCase();

    if (db.settings.enforceUniqueSkuPerStore) {
      const skuExists = db.products.some(
        (p) =>
          p.storeId === payload.storeId &&
          p.sku.toUpperCase() === normalizedSku,
      );
      if (skuExists) {
        throw new ApiError({
          statusCode: 409,
          error: "CONFLICT",
          message: `SKU "${normalizedSku}" already exists in this store.`,
        });
      }
    }

    const nowIso = new Date().toISOString();
    const newProduct: ProductRecord = {
      id: `prod-${Date.now()}`,
      storeId: payload.storeId,
      categoryId: payload.categoryId,
      name: payload.name.trim(),
      sku: normalizedSku,
      description: payload.description?.trim() || null,
      price: Number(payload.price),
      stockQuantity: Number(payload.stockQuantity),
      lowStockThreshold: Number(payload.lowStockThreshold),
      status: payload.status,
      imageUrl: payload.imageUrl?.trim() || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.products = [newProduct, ...db.products];
    const store = db.stores.find((s) => s.id === payload.storeId);
    if (store) {
      store.updatedAt = nowIso;
    }

    appendActivity(db, {
      entityType: "PRODUCT",
      entityName: newProduct.name,
      action: `Added SKU ${newProduct.sku} (${newProduct.stockQuantity} units)`,
      actorName: "Sarah Jenkins",
      storeCode: store?.code ?? null,
    });

    saveDb(db);
    return hydrateProduct(newProduct, db.categories) as unknown as TResponse;
  }

  const productIdMatch = cleanPath.match(/^\/products\/([^/]+)$/);
  if (productIdMatch) {
    const productId = decodeURIComponent(productIdMatch[1]);
    const index = db.products.findIndex((p) => p.id === productId);

    if (index === -1) {
      throw new ApiError({
        statusCode: 404,
        error: "NOT_FOUND",
        message: "Requested product could not be found.",
      });
    }

    if (method === "GET") {
      return hydrateProduct(
        db.products[index],
        db.categories,
      ) as unknown as TResponse;
    }

    if (method === "PATCH" || method === "PUT") {
      const payload = body as Partial<ProductFormValues>;
      const existing = db.products[index];
      const nextSku = payload.sku
        ? payload.sku.trim().toUpperCase()
        : existing.sku;
      const targetStoreId = payload.storeId ?? existing.storeId;

      if (db.settings.enforceUniqueSkuPerStore) {
        const duplicateSku = db.products.some(
          (p) =>
            p.id !== productId &&
            p.storeId === targetStoreId &&
            p.sku.toUpperCase() === nextSku,
        );
        if (duplicateSku) {
          throw new ApiError({
            statusCode: 409,
            error: "CONFLICT",
            message: `SKU "${nextSku}" is already assigned to another product in this store.`,
          });
        }
      }

      const nowIso = new Date().toISOString();
      const updated: ProductRecord = {
        ...existing,
        storeId: targetStoreId,
        categoryId: payload.categoryId ?? existing.categoryId,
        name: payload.name !== undefined ? payload.name.trim() : existing.name,
        sku: nextSku,
        description:
          payload.description !== undefined
            ? payload.description.trim() || null
            : existing.description,
        price:
          payload.price !== undefined ? Number(payload.price) : existing.price,
        stockQuantity:
          payload.stockQuantity !== undefined
            ? Number(payload.stockQuantity)
            : existing.stockQuantity,
        lowStockThreshold:
          payload.lowStockThreshold !== undefined
            ? Number(payload.lowStockThreshold)
            : existing.lowStockThreshold,
        status: payload.status ?? existing.status,
        imageUrl:
          payload.imageUrl !== undefined
            ? payload.imageUrl.trim() || null
            : existing.imageUrl,
        updatedAt: nowIso,
      };

      db.products[index] = updated;
      const store = db.stores.find((s) => s.id === updated.storeId);
      if (store) {
        store.updatedAt = nowIso;
      }

      appendActivity(db, {
        entityType: "PRODUCT",
        entityName: updated.name,
        action: `Updated SKU ${updated.sku} (${updated.stockQuantity} in stock)`,
        actorName: "Sarah Jenkins",
        storeCode: store?.code ?? null,
      });

      saveDb(db);
      return hydrateProduct(updated, db.categories) as unknown as TResponse;
    }

    if (method === "DELETE") {
      const removed = db.products[index];
      const store = db.stores.find((s) => s.id === removed.storeId);
      db.products = db.products.filter((p) => p.id !== productId);

      appendActivity(db, {
        entityType: "PRODUCT",
        entityName: removed.name,
        action: `Removed SKU ${removed.sku} from catalog`,
        actorName: "Sarah Jenkins",
        storeCode: store?.code ?? null,
      });

      saveDb(db);
      return { deleted: true, id: productId } as unknown as TResponse;
    }
  }

  // =========================================================================
  // CATEGORIES ENDPOINTS
  // =========================================================================
  if (cleanPath === "/categories" && method === "GET") {
    const search =
      typeof params.search === "string"
        ? params.search.trim().toLowerCase()
        : "";
    const occupancy =
      typeof params.occupancy === "string" ? params.occupancy : "ALL";
    const storeId =
      typeof params.storeId === "string" ? params.storeId : undefined;
    const page =
      typeof params.page === "number" ? params.page : Number(params.page ?? 1);
    const pageSize =
      typeof params.pageSize === "number"
        ? params.pageSize
        : Number(params.pageSize ?? 25);

    const allHydrated = [...db.categories]
      .sort((a, b) => a.posOrder - b.posOrder)
      .map((cat) => hydrateCategory(cat, db.products, storeId));

    const filtered = allHydrated.filter((cat) => {
      if (occupancy === "WITH_PRODUCTS" && cat.productCount === 0) return false;
      if (occupancy === "EMPTY" && cat.productCount > 0) return false;
      if (search.length > 0) {
        const haystack =
          `${cat.name} ${cat.slug} ${cat.description ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const meta = buildPaginationMeta(filtered.length, page, pageSize);
    const start = (meta.page - 1) * meta.pageSize;
    const paginated = filtered.slice(start, start + meta.pageSize);

    const response: CategoriesListResponse = {
      data: paginated,
      meta,
      counts: {
        all: allHydrated.length,
        withProducts: allHydrated.filter((c) => c.productCount > 0).length,
        empty: allHydrated.filter((c) => c.productCount === 0).length,
        activeCategories: allHydrated.filter((c) => c.status === "ACTIVE")
          .length,
        totalAssignedSkus: db.products.length,
      },
    };

    return response as unknown as TResponse;
  }

  if (cleanPath === "/categories/reorder" && method === "PATCH") {
    const payload = body as { orderedIds: string[] };
    if (Array.isArray(payload.orderedIds)) {
      payload.orderedIds.forEach((id, idx) => {
        const cat = db.categories.find((c) => c.id === id);
        if (cat) {
          cat.posOrder = idx + 1;
          cat.updatedAt = new Date().toISOString();
        }
      });

      appendActivity(db, {
        entityType: "CATEGORY",
        entityName: "POS Category Hierarchy",
        action: "Updated Point of Sale tab sequence priority",
        actorName: "Sarah Jenkins",
        storeCode: null,
      });

      saveDb(db);
    }

    return db.categories
      .sort((a, b) => a.posOrder - b.posOrder)
      .map((c) => hydrateCategory(c, db.products)) as unknown as TResponse;
  }

  if (cleanPath === "/categories" && method === "POST") {
    const payload = body as CategoryFormValues;
    const cleanSlug = normalizeSlug(payload.slug);

    const duplicateSlug = db.categories.some((c) => c.slug === cleanSlug);
    if (duplicateSlug) {
      throw new ApiError({
        statusCode: 409,
        error: "CONFLICT",
        message: `A category with slug "/${cleanSlug}" already exists.`,
      });
    }

    const nowIso = new Date().toISOString();
    const resolvedStoreIds = payload.appliesToAllStores
      ? db.stores.map((s) => s.id)
      : payload.storeIds;

    const newCategory: CategoryRecord = {
      id: `cat-${Date.now()}`,
      name: payload.name.trim(),
      slug: cleanSlug,
      description: payload.description?.trim() || null,
      iconKey: payload.iconKey,
      posOrder: Number(payload.posOrder),
      status: payload.status,
      appliesToAllStores: payload.appliesToAllStores,
      storeIds: resolvedStoreIds,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.categories = [...db.categories, newCategory];
    appendActivity(db, {
      entityType: "CATEGORY",
      entityName: newCategory.name,
      action: `Created category /${newCategory.slug} (POS #${newCategory.posOrder})`,
      actorName: "Sarah Jenkins",
      storeCode: null,
    });

    saveDb(db);
    return hydrateCategory(newCategory, db.products) as unknown as TResponse;
  }

  const categoryIdMatch = cleanPath.match(/^\/categories\/([^/]+)$/);
  if (categoryIdMatch) {
    const categoryId = decodeURIComponent(categoryIdMatch[1]);
    const index = db.categories.findIndex((c) => c.id === categoryId);

    if (index === -1) {
      throw new ApiError({
        statusCode: 404,
        error: "NOT_FOUND",
        message: "Requested category was not found.",
      });
    }

    if (method === "GET") {
      const storeId =
        typeof params.storeId === "string" ? params.storeId : undefined;
      return hydrateCategory(
        db.categories[index],
        db.products,
        storeId,
      ) as unknown as TResponse;
    }

    if (method === "PATCH" || method === "PUT") {
      const payload = body as Partial<CategoryFormValues>;
      const existing = db.categories[index];
      const nextSlug = payload.slug
        ? normalizeSlug(payload.slug)
        : existing.slug;

      const duplicateSlug = db.categories.some(
        (c) => c.id !== categoryId && c.slug === nextSlug,
      );
      if (duplicateSlug) {
        throw new ApiError({
          statusCode: 409,
          error: "CONFLICT",
          message: `Another category already uses slug "/${nextSlug}".`,
        });
      }

      const nextAppliesAll =
        payload.appliesToAllStores ?? existing.appliesToAllStores;
      const nextStoreIds = nextAppliesAll
        ? db.stores.map((s) => s.id)
        : (payload.storeIds ?? existing.storeIds);

      const updated: CategoryRecord = {
        ...existing,
        name: payload.name !== undefined ? payload.name.trim() : existing.name,
        slug: nextSlug,
        description:
          payload.description !== undefined
            ? payload.description.trim() || null
            : existing.description,
        iconKey: payload.iconKey ?? existing.iconKey,
        posOrder:
          payload.posOrder !== undefined
            ? Number(payload.posOrder)
            : existing.posOrder,
        status: payload.status ?? existing.status,
        appliesToAllStores: nextAppliesAll,
        storeIds: nextStoreIds,
        updatedAt: new Date().toISOString(),
      };

      db.categories[index] = updated;
      appendActivity(db, {
        entityType: "CATEGORY",
        entityName: updated.name,
        action: `Updated category /${updated.slug}`,
        actorName: "Sarah Jenkins",
        storeCode: null,
      });

      saveDb(db);
      return hydrateCategory(updated, db.products) as unknown as TResponse;
    }

    if (method === "DELETE") {
      const referencingCount = db.products.filter(
        (p) => p.categoryId === categoryId,
      ).length;

      if (referencingCount > 0) {
        throw new ApiError({
          statusCode: 409,
          error: "CATEGORY_IN_USE",
          message: `Cannot delete "${db.categories[index].name}" while ${referencingCount} product${referencingCount === 1 ? "" : "s"} still reference it. Reassign or remove those products first.`,
        });
      }

      const removed = db.categories[index];
      db.categories = db.categories.filter((c) => c.id !== categoryId);

      appendActivity(db, {
        entityType: "CATEGORY",
        entityName: removed.name,
        action: `Deleted empty category /${removed.slug}`,
        actorName: "Sarah Jenkins",
        storeCode: null,
      });

      saveDb(db);
      return { deleted: true, id: categoryId } as unknown as TResponse;
    }
  }

  // =========================================================================
  // SETTINGS & MOCK RESET ENDPOINTS
  // =========================================================================
  if (cleanPath === "/settings" && method === "GET") {
    return db.settings as unknown as TResponse;
  }

  if (cleanPath === "/settings" && (method === "PATCH" || method === "PUT")) {
    const payload = body as Partial<WorkspaceSettingsFormValues>;
    db.settings = {
      ...db.settings,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    appendActivity(db, {
      entityType: "SYSTEM",
      entityName: "Workspace Settings",
      action: "Updated tenant defaults and POS sync parameters",
      actorName: "Sarah Jenkins",
      storeCode: null,
    });

    saveDb(db);
    return db.settings as unknown as TResponse;
  }

  if (cleanPath === "/settings/reset-mock-data" && method === "POST") {
    const freshSeed = createInitialSeedState();
    saveDb(freshSeed);
    return freshSeed.settings as unknown as TResponse;
  }

  throw new ApiError({
    statusCode: 404,
    error: "ENDPOINT_NOT_FOUND",
    message: `Unhandled API endpoint: ${method} ${cleanPath}`,
  });
}
