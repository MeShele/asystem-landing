import { useLeadDialog } from "@/components/LeadDialog";
import { useContent } from "@/i18n";

/** «A plain sentence, one action»: почти пустой экран, одна фраза, одна кнопка, ссылка. */
const Cta = () => {
  const { CTA, DEMO_URL } = useContent();
  const openLead = useLeadDialog();
  return (
    <section id="demo" className="page-x pb-[10svh] pt-[14svh]" aria-label={CTA.button}>
      <p className="t-lead max-w-[34ch]">{CTA.sentence}</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" className="btn btn-signal btn-sm !h-11" onClick={() => openLead({ source: "get.asystem.ai/cta" })}>
          {CTA.button}
        </button>
        <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="link t-body">{CTA.link}</a>
      </div>
    </section>
  );
};

export default Cta;
