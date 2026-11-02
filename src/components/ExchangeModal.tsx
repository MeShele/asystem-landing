import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLang } from "@/i18n";

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

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block">
    <span className="ui-k mb-1 block">{label}</span>
    {children}
    {error && <span className="mt-1 block text-[13px] text-[hsl(var(--destructive))]">{error}</span>}
  </label>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="ui-row py-1">
    <span className="ui-k">{k}</span>
    <span className="ui-v">{v}</span>
  </div>
);

/** Окно оформления заявки из виджета: демонстрация интерфейса обменника, реального обмена нет. */
const ExchangeModal = ({ open, onClose, mode, giveAmount, giveCur, getAmount, getCur, rate, fmt }: Props) => {
  const { t } = useLang();
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
    const tm = setTimeout(() => firstRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(tm);
    };
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "buy") {
      if (wallet.trim().length < 8) e.wallet = t("Укажите адрес кошелька получателя", "Enter the recipient wallet address");
    } else if (requisites.trim().length < 6) {
      e.requisites = t("Укажите реквизиты для получения", "Enter your payout details");
    }
    if (contact.trim().length < 3) e.contact = t("Укажите контакт для связи", "Enter a contact");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setOrderId(String(Math.floor(100 + Math.random() * 900)));
    setStep("done");
  };

  const input = "ui-field w-full outline-none focus-visible:outline-2 focus-visible:outline-[hsl(var(--foreground))]";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[hsl(var(--foreground)/0.55)] sm:items-center sm:p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "buy" ? t("Покупка USDT", "Buy USDT") : t("Продажа USDT", "Sell USDT")}
    >
      <div
        data-ui
        className="ui-card relative w-full max-w-md p-6"
        style={{ boxShadow: "0 30px 80px -20px hsl(240 10% 6% / 0.5)" /* taste-skill-ignore: диалог плавает */ }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label={t("Закрыть", "Close")} className="ui-btn absolute right-3 top-3 h-9 w-9 !px-0">
          <X className="h-4 w-4" />
        </button>

        {step === "form" ? (
          <form onSubmit={submit} noValidate>
            <h3 className="text-[22px] font-bold tracking-tight">
              {mode === "buy" ? t("Покупка USDT", "Buy USDT") : t("Продажа USDT", "Sell USDT")}
            </h3>
            <p className="ui-k mt-1">{t("Оператор подтвердит детали заявки.", "The operator will confirm the order details.")}</p>

            <div className="ui-field mt-4">
              <Row k={t("Вы отдаёте", "You send")} v={`${fmt(giveAmount)} ${giveCur}`} />
              <div className="ui-line my-1" />
              <Row k={t("Вы получаете", "You receive")} v={`${fmt(getAmount)} ${getCur}`} />
              <div className="ui-k mt-2">{t("Курс", "Rate")}: 1 USDT = {rate.toFixed(2)} KGS</div>
            </div>

            <div className="mt-4 space-y-3">
              <Field label={mode === "buy" ? t("Сеть получения", "Receiving network") : t("Сеть отправки", "Sending network")}>
                <select value={network} onChange={(e) => setNetwork(e.target.value)} className={input}>
                  {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              {mode === "buy" ? (
                <Field label={t(`Адрес кошелька ${getCur}`, `${getCur} wallet address`)} error={errors.wallet}>
                  <input ref={firstRef} value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="T… / 0x…" className={input} />
                </Field>
              ) : (
                <Field label={t("Реквизиты для получения KGS", "KGS payout details")} error={errors.requisites}>
                  <input ref={firstRef} value={requisites} onChange={(e) => setRequisites(e.target.value)} placeholder={t("Номер карты или счёта", "Card or account number")} className={input} />
                </Field>
              )}
              <Field label={t("Контакт для связи", "Contact")} error={errors.contact}>
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("Telegram, почта или телефон", "Telegram, email or phone")} className={input} />
              </Field>
            </div>

            <button type="submit" className="ui-btn ui-btn-accent mt-5 w-full">{t("Создать заявку", "Create order")}</button>
            <p className="ui-k mt-3 text-center">{t("Демонстрация интерфейса, реального обмена нет.", "Interface demo, no real exchange happens.")}</p>
          </form>
        ) : (
          <div className="py-2">
            <h3 className="text-[22px] font-bold tracking-tight">{t("Заявка создана", "Order created")}</h3>
            <p className="ui-k mt-1">{t("Номер заявки", "Order number")} <span className="ui-v">№{orderId}</span></p>
            <div className="ui-field mt-4">
              <Row k={t("Операция", "Operation")} v={mode === "buy" ? t("Покупка USDT", "Buy USDT") : t("Продажа USDT", "Sell USDT")} />
              <Row k={t("Отдаёте", "You send")} v={`${fmt(giveAmount)} ${giveCur}`} />
              <Row k={t("Получаете", "You receive")} v={`${fmt(getAmount)} ${getCur}`} />
            </div>
            <p className="ui-k mt-4">
              {t(
                "В настоящем обменнике клиент дальше получает реквизиты и следит за статусом заявки в кабинете.",
                "In a real exchange the client then receives payment details and follows the order status in their account.",
              )}
            </p>
            <button type="button" className="ui-btn ui-btn-accent mt-5 w-full" onClick={onClose}>{t("Готово", "Done")}</button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ExchangeModal;
