/**
 * Логотип: знак «Горизонтали» — буква «А»-гора из линий высот — и слово «asystem».
 * В шапке и подвале стоит рабочая версия знака (пять толстых линий): парадная, с тонкими линиями,
 * в мелком размере сливается. Исходники и правила — asystem-promo/brandkit/logo-final.
 */
const Logo = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const mark = size === "sm" ? "h-[30px]" : "h-9";
  const text = size === "sm" ? "text-[18px]" : "text-[22px]";
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/brand/mark.svg" width={3392} height={3042} alt="" aria-hidden="true" decoding="async" className={`w-auto shrink-0 ${mark}`} />
      <span className={`font-display font-bold leading-none tracking-[-0.02em] ${text}`}>asystem</span>
    </span>
  );
};

export default Logo;
