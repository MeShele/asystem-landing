import { Link } from "react-router-dom";
import PageShell, { PageHead } from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import Illus from "@/components/Illus";
import { useLang } from "@/i18n";
import { usePlatformStatus, type StackState } from "@/lib/platformStatus";

/**
 * Страница статуса: работает ли платформа и обменники на ней прямо сейчас и
 * какая доля проверок за 30 дней была успешной. Имена обменников не публикуем —
 * только номера. Данные — с сервера (опрос раз в минуту), ничего не выдумываем:
 * нет ответа — так и пишем. Оформление — сетка главной.
 */
const Status = () => {
  const { t, lang } = useLang();
  const { data, error, loading } = usePlatformStatus();

  const stateLabel = (s: StackState) =>
    s === "ok" ? t("работает", "operational")
    : s === "degraded" ? t("перебои", "degraded")
    : s === "down" ? t("не отвечает", "down")
    : t("нет данных", "no data");

  const dotStyle = (s: StackState) => ({
    background:
      s === "ok" ? "hsl(var(--ok))"
      : s === "degraded" ? "hsl(var(--warn))"
      : s === "down" ? "hsl(var(--danger))"
      : "hsl(var(--muted) / 0.4)",
  });

  const fmtPct = (n: number | null) => (n == null ? "—" : `${n.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 2 })} %`);
  const fmtTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : "—";

  const stale = !!data && (data.platform?.status ?? "unknown") === "unknown" && data.totals.unknown === data.totals.total;
  const issues = data ? data.totals.down + data.totals.degraded : 0;
  const coreBad = !!data?.platform && data.platform.status !== "ok" && data.platform.status !== "unknown";

  const headline = (() => {
    if (loading) return t("Проверяем…", "Checking…");
    if (error || !data) return t("Данные о статусе сейчас недоступны", "Status data is unavailable right now");
    // Снимки старше 10 минут: встал сам опрос, а не обменники — «всё хорошо» по ним не говорим.
    if (stale) return t("Данные проверок устарели — обновляем", "Check data is stale — refreshing");
    if (coreBad) return t("Перебои в работе ядра платформы", "Platform core is experiencing issues");
    if (issues === 0) return t("Все обменники работают", "All exchanges are operational");
    return t(`Перебои у ${issues} из ${data.totals.total} обменников`, `${issues} of ${data.totals.total} exchanges have issues`);
  })();

  const tone = loading || error || !data || stale ? "hsl(var(--muted))" : issues + (coreBad ? 1 : 0) === 0 ? "hsl(var(--ok))" : "hsl(var(--warn))";

  return (
    <PageShell title={t("Статус платформы — ASystem Core", "Platform status — ASystem Core")}>
      <section className="wrap relative pb-6">
        <Illus bg name="gear" size={480} className="right-[-80px] top-[-120px] hidden lg:block" />
        <Reveal className="relative z-[1]">
          <PageHead
            eyebrow={t("Статус · проверка раз в минуту", "Status · checked every minute")}
            title={t("Статус платформы", "Platform status")}
            lead={t(
              "Витрина, API и база каждого обменника проверяются снаружи. Имена клиентов не публикуем, только номера.",
              "The storefront, API and database of every exchange are checked from outside. Client names are not published, only numbers.",
            )}
          />
        </Reveal>
      </section>

      <section className="wrap py-10 sm:py-14">
        <Reveal className="panel p-7 sm:p-10" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tone }} aria-hidden="true" />
            <h2 className="t-h3">{headline}</h2>
          </div>
          <p className="t-small muted mt-2">{t("Последняя проверка", "Last check")}: {fmtTime(data?.checked_at ?? null)}</p>
          {data && (
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[hsl(var(--line)/0.08)] pt-8 lg:grid-cols-4">
              <div>
                <dt className="t-small muted">{t("Обменников", "Exchanges")}</dt>
                <dd className="t-h2 tabular mt-2 font-display">{data.totals.total}</dd>
              </div>
              <div>
                <dt className="t-small muted">{t("Работают", "Operational")}</dt>
                <dd className="t-h2 tabular mt-2 font-display">{data.totals.ok}</dd>
              </div>
              <div>
                <dt className="t-small muted">{t(`Uptime за ${data.window_days} дн.`, `${data.window_days}-day uptime`)}</dt>
                <dd className="t-h2 tabular mt-2 font-display">{fmtPct(data.uptime)}</dd>
              </div>
              <div>
                <dt className="t-small muted">{t("Ядро платформы", "Platform core")}</dt>
                <dd className="mt-3 flex items-center gap-2.5 text-[17px] font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full" style={dotStyle(data.platform?.status ?? "unknown")} />
                  {stateLabel(data.platform?.status ?? "unknown")}
                </dd>
              </div>
            </dl>
          )}
          {data && data.history_days < 30 && (
            <p className="t-small muted mt-6">
              {t(
                `История копится с ${data.history_days === 0 ? "сегодняшнего дня" : `${data.history_days} дн. назад`}, uptime за полные ${data.window_days} дней появится позже.`,
                `History has been accumulating for ${data.history_days} day(s); full ${data.window_days}-day uptime will appear later.`,
              )}
            </p>
          )}
        </Reveal>
      </section>

      {data && data.exchanges.length > 0 && (
        <section className="wrap py-10 sm:py-14">
          <Reveal className="max-w-[640px]">
            <h2 className="t-h2">{t("Обменники на платформе", "Exchanges on the platform")}</h2>
          </Reveal>
          <Reveal as="ul" className="mt-8 grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            {data.exchanges.map((e) => (
              <li key={e.n} className="flex items-center justify-between gap-4 border-t border-[hsl(var(--line)/0.08)] py-4 text-[15px]">
                <span className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={dotStyle(e.status)} />
                  <span className="font-semibold">{t(`Обменник ${e.n}`, `Exchange ${e.n}`)}</span>
                  <span className="muted">{stateLabel(e.status)}</span>
                  {e.down_for_min != null && <span className="muted">· {t(`${e.down_for_min} мин`, `${e.down_for_min} min`)}</span>}
                </span>
                <span className="tabular muted">{fmtPct(e.uptime)}</span>
              </li>
            ))}
          </Reveal>
        </section>
      )}

      <section className="wrap py-10 pb-16 sm:py-14 sm:pb-20">
        <Reveal className="grid grid-cols-1 gap-6 text-[15px] leading-relaxed lg:grid-cols-3">
          <div className="panel p-6">
            <p className="font-semibold">{t("Работает", "Operational")}</p>
            <p className="muted mt-2">{t("Витрина и API отвечают, база обслуживает запросы.", "Storefront and API respond, the database serves requests.")}</p>
          </div>
          <div className="panel p-6">
            <p className="font-semibold">{t("Перебои", "Degraded")}</p>
            <p className="muted mt-2">{t("Сайт открывается, база не отвечает.", "The site opens, the database doesn't respond.")}</p>
          </div>
          <div className="panel p-6">
            <p className="font-semibold">{t("Не отвечает", "Down")}</p>
            <p className="muted mt-2">{t("Витрина или API недоступны.", "Storefront or API unreachable.")}</p>
          </div>
        </Reveal>
        <p className="t-small muted mt-6">
          {t(
            "Uptime — доля успешных проверок за период по каждому обменнику. Обменники на серверах клиентов проверяются так же, как размещённые у нас.",
            "Uptime is the share of successful checks over the period per exchange. Exchanges on clients' own servers are checked the same way as those hosted with us.",
          )}
        </p>
        <p className="t-small mt-3">
          <Link to="/blueprint" className="link underline underline-offset-4">{t("Чек-лист запуска обменника", "Exchange launch checklist")}</Link>
        </p>
      </section>
    </PageShell>
  );
};

export default Status;
