import type { AppLocale } from "./config";

import enAuth from "@/messages/en/auth.json";
import enCategories from "@/messages/en/categories.json";
import enCommon from "@/messages/en/common.json";
import enDashboard from "@/messages/en/dashboard.json";
import enErrors from "@/messages/en/errors.json";
import enProducts from "@/messages/en/products.json";
import enSettings from "@/messages/en/settings.json";
import enStores from "@/messages/en/stores.json";

import viAuth from "@/messages/vi/auth.json";
import viCategories from "@/messages/vi/categories.json";
import viCommon from "@/messages/vi/common.json";
import viDashboard from "@/messages/vi/dashboard.json";
import viErrors from "@/messages/vi/errors.json";
import viProducts from "@/messages/vi/products.json";
import viSettings from "@/messages/vi/settings.json";
import viStores from "@/messages/vi/stores.json";

const enMessages = {
  common: enCommon,
  auth: enAuth,
  errors: enErrors,
  stores: enStores,
  categories: enCategories,
  products: enProducts,
  dashboard: enDashboard,
  settings: enSettings,
};

const viMessages = {
  common: viCommon,
  auth: viAuth,
  errors: viErrors,
  stores: viStores,
  categories: viCategories,
  products: viProducts,
  dashboard: viDashboard,
  settings: viSettings,
};

export type AppMessages = typeof enMessages;

export function getMergedMessages(locale: AppLocale): AppMessages {
  return locale === "vi" ? viMessages : enMessages;
}
