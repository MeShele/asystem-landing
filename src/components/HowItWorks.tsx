import { useState } from "react";
import { SetupFragment } from "@/components/fragments/Panels";
import { useContent } from "@/i18n";

/**
 * «Drag through the stages»: два поля и один ползунок с четырьмя стопами,
 * который двигает и фразу слева, и фрагмент продукта справа. Работает с
 * клавиатуры (стрелки у range). От прокрутки ничего не зависит.
 */
const HowItWorks = () => {
  const { STEPS } = useContent();
  const [i, setI] = useState(0);
  const n = STEPS.stages.length;
  const filled = `${(i / (n - 1)) * 100}%`;

  return (
    <section id="how" aria-label={STEPS.title} className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[88svh]">
        <div className="bg-surface flex min-h-[46svh] flex-col px-6 pb-28 pt-16 sm:px-10 lg:order-1 lg:px-[8%] lg:pt-[10svh]">
          <h2 id="how-title" key={i} className="t-display max-w-[14ch]" style={{ animation: "fadeSwap 200ms ease-out" }}>
            {STEPS.stages[i].clause}
          </h2>
          <p className="t-body mt-6 max-w-[40ch]">{STEPS.stages[i].text}</p>
          <p className="t-body muted mt-auto max-w-[44ch] pt-10">{STEPS.note}</p>
        </div>
        <div className="bg-page flex min-h-[46svh] items-center justify-center px-6 pb-28 pt-12 lg:order-2 lg:pb-32">
          <div key={`f${i}`} className="w-full max-w-[440px]" style={{ animation: "fadeSwap 200ms ease-out" }}>
            <SetupFragment stage={i as 0 | 1 | 2 | 3} />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-7 pb-7">
        <input
          type="range"
          min={0}
          max={n - 1}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-label={STEPS.title}
          aria-valuetext={STEPS.stages[i].short}
          className="stages-range"
          style={{ "--filled": filled } as React.CSSProperties}
        />
        <div className="mt-3 grid grid-cols-4 t-small sm:t-body">
          {STEPS.stages.map((s, k) => (
            <button
              key={s.short}
              type="button"
              onClick={() => setI(k)}
              className={`text-left transition-colors duration-200 ${k === i ? "font-semibold" : "muted"} ${k === n - 1 ? "text-right" : k === 0 ? "" : "text-center"}`}
            >
              {s.short}
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes fadeSwap { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  );
};

export default HowItWorks;
