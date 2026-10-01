import type * as RU from "@/content";
import { MODULE_COUNT } from "@/modulesCatalog";

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
  sub: "Exchange website, client account, KYC/AML and regulatory reporting — a ready platform on your domain and under your brand. You hold the operator licence; we run the software, servers and updates.",
  ctaPrimary: "Request a demo",
  ctaSecondary: "Live demo",
};

export const DEMO_URL = "https://demo.asystem.ai";

export const STATS: typeof RU.STATS = [
  { value: String(MODULE_COUNT), label: "modules in the catalog" },
  { value: "8", label: "exchanges already run on the platform", live: "exchangers" },
  { value: "KG", label: "servers and data in Kyrgyzstan" },
  { value: "SFIS", label: "KG compliance built in" },
];

export const INTEGRATIONS = [
  { name: "Didit", domain: "didit.me" },
  { name: "BiometricVision" },
  { name: "Finik", domain: "finik.kg" },
  { name: "Ranex KYT", domain: "ranex.kg" },
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
  { icon: "Server", title: "Your own server in Kyrgyzstan", text: "Every exchange gets a separate server and its own database: client data is never mixed with anyone else's." },
  { icon: "Palette", title: "Your brand", text: "Logo, colors, texts, bank details and domain — the exchange looks like your product. Everything is edited in the admin panel." },
  { icon: "ShieldCheck", title: "KYC / AML inside", text: "Identity verification (ASystem KYC, Didit or BiometricVision), SFIS list screening and Ranex KYT crypto address checks." },
  { icon: "FileSpreadsheet", title: "SFIS reporting", text: "FinSupervision reports: deal and client registries are compiled automatically. A reference of 156 suspicious-activity codes, high-risk jurisdictions." },
  { icon: "RefreshCw", title: "Updates are on us", text: "We roll out new modules and fixes. Your team doesn't need to install anything." },
  { icon: "Wallet", title: "Rent or buy out", text: "Rent the platform monthly or buy a perpetual licence to it." },
  { icon: "Lock", title: "Secure by default", text: "A separate database per exchange, encrypted provider keys, two-factor login for staff and clients." },
];

export const STEPS: typeof RU.STEPS = [
  { n: "01", title: "Brief", text: "You send us company details, bank details, the currency list and the domain." },
  { n: "02", title: "Server and database", text: "We set up a dedicated server and database for you and connect the domain and email." },
  { n: "03", title: "Setup", text: "Branding, currencies, rates and fees, modules, identity checks and payment acceptance." },
  { n: "04", title: "Training and launch", text: "We walk your staff through orders and compliance, then open the exchange to clients." },
];

export const API_CORES: typeof RU.API_CORES = {
  title: "Need individual cores rather than an exchange?",
  lead: "Some platform cores are available via a keyed API: you can embed them into your own system without our exchange. Connected by arrangement.",
  cores: [
    { title: "KYC Core", text: "Identity verification and risk scoring through one API." },
    { title: "Payment Core", text: "QR payment acceptance via Finik." },
    { title: "Reporting Core", text: "Data for regulatory reporting." },
    { title: "Custody Core", text: "Wallets and payouts on DFNS." },
  ],
  snippet: `POST /kyc-core/verify
Authorization: Bearer ask_••••

{ "full_name": "...", "document": {...} }
→ { "decision": "auto_approve", "score": 82 }`,
};

export const COMPLIANCE: typeof RU.COMPLIANCE = {
  title: "Compliance and security are the foundation, not an option",
  lead: "Checks run automatically along the order; your compliance officer decides on borderline cases.",
  points: [
    { title: "KR regulation", text: "Compliant with SFIS requirements: law 87/2018, decree 739/2025." },
    { title: "FinSupervision reports", text: "Deal and client registries are compiled automatically; the officer enters financial figures monthly." },
    { title: "Data isolation", text: "A separate server and database for every exchange." },
    { title: "Key encryption", text: "Provider keys are stored encrypted in the database." },
    { title: "Risk screening", text: "SFIS lists, high-risk jurisdictions, limit accumulators, crypto address checks." },
    { title: "History and retention", text: "Every order's history and compliance decisions; data is kept for at least 5 years." },
  ],
};

export const FAQ: typeof RU.FAQ = [
  { q: "How long does a launch take?", a: "We set up the server and database ourselves. The rest depends on how quickly bank details, the domain and setup data are ready. It takes weeks, not the months of building from scratch." },
  { q: "Do you help with the VA exchange operator licence?", a: "The exchange obtains the licence itself; we are responsible for the software. There is a free checklist of launch requirements in the KR, and the platform already meets SFIS requirements for client handling and reporting." },
  { q: "Who owns the data?", a: "Client data belongs to the exchange. Every exchange has a separate server and its own database — data is never mixed with anyone else's." },
  { q: "Can I buy the platform out?", a: "Yes. Besides renting, you can buy a perpetual licence to the platform. Terms are agreed individually." },
  { q: "What do support and updates include?", a: "We roll out platform updates and fixes; your team doesn't need to install anything. We answer your staff's questions." },
  { q: "Can I use only KYC or payments, without the exchange?", a: "Some cores — KYC, payment acceptance, wallets, reporting data — are available via a keyed API. We discuss the connection for your case." },
];

export const FINAL_CTA: typeof RU.FINAL_CTA = {
  title: "Launch a licensed exchange in weeks, not months",
  sub: "We'll show you the platform live and send you a commercial proposal.",
  cta: "Request a demo",
};
