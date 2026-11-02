import { useContent } from "@/i18n";

/**
 * «One quiet logo row»: логотипов партнёры не передавали, поэтому имена набраны
 * текстовым шрифтом в одну строку, читается как предложение. Ничего не рисуем.
 */
const Proof = () => {
  const { PROOF } = useContent();
  return (
    <section className="page-x py-16 lg:py-20" aria-label={PROOF.lead}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="t-body shrink-0">{PROOF.lead}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 lg:flex lg:flex-1 lg:justify-between lg:pl-16">
          {PROOF.names.map((n) => (
            <li key={n} className="t-lead font-semibold">{n}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Proof;
