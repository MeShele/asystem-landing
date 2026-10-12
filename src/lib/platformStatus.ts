import { useEffect, useState } from "react";

/**
 * Публичный статус платформы — edge platform-status на core: сводка без имён
 * обменников (сколько работают, uptime за 30 дней, ядро). Обновляем раз в минуту —
 * чаще светофор на сервере не пишется.
 */
export const STATUS_URL = "https://api.asystem.ai/functions/v1/platform-status";

export type StackState = "ok" | "degraded" | "down" | "unknown";

export interface PlatformStatus {
  checked_at: string | null;
  platform: { status: StackState; uptime: number | null } | null;
  exchanges: { n: number; status: StackState; uptime: number | null; down_for_min: number | null }[];
  totals: { total: number; ok: number; degraded: number; down: number };
  uptime: number | null;
  history_days: number;
  window_days: number;
}

export function usePlatformStatus(): { data: PlatformStatus | null; error: boolean; loading: boolean } {
  const [data, setData] = useState<PlatformStatus | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(STATUS_URL, { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const json = (await r.json()) as PlatformStatus;
        if (alive) { setData(json); setError(false); }
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = window.setInterval(load, 60_000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  return { data, error, loading };
}
