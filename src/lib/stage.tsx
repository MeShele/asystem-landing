import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Сцена: правая половина экрана закреплена и показывает фрагмент продукта,
 * который соответствует секции в зоне чтения. Секция объявляет свой кадр
 * атрибутом data-stage; наблюдатель выбирает тот, что ближе к середине экрана.
 */
export type StageKey = "exchange" | "kyc" | "compliance" | "reports" | "server" | "brand" | "api";

const StageContext = createContext<{ active: StageKey; setActive: (k: StageKey) => void }>({
  active: "exchange",
  setActive: () => {},
});

export const StageProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<StageKey>("exchange");
  const value = useMemo(() => ({ active, setActive }), [active]);
  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
};

export const useStage = () => useContext(StageContext);

/** Вешается на контейнер с элементами [data-stage]; переключает активный кадр. */
export const useStageObserver = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { setActive } = useStage();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-stage]"));
    if (!els.length) return;
    const ratios = new Map<HTMLElement, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target as HTMLElement, e.isIntersecting ? e.intersectionRatio : 0);
        let best: HTMLElement | null = null;
        let bestR = 0;
        for (const [el, r] of ratios) if (r > bestR) { best = el; bestR = r; }
        if (best) setActive(best.dataset.stage as StageKey);
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [setActive]);
  return ref;
};
