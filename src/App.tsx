import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Stats, Problem, ClientShowcase, Features, HowItWorks, OperatorShowcase, Architecture, Modules, ApiCores, Compliance } from "@/components/Sections";
import { Pricing, Faq, FinalCta, Footer } from "@/components/Closing";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
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
