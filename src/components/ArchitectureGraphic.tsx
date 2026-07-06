import { useState } from "react";
import { Boxes } from "lucide-react";
import { motion } from "motion/react";
import { ICONS } from "@/lib/icons";
import InfoModal from "@/components/InfoModal";
import { CATALOG, type CatalogCategory } from "@/modulesCatalog";

/** Core in the center → functional cores around it → modules branching from each core. */
type Core = { key: string; label: string; icon: string; cat: string; modules: string[] };

const CORES: Core[] = [
  { key: "kyc", label: "KYC Core", icon: "UserCheck", cat: "kyc", modules: ["ASystem KYC", "SumSub", "Didit", "BiometricVision"] },
  { key: "pay", label: "Payment Core", icon: "CreditCard", cat: "payments", modules: ["Finik QR", "CoreX", "ElQR"] },
  { key: "aml", label: "AML Core", icon: "ShieldAlert", cat: "aml", modules: ["Comply Core", "ComplyAdvantage"] },
  { key: "rep", label: "Reporting Core", icon: "FileSpreadsheet", cat: "reporting", modules: ["Финнадзор", "Данные комплайнс"] },
  { key: "cust", label: "Custody Core", icon: "Wallet", cat: "wallets", modules: ["ORGON", "DFNS", "Argon"] },
  { key: "liq", label: "Liquidity Core", icon: "Repeat", cat: "exchanges", modules: ["Binance", "Kraken", "ByBit"] },
];

const R = 34; // % radius of the core ring from center
const NODES = CORES.map((_, i) => {
  const a = (-90 + i * (360 / CORES.length)) * (Math.PI / 180);
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
});

const CoreCard = ({ core, compact, w = "w-full", onClick }: { core: Core; compact?: boolean; w?: string; onClick?: () => void }) => {
  const Icon = ICONS[core.icon];
  const list = compact ? core.modules.slice(0, 3) : core.modules;
  const extra = compact ? core.modules.length - list.length : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block rounded-xl border border-border bg-card p-3 text-left shadow-[0_8px_24px_-12px_hsl(240_10%_6%/0.18)] transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_14px_34px_-14px_hsl(240_10%_6%/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${w}`}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/15">
          {Icon && <Icon className="h-4 w-4 text-foreground" />}
        </span>
        <span className="font-display text-sm font-bold leading-tight">{core.label}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {list.map((m) => (
          <span key={m} className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{m}</span>
        ))}
        {extra > 0 && (
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground">+{extra}</span>
        )}
      </div>
    </button>
  );
};

const CenterNode = () => (
  <div className="relative grid place-items-center">
    <span className="absolute h-24 w-24 animate-ping rounded-full bg-accent/25" />
    <div className="relative flex flex-col items-center gap-0.5 rounded-2xl border-2 border-accent bg-accent px-6 py-4 text-accent-foreground shadow-[0_16px_40px_-12px_hsl(79_100%_55%/0.6)]">
      <Boxes className="h-6 w-6" />
      <span className="font-display text-sm font-extrabold">ASystem Core</span>
      <span className="text-[10px] font-medium opacity-75">Ядро платформы</span>
    </div>
  </div>
);

const ArchitectureGraphic = () => {
  const [cat, setCat] = useState<CatalogCategory | null>(null);
  const open = (core: Core) => setCat(CATALOG.find((c) => c.key === core.cat) ?? null);

  return (
    <div>
      {/* Desktop: radial hub */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-2xl lg:block">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
          {NODES.map((p, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke="hsl(var(--accent))"
              strokeWidth="0.4"
              strokeOpacity="0.55"
              strokeDasharray="1.6 1.6"
              strokeLinecap="round"
              className="arch-line"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </svg>
        {/* обёртка держит позиционирование (motion затирает transform — translate
            и scale обязаны жить на разных элементах) */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <CenterNode />
          </motion.div>
        </div>
        {CORES.map((c, i) => (
          <div
            key={c.key}
            style={{ left: `${NODES[i].x}%`, top: `${NODES[i].y}%` }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-90px" }}
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.15 + i * 0.08 }}
            >
              <CoreCard core={c} compact w="w-40" onClick={() => open(c)} />
            </motion.div>
          </div>
        ))}
      </div>

      {/* Mobile / tablet: stacked tree */}
      <div className="lg:hidden">
        <div className="flex justify-center">
          <CenterNode />
        </div>
        <div className="mx-auto my-4 h-6 w-px bg-gradient-to-b from-accent/60 to-border" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-2 gap-3"
        >
          {CORES.map((c) => (
            <motion.div
              key={c.key}
              variants={{
                hidden: { opacity: 0, y: 14, scale: 0.97 },
                show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 22 } },
              }}
            >
              <CoreCard core={c} compact onClick={() => open(c)} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">Нажмите на ядро — описание и провайдеры</p>

      <InfoModal category={cat} onClose={() => setCat(null)} />
    </div>
  );
};

export default ArchitectureGraphic;
