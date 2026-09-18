import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { LeadForm, type LeadPrefill } from "@/components/LeadForm";
import { useLang } from "@/i18n";

/**
 * Модальное окно заявки. Любая кнопка «Запросить демо» открывает форму там, где
 * человек стоит, вместо прокрутки в конец страницы.
 *
 * Radix в проекте нет (только slot), поэтому окно своё: оверлей, Esc, возврат
 * фокуса на кнопку и блокировка прокрутки фона — минимум, без которого модалка
 * ощущается сломанной.
 */

type OpenFn = (prefill?: LeadPrefill & { title?: string }) => void;

const LeadDialogContext = createContext<OpenFn | null>(null);

export const useLeadDialog = (): OpenFn => {
  const open = useContext(LeadDialogContext);
  if (!open) throw new Error("useLeadDialog вне LeadDialogProvider");
  return open;
};

export const LeadDialogProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useLang();
  const [state, setState] = useState<(LeadPrefill & { title?: string }) | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const open = useCallback<OpenFn>((prefill) => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setState(prefill ?? {});
  }, []);

  const close = useCallback(() => {
    setState(null);
    // Возвращаем фокус туда, откуда открыли: иначе он улетает в начало страницы.
    restoreFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state, close]);

  return (
    <LeadDialogContext.Provider value={open}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={state.title ?? t("Запросить демо", "Request a demo")}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-[0_24px_70px_-28px_hsl(240_10%_6%/0.45)] sm:rounded-2xl sm:p-7"
            >
              <button
                type="button"
                onClick={close}
                aria-label={t("Закрыть", "Close")}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <span className="h-2 w-10 rounded-sm bg-accent" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("Заявка", "Request")}
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                {state.title ?? t("Покажем платформу вживую", "See the platform live")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("Ответим в течение рабочего дня.", "We reply within one business day.")}
              </p>

              <div className="mt-5">
                <LeadForm prefill={state} autoFocus submitLabel={t("Отправить заявку", "Send request")} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LeadDialogContext.Provider>
  );
};
