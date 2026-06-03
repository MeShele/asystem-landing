import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { ICONS } from "@/lib/icons";
import ProviderLogo from "@/components/ProviderLogo";
import type { CatalogCategory } from "@/modulesCatalog";

/** Модалка ядра/категории: иконка + название + описание + сетка провайдеров с логотипами. */
const InfoModal = ({ category, onClose }: { category: CatalogCategory | null; onClose: () => void }) => {
  useEffect(() => {
    if (!category) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [category, onClose]);

  if (!category) return null;
  const Icon = ICONS[category.icon];
  const available = category.modules.filter((m) => m.status === "available").length;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-foreground/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={category.label}
    >
      <div
        className="relative w-full max-w-lg animate-scale-in rounded-t-2xl bg-card p-6 shadow-[0_30px_80px_-20px_hsl(240_10%_6%/0.5)] sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15">
            {Icon && <Icon className="h-5 w-5 text-foreground" />}
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{available} из {category.modules.length} провайдеров доступно сейчас</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{category.desc}</p>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Провайдеры и сервисы</div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {category.modules.map((m) => (
              <div key={m.name} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                <ProviderLogo name={m.name} domain={m.domain} own={m.own} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  {m.status === "available" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground">
                      <Check className="h-3 w-3 text-emerald-600" /> Доступно
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground">Скоро</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 rounded-xl bg-accent/10 p-3 text-xs leading-relaxed text-muted-foreground">
          Модуль включается тумблером в админке — без правки кода. Ядро можно использовать и отдельно, через публичный API.
        </p>
      </div>
    </div>,
    document.body,
  );
};

export default InfoModal;
