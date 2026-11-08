import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "@/i18n";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Proof from "@/components/Proof";
import ProductTour from "@/components/ProductTour";
import Automation from "@/components/Automation";
import Who from "@/components/Who";
import GradientBackground from "@/components/GradientBackground";
import Law from "@/components/Law";
import HowItWorks from "@/components/HowItWorks";
import Tariffs from "@/components/Tariffs";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

function App() {
  const { t } = useLang();

  useEffect(() => {
    document.title = t(
      "ASystem Core — платформа лицензированных криптообменников",
      "ASystem Core — the licensed crypto exchange platform",
    );
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      t(
        "Платформа для лицензированного криптообменника в Кыргызстане: сайт и кабинет клиента, KYC/AML, комплаенс под ГСФР и отчёты в Финнадзор. Сервер в КР, ваш домен и бренд.",
        "A platform for licensed crypto exchanges in Kyrgyzstan: website and client account, KYC/AML, SFIS compliance and FinSupervision reports. Servers in the KR, your domain and brand.",
      ),
    );
  }, [t]);

  // Заход с внутренних страниц на якорь: докручиваем после маунта.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const jump = () => {
      const el = document.querySelector(hash);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72 });
    };
    const t1 = setTimeout(jump, 150);
    const t2 = setTimeout(jump, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [hash]);

  return (
    <>
      <GradientBackground />
      <div className="relative z-[1] min-h-full">
        <Header />
        <main>
          <Hero />
          <Proof />
          <ProductTour />
          <Who />
          <Law />
          <HowItWorks />
          <Automation />
          <Tariffs />
          <Faq />
          <Cta />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
