import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import ProductVideo from "@/components/ProductVideo";
import { ApiSnippet, CompliancePanel, KycPanel, ReportPanel, ServerPanel } from "@/components/fragments/Panels";
import { useContent } from "@/i18n";
import { useTheme } from "@/theme";

/**
 * Возможности: панели разной ширины на тёмном тоне, в каждой настоящий
 * фрагмент интерфейса. Ни одной иконки: продукт показывает себя сам.
 */
const FRAGMENT: Record<string, ReactNode> = {
  kyc: <KycPanel />,
  compliance: <CompliancePanel />,
  reports: <ReportPanel />,
  server: <ServerPanel />,
  api: <ApiSnippet />,
};

const SPAN: Record<string, string> = {
  brand: "lg:col-span-7",
  kyc: "lg:col-span-5",
  compliance: "lg:col-span-4",
  reports: "lg:col-span-4",
  server: "lg:col-span-4",
  api: "lg:col-span-12",
};

const Features = () => {
  const { FEATURES } = useContent();
  const { theme } = useTheme();
  return (
    <section id="features" className="wrap py-20 sm:py-28">
      <Reveal className="max-w-[640px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{FEATURES.eyebrow}</p>
        <h2 className="t-h2 mt-3">{FEATURES.title}</h2>
        <p className="t-lead muted mt-5">{FEATURES.lead}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {FEATURES.items.map((f) => (
          <Reveal key={f.stage} className={`panel flex flex-col overflow-hidden ${SPAN[f.stage]} ${f.stage === "api" ? "lg:flex-row lg:items-center" : ""}`}>
            <div className={`p-7 ${f.stage === "api" ? "lg:w-1/2" : ""}`}>
              <h3 className="t-h3">{f.title}</h3>
              <p className="muted mt-3 max-w-[46ch]">{f.text[0]}</p>
              <p className="muted mt-2 max-w-[46ch] text-[15px]">{f.text[1]}</p>
            </div>
            {f.stage === "brand" ? (
              <div className="relative mt-auto px-7">
                <ProductVideo
                  key={theme}
                  src={theme === "light" ? "/demos/exchange-light.mp4" : "/demos/exchange.mp4"}
                  poster={theme === "light" ? "/shots/exchange-light.png" : "/shots/exchange-dark.jpg"}
                  ratio={900 / 700}
                  label={f.title}
                  className="mx-auto max-w-[520px] !rounded-b-none"
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                />
              </div>
            ) : (
              <div className={`relative mt-auto px-7 pb-7 ${f.stage === "api" ? "lg:w-1/2 lg:pt-7" : ""}`}>
                <div className="flex justify-center">{FRAGMENT[f.stage]}</div>
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Features;
