/** Словесный знак: лаймовая марка и «asystem.ai». */
const Logo = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const mark = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "sm" ? "text-[17px]" : "text-xl";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`grid shrink-0 place-items-center rounded-[9px] bg-accent text-accent-foreground ${mark}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </svg>
      </span>
      <span className={`font-display font-bold tracking-tight ${text}`}>
        asystem<span className="muted">.ai</span>
      </span>
    </span>
  );
};

export default Logo;
