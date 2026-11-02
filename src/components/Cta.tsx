import Reveal from "@/components/Reveal";
import { LeadForm } from "@/components/LeadForm";
import { useContent } from "@/i18n";

/** Финал: панель с фразой слева и формой справа. */
const Cta = () => {
  const { CTA, DEMO_URL } = useContent();
  return (
    <section id="demo" className="wrap py-20 sm:py-28">
      <Reveal className="panel grid grid-cols-1 gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
        <div>
          <h2 className="t-h2 max-w-[16ch]">{CTA.title}</h2>
          <p className="t-lead muted mt-5 max-w-[40ch]">{CTA.sentence}</p>
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="link mt-6 inline-block font-medium underline underline-offset-4">{CTA.link}</a>
        </div>
        <div className="panel-2 p-5 sm:p-6">
          <LeadForm prefill={{ source: "get.asystem.ai/section" }} />
        </div>
      </Reveal>
    </section>
  );
};

export default Cta;
