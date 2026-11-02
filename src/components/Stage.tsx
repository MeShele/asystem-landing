import { useEffect, useRef, useState, type ReactNode } from "react";
import ExchangeWidget from "@/components/ExchangeWidget";
import { ApiSnippet, CompliancePanel, KycPanel, ReportPanel, ServerPanel } from "@/components/fragments/Panels";
import StorefrontClip from "@/components/fragments/StorefrontClip";
import { useLang } from "@/i18n";
import { useStage, type StageKey } from "@/lib/stage";

/**
 * Закреплённая сцена: тёмное поле, на нём фрагмент продукта для секции, которая
 * сейчас читается. В DOM только текущий кадр и, пока идёт смена, предыдущий:
 * медленный перекрёстный фейд (сигнатурное движение направления). Под
 * reduced-motion смена мгновенная, предыдущий кадр не держится.
 */
const FADE_MS = 1600;

/* Витрина: виджет в окружении шапки и подписи, чтобы кадр читался как страница, а не карточка в пустоте */
const Storefront = () => {
  const { t } = useLang();
  return (
    <div data-ui className="flex h-full w-full max-w-[560px] flex-col justify-between py-2 text-[hsl(var(--background))]">
      <div className="hidden items-center justify-between gap-3 lg:flex">
        <span className="text-[15px] font-semibold">exchange.kg</span>
        <span className="flex gap-4 text-[13px] opacity-70">
          <span>{t("Обмен", "Exchange")}</span><span>{t("Курсы", "Rates")}</span><span>{t("О нас", "About")}</span><span>{t("Войти", "Sign in")}</span>
        </span>
      </div>
      <div className="flex justify-center lg:py-6"><ExchangeWidget /></div>
      <div className="hidden items-center justify-between gap-3 text-[13px] opacity-70 lg:flex">
        <span>{t("Витрина обменника на платформе", "Exchange storefront on the platform")}</span>
        <span>{t("Ваш домен и бренд", "Your domain and brand")}</span>
      </div>
    </div>
  );
};

const FRAMES: Record<StageKey, ReactNode> = {
  exchange: <Storefront />,
  kyc: <KycPanel />,
  compliance: <CompliancePanel />,
  reports: <ReportPanel />,
  server: <ServerPanel />,
  brand: <StorefrontClip />,
  api: <ApiSnippet />,
};

const Stage = ({ className = "" }: { className?: string }) => {
  const { active } = useStage();
  const [prev, setPrev] = useState<StageKey | null>(null);
  const last = useRef<StageKey>(active);

  useEffect(() => {
    if (last.current === active) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) setPrev(last.current);
    last.current = active;
    const tm = setTimeout(() => setPrev(null), FADE_MS);
    return () => clearTimeout(tm);
  }, [active]);

  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {prev && prev !== active && (
        <div key={`prev-${prev}`} className="stage-frame is-off">{FRAMES[prev]}</div>
      )}
      <div key={active} className="stage-frame is-on">{FRAMES[active]}</div>
    </div>
  );
};

export default Stage;
