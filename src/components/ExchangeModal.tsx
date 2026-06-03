import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight, Check, ShieldCheck, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "buy" | "sell";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  giveAmount: number;
  giveCur: string;
  getAmount: number;
  getCur: string;
  rate: number;
  fmt: (n: number) => string;
};

const NETWORKS = ["TRC20 · Tron", "ERC20 · Ethereum", "TON"];

const inputCls = (err?: string) =>
  `h-11 w-full rounded-[var(--radius)] border bg-secondary/40 px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent/40 ${
    err ? "border-destructive" : "border-border focus:border-accent/60"
  }`;

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
  </label>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{k}</span>
    <span className="font-semibold text-foreground">{v}</span>
  </div>
);

const ExchangeModal = ({ open, onClose, mode, giveAmount, giveCur, getAmount, getCur, rate, fmt }: Props) => {
  const [step, setStep] = useState<"form" | "done">("form");
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [wallet, setWallet] = useState("");
  const [requisites, setRequisites] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setErrors({});
    setWallet("");
    setRequisites("");
    setContact("");
    setNetwork(NETWORKS[0]);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "buy") {
      if (wallet.trim().length < 8) e.wallet = "Укажите адрес кошелька получателя";
    } else {
      if (requisites.trim().length < 6) e.requisites = "Укажите реквизиты для получения";
    }
    if (contact.trim().length < 3) e.contact = "Укажите контакт для связи";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    // Демо лендинга — реального обмена нет, генерируем номер заявки
    setOrderId("ASX-" + Math.floor(100000 + Math.random() * 900000));
    setStep("done");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-foreground/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "buy" ? "Покупка USDT" : "Продажа USDT"}
    >
      <div
        className="relative w-full max-w-md animate-scale-in rounded-t-2xl bg-card p-6 shadow-[0_30px_80px_-20px_hsl(240_10%_6%/0.5)] sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "form" ? (
          <form onSubmit={submit} noValidate>
            <h3 className="font-display text-xl font-extrabold tracking-tight">
              {mode === "buy" ? "Покупка USDT" : "Продажа USDT"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Оформление заявки — оператор подтвердит детали.</p>

            <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
              <Row k="Вы отдаёте" v={`${fmt(giveAmount)} ${giveCur}`} />
              <div className="my-1 h-px bg-border" />
              <Row k="Вы получаете" v={`${fmt(getAmount)} ${getCur}`} />
              <div className="mt-2 text-xs text-muted-foreground">
                Курс: 1 USDT = {rate.toFixed(2)} KGS · комиссия 0%
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Field label={mode === "buy" ? "Сеть получения" : "Сеть отправки"}>
                <div className="relative">
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className={`${inputCls()} appearance-none pr-9`}
                  >
                    {NETWORKS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>

              {mode === "buy" ? (
                <Field label={`Адрес кошелька ${getCur}`} error={errors.wallet}>
                  <input
                    ref={firstRef}
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="T… / 0x…"
                    className={inputCls(errors.wallet)}
                  />
                </Field>
              ) : (
                <Field label="Реквизиты для получения KGS" error={errors.requisites}>
                  <input
                    ref={firstRef}
                    value={requisites}
                    onChange={(e) => setRequisites(e.target.value)}
                    placeholder="Номер карты или счёта"
                    className={inputCls(errors.requisites)}
                  />
                </Field>
              )}

              <Field label="Контакт для связи" error={errors.contact}>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Telegram / email / телефон"
                  className={inputCls(errors.contact)}
                />
              </Field>
            </div>

            <Button type="submit" variant="signal" size="lg" className="mt-5 w-full">
              Создать заявку <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-foreground" />
              Демонстрация интерфейса — без реального обмена
            </p>
          </form>
        ) : (
          <div className="py-2 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
              <Check className="h-7 w-7 text-accent-foreground" />
            </div>
            <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight">Заявка создана</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Номер заявки <span className="font-mono font-semibold text-foreground">{orderId}</span>
            </p>

            <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4 text-left">
              <Row k="Операция" v={mode === "buy" ? "Покупка USDT" : "Продажа USDT"} />
              <Row k="Отдаёте" v={`${fmt(giveAmount)} ${giveCur}`} />
              <Row k="Получаете" v={`${fmt(getAmount)} ${getCur}`} />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-left text-xs leading-relaxed text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <span>В реальном обменнике клиент получает инструкции по оплате и статус заявки онлайн. Это демонстрация платформы — реальный обмен здесь недоступен.</span>
            </div>

            <Button variant="signal" size="lg" className="mt-5 w-full" onClick={onClose}>
              Готово
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ExchangeModal;
