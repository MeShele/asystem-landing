import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "@/i18n";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import { BlueprintCta, IntegrationsBar, Stats, Problem, ClientShowcase, Features, HowItWorks, OperatorShowcase, Architecture, Modules, ApiCores, Compliance } from "@/components/Sections";
import { Faq, FinalCta, Footer } from "@/components/Closing";
import { Tariffs } from "@/components/Tariffs";
import { LeadDialogProvider } from "@/components/LeadDialog";

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
          "Платформа для лицензированного криптообменника в Кыргызстане: сайт и кабинет клиента, KYC/AML, комплаенс под ГСФР и отчёты в Финнадзор. Сервер в КР, ваш домен и бренд.",
          "A platform for licensed crypto exchanges in Kyrgyzstan: website and client account, KYC/AML, SFIS compliance and FinSupervision reports. Servers in the KR, your domain and brand.",
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
    <LeadDialogProvider>
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
        <Tariffs />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
    </LeadDialogProvider>
  );
}

export default App;
