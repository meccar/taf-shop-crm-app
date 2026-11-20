"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DisplayCurrency,
  isDisplayCurrency,
  AppLocale,
  LOCALE_COOKIE_NAME,
  CURRENCY_COOKIE_NAME,
  DEFAULT_CURRENCY,
} from "./config";

let currentCurrency: DisplayCurrency = DEFAULT_CURRENCY;
const currencyListeners = new Set<() => void>();

function readCurrencyCookie(): DisplayCurrency {
  if (typeof document === "undefined") return DEFAULT_CURRENCY;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CURRENCY_COOKIE_NAME}=([^;]*)`),
  );
  const raw = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isDisplayCurrency(raw) ? raw : DEFAULT_CURRENCY;
}

export function setLocaleCookie(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function setDisplayCurrencyPreference(currency: DisplayCurrency): void {
  currentCurrency = currency;
  if (typeof document !== "undefined") {
    document.cookie = `${CURRENCY_COOKIE_NAME}=${encodeURIComponent(currency)}; path=/; max-age=31536000; SameSite=Lax`;
  }
  currencyListeners.forEach((listener) => listener());
}

export function useDisplayCurrency(): [
  DisplayCurrency,
  (currency: DisplayCurrency) => void,
] {
  useEffect(() => {
    const cookieValue = readCurrencyCookie();
    if (cookieValue !== currentCurrency) {
      currentCurrency = cookieValue;
      currencyListeners.forEach((listener) => listener());
    }
  }, []);

  const value = useSyncExternalStore(
    (listener) => {
      currencyListeners.add(listener);
      return () => currencyListeners.delete(listener);
    },
    () => currentCurrency,
    () => DEFAULT_CURRENCY,
  );

  const setCurrency = useCallback((next: DisplayCurrency) => {
    setDisplayCurrencyPreference(next);
  }, []);

  return [value, setCurrency];
}
