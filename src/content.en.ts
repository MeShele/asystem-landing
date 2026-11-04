/** EN mirror of content.ts: same structure, short sentences. */
import type * as RU from "@/content";

export const NAV: typeof RU.NAV = [
  { label: "What's inside", href: "#features" },
  { label: "Requirements", href: "#law" },
  { label: "Launch", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Checklist", href: "/blueprint" },
];

export const DEMO_URL = "https://demo.asystem.ai";

export const HERO: typeof RU.HERO = {
  h1Lines: ["The exchange platform", "built for Kyrgyz law"],
  sub: "Website, client account, admin panel and compliance for SFIS requirements. Your licence, our software.",
  cta: "Request a demo",
  ctaSecondary: "Open the demo stand",
  demoUrl: DEMO_URL,
  fact: (n: number | null) => (n ? `${n} exchanges already live` : "Exchanges already live"),
  facts: ["Server in Bishkek", "Launch within 14 days"],
  shotLabel: "Operator admin panel: orders by status",
};

export const PROOF: typeof RU.PROOF = {
  lead: "Works together with",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

export const TOUR: typeof RU.TOUR = {
  eyebrow: "Stage 1 · live now",
  title: "What's inside",
  lead: "Real screens from the demo stand, not mock-ups.",
  items: [
    { key: "store", title: "Storefront", text: "Your domain, logo and rates. The client buys, sells, swaps." },
    { key: "cabinet", title: "Client account", text: "Identity check, orders, QR payment, documents." },
    { key: "admin", title: "Admin panel", text: "Orders by status, staff and permissions, SFIS list screening." },
    { key: "reports", title: "FinSupervision reports", text: "Registries build from orders by themselves. Kept five years." },
  ],
  foot: "A separate server in Bishkek. Daily backup. Updates are on us.",
};

export const WHO: typeof RU.WHO = {
  title: "Who it is for",
  labelYes: "A fit",
  labelNo: "Not a fit",
  cards: [
    { text: "You are getting or already hold a virtual asset exchange operator licence and need an exchange without your own IT team." },
    { text: "You run an exchange that fails the regulator's check: no KYC, no reports, no server in Kyrgyzstan." },
    { text: "Anonymous exchange, trading venue, operating without a licence.", no: true },
  ],
};

export const LAW: typeof RU.LAW = {
  title: "SFIS requirements and what is already in the platform",
  lead: "One line lives outside the platform. The rest works.",
  head: ["What SFIS requires", "How it is done", "Status"],
  status: { done: "Done", you: "Your side" },
  rows: [
    { req: "Identity check before the first deal, 18+, residency", how: "KYC in the client account: own, Didit or BiometricVision", status: "done" },
    { req: "Screening against SFIS and sanctions lists", how: "A match stops the order until the officer decides", status: "done" },
    { req: "One client, one account; data consent; public offer", how: "Duplicates by tax ID are blocked; consents recorded with time and IP", status: "done" },
    { req: "Order time to the minute, documents five years, backup", how: "History of every order, daily backup", status: "done" },
    { req: "Servers on the territory of Kyrgyzstan", how: "A separate server in a Bishkek data centre", status: "done" },
    { req: "Cashless settlements, FinSupervision reports", how: "Transfer or QR; registries build from orders", status: "done" },
    { req: "Wallet checks via Ranex", how: "Ranex KYT is built in; Ranex issues the key to the exchange", status: "done" },
    { req: "Recording of client conversations, five years", how: "The exchange's telephony and messengers", status: "you" },
  ],
  we: { title: "Us", items: ["Platform, server, updates", "New regulator requirements", "Support and provider setup"] },
  you: { title: "You", items: ["VA exchange operator licence", "Contracts with Finik and the KYC provider", "Compliance officer", "Rates, bank details, working capital"] },
  source: "Source: SFIS requirements for virtual asset exchange platforms, June 2026.",
};

export const AUTOMATION: typeof RU.AUTOMATION = {
  eyebrow: "Stage 2 · Auto-exchange module",
  title: "A deal with no staff involved",
  lead: "Paid by QR, the crypto leaves by itself. Sent crypto, the som leaves by itself.",
  note: "Large orders are still decided by the officer. Without the module the exchange works as before, by hand.",
  flows: [
    { key: "buy", title: "Buy", steps: ["The client pays by Finik QR", "The platform sends crypto from the hot wallet", "Network confirmed, order closed with a hash"] },
    { key: "sell", title: "Sell", steps: ["The client sends exactly the stated amount", "The platform recognises the deposit by amount", "Som leaves via Finik, order closed"] },
  ],
};

export const STEPS: typeof RU.STEPS = {
  title: "Launch in four steps",
  note: "Within 14 days of the first payment.",
  stages: [
    { short: "01", clause: "Contract", text: "A plan and a three-month contract." },
    { short: "02", clause: "Server", text: "Your server in Bishkek, domain and TLS." },
    { short: "03", clause: "Setup", text: "Logo, currencies, rates, bank details, staff." },
    { short: "04", clause: "Opening", text: "Readiness checklist is green, clients come in." },
  ],
};

export const PRICING: typeof RU.PRICING = {
  title: "Pricing",
  lead: (prepay: number) => `A server in Kyrgyzstan and compliance come with every plan. Paid ${prepay} months in advance.`,
  rateNote: (date: string) => `Prices in KGS at the NBKR rate as of ${date}; the exact amount is fixed in the contract.`,
  providersNote: "The KYC provider, acquiring and SMS are paid to the providers directly.",
  noRate: "We'll send prices in the proposal.",
  perMonth: "per month",
  setup: "one-time setup",
  popular: "popular",
  groups: {
    start: { title: "Start", desc: "Everything to operate under a licence.", points: ["Exchange on your domain", "Your own server in Kyrgyzstan", "Compliance for SFIS", "ASystem KYC and Ranex KYT", "Email, two-factor login"] },
    business: { title: "Business", desc: "Payments, reports and external KYC.", points: ["Everything in Start", "Finik: QR payments", "FinSupervision reports", "Didit or BiometricVision", "SMS notifications"] },
    buyout: { title: "Buyout", desc: "The platform is yours for good.", points: ["No monthly fee", "Modules as in the plans", "Server in Kyrgyzstan"], from: "from", unit: "one-time, instead of a subscription" },
    addons: {
      title: "Add-ons for any plan",
      price: "Prices in the commercial proposal.",
      items: [
        { name: "Telegram", desc: "bot for clients and staff" },
        { name: "Jivo live chat", desc: "chat window on the storefront" },
        { name: "Rates export", desc: "BestChange and other monitors" },
        { name: "Auto rates", desc: "market pair with your margin" },
        { name: "Blog", desc: "articles for search engines" },
        { name: "App", desc: "the site as a phone app" },
      ],
    },
  },
  cta: "Get a proposal",
};

export const FAQ: typeof RU.FAQ = {
  title: "Questions",
  lead: "What people ask before the first call.",
  items: [
    { q: "Do you help with the licence?", a: "The exchange obtains the licence; we are responsible for the software. The launch checklist for the KR is free." },
    { q: "Who owns the client data?", a: "The exchange. A separate server and database in Kyrgyzstan; data never mixes with anyone else's." },
    { q: "How long does the launch take?", a: "The server is up in a day. The rest depends on your bank details, domain and provider contracts. Usually within 14 days." },
    { q: "Can the platform be bought out?", a: "Yes. Besides the subscription you can buy the platform licence outright; terms are set in the contract." },
    { q: "Why are prices in KGS?", a: "KR law prohibits advertising with prices in foreign currency. The amount is computed at the NBKR rate and fixed in the contract." },
  ],
};

export const CTA: typeof RU.CTA = {
  title: "See it live",
  sentence: "We'll answer licence questions and send a commercial proposal within one business day.",
  link: "Or open the demo stand yourself",
};

export const FOOTER: typeof RU.FOOTER = {
  about: "A platform for licensed crypto exchanges in Kyrgyzstan.",
  menuTitle: "Sections",
  menu: [
    { label: "What's inside", href: "#features" },
    { label: "Requirements", href: "#law" },
    { label: "Launch", href: "#how" },
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
