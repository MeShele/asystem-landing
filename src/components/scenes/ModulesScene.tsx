import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useLang } from "@/i18n";

/**
 * Маркетплейс модулей в админке: карточки с тумблерами, которые включаются по очереди,
 * как это делает оператор. Вместо ролика: живая вёрстка под тему и язык.
 */
const ModulesScene = () => {
  const { t } = useLang();
  const reduced = !!useReducedMotion();
  const items = [
    { name: t("Finik: приём по QR", "Finik: QR payments"), tag: t("в тарифе", "in plan"), base: true },
    { name: t("Отчёты Финнадзор", "FinSupervision reports"), tag: t("в тарифе", "in plan"), base: true },
    { name: t("Didit KYC", "Didit KYC"), tag: t("в тарифе", "in plan"), base: true },
    { name: t("Уведомления в Telegram", "Telegram notifications"), tag: t("докупается", "add-on"), base: false },
    { name: t("Автоматические курсы", "Automatic rates"), tag: t("докупается", "add-on"), base: false },
    { name: t("Выгрузка на мониторинги", "Rates for monitors"), tag: t("докупается", "add-on"), base: false },
  ];
  const [on, setOn] = useState<boolean[]>(items.map((m) => m.base));
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) { setOn(items.map(() => true)); return; }
    const id = setInterval(() => setStep((s) => s + 1), 1800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    if (step === 0) return;
    const addons = [3, 4, 5];
    const k = addons[(step - 1) % (addons.length + 1)];
    setOn((prev) => {
      const next = [...prev];
      if (k == null) return items.map((m) => m.base);   // пауза: сброс докупленных
      next[k] = true;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div data-ui className="ui-card w-full overflow-hidden">
      <div className="ui-row px-4 py-2.5">
        <span className="ui-code ui-k">admin · {t("модули", "modules")}</span>
        <span className="ui-chip">{t("включено", "enabled")}: {on.filter(Boolean).length} / {items.length}</span>
      </div>
      <div className="ui-line grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
        {items.map((m, k) => (
          <div key={m.name} className="flex items-center justify-between gap-3 rounded-[10px] border border-[hsl(var(--line)/0.1)] bg-[hsl(var(--surface-2))] p-3">
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold">{m.name}</div>
              <div className="ui-k">{m.tag}</div>
            </div>
            <span className={`ui-toggle shrink-0 ${on[k] ? "on" : ""}`} aria-hidden="true"><i /></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesScene;
