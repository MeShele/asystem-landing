import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/**
 * «Answers as reading text»: вопросы и ответы сплошным текстом в две колонки,
 * вопрос — жирное начало абзаца. Без раскрывашек: всё отвечено с первого взгляда.
 */
const Faq = () => {
  const { FAQ } = useContent();
  return (
    <section id="faq" className="page-x py-24 lg:py-32">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <h2 className="t-head lg:col-span-3">{FAQ.title}</h2>
        <Reveal className="lg:col-span-8 lg:col-start-5 [column-gap:56px] md:[columns:2]">
          {FAQ.items.map((f) => (
            <p key={f.q} className="t-body mb-5 [break-inside:avoid]">
              <strong className="font-semibold">{f.q}</strong> {f.a}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default Faq;
