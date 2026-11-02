import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "@/i18n";

// Тема: дефолт светлая, выбор в localStorage("asys-theme"); класс на <html>
// ставится до первой отрисовки скриптом в index.html.
const ThemeToggle = () => {
  const { t } = useLang();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("asys-theme", next ? "dark" : "light"); } catch { /* private mode */ }
  };
  return (
    <button
      type="button"
      onClick={flip}
      aria-label={dark ? t("Светлая тема", "Light theme") : t("Тёмная тема", "Dark theme")}
      className="btn btn-quiet h-10 w-10 !px-0"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
};

export default ThemeToggle;
