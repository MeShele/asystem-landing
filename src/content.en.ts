/** EN mirror of content.ts: same structure, short sentences. */
import type * as RU from "@/content";

export const NAV: typeof RU.NAV = [
  { label: "What's inside", href: "#features" },
  { label: "Requirements", href: "#law" },
  { label: "Launch", href: "#how" },
  { label: "Roadmap", href: "#roadmap" },
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
  label: "A shield with a safe dial and four inlays: KYC, screening, data, reports",
  source: "Source: SFIS requirements for virtual asset exchange platforms, June 2026.",
};

export const AUTOMATION: typeof RU.AUTOMATION = {
  title: "A deal with no staff involved",
  lead: "The Auto-exchange module: Finik confirms the payment, the platform sends the crypto.",
  scene: {
    label: "An exchange conveyor: the client gives one currency, the machine converts it, the client receives another, the margin drops into the exchange's cash box",
    give: "The client gives",
    get: "The client receives",
    getNote: "no waiting for an operator",
    cash: "Exchange income",
    currency: "KGS",
    caption: "Example: a 1% spread on every order.",
  },
  sides: [
    {
      key: "exchange", title: "For the exchange",
      steps: [
        { id: "confirm", title: "Payments confirm themselves", text: "Finik, no manual checks" },
        { id: "margin", title: "The spread goes to income", text: "On every order, with no one on shift" },
        { id: "officer", title: "Large orders go to the officer", text: "Above the compliance threshold" },
      ],
    },
    {
      key: "client", title: "For the client",
      steps: [
        { id: "pay", title: "Pays the way they like", text: "Fiat by Finik QR or crypto to the order's address" },
        { id: "get", title: "Receives without waiting", text: "The platform sends it, no operator needed" },
        { id: "done", title: "Sees the result in the order", text: "Order closed; crypto comes with a hash" },
      ],
    },
  ],
};

export const STEPS: typeof RU.STEPS = {
  title: "Launch in four steps",
  note: "Within 14 days of payment.",
  label: "Four launch steps: a handshake under the contract tablet, a server rack, a setup console, the exchange building",
  steps: [
    { id: "contract", title: "Contract", text: "A plan and a three-month contract" },
    { id: "server", title: "Server", text: "Server in Bishkek, domain, TLS" },
    { id: "setup", title: "Setup", text: "Brand, currencies, rates, bank details" },
    { id: "open", title: "Opening", text: "The exchange takes clients" },
  ],
};

export const ROADMAP: typeof RU.ROADMAP = {
  title: "Roadmap",
  lead: "What we are building on the platform and when. Dates are estimates.",
  today: "today",
  later: "later",
  status: { done: "done", now: "in progress", next: "ahead" },
  range: ["2026-11-01", "2027-03-31"],
  months: [
    { at: "2026-11-01", label: "November" },
    { at: "2026-12-01", label: "December" },
    { at: "2027-01-01", label: "January 2027" },
    { at: "2027-02-01", label: "February" },
    { at: "2027-03-01", label: "March" },
  ],
  items: [
    { id: "backup", from: "2026-11-23", to: "2026-11-29", when: "23–29 November", title: "Data protection", text: "Nightly copies at a second site, failure alerts", done: false },
    { id: "auto", from: "2026-11-30", to: "2026-12-06", when: "30 November – 6 December", title: "Auto-exchange: live test", text: "A deal with no staff on real money, a small amount", done: false },
    { id: "version", from: "2026-11-30", to: "2026-12-20", when: "by 20 December", title: "One version for every exchange", text: "Updates ship as one numbered release", done: false },
    { id: "tests", from: "2026-12-07", to: "2027-01-10", when: "by 10 January", title: "Automated payment and payout checks", text: "An update ships only after the money-path tests pass", done: false },
    { id: "access", from: "2027-01-11", to: "2027-01-31", when: "January", title: "Stronger sign-in", text: "A second sign-in step is mandatory for all staff", done: false },
    { id: "fast", from: "2027-02-01", to: "2027-03-31", when: "February – March", title: "Payout in 30 seconds", text: "From payment to the crypto being sent", done: false },
  ],
  beyond: [
    { id: "next", when: "after March", title: "Later", text: "Anti-fraud, a partner programme, listing on rate monitors" },
    { id: "wallet", when: "2027", title: "Wallet", text: "A USDT balance and QR payments in Kyrgyzstan" },
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
    { label: "Roadmap", href: "#roadmap" },
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
