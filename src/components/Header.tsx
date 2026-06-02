import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV } from "@/content";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/logo-light.svg" alt="ASystem Core" className="h-8 w-auto" />
          <span className="font-display text-base font-extrabold tracking-tight">ASystem Core</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button variant="signal" size="sm" asChild>
            <a href="#demo">Запросить демо</a>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Меню">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                {n.label}
              </a>
            ))}
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
