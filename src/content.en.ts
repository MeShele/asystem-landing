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
  sub: "Ready software for a licensed exchange: website, client account, admin panel and SFIS reporting.",
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
  lead: "Screenshots of the demo stand, demo.asystem.ai.",
  items: [
    { key: "store", title: "Storefront", text: "Your domain and rates. Buy, sell, swap." },
    { key: "cabinet", title: "Client account", text: "KYC, orders, QR payment, documents." },
    { key: "admin", title: "Admin panel", text: "Orders, staff, SFIS list screening." },
    { key: "reports", title: "FinSupervision reports", text: "Registries build from orders by themselves." },
  ],
};

export const WHO: typeof RU.WHO = {
  title: "Who it is for",
  labelYes: "A fit",
  labelNo: "Not a fit",
  cards: [
    { text: "You hold or are obtaining a virtual asset exchange operator licence." },
    { text: "You run an exchange that fails the SFIS check." },
    { text: "Anonymous exchange, trading venue, no licence.", no: true },
  ],
};

export const LAW: typeof RU.LAW = {
  title: "SFIS requirements and what is already in the platform",
  lead: "The platform covers seven of eight requirements. Call recording stays with the exchange.",
  head: ["What SFIS requires", "How it is done", "Status"],
  status: { done: "Done", you: "Your side" },
  rows: [
    { req: "KYC before the first deal, 18+, residency", how: "Own KYC, Didit or BiometricVision", status: "done" },
    { req: "Screening against SFIS and sanctions lists", how: "A match stops the order until the officer decides", status: "done" },
    { req: "One client, one account; consent; public offer", how: "Duplicates by tax ID blocked; consents with time and IP", status: "done" },
    { req: "Order time, documents five years, backup", how: "History of every order, daily backup", status: "done" },
    { req: "Servers in Kyrgyzstan", how: "Own server in a Bishkek data centre", status: "done" },
    { req: "Cashless and FinSupervision reports", how: "Transfer or QR, registries from orders", status: "done" },
    { req: "Ranex wallet checks", how: "Built in; Ranex issues the key to the exchange", status: "done" },
    { req: "Call recording, five years", how: "The exchange's telephony and messengers", status: "you" },
  ],
  source: "Source: SFIS requirements for virtual asset exchange platforms, June 2026.",
};

export const AUTOMATION: typeof RU.AUTOMATION = {
  eyebrow: "Stage 2 · Auto-exchange module",
  title: "A deal with no staff involved",
  lead: "Buying and selling run without staff: Finik confirms the payment, the platform sends the crypto.",
  note: "Orders above the compliance threshold stay with the officer for manual review.",
  flows: [
    { key: "buy", title: "Buy", steps: ["The client pays by Finik QR", "The platform sends crypto from the hot wallet", "The network confirms the transfer, the order closes with a hash"] },
    { key: "sell", title: "Sell", steps: ["The client sends the amount stated in the order", "The platform recognises the deposit by amount", "Finik pays out the som, the order closes"] },
  ],
};

export const STEPS: typeof RU.STEPS = {
  title: "Launch in four steps",
  note: "Within 14 days of payment.",
  stages: [
    { short: "01", clause: "Contract", text: "A plan, a three-month contract." },
    { short: "02", clause: "Server", text: "Server in Bishkek, domain, TLS." },
    { short: "03", clause: "Setup", text: "Brand, currencies, rates, bank details." },
    { short: "04", clause: "Opening", text: "The exchange is open, clients sign up." },
  ],
};

export const PRICING: typeof RU.PRICING = {
  title: "Pricing",
  lead: (prepay: number) => `Server and compliance in every plan. Paid ${prepay} months in advance.`,
  rateNote: (date: string) => `Prices in KGS at the NBKR rate as of ${date}, fixed in the contract.`,
  providersNote: "KYC, acquiring and SMS are paid to providers directly.",
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
      price: "Prices in the proposal.",
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
  items: [
    { q: "Do you help with the licence?", a: "The exchange obtains the licence; we build the software. The requirements checklist is free." },
    { q: "Who owns the client data?", a: "The exchange. Own server and database in Kyrgyzstan." },
    { q: "How long does the launch take?", a: "Within 14 days. The server takes a day; the rest is your bank details and contracts." },
    { q: "Can the platform be bought out?", a: "Yes, terms are set in the contract." },
    { q: "Why are prices in KGS?", a: "KR advertising law requires it. The amount is fixed in the contract." },
  ],
};

export const CTA: typeof RU.CTA = {
  title: "See the platform",
  sentence: "A 30-minute call and a commercial proposal within one business day.",
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
