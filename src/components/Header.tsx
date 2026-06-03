import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { NAV } from "@/content";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Scroll-spy: подсветка пункта меню для секции в зоне видимости
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const linkBase =
    "rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" aria-label="asystem.ai" className={`${linkBase}`}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => {
            const on = active === n.href.slice(1);
            return (
              <a
                key={n.href}
                href={n.href}
                className={`relative py-1 text-sm font-medium ${linkBase} ${on ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-accent transition-all duration-300 ${on ? "right-0 opacity-100" : "right-full opacity-0"}`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button variant="signal" size="sm" asChild>
            <a href="#demo">Запросить демо</a>
          </Button>
        </div>

        <button
          className={`md:hidden ${linkBase} p-1`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {NAV.map((n) => {
              const on = active === n.href.slice(1);
              return (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${on ? "bg-accent/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <span className={`h-4 w-0.5 rounded-full bg-accent transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
                  {n.label}
                </a>
              );
            })}
            <Button variant="signal" className="mt-2" asChild>
              <a href="#demo" onClick={() => setOpen(false)}>Запросить демо</a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
