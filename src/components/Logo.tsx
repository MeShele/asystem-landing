/** Словесный знак: лаймовая марка (заливка) и «asystem.ai». Лайм не текст на белом. */
const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const mark = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-[2rem]" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span className="inline-flex items-center gap-3">
      <span className={`grid shrink-0 place-items-center bg-accent-fill ${mark}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </svg>
      </span>
      <span className={`font-[family-name:var(--font-heading)] font-bold tracking-tight ${text}`}>
        asystem<span className="muted">.ai</span>
      </span>
    </span>
  );
};

export default Logo;
