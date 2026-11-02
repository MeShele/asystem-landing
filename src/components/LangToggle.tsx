import { useLang, type Lang } from "@/i18n";

const OPTIONS: { k: Lang; label: string }[] = [
  { k: "ru", label: "Ру" },
  { k: "en", label: "En" },
];

/** Язык: две кнопки в одной капсуле, активная в светлом тоне. */
const LangToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label={lang === "ru" ? "Язык" : "Language"} className="flex h-10 rounded-[10px] bg-[hsl(var(--line)/0.06)] p-1">
      {OPTIONS.map((o) => {
        const on = o.k === lang;
        return (
          <button
            key={o.k}
            type="button"
            onClick={() => setLang(o.k)}
            aria-pressed={on}
            className={`rounded-[7px] px-3 text-sm font-semibold transition-colors duration-200 ${on ? "bg-fg text-bg" : "muted hover:text-fg"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

export default LangToggle;
