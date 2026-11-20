export const APP_LOCALES = ["en", "vi"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_NAME = "shop_crm_locale";

export const DISPLAY_CURRENCIES = ["USD", "VND"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];
export const DEFAULT_CURRENCY: DisplayCurrency = "USD";
export const CURRENCY_COOKIE_NAME = "shop_crm_currency";

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (APP_LOCALES as readonly string[]).includes(value)
  );
}

export function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return (
    typeof value === "string" &&
    (DISPLAY_CURRENCIES as readonly string[]).includes(value)
  );
}
