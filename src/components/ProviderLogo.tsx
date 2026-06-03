import { Boxes } from "lucide-react";
import { useState } from "react";

/** Логотип провайдера: реальный (logo.clearbit.com) с аккуратным фолбэком —
 *  лаймовая марка для продуктов ASystem, буквенная плитка для прочих. */
const ProviderLogo = ({
  name,
  domain,
  own,
  size = "h-9 w-9",
}: {
  name: string;
  domain?: string;
  own?: boolean;
  size?: string;
}) => {
  const [err, setErr] = useState(false);

  if (own) {
    return (
      <span className={`grid shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground ${size}`}>
        <Boxes className="h-5 w-5" />
      </span>
    );
  }

  if (domain && !err) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt={name}
        onError={() => setErr(true)}
        className={`shrink-0 rounded-lg border border-border bg-white object-contain p-1.5 ${size}`}
      />
    );
  }

  const initials = (name.match(/[A-Za-zА-Яа-я0-9]/g) || []).slice(0, 2).join("").toUpperCase();
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg border border-border bg-secondary text-xs font-bold text-foreground ${size}`}>
      {initials}
    </span>
  );
};

export default ProviderLogo;
