import { Boxes } from "lucide-react";
import { ICONS } from "@/lib/icons";

/** Core in the center → functional cores around it → modules branching from each core. */
type Core = { key: string; label: string; icon: string; modules: string[] };

const CORES: Core[] = [
  { key: "kyc", label: "KYC Core", icon: "UserCheck", modules: ["ASystem KYC", "SumSub", "Didit", "BiometricVision"] },
  { key: "pay", label: "Payment Core", icon: "CreditCard", modules: ["Finik QR", "CoreX", "ElQR"] },
  { key: "aml", label: "AML Core", icon: "ShieldAlert", modules: ["Comply Core", "ComplyAdvantage"] },
  { key: "rep", label: "Reporting Core", icon: "FileSpreadsheet", modules: ["Финнадзор", "Данные комплайнс"] },
  { key: "cust", label: "Custody Core", icon: "Wallet", modules: ["ORGON", "DFNS", "Argon"] },
  { key: "liq", label: "Liquidity Core", icon: "Repeat", modules: ["Binance", "Kraken", "ByBit"] },
];

const R = 34; // % radius of the core ring from center
const NODES = CORES.map((_, i) => {
  const a = (-90 + i * (360 / CORES.length)) * (Math.PI / 180);
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
});

const CoreCard = ({ core, compact, w = "w-full" }: { core: Core; compact?: boolean; w?: string }) => {
  const Icon = ICONS[core.icon];
  const list = compact ? core.modules.slice(0, 3) : core.modules;
  const extra = compact ? core.modules.length - list.length : 0;
  return (
    <div className={`rounded-xl border border-border bg-card p-3 shadow-[0_8px_24px_-12px_hsl(240_10%_6%/0.18)] ${w}`}>
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
    </div>
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

const ArchitectureGraphic = () => (
  <div>
    {/* Desktop: radial hub */}
    <div className="relative mx-auto hidden aspect-square w-full max-w-2xl lg:block">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {NODES.map((p, i) => (
          <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} stroke="hsl(var(--accent))" strokeWidth="0.4" strokeOpacity="0.55" strokeDasharray="1.6 1.6" strokeLinecap="round" />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <CenterNode />
      </div>
      {CORES.map((c, i) => (
        <div
          key={c.key}
          style={{ left: `${NODES[i].x}%`, top: `${NODES[i].y}%` }}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <CoreCard core={c} compact w="w-40" />
        </div>
      ))}
    </div>

    {/* Mobile / tablet: stacked tree */}
    <div className="lg:hidden">
      <div className="flex justify-center">
        <CenterNode />
      </div>
      <div className="mx-auto my-4 h-6 w-px bg-gradient-to-b from-accent/60 to-border" />
      <div className="grid grid-cols-2 gap-3">
        {CORES.map((c) => (
          <CoreCard key={c.key} core={c} compact />
        ))}
      </div>
    </div>
  </div>
);

export default ArchitectureGraphic;
