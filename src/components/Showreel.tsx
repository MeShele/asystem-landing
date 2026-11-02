import Reveal from "@/components/Reveal";
import ProductVideo from "@/components/ProductVideo";
import { useContent, useLang } from "@/i18n";

/** Шоурил 30 секунд: Remotion-ролик из asystem-promo, тёмный. */
const Showreel = () => {
  const { SHOWREEL } = useContent();
  const { lang } = useLang();
  const sfx = lang === "en" ? "-en" : "";
  return (
    <section className="wrap py-10 sm:py-14">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="t-h2">{SHOWREEL.title}</h2>
          <p className="muted max-w-[40ch]">{SHOWREEL.lead}</p>
        </div>
        <ProductVideo key={sfx} src={`/video/showreel${sfx}.mp4`} poster={`/video/showreel-poster${sfx}.jpg`} ratio={16 / 9} label={SHOWREEL.title} className="mt-8" />
      </Reveal>
    </section>
  );
};

export default Showreel;
