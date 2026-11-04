import { useLang } from "@/i18n";
import { useTheme } from "@/theme";

/** Тема: одна кнопка-капсула, показывает иконку той темы, на которую переключит. */
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? t("Светлая тема", "Light theme") : t("Тёмная тема", "Dark theme");
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[hsl(var(--line)/0.06)] text-[hsl(var(--muted))] transition-colors duration-200 hover:text-[hsl(var(--fg))]"
    >
      {next === "light" ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
