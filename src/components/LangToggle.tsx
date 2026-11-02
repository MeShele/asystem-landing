import { useLang, type Lang } from "@/i18n";

// Язык: две кнопки на одной заливке, активная в чернилах.
const OPTIONS: { k: Lang; label: string }[] = [
  { k: "ru", label: "Ру" },
  { k: "en", label: "En" },
];

const LangToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label={lang === "ru" ? "Язык" : "Language"} className="flex h-10 bg-surface p-1">
      {OPTIONS.map((o) => {
        const on = o.k === lang;
        return (
          <button
            key={o.k}
            type="button"
            onClick={() => setLang(o.k)}
            aria-pressed={on}
            className={`t-small px-3 font-semibold transition-colors duration-200 ${on ? "bg-ink" : "muted hover:text-[hsl(var(--foreground))]"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

export default LangToggle;
