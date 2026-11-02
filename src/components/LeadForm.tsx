import { useState } from "react";
import { Check } from "lucide-react";
import { useContent } from "@/i18n";

/**
 * Форма заявки. Одна на весь лендинг: открывается модальным окном с любой
 * кнопки «Запросить демо». Уходит в edge submit-lead на core.
 */
export type LeadTopic = "turnkey" | "api" | "license";

export interface LeadPrefill {
  topic?: LeadTopic;
  /** Уходит в заявку как есть, например тариф. */
  message?: string;
  /** Откуда пришла заявка. */
  source?: string;
}

export const LeadForm = ({ prefill, autoFocus = false }: { prefill?: LeadPrefill; autoFocus?: boolean }) => {
  const { LEAD } = useContent();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(false);
  const [topic, setTopic] = useState<LeadTopic>(prefill?.topic ?? "turnkey");

  if (sent) {
    return (
      <div className="py-8 text-center" role="status">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-6 w-6" />
        </span>
        <p className="t-lead mt-4 font-semibold">{LEAD.sentTitle}</p>
        <p className="mt-1">{LEAD.sentText}</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;
        const fd = new FormData(e.currentTarget);
        // honeypot: поле невидимо человеку, заполнено — бот. Показываем успех, не шлём.
        if (((fd.get("website") as string) || "").trim()) { setSent(true); return; }
        setErr(false);
        setSending(true);
        try {
          const res = await fetch("https://api.asystem.ai/functions/v1/submit-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: fd.get("name"),
              company: fd.get("company"),
              contact: fd.get("contact"),
              topic,
              message: prefill?.message ?? null,
              source: prefill?.source ?? "get.asystem.ai",
            }),
          });
          if (!res.ok) throw new Error("failed");
          setSent(true);
        } catch {
          setErr(true);
        } finally {
          setSending(false);
        }
      }}
    >
      <div className="flex flex-wrap gap-1.5 pb-1" role="group" aria-label={LEAD.title}>
        {LEAD.topics.map((tp) => {
          const on = topic === tp.key;
          return (
            <button
              key={tp.key}
              type="button"
              onClick={() => setTopic(tp.key as LeadTopic)}
              aria-pressed={on}
              className={`btn btn-sm ${on ? "btn-signal" : "btn-ghost"}`}
            >
              {tp.label}
            </button>
          );
        })}
      </div>

      {prefill?.message && (
        <div className="panel-2 px-4 py-3 t-small">
          <div className="font-semibold">{LEAD.attached}</div>
          <div className="mt-0.5 whitespace-pre-line">{prefill.message}</div>
        </div>
      )}

      <input required name="name" autoFocus={autoFocus} placeholder={LEAD.name} aria-label={LEAD.name} className="field" />
      <input required name="company" placeholder={LEAD.company} aria-label={LEAD.company} className="field" />
      <input required name="contact" type="text" placeholder={LEAD.contact} aria-label={LEAD.contact} className="field" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button type="submit" disabled={sending} className="btn btn-signal w-full">
        {sending ? LEAD.sending : LEAD.send}
      </button>

      {err && <p className="t-small text-[hsl(var(--destructive))]">{LEAD.error}</p>}
      <p className="t-small muted">{LEAD.consent}</p>
    </form>
  );
};
