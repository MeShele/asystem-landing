import { useEffect, useState } from "react";

/**
 * Живые данные платформы: число обменников и цены тарифов. Источник —
 * публичная edge platform-stats на core (те же цифры, что в КП и «Тарифах»
 * из админки: один расчёт на сервере). Пока ответ не пришёл или если API
 * недоступно — null, и блоки показывают запасной вариант без выдуманных цифр.
 */
export const STATS_URL = "https://api.asystem.ai/functions/v1/platform-stats";

export interface PlatformTier {
  id: "start" | "business";
  title: string;
  /** $ в месяц */
  monthly: number;
  /** $ разово при подключении */
  setup: number;
}

export interface PlatformStats {
  currency: "USD";
  prepayMonths: number;
  exchangers?: number;
  tiers?: PlatformTier[];
  buyout?: { price: number; from: boolean };
}

let cache: Promise<PlatformStats | null> | null = null;

function load(): Promise<PlatformStats | null> {
  cache ??= fetch(STATS_URL)
    .then((r) => (r.ok ? (r.json() as Promise<PlatformStats>) : null))
    .catch(() => null);
  return cache;
}

/** Один запрос на страницу, сколько бы компонентов ни спросили. */
export function usePlatformStats(): PlatformStats | null {
  const [data, setData] = useState<PlatformStats | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((d) => alive && setData(d));
    return () => { alive = false; };
  }, []);
  return data;
}
