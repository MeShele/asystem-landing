import Reveal from "@/components/Reveal";
import ScreenTour from "@/components/scenes/ScreenTour";
import { useContent } from "@/i18n";

/** Платформа за 30 секунд: четыре живых экрана вместо ролика. */
const Showreel = () => {
  const { SHOWREEL } = useContent();
  return (
    <section className="wrap py-10 sm:py-14">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="t-h2">{SHOWREEL.title}</h2>
          <p className="muted max-w-[40ch]">{SHOWREEL.lead}</p>
        </div>
        <div className="mt-8"><ScreenTour /></div>
      </Reveal>
    </section>
  );
};

export default Showreel;
