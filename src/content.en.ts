import type * as RU from "@/content";

/**
 * English mirror of the landing copy (structure = content.ts, RU is canonical).
 * Terminology: SFIS = State Financial Intelligence Service of the KR (ГСФР),
 * FinSupervision = Financial Market Regulation and Supervision Service (Финнадзор),
 * VA = virtual assets. Keep both files in sync when editing copy.
 */

export const NAV: typeof RU.NAV = [
  { label: "Features", href: "#features" },
  { label: "Modules", href: "#modules" },
  { label: "How it works", href: "#how" },
  { label: "Compliance", href: "#compliance" },
  { label: "Pricing", href: "#pricing" },
  { label: "Checklist", href: "/blueprint" },
];

export const HERO: typeof RU.HERO = {
  badge: "Infrastructure for licensed crypto business",
  h1a: "Launch a licensed crypto exchange",
  h1accent: "turnkey",
  h1b: "— in weeks, not months",
  sub: "ASystem Core covers the VA exchange operator licence, deployment, KYC/AML and regulatory reporting. You launch a ready-made exchange under your own brand and add modules as you grow.",
  ctaPrimary: "Request a demo",
  ctaSecondary: "Live demo",
};

export const DEMO_URL = "https://demo.asystem.ai";

export const STATS: typeof RU.STATS = [
  { value: "25+", label: "modules in the marketplace" },
  { value: "4", label: "exchanges live in production" },
  { value: "1 click", label: "to deploy an exchange" },
  { value: "SFIS", label: "KG compliance built in" },
];

export const INTEGRATIONS = [
  { name: "SumSub", domain: "sumsub.com" },
  { name: "Didit", domain: "didit.me" },
  { name: "BiometricVision" },
  { name: "Finik", domain: "finik.kg" },
  { name: "CoreX" },
  { name: "DFNS", domain: "dfns.co" },
  { name: "ORGON" },
  { name: "Comply Core", own: true },
] as { name: string; domain?: string; own?: boolean }[];

export const PROBLEM: typeof RU.PROBLEM = {
  title: "Building from scratch takes a year — and carries real risk",
  lead: "VASP licensing, KYC/AML integrations, exchange development, regulator-grade reporting — each step is a project of its own. ASystem Core folds it all into one ready platform.",
  pains: [
    { title: "Months of development", text: "Exchange, admin panel, billing, security — built from scratch by a team over one or two quarters." },
    { title: "Licence and compliance", text: "SFIS requirements (law 87/2018, decree 739/2025), suspicious-activity codes, FinSupervision reporting." },
    { title: "Provider integrations", text: "KYC, AML screening, payments, custody — each with its own API, webhooks and quirks." },
  ],
};

export const FEATURES: typeof RU.FEATURES = [
  { icon: "Rocket", title: "Turnkey exchange", text: "A ready crypto-to-fiat exchange platform — billing, orders, admin panel and security out of the box." },
  { icon: "MousePointerClick", title: "One-click deployment", text: "Your domain, DNS and SSL come up automatically. A new exchange in minutes, not weeks." },
  { icon: "Palette", title: "Your brand", text: "Logo, colors, content, domain — every exchange looks like your product. Multi-domain from a single panel." },
  { icon: "ShieldCheck", title: "KYC / AML inside", text: "Multi-provider identity verification (SumSub, Biometric Vision, ASystem KYC) and AML screening — switched with a toggle." },
  { icon: "FileSpreadsheet", title: "SFIS reporting", text: "Automated FinSupervision reporting, 156 suspicious-activity codes, high-risk jurisdiction screening." },
  { icon: "RefreshCw", title: "OTA updates", text: "The platform updates over the air — new modules and features with zero downtime and no manual deploys." },
  { icon: "Server", title: "SaaS or self-hosted", text: "Host with us or deploy on your own infrastructure with a single command." },
  { icon: "Lock", title: "Secure by default", text: "Per-tenant data isolation at the database level (RLS), encrypted keys, full audit trail." },
];

export const STEPS: typeof RU.STEPS = [
  { n: "01", title: "VA exchange operator licence", text: "We help you obtain the VASP licence under KR regulator requirements." },
  { n: "02", title: "One-click deploy", text: "We roll out your exchange: domain, SSL, infrastructure — automatically." },
  { n: "03", title: "Branding", text: "Set up your logo, colors and content under your own brand." },
  { n: "04", title: "Plug in modules", text: "Enable KYC, payments, custody and reporting from the marketplace as you grow." },
];

export const API_CORES: typeof RU.API_CORES = {
  title: "Need individual cores rather than an exchange?",
  lead: "ASystem Core is a platform of modular fintech cores. Plug them into your own infrastructure one by one via a public API — no exchange on top required.",
  cores: [
    { title: "KYC Core", text: "Verification and scoring through a single multi-provider API." },
    { title: "Payment Core", text: "Payment acceptance and routing." },
    { title: "AML Core", text: "Transaction screening and risk scoring." },
    { title: "Custody Core", text: "Wallet management and payouts." },
  ],
  snippet: `POST /kyc-core/verify
Authorization: Bearer ask_••••

{ "full_name": "...", "document": {...} }
→ { "decision": "auto_approve", "score": 82 }`,
};

export const COMPLIANCE: typeof RU.COMPLIANCE = {
  title: "Compliance and security are the foundation, not an option",
  lead: "The platform is built around regulator requirements and vetted by professional buyers.",
  points: [
    { title: "KR regulation", text: "Compliant with SFIS requirements: law 87/2018, decree 739/2025." },
    { title: "Automated reporting", text: "FinSupervision reports are generated automatically, 156 suspicious-activity codes." },
    { title: "Data isolation", text: "RLS isolation of every tenant at the database level." },
    { title: "Key encryption", text: "Provider API keys are stored encrypted (pgcrypto / vault)." },
    { title: "Risk screening", text: "Sanctions lists, high-risk jurisdictions, limit accumulators." },
    { title: "Audit trail", text: "Every action is recorded — full transparency for the regulator." },
  ],
};

export const PRICING: typeof RU.PRICING = {
  note: "Pricing depends on the plan and volume — we scope it for your case on a demo call.",
  plans: [
    {
      name: "Start",
      tagline: "A minimal working exchange",
      forWho: "Your first licensed exchange, one brand",
      priceLabel: "Scoped for your launch",
      featured: false,
      includes: [
        "Turnkey exchange",
        "ASystem KYC (verification)",
        "Comply Core (SFIS) — compliance",
        "Finik QR — payment acceptance",
        "Document generation",
        "1 domain + SSL · OTA updates",
      ],
      cta: "Scope my launch",
    },
    {
      name: "Comfort",
      tagline: "Everything an exchange needs",
      forWho: "A growing operator, multiple brands",
      priceLabel: "Scoped for your launch",
      featured: true,
      includes: [
        "Everything in Start",
        "Extended KYC: Didit · BiometricVision · SumSub",
        "CoreX Acquiring — card payments",
        "FinSupervision reports + compliance data",
        "Client quiz / questionnaire",
        "Multi-domain + white-label · priority support",
      ],
      cta: "Request a demo",
    },
    {
      name: "Enterprise / API cores",
      tagline: "For banks, fintechs, large VASPs",
      forWho: "Your own infrastructure and integrations",
      priceLabel: "On request",
      featured: false,
      includes: [
        "Everything in Comfort",
        "Custody: ORGON · DFNS",
        "Exchange liquidity (Binance, Kraken…)",
        "Modular API cores (KYC/Payment/AML/Custody)",
        "Self-hosted · custom SLA",
        "Dedicated support · release control",
      ],
      cta: "Discuss integration",
    },
  ],
};

export const FAQ: typeof RU.FAQ = [
  { q: "How long does a launch take?", a: "Technically the exchange deploys in one click within minutes. A full launch with branding and modules takes weeks — not the months required to build from scratch." },
  { q: "Do you help with the VA exchange operator licence?", a: "Yes. We support VASP licensing under KR regulator requirements — from a checklist to full guidance depending on the plan." },
  { q: "Who owns the data?", a: "Each operator's data is isolated at the database level (RLS). In the self-hosted option everything stays on your infrastructure." },
  { q: "SaaS or self-hosted?", a: "Both. You can start on our hosting and later move to your own infrastructure — the platform deploys with a single command." },
  { q: "What do support and updates include?", a: "The platform updates over the air (OTA): new modules and features with zero downtime. Support level depends on the plan — from tickets to a dedicated team." },
  { q: "Can I use only KYC or payments, without the exchange?", a: "Yes. The cores (KYC, Payment, AML, Custody) are available as standalone APIs to integrate into your own infrastructure." },
];

export const FINAL_CTA: typeof RU.FINAL_CTA = {
  title: "Launch a licensed exchange in weeks, not months",
  sub: "We'll show you the platform live and scope the launch for your case.",
  cta: "Request a demo",
};
