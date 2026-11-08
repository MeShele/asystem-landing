/** EN mirror of content.ts: same structure, short sentences. */
import type { Graph } from "@/lib/schema";
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
  shotLabel: "The order's path: client, exchange website, payment, operator, FinSupervision",
  schema: {
    cols: 5,
    nodes: [
      { id: "client", col: 1, row: 1, title: "Client", text: "Sign-up and KYC before the first deal" },
      { id: "site", col: 2, row: 1, title: "Exchange website", text: "Your domain, the rate is locked in the order" },
      { id: "pay", col: 3, row: 1, title: "Payment", text: "Bank transfer or Finik QR, confirmed automatically" },
      { id: "operator", col: 4, row: 1, title: "Operator", text: "SFIS list screening, payout" },
      { id: "fin", col: 5, row: 1, kind: "accent", title: "FinSupervision", text: "Registries build from orders" },
      { id: "server", col: 1, row: 2, span: 5, kind: "ghost", title: "Server in Bishkek", text: "Data kept five years, daily backup, your domain and brand" },
    ],
    edges: [
      { from: "client", to: "site" }, { from: "site", to: "pay" }, { from: "pay", to: "operator" }, { from: "operator", to: "fin" },
    ],
    route: ["client", "site", "pay", "operator", "fin"],
  } as Graph,
};

export const PROOF: typeof RU.PROOF = {
  lead: "Works together with",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

export const TOUR: typeof RU.TOUR = {
  eyebrow: "Stage 1 · live now",
  title: "What's inside",
  lead: "Four parts of the platform. All of it is open live on the demo stand.",
  items: [
    {
      key: "store", title: "Storefront", text: "Your domain and rates. Buy, sell, swap.",
      schema: {
        cols: 3,
        nodes: [
          { id: "domain", col: 1, row: 1, kind: "ghost", title: "Your domain", text: "your-exchange.kg, your brand" },
          { id: "choose", col: 2, row: 1, title: "Buy, sell, swap", text: "The client picks a direction and an amount" },
          { id: "order", col: 3, row: 1, kind: "accent", title: "Order created", text: "Rate locked, payment details issued" },
          { id: "kyc", col: 2, row: 2, kind: "side", title: "Sign-in and KYC", text: "Before the first deal: 18+, residency" },
        ],
        edges: [{ from: "domain", to: "choose" }, { from: "choose", to: "order" }, { from: "kyc", to: "choose", dashed: true }],
        route: ["domain", "choose", "order"],
      } as Graph,
    },
    {
      key: "cabinet", title: "Client account", text: "KYC, orders, QR payment, documents.",
      schema: {
        cols: 4,
        nodes: [
          { id: "created", col: 1, row: 1, title: "Order created", text: "Rate and payment details inside" },
          { id: "paid", col: 2, row: 1, title: "Paid", text: "Finik QR or bank transfer" },
          { id: "issued", col: 3, row: 1, title: "Sent", text: "Transaction hash in the order" },
          { id: "done", col: 4, row: 1, kind: "accent", title: "Completed", text: "Receipt and history in the account" },
          { id: "kyc", col: 1, row: 2, kind: "side", title: "KYC and residency", text: "Once, before the first deal" },
          { id: "docs", col: 4, row: 2, kind: "side", title: "Offer and consents", text: "Stored with time and IP" },
        ],
        edges: [
          { from: "created", to: "paid" }, { from: "paid", to: "issued" }, { from: "issued", to: "done" },
          { from: "kyc", to: "created", dashed: true }, { from: "docs", to: "done", dashed: true },
        ],
        route: ["created", "paid", "issued", "done"],
      } as Graph,
    },
    {
      key: "admin", title: "Admin panel", text: "Orders, staff, SFIS list screening.",
      schema: {
        cols: 4,
        nodes: [
          { id: "waitpay", col: 1, row: 1, title: "Awaiting payment", text: "The order is visible to staff" },
          { id: "waitissue", col: 2, row: 1, title: "Awaiting payout", text: "Staff confirms and sends" },
          { id: "done", col: 3, row: 1, kind: "accent", title: "Completed", text: "With the transaction hash" },
          { id: "compliance", col: 1, row: 2, title: "Compliance review", text: "SFIS list match: the order waits for the officer" },
          { id: "staff", col: 4, row: 1, kind: "side", title: "Staff", text: "Roles and permissions" },
          { id: "ready", col: 4, row: 2, kind: "side", title: "Readiness checklist", text: "What to fill in before launch" },
        ],
        edges: [
          { from: "waitpay", to: "waitissue" }, { from: "waitissue", to: "done" },
          { from: "waitpay", to: "compliance", dashed: true }, { from: "compliance", to: "waitissue", dashed: true },
        ],
        route: ["waitpay", "waitissue", "done"],
      } as Graph,
    },
    {
      key: "reports", title: "FinSupervision reports", text: "Registries build from orders by themselves.",
      schema: {
        cols: 3,
        nodes: [
          { id: "orders", col: 1, row: 2, title: "Orders for the month", text: "Each with time, rate and client" },
          { id: "r4", col: 2, row: 1, title: "VA sales", text: "Annex 4/o" },
          { id: "r5", col: 2, row: 2, title: "VA purchases", text: "Annex 5/o" },
          { id: "r6", col: 2, row: 3, title: "VA swaps", text: "Annex 6/o" },
          { id: "fin", col: 3, row: 2, kind: "accent", title: "FinSupervision", text: "Report file and cover letter" },
        ],
        edges: [
          { from: "orders", to: "r4" }, { from: "orders", to: "r5" }, { from: "orders", to: "r6" },
          { from: "r4", to: "fin" }, { from: "r5", to: "fin" }, { from: "r6", to: "fin" },
        ],
        route: ["orders", "r5", "fin"],
      } as Graph,
    },
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
    {
      key: "buy", title: "Buy",
      schema: {
        cols: 3,
        nodes: [
          { id: "pay", col: 1, row: 1, title: "The client pays by Finik QR", text: "Finik confirms the payment" },
          { id: "send", col: 2, row: 1, title: "The platform sends the crypto", text: "From the exchange's hot wallet" },
          { id: "done", col: 3, row: 1, kind: "accent", title: "Order closed", text: "Network confirmed, hash in the order" },
          { id: "staff", col: 2, row: 2, kind: "ghost", title: "Staff", text: "Not involved" },
        ],
        edges: [{ from: "pay", to: "send" }, { from: "send", to: "done" }, { from: "send", to: "staff", dashed: true }],
        route: ["pay", "send", "done"],
      } as Graph,
    },
    {
      key: "sell", title: "Sell",
      schema: {
        cols: 3,
        nodes: [
          { id: "transfer", col: 1, row: 1, title: "The client sends the order amount", text: "To the exchange's address" },
          { id: "detect", col: 2, row: 1, title: "The platform recognises the deposit", text: "By the order's unique amount" },
          { id: "payout", col: 3, row: 1, kind: "accent", title: "Finik pays out the som", text: "Order closed" },
          { id: "staff", col: 2, row: 2, kind: "ghost", title: "Staff", text: "Not involved" },
        ],
        edges: [{ from: "transfer", to: "detect" }, { from: "detect", to: "payout" }, { from: "detect", to: "staff", dashed: true }],
        route: ["transfer", "detect", "payout"],
      } as Graph,
    },
  ],
};

export const STEPS: typeof RU.STEPS = {
  title: "Launch in four steps",
  note: "Within 14 days of payment.",
  schema: {
    cols: 4,
    nodes: [
      { id: "contract", col: 1, row: 1, title: "Contract", text: "A plan, a three-month contract" },
      { id: "server", col: 2, row: 1, title: "Server", text: "Server in Bishkek, domain, TLS" },
      { id: "setup", col: 3, row: 1, title: "Setup", text: "Brand, currencies, rates, bank details" },
      { id: "open", col: 4, row: 1, kind: "accent", title: "Opening", text: "The exchange is open, clients sign up" },
    ],
    edges: [{ from: "contract", to: "server" }, { from: "server", to: "setup" }, { from: "setup", to: "open" }],
    route: ["contract", "server", "setup", "open"],
  } as Graph,
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
