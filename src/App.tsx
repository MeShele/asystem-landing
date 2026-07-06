import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import { Stats, Problem, ClientShowcase, Features, HowItWorks, OperatorShowcase, Architecture, Modules, ApiCores, Compliance } from "@/components/Sections";
import { Pricing, Faq, FinalCta, Footer } from "@/components/Closing";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
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
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

export default App;
