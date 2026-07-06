import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// Переключатель темы. Дефолт — светлая; выбор живёт в localStorage("asys-theme"),
// класс на <html> ставится до первой отрисовки скриптом в index.html.
const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("asys-theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={dark ? "Светлая тема" : "Тёмная тема"}
      className={`grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={dark ? "sun" : "moon"}
          initial={{ rotate: -60, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 60, scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="grid place-items-center"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
