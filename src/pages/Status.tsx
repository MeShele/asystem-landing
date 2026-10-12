import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/i18n";
import { usePlatformStatus, type StackState } from "@/lib/platformStatus";

/**
 * Страница статуса: работает ли платформа и обменники на ней прямо сейчас и
 * какая доля проверок за 30 дней была успешной. Имена обменников не публикуем —
 * только номера. Данные — с сервера (опрос раз в минуту), ничего не выдумываем:
 * нет ответа — так и пишем.
 */
const Status = () => {
  const { t, lang } = useLang();
  const { data, error, loading } = usePlatformStatus();

  useEffect(() => {
    const prev = document.title;
    document.title = t("Статус платформы — ASystem Core", "Platform status — ASystem Core");
    window.scrollTo(0, 0);
    return () => { document.title = prev; };
  }, [t]);

  const stateLabel = (s: StackState) =>
    s === "ok" ? t("работает", "operational")
    : s === "degraded" ? t("перебои", "degraded")
    : s === "down" ? t("не отвечает", "down")
    : t("нет данных", "no data");

  const dotClass = (s: StackState) =>
    s === "ok" ? "bg-emerald-500" : s === "degraded" ? "bg-amber-500" : s === "down" ? "bg-red-500" : "bg-muted-foreground/40";

  const fmtPct = (n: number | null) => (n == null ? "—" : `${n.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 2 })} %`);
  const fmtTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : "—";

  const headline = (() => {
    if (loading) return t("Проверяем…", "Checking…");
    if (error || !data) return t("Данные о статусе сейчас недоступны", "Status data is unavailable right now");
    const { totals, platform } = data;
    if (platform && platform.status !== "ok") return t("Перебои в работе ядра платформы", "Platform core is experiencing issues");
    if (totals.down + totals.degraded === 0) return t("Все обменники работают", "All exchanges are operational");
    return t(
      `Перебои у ${totals.down + totals.degraded} из ${totals.total} обменников`,
      `${totals.down + totals.degraded} of ${totals.total} exchanges have issues`,
    );
  })();

  const headlineTone = (() => {
    if (loading || error || !data) return "border-border";
    const bad = data.totals.down + data.totals.degraded + (data.platform && data.platform.status !== "ok" ? 1 : 0);
    return bad === 0 ? "border-emerald-500/60" : "border-amber-500/60";
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> {t("На главную", "Back to home")}
            </Link>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Link to="/" className="hidden sm:block"><Logo /></Link>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <ThemeToggle />
            <Button variant="signal" size="sm" asChild>
              <Link to="/#demo">{t("Запросить демо", "Request a demo")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-12 sm:py-16">
        <div className="flex items-center gap-3">
          <span className="h-2 w-10 rounded-sm bg-accent" />
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("Статус · проверка раз в минуту", "Status · checked every minute")}
          </span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {t("Статус платформы ASystem Core", "ASystem Core platform status")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t(
            "Каждую минуту снаружи проверяются витрина, API и база каждого обменника на платформе. Здесь — результат без имён: кто из клиентов работает на ASystem, мы публично не называем.",
            "Every minute the storefront, API and database of every exchange on the platform are checked from outside. Results are shown without names: we don't publicly disclose which clients run on ASystem.",
          )}
        </p>

        <section className={`mt-10 rounded-2xl border-2 bg-card p-6 ${headlineTone}`} aria-live="polite">
          <div className="flex items-start gap-3">
            <Activity className="mt-1 h-6 w-6 shrink-0 text-accent" />
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-extrabold">{headline}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("Последняя проверка", "Last check")}: {fmtTime(data?.checked_at ?? null)}
              </p>
            </div>
          </div>
          {data && (
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("Обменников", "Exchanges")}</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold tabular-nums">{data.totals.total}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("Работают", "Operational")}</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold tabular-nums">{data.totals.ok}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t(`Uptime за ${data.window_days} дн.`, `${data.window_days}-day uptime`)}</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold tabular-nums">{fmtPct(data.uptime)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("Ядро платформы", "Platform core")}</dt>
                <dd className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotClass(data.platform?.status ?? "unknown")}`} />
                  {stateLabel(data.platform?.status ?? "unknown")}
                </dd>
              </div>
            </dl>
          )}
          {data && data.history_days < 30 && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t(
                `История проверок копится с ${data.history_days === 0 ? "сегодняшнего дня" : `${data.history_days} дн. назад`}; uptime за полные ${data.window_days} дней появится позже.`,
                `Check history has been accumulating for ${data.history_days} day(s); full ${data.window_days}-day uptime will appear later.`,
              )}
            </p>
          )}
        </section>

        {data && data.exchanges.length > 0 && (
          <section className="mt-8">
            <h3 className="font-display text-lg font-bold">{t("Обменники на платформе", "Exchanges on the platform")}</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {data.exchanges.map((e) => (
                <li key={e.n} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass(e.status)}`} />
                    <span className="font-medium">{t(`Обменник ${e.n}`, `Exchange ${e.n}`)}</span>
                    <span className="text-muted-foreground">{stateLabel(e.status)}</span>
                    {e.down_for_min != null && (
                      <span className="text-muted-foreground">· {t(`${e.down_for_min} мин`, `${e.down_for_min} min`)}</span>
                    )}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{fmtPct(e.uptime)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 text-sm leading-relaxed text-muted-foreground">
          <p>
            {t(
              "«Работает» — витрина и API отвечают, база обслуживает запросы. «Перебои» — сайт открывается, но база не отвечает. «Не отвечает» — витрина или API недоступны. Uptime — доля успешных проверок за период по каждому обменнику.",
              "“Operational” — storefront and API respond and the database serves requests. “Degraded” — the site opens but the database doesn't respond. “Down” — storefront or API unreachable. Uptime is the share of successful checks over the period per exchange.",
            )}
          </p>
          <p className="mt-3">
            {t(
              "Обменники на собственных серверах клиентов проверяются так же, как размещённые у нас.",
              "Exchanges on clients' own servers are checked the same way as those hosted with us.",
            )}
          </p>
        </section>
      </main>
    </div>
  );
};

export default Status;
