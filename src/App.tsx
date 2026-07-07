import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import { BlueprintCta, IntegrationsBar, Stats, Problem, ClientShowcase, Features, HowItWorks, OperatorShowcase, Architecture, Modules, ApiCores, Compliance } from "@/components/Sections";
import { Pricing, Faq, FinalCta, Footer } from "@/components/Closing";

function App() {
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
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

export default App;
