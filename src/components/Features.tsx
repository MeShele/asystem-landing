import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { ApiSnippet, CompliancePanel, KycPanel, ReportPanel, ServerPanel } from "@/components/fragments/Panels";
import StorefrontClip from "@/components/fragments/StorefrontClip";
import { useContent } from "@/i18n";
import type { StageKey } from "@/lib/stage";

/**
 * «Small proof beside text»: один узкий модуль, повторённый шесть раз вниз по
 * колонке чтения. Слева панель с кропнутым фрагментом продукта, справа заголовок
 * и два абзаца. Каждый модуль переключает сцену справа на свой кадр.
 */
const PROOF: Record<StageKey, ReactNode> = {
  exchange: null,
  kyc: <KycPanel compact />,
  compliance: <CompliancePanel compact />,
  reports: <ReportPanel compact />,
  server: <ServerPanel compact />,
  brand: <StorefrontClip compact />,
  api: <ApiSnippet compact />,
};

const Features = () => {
  const { FEATURES } = useContent();
  return (
    <section id="features" className="px-6 pb-0 pt-24 sm:px-10 lg:pt-32">
      <h2 className="t-head max-w-[18ch]">{FEATURES.title}</h2>
      <div className="mt-16 space-y-24 lg:space-y-28">
        {FEATURES.items.map((f) => (
          <Reveal key={f.stage} data-stage={f.stage} className="grid gap-5 sm:grid-cols-[300px_1fr] lg:max-w-[640px]">
            <div className="bg-surface relative h-[200px] overflow-hidden">
              {f.stage === "brand" ? PROOF.brand : <div className="absolute inset-x-4 top-4">{PROOF[f.stage as StageKey]}</div>}
            </div>
            <div className="min-w-0">
              <h3 className="t-body font-semibold">{f.title}</h3>
              <p className="t-body mt-3">{f.text[0]}</p>
              <p className="t-body muted mt-3">{f.text[1]}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Features;
