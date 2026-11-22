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
  map: { label: "Relief map of Kyrgyzstan: the exchange server sits in Bishkek, orders reach it from cities across the country", city: "Bishkek", note: "exchange server and data" },
};

export const PATH: typeof RU.PATH = {
  title: "The order's path",
  steps: [
    { id: "client", title: "Client", text: "Sign-up and KYC" },
    { id: "site", title: "Exchange website", text: "The rate is locked in the order" },
    { id: "pay", title: "Payment", text: "Bank transfer or Finik QR" },
    { id: "operator", title: "Operator", text: "Screening and payout" },
    { id: "fin", title: "FinSupervision", text: "The report builds from orders" },
  ],
  base: "A dedicated server in Bishkek, your domain and brand, daily backup.",
};

export const PROOF: typeof RU.PROOF = {
  lead: "Works together with",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

export const TOUR: typeof RU.TOUR = {
  title: "What's inside",
  lead: "Four parts of the platform. Screens taken from the demo stand.",
  hint: "Scroll down, the screens change",
  items: [
    { key: "store", title: "Storefront", text: "A site on your domain: rates and the exchange order.", alt: "Exchange storefront: a form to swap som for crypto, with rate and fee" },
    { key: "cabinet", title: "Client account", text: "KYC, orders, QR payment, documents.", alt: "Client account: order history with statuses" },
    { key: "admin", title: "Admin panel", text: "Orders, staff, SFIS list screening.", alt: "Admin panel: an order board by status" },
    { key: "reports", title: "FinSupervision reports", text: "Registries build from orders.", alt: "Reporting: FinSupervision reports for the chosen month" },
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
  title: "SFIS requirements in the platform",
  groups: [
    { key: "kyc", title: "KYC", points: ["before the first deal", "18+ and residency", "own, Didit or BiometricVision"] },
    { key: "checks", title: "Screening", points: ["SFIS and sanctions lists", "wallets via Ranex KYT"] },
    { key: "data", title: "Data", points: ["server in Bishkek", "five-year retention", "daily backup"] },
    { key: "reports", title: "Reports", points: ["FinSupervision registries", "cashless payments only"] },
  ],
  label: "A shield of four plates: KYC, screening, data, reports",
  source: "Source: SFIS requirements for virtual asset exchange platforms, June 2026.",
};

export const AUTOMATION: typeof RU.AUTOMATION = {
  title: "A deal with no staff involved",
  lead: "The Auto-exchange module: Finik confirms the payment, the platform sends the crypto.",
  note: "Orders above the compliance threshold go to the officer.",
  flows: [
    {
      key: "buy", title: "Buy",
      steps: [
        { id: "pay", title: "The client pays by Finik QR", text: "Finik confirms the payment" },
        { id: "send", title: "The platform sends the crypto", text: "From the exchange's hot wallet" },
        { id: "done", title: "Order closed", text: "Transaction hash in the order" },
      ],
    },
    {
      key: "sell", title: "Sell",
      steps: [
        { id: "transfer", title: "The client sends the order amount", text: "To the exchange's address" },
        { id: "detect", title: "The platform recognises the deposit", text: "By the order's unique amount" },
        { id: "payout", title: "Finik pays out the som", text: "Order closed" },
      ],
    },
  ],
};

export const STEPS: typeof RU.STEPS = {
  title: "Launch in four steps",
  note: "Within 14 days of payment.",
  label: "Four launch steps: a handshake over the contract, a server rack, a setup console, the exchange building",
  steps: [
    { id: "contract", title: "Contract", text: "A plan and a three-month contract" },
    { id: "server", title: "Server", text: "Server in Bishkek, domain, TLS" },
    { id: "setup", title: "Setup", text: "Brand, currencies, rates, bank details" },
    { id: "open", title: "Opening", text: "The exchange takes clients" },
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
    start: { title: "Start", desc: "The base set for operating under a licence.", points: ["Exchange on your domain", "Your own server in Kyrgyzstan", "Compliance for SFIS", "ASystem KYC and Ranex KYT", "Email, two-factor login"] },
    business: { title: "Business", desc: "Payments, reports and external KYC.", points: ["Everything in Start", "Finik: QR payments", "FinSupervision reports", "Didit or BiometricVision", "SMS notifications"] },
    buyout: { title: "Buyout", desc: "The platform stays with you.", points: ["No monthly fee", "Modules as in the plans", "Server in Kyrgyzstan"], from: "from", unit: "one-time, instead of a subscription" },
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
