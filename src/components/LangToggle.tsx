import { motion } from "motion/react";
import { useLang, type Lang } from "@/i18n";

// Переключатель языка RU|EN — сегмент-пилюля в паре с ThemeToggle.
const OPTIONS: Lang[] = ["ru", "en"];

const LangToggle = ({ className = "" }: { className?: string }) => {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label={lang === "ru" ? "Язык" : "Language"}
      className={`flex h-9 items-center rounded-full border border-border bg-card p-0.5 ${className}`}
    >
      {OPTIONS.map((o) => {
        const on = o === lang;
        return (
          <button
            key={o}
            type="button"
            onClick={() => setLang(o)}
            aria-pressed={on}
            className={`relative rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              on ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {on && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{o}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LangToggle;
