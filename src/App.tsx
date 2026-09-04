import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "@/i18n";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import { BlueprintCta, IntegrationsBar, Stats, Problem, ClientShowcase, Features, HowItWorks, OperatorShowcase, Architecture, Modules, ApiCores, Compliance } from "@/components/Sections";
import { Faq, FinalCta, Footer } from "@/components/Closing";
import { Calculator } from "@/components/Calculator";

function App() {
  const { t } = useLang();

  // title/description следуют за языком (дефолт в index.html — RU)
  useEffect(() => {
    document.title = t(
      "ASystem Core — платформа лицензированных криптообменников",
      "ASystem Core — the licensed crypto exchange platform",
    );
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        t(
          "Запустите лицензированный крипто-обменник под ключ: лицензия оператора обмена ВА, KYC/AML, отчётность и деплой в один клик.",
          "Launch a licensed turnkey crypto exchange: VA exchange operator licence, KYC/AML, reporting and one-click deployment.",
        ),
      );
  }, [t]);

  // Заход с внутренних страниц (например /blueprint → «/#demo»): после маунта
  // докручиваем к якорю из hash — SPA-навигация сама этого не делает. Два
  // прогона: первый может проиграть гонку инициализации Lenis/лейаута.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const jump = () => {
      const el = document.querySelector(hash);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76 });
    };
    const t1 = setTimeout(jump, 150);
    const t2 = setTimeout(jump, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <IntegrationsBar />
        <Showreel />
        <Stats />
        <Problem />
        <ClientShowcase />
        <Features />
        <HowItWorks />
        <OperatorShowcase />
        <Architecture />
        <Modules />
        <ApiCores />
        <Compliance />
        <BlueprintCta />
        <Calculator />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

export default App;
