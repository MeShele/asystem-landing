import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n";

/**
 * Форма заявки. Одна на весь лендинг: стоит в секции «Демо» внизу и открывается
 * модальным окном с любой кнопки «Запросить демо».
 *
 * Раньше она жила только внизу семнадцатой секцией — то есть первой точки
 * контакта не было, была последняя. Поэтому форма вынесена сюда, а кнопки
 * зовут её там, где человек стоит.
 */

export const CTA_TOPICS = [
  { key: "turnkey", ru: "Обменник под ключ", en: "Turnkey exchange" },
  { key: "api", ru: "Только API-ядра", en: "API cores only" },
  { key: "license", ru: "Вопрос по лицензии", en: "Licence question" },
] as const;

export type LeadTopic = (typeof CTA_TOPICS)[number]["key"];

export interface LeadPrefill {
  topic?: LeadTopic;
  /** Уходит в заявку как есть — например, состав из калькулятора. */
  message?: string;
  /** Откуда пришла заявка: помогает понять, что сработало. */
  source?: string;
}

const inputCls =
  "h-11 w-full rounded-[var(--radius)] border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export const LeadForm = ({
  prefill,
  submitLabel,
  autoFocus = false,
}: {
  prefill?: LeadPrefill;
  submitLabel?: string;
  autoFocus?: boolean;
}) => {
  const { lang, t } = useLang();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(false);
  const [topic, setTopic] = useState<LeadTopic>(prefill?.topic ?? "turnkey");

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="py-10 text-center"
      >
        <motion.div
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.08 }}
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent"
        >
          <Check className="h-6 w-6 text-accent-foreground" />
        </motion.div>
        <p className="mt-4 font-display text-lg font-bold">{t("Заявка отправлена", "Request sent")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("Свяжемся с вами в ближайшее время.", "We'll get back to you shortly.")}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;
        const fd = new FormData(e.currentTarget);
        // honeypot: поле невидимо человеку, заполнено — значит бот.
        // Показываем успех, но ничего не отправляем.
        if (((fd.get("website") as string) || "").trim()) {
          setSent(true);
          return;
        }
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
      {/* сценарий обращения — сегментация до разговора */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {CTA_TOPICS.map((tp) => {
          const on = topic === tp.key;
          return (
            <button
              key={tp.key}
              type="button"
              onClick={() => setTopic(tp.key)}
              className={`relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                on ? "border-transparent text-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="cta-topic-pill"
                  className="absolute inset-0 rounded-full border border-accent bg-accent/15"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tp[lang]}</span>
            </button>
          );
        })}
      </div>

      {prefill?.message && (
        <div className="rounded-[var(--radius)] border border-border bg-secondary/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <div className="mb-1 font-semibold text-foreground">{t("К заявке приложено", "Attached to the request")}</div>
          <div className="whitespace-pre-line">{prefill.message}</div>
        </div>
      )}

      {/* autoFocus только в модалке: в секции внизу он утащил бы страницу к форме */}
      <input required name="name" autoFocus={autoFocus} placeholder={t("Имя", "Name")} className={inputCls} />
      <input required name="company" placeholder={t("Компания", "Company")} className={inputCls} />
      <input
        required
        name="contact"
        type="text"
        placeholder={t("Telegram / email / телефон", "Telegram / email / phone")}
        className={inputCls}
      />
      {/* honeypot: скрыто от людей, ловит ботов */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <Button type="submit" variant="signal" disabled={sending} className="group w-full">
        {sending ? t("Отправляем…", "Sending…") : submitLabel ?? t("Запросить демо", "Request a demo")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Button>

      {err && (
        <p className="text-center text-xs text-destructive">
          {t("Не удалось отправить. Напишите нам в Telegram или на почту.", "Could not send. Please reach us on Telegram or email.")}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground/80">
        {t(
          "Нажимая, вы соглашаетесь на обработку контактных данных",
          "By submitting you agree to the processing of your contact details",
        )}
      </p>
    </form>
  );
};
