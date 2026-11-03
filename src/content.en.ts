import type * as RU from "@/content";
import { MODULE_COUNT } from "@/modulesCatalog";

/**
 * English mirror of content.ts (RU is canonical). SFIS = State Financial
 * Intelligence Service of the KR (ГСФР), FinSupervision = Financial Market
 * Regulation and Supervision Service (Финнадзор), NBKR = National Bank.
 */

export const NAV: typeof RU.NAV = [
  { label: "What you get", href: "#features" },
  { label: "Requirements", href: "#law" },
  { label: "Launch", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Checklist", href: "/blueprint" },
];

export const DEMO_URL = "https://demo.asystem.ai";

export const HERO: typeof RU.HERO = {
  h1Lines: ["An exchange that works", "by Kyrgyz law"],
  sub: "A ready exchange under your brand: website, client account, admin panel and compliance built for SFIS requirements. Server in Bishkek. Launch within 14 days.",
  cta: "Request a demo",
  ctaSecondary: "Open the demo stand",
  demoUrl: DEMO_URL,
  fact: (n: number | null) => (n ? `${n} exchanges already live` : "Exchanges already live"),
  facts: ["Server in Bishkek", "SFIS requirements built in", "Launch within 14 days"],
  videoLabel: "Orders in the operator admin panel: kanban, statuses, payouts",
};

export const PROOF: typeof RU.PROOF = {
  lead: "Works together with",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

export const FEATURES: typeof RU.FEATURES = {
  eyebrow: "Stage 1 · live now",
  title: "What you get",
  lead: "Not mock-ups: real screens below. On launch day you have everything listed here.",
  items: [
    { stage: "brand", title: "Exchange website", text: ["Your domain, logo and colours. Buy, sell, swap. You set rates and fees.", "Two storefront templates, dark theme, emails and a Telegram bot in the exchange's name."] },
    { stage: "kyc", title: "Client account", text: ["Sign-up, identity check, order history, QR payment, documents and consents.", "Reviewed by your staff or a provider: Didit or BiometricVision."] },
    { stage: "compliance", title: "Admin panel and compliance", text: ["Orders, staff and permissions. Clients are screened against SFIS lists; a match stops the order until the officer decides.", "You set the threshold above which a large order waits for the officer."] },
    { stage: "reports", title: "FinSupervision reports", text: ["Deal and client registries build themselves from orders in the required format.", "Data is kept for at least five years, as the regulator requires."] },
    { stage: "server", title: "Your own server in Kyrgyzstan", text: ["A separate server and database just for you in a Bishkek data centre. Daily backups.", "Updates, support and new regulator requirements are on us."] },
  ],
};

export const WHO: typeof RU.WHO = {
  title: "Who it is for",
  lead: "The platform is built for the virtual assets law. Without client identification a deal does not go through.",
  labelYes: "A fit",
  labelNo: "Not a fit",
  cards: [
    { title: "You are getting or already hold a virtual asset exchange operator licence", text: "You want to open an exchange fast, legally and without your own IT team. Clients pay in som and receive USDT and other crypto." },
    { title: "You have an exchange, but it fails the regulator's review", text: "No client checks, no FinSupervision reports, no server in Kyrgyzstan. You move to a platform that already has them." },
    { title: "Anonymous exchange, a trading exchange, work without a licence", text: "Not what the platform is for: every deal is tied to a verified client and leaves a trail for the regulator.", no: true },
  ],
};

export const LAW: typeof RU.LAW = {
  title: "Regulator requirements and what is already in the platform",
  lead: "Based on SFIS requirements for virtual asset exchange platforms. Honestly: one line lives outside the platform.",
  head: ["What SFIS requires", "How it is done", "Status"],
  status: { done: "Done", you: "Your side" },
  rows: [
    { req: "Identity check before the first deal, age 18+, residency", how: "KYC in the client account: own, Didit or BiometricVision. Non-residents go to manual review", status: "done" },
    { req: "Screening against SFIS and sanctions lists", how: "Comply Core: lists loaded, a match stops the order until the officer decides", status: "done" },
    { req: "One client, one account; personal data consent; public offer", how: "Duplicates by tax ID are blocked; consent and offer acceptance are recorded with time and IP", status: "done" },
    { req: "Order time to the minute, documents kept five years, daily backup", how: "History of every order, documents in the database, backup is part of every server deployment", status: "done" },
    { req: "Servers on the territory of Kyrgyzstan", how: "A separate server for each exchange in a Bishkek data centre", status: "done" },
    { req: "Cashless settlements, FinSupervision reports", how: "Payment only by transfer or QR; deal and client registries build from orders", status: "done" },
    { req: "Wallet and transfer checks via Ranex", how: "Ranex KYT is built in: Ranex issues the API key to the exchange, we connect it the day it arrives", status: "done" },
    { req: "Recording of client conversations, five years", how: "Outside the platform: the exchange's telephony and messengers", status: "you" },
  ],
  we: { title: "Us", items: ["Platform, server in Bishkek, updates", "Compliance with new regulator requirements", "Support and provider setup", "Daily backups and data protection"] },
  you: { title: "You", items: ["Virtual asset exchange operator licence", "Contracts with Finik and the identity provider", "Compliance officer and decisions on disputed orders", "Rates, fees, bank details, working capital", "Recording of client conversations"] },
  source: "Source: SFIS requirements for virtual asset exchange platforms, June 2026.",
};

export const SHOWREEL: typeof RU.SHOWREEL = {
  title: "The platform in 30 seconds",
  lead: "Storefront, client account, admin panel and reports in one clip.",
};

export const AUTOMATION: typeof RU.AUTOMATION = {
  eyebrow: "Auto-exchange module",
  title: "A deal with no staff involved",
  lead: "The client pays by QR and the crypto leaves by itself. The client sends crypto and the som leaves by itself. Each direction has its own switch, limits and a kill switch are at hand, and a checklist shows what is still missing.",
  note: "Without the module the exchange works as before: staff verify payment and pay out by hand. The automation takes orders below the compliance threshold; large ones are still decided by the officer.",
  legend: ["client", "platform", "network / provider"],
  flows: [
    {
      key: "buy",
      title: "Buying USDT",
      steps: [
        "The client pays by Finik QR, the webhook confirms the payment.",
        "The platform signs a transfer from the exchange's hot wallet.",
        "The network confirms the transaction and the order closes with a hash.",
      ],
      order: { title: "No. 7", id: "#f097e928", summary: "Buy 57.47 USDT · 5,000 KGS · TRC20", live: "in progress", done: "completed" },
      log: [
        { time: "14:02", actor: "client", text: "Client paid by Finik QR", meta: "5,000 KGS · confirmed by webhook" },
        { time: "14:02", actor: "system", text: "Order paid, queued for payout", meta: "below compliance threshold · KYT clear" },
        { time: "14:03", actor: "system", text: "Transfer of 57.47 USDT signed and broadcast", meta: "tx 3f9a1c…e04b · hot wallet TRC20" },
        { time: "14:04", actor: "network", text: "Network confirmed the transfer — order completed", meta: "no staff involved" },
      ],
    },
    {
      key: "sell",
      title: "Selling USDT",
      steps: [
        "The order gets a unique amount to send, so the deposit is recognised without questions.",
        "The chain watcher sees the transfer to the exchange wallet and confirms payment.",
        "Som is paid to the client via Finik and the order closes.",
      ],
      order: { title: "No. 8", id: "#a21c77d0", summary: "Sell 100.004213 USDT · 8,700 KGS", live: "awaiting transfer", done: "completed" },
      log: [
        { time: "15:10", actor: "system", text: "Client given the exact amount to send", meta: "exactly 100.004213 USDT to the exchange address" },
        { time: "15:12", actor: "network", text: "Deposit recognised by amount", meta: "tx 9b7e42…11fa · 100.004213 USDT" },
        { time: "15:12", actor: "system", text: "Payment confirmed, som sent via Finik", meta: "8,700 KGS to the client's wallet" },
        { time: "15:13", actor: "network", text: "Finik confirmed the payout — order completed", meta: "no staff involved" },
      ],
    },
  ],
};


export const STEPS: typeof RU.STEPS = {
  title: "How we launch",
  note: "Four steps, within 14 days of the first payment. External services, the identity provider and Finik, are connected under their own contracts; we help with setup and keys.",
  stages: [
    { short: "Contract", clause: "Contract", text: "You pick a plan. The first contract runs three months, paid a month ahead in som." },
    { short: "Server", clause: "Deployment", text: "We bring up your server in Bishkek, the domain and a secure connection." },
    { short: "Setup", clause: "Setup", text: "Logo and colours, currencies, rates, bank details, legal pages. Staff and their permissions." },
    { short: "Opening", clause: "Opening", text: "The exchange takes clients. A readiness checklist in the admin panel shows what is still empty." },
  ],
};

export const MODULES: typeof RU.MODULES = {
  title: "Module catalog",
  note: `${MODULE_COUNT} modules. What's in a plan, what's an add-on. Enabled in the admin panel, paid ones on request.`,
  videoLabel: "Module marketplace in the exchange admin panel",
  foot: "External providers are paid directly, with no markup from us.",
};

export const PRICING: typeof RU.PRICING = {
  title: "Pricing",
  lead: (prepay: number) => `A server in Kyrgyzstan and Comply Core come with every plan. The subscription is paid ${prepay} months in advance.`,
  rateNote: (date: string) => `Prices in KGS at the NBKR rate as of ${date}; the exact amount is fixed in the contract.`,
  providersNote: "The KYC provider, acquiring and SMS are paid to the providers directly.",
  noRate: "We'll send prices in the proposal.",
  perMonth: "per month",
  setup: "one-time setup",
  popular: "popular",
  groups: {
    start: { title: "Start", desc: "Everything to operate under a licence.", points: ["Exchange on your domain", "Your own server in Kyrgyzstan", "Comply Core for SFIS", "ASystem KYC and Ranex KYT", "Email, two-factor login, knowledge check"] },
    business: { title: "Business", desc: "Payments, reports and external KYC.", points: ["Everything in Start", "Finik: QR payments", "FinSupervision reports", "Didit or BiometricVision", "SMS notifications"] },
    buyout: { title: "Buyout", desc: "The platform is yours for good.", points: ["No monthly fee", "Modules as in the plans", "Server in Kyrgyzstan"], from: "from", unit: "one-time, instead of a subscription" },
    addons: {
      title: "Add-ons for any plan",
      price: "Prices in the commercial proposal.",
      items: [
        { name: "Telegram", desc: "the exchange's bot for clients and staff" },
        { name: "Jivo live chat", desc: "chat window on the storefront" },
        { name: "Rates export for monitors", desc: "BestChange and others" },
        { name: "Auto rates", desc: "market pair with your margin" },
        { name: "Blog", desc: "articles for search engines" },
        { name: "Phone app", desc: "the site as an app" },
      ],
    },
  },
  cta: "Get a proposal",
};

export const FAQ: typeof RU.FAQ = {
  title: "Questions",
  lead: "Briefly, what people ask before the first call.",
  items: [
    { q: "How long does the launch take?", a: "We deploy the server and database. The rest depends on how quickly bank details, domain and setup data are ready. It is a matter of weeks." },
    { q: "Do you help with the virtual asset exchange operator licence?", a: "The exchange obtains the licence itself; we are responsible for the software. There is a free checklist of launch requirements in the KR, and the platform already meets SFIS requirements for client work and reporting." },
    { q: "Who owns the client data?", a: "The exchange. Each one has a separate server and database in Kyrgyzstan; data never mixes with anyone else's." },
    { q: "Can the exchange be listed on BestChange and other monitors?", a: "The rates export module serves rates.xml and rates.json in the monitors' format. Each monitor has its own listing terms, which the exchange fulfils." },
    { q: "How does the client learn the order status?", a: "By email from your domain, by SMS from the operator's account and in Telegram via the exchange's bot. Staff get every status change from the bot." },
    { q: "Can the platform be bought out?", a: "Yes. Besides the subscription you can buy the platform licence outright. Terms are set in the contract." },
    { q: "What does support include?", a: "We ship updates and fixes; your team installs nothing. We answer your staff's questions." },
    { q: "Can we connect only identity checks or payments, without the exchange?", a: "Yes. Identity verification, payment acceptance, wallets and reporting data are available via API with a key. We discuss the connection per task." },
    { q: "Why are prices in KGS?", a: "KR law on settlements in the national currency prohibits advertising with prices in foreign currency. Prices are computed at the NBKR rate on the day of the request and fixed in the contract." },
  ],
};

export const CTA: typeof RU.CTA = {
  title: "See it live",
  sentence: "We'll answer licence questions and send a commercial proposal within one business day.",
  link: "Or open the demo stand yourself",
};

export const FOOTER: typeof RU.FOOTER = {
  about: "A platform for licensed crypto exchanges in Kyrgyzstan. Turnkey exchange, compliance and regulator reporting.",
  menuTitle: "Sections",
  menu: [
    { label: "What you get", href: "#features" },
    { label: "Requirements", href: "#law" },
    { label: "Launch", href: "#how" },
    { label: "Modules", href: "#modules" },
    { label: "Pricing", href: "#pricing" },
    { label: "Questions", href: "#faq" },
    { label: "Launch checklist", href: "/blueprint" },
    { label: "Platform status", href: "/status" },
  ],
  contactTitle: "Contact",
  legal: "© 2026 ASystem Core, ASystem LLC, Bishkek",
  disclaimer: "The virtual asset exchange operator licence is obtained by the exchange. We supply the software.",
};

export const LEAD: typeof RU.LEAD = {
  title: "See the platform live",
  sub: "We reply within one business day.",
  topics: [
    { key: "turnkey", label: "Turnkey exchange" },
    { key: "api", label: "API cores only" },
    { key: "license", label: "Licence question" },
  ],
  name: "Name",
  company: "Company",
  contact: "Telegram, email or phone",
  send: "Send request",
  sending: "Sending…",
  sentTitle: "Request sent",
  sentText: "We'll get back to you shortly.",
  error: "Could not send. Please reach us on Telegram or email.",
  consent: "By submitting you agree to the processing of your contact details.",
  attached: "Attached to the request",
};
