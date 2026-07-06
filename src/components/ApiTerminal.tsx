import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// Живой API-терминал: запрос печатается посимвольно, ответ въезжает с пилюлей
// «200 · N ms». Циклится по 4 ядрам; активное ядро сообщается наверх (карточки
// слева подсвечиваются синхронно). Клик по карточке ядра переключает цикл.

export interface ApiCycle {
  method: string;
  path: string;
  body: string;
  resp: string;
  ms: number;
}

export const API_CYCLES: ApiCycle[] = [
  {
    method: "POST",
    path: "/kyc-core/verify",
    body: '{ "full_name": "…", "document": { … } }',
    resp: '{ "decision": "auto_approve", "score": 82 }',
    ms: 142,
  },
  {
    method: "POST",
    path: "/payment-core/invoices",
    body: '{ "amount": "25 000 KGS", "method": "qr" }',
    resp: '{ "qr_url": "https://…", "status": "pending" }',
    ms: 96,
  },
  {
    method: "POST",
    path: "/aml-core/screen",
    body: '{ "wallet": "0x8d40…cf6f", "network": "ETH" }',
    resp: '{ "risk": "low", "score": 12, "hits": [] }',
    ms: 118,
  },
  {
    method: "POST",
    path: "/custody-core/payouts",
    body: '{ "to": "TVd7…9kQz", "amount": "1 675 USDT" }',
    resp: '{ "tx": "0x8d40…cf6f", "status": "sent" }',
    ms: 210,
  },
];

const HOLD_AFTER_RESP = 3200; // пауза после ответа перед следующим ядром

const ApiTerminal = ({ active, onAdvance }: { active: number; onAdvance: (next: number) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const reduced = useReducedMotion();
  const [chars, setChars] = useState(0);
  const [respIn, setRespIn] = useState(false);

  const c = API_CYCLES[active];
  const reqFull = `${c.method} ${c.path}\nAuthorization: Bearer ask_••••\n\n${c.body}`;

  // тайпинг запроса (перезапускается при смене ядра)
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setChars(reqFull.length);
      setRespIn(true);
      const t = setTimeout(() => onAdvance((active + 1) % API_CYCLES.length), 4200);
      return () => clearTimeout(t);
    }
    setChars(0);
    setRespIn(false);
    const type = setInterval(() => {
      setChars((n) => {
        if (n >= reqFull.length) {
          clearInterval(type);
          return n;
        }
        return n + 1;
      });
    }, 22);
    return () => clearInterval(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, inView, reduced]);

  // ответ + автопереход к следующему ядру (deps включают active:
  // клик по карточке ядра снимает старые таймеры и перезапускает цикл)
  useEffect(() => {
    if (reduced || !inView) return;
    if (chars < reqFull.length) return;
    const show = setTimeout(() => setRespIn(true), 380);
    const next = setTimeout(() => onAdvance((active + 1) % API_CYCLES.length), 380 + HOLD_AFTER_RESP);
    return () => {
      clearTimeout(show);
      clearTimeout(next);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, inView, reduced, active, reqFull.length]);

  const typed = reqFull.slice(0, chars);
  const [reqLine, authLine, , bodyLine] = typed.split("\n").concat(["", "", "", ""]);
  const typing = chars < reqFull.length;

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c12]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 font-mono text-[11px] text-white/40">api.asystem.ai</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/35">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          live
        </span>
      </div>

      <div className="min-h-[236px] p-5 font-mono text-[11px] leading-relaxed sm:text-xs">
        {/* запрос печатается */}
        <div className="whitespace-pre-wrap break-all text-accent/90">
          <span className="text-white/40">$ </span>
          {reqLine}
          {typing && chars <= reqLine.length && <Cursor />}
        </div>
        {authLine !== undefined && authLine !== "" && (
          <div className="whitespace-pre-wrap break-all text-white/45">
            {authLine}
            {typing && chars > reqLine.length + 1 && chars <= reqLine.length + 1 + authLine.length && <Cursor />}
          </div>
        )}
        {bodyLine !== undefined && bodyLine !== "" && (
          <div className="mt-3 whitespace-pre-wrap break-all text-white/75">
            {bodyLine}
            {typing && chars > reqFull.length - c.body.length && <Cursor />}
          </div>
        )}

        {/* ответ */}
        <motion.div
          initial={false}
          animate={respIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="mt-4"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            200 · {c.ms} ms
          </span>
          <div className="mt-2 whitespace-pre-wrap break-all text-accent">→ {c.resp}</div>
        </motion.div>
      </div>
    </div>
  );
};

const Cursor = () => <span className="animate-pulse text-accent">▍</span>;

export default ApiTerminal;
