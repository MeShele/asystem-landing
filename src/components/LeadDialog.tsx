import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { LeadForm, type LeadPrefill } from "@/components/LeadForm";
import { useContent, useLang } from "@/i18n";

/**
 * Модальное окно заявки: открывается там, где человек стоит. Оверлей, Esc,
 * возврат фокуса и блокировка прокрутки фона. Тень есть: окно действительно плавает.
 */
type OpenFn = (prefill?: LeadPrefill & { title?: string }) => void;

const LeadDialogContext = createContext<OpenFn | null>(null);

export const useLeadDialog = (): OpenFn => {
  const open = useContext(LeadDialogContext);
  if (!open) throw new Error("useLeadDialog вне LeadDialogProvider");
  return open;
};

export const LeadDialogProvider = ({ children }: { children: ReactNode }) => {
  const { LEAD } = useContent();
  const { t } = useLang();
  const [state, setState] = useState<(LeadPrefill & { title?: string }) | null>(null);
  const [shown, setShown] = useState(false);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const open = useCallback<OpenFn>((prefill) => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setState(prefill ?? {});
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  const close = useCallback(() => {
    setShown(false);
    setTimeout(() => {
      setState(null);
      restoreFocus.current?.focus?.();
    }, 170);
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
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
      {state && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          style={{ opacity: shown ? 1 : 0, transition: `opacity ${shown ? 240 : 160}ms ease` }}
        >
          <div className="absolute inset-0 bg-[hsl(var(--foreground)/0.55)]" onClick={close} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={state.title ?? LEAD.title}
            className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-page p-6 sm:p-8"
            style={{
              boxShadow: "0 30px 80px -20px hsl(240 10% 6% / 0.45)", /* taste-skill-ignore: окно плавает */
              transform: shown ? "none" : "translateY(16px) scale(0.98)",
              transition: `transform ${shown ? 320 : 160}ms var(--ease-out)`,
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label={t("Закрыть", "Close")}
              className="btn btn-quiet absolute right-4 top-4 h-10 w-10 !px-0"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="t-head pr-12">{state.title ?? LEAD.title}</h2>
            <p className="mt-3 muted">{LEAD.sub}</p>
            <div className="mt-6">
              <LeadForm prefill={state} autoFocus />
            </div>
          </div>
        </div>
      )}
    </LeadDialogContext.Provider>
  );
};
