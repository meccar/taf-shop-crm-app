import type { AppLocale, DisplayCurrency } from "./config";

function getIntlLocale(locale: AppLocale): string {
  return locale === "vi" ? "vi-VN" : "en-US";
}

export function formatNumber(
  value: number | string,
  locale: AppLocale,
): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat(getIntlLocale(locale)).format(num);
}

export function formatCurrency(
  value: number | string,
  locale: AppLocale,
  currency: DisplayCurrency = "USD",
): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);

  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(num);
}

export function formatDateTime(
  value: string | Date,
  locale: AppLocale,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value: string | Date, locale: AppLocale): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
  }).format(date);
}
