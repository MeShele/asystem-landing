import type * as RU from "@/content";
import { MODULE_COUNT } from "@/modulesCatalog";

/**
 * English mirror of content.ts (RU is canonical). SFIS = State Financial
 * Intelligence Service of the KR (ГСФР), FinSupervision = Financial Market
 * Regulation and Supervision Service (Финнадзор), NBKR = National Bank.
 */

export const NAV: typeof RU.NAV = [
  { label: "What's inside", href: "#features" },
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
  { label: "Checklist", href: "/blueprint" },
];

export const DEMO_URL = "https://demo.asystem.ai";

export const HERO: typeof RU.HERO = {
  h1: "Crypto exchange under the KR licence",
  sub: "Website, client account, admin panel, KYC/AML and regulator reports on your domain and server in Kyrgyzstan. You hold the licence, we run the software.",
  cta: "Request a demo",
  links: [
    { label: "Demo stand", href: DEMO_URL, external: true },
    { label: "Launch checklist", href: "/blueprint" },
    { label: "Platform status", href: "/status" },
  ],
  fact: (n: number | null) => (n ? `${n} exchanges already run on the platform` : "Exchanges already run on the platform"),
};

export const FEATURES: typeof RU.FEATURES = {
  title: "What the platform includes",
  items: [
    {
      stage: "kyc",
      title: "Client verification inside",
      text: [
        "Passport, selfie, age and residency. Reviewed by your officer or an automated provider, Didit or BiometricVision.",
        "After verification the client is screened against the SFIS lists. A match stops the order until the officer decides.",
      ],
    },
    {
      stage: "compliance",
      title: "Compliance by SFIS rules",
      text: [
        "A directory of 156 suspicious-activity codes, limits and accumulators, a threshold above which an order waits for the officer.",
        "Every decision stays in the order history together with who made it.",
      ],
    },
    {
      stage: "reports",
      title: "FinSupervision reports",
      text: [
        "Deal and client registries build themselves from orders in the required format. Financial figures are entered monthly by the officer.",
        "Data is kept for at least five years, as the regulator requires.",
      ],
    },
    {
      stage: "server",
      title: "Your own server in Kyrgyzstan",
      text: [
        "Each exchange has a separate server and database in a Bishkek data centre. Client data never mixes with anyone else's.",
        "Daily backups, provider keys stored encrypted, updates shipped by us.",
      ],
    },
    {
      stage: "brand",
      title: "Your domain and brand",
      text: [
        "Logo, colours, texts, bank details and domain are changed in the admin panel. The client sees your exchange, not our platform.",
        "Two storefront templates, dark theme, emails and a Telegram bot in the exchange's name.",
      ],
    },
    {
      stage: "api",
      title: "Standalone cores via API",
      text: [
        "Identity verification, payment acceptance and reporting data can be built into your own system without our exchange.",
        "Access by key, connection by arrangement.",
      ],
    },
  ],
};

export const SHOWCASE: typeof RU.SHOWCASE = {
  left: "The client creates",
  right: "you process",
  inputTitle: "Client order on the site",
  amountLabel: "Amount, KGS",
  walletLabel: "USDT wallet, TRC20",
  hint: "Change the amount: the card on the right recalculates",
};

export const STEPS: typeof RU.STEPS = {
  title: "How the launch goes",
  stages: [
    { short: "Brief", clause: "First the brief and domain", text: "Company data, bank details, currency list and domain." },
    { short: "Server", clause: "Then a server in Bishkek", text: "Separate server and database, domain, certificate, email." },
    { short: "Setup", clause: "Then setup and modules", text: "Brand, rates and fees, identity checks, payments." },
    { short: "Launch", clause: "And the first clients", text: "We walk staff through orders and compliance, then open the doors." },
  ],
  note: "We deploy the server and database. Timing depends on how quickly bank details, domain and setup data are ready: weeks, not months of development from scratch.",
};

export const MODULES: typeof RU.MODULES = {
  title: "Module catalog",
  note: `${MODULE_COUNT} modules. What's in a plan, what's an add-on. Enabled with a toggle in the admin panel, paid ones on request.`,
  foot: ["External providers are paid directly,", "with no markup from us."],
};

export const PROOF: typeof RU.PROOF = {
  lead: "Works together with",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

export const PRICING: typeof RU.PRICING = {
  title: "Pricing",
  lead: (prepay: number) => `A server in Kyrgyzstan and Comply Core come with every plan. The subscription is paid ${prepay} months in advance.`,
  rateNote: (date: string) => `Prices in KGS at the NBKR rate as of ${date}. The exact amount is fixed in the contract.`,
  noRate: "We'll send prices in the proposal.",
  perMonth: "per month",
  setup: "one-time setup",
  groups: {
    start: { title: "Start", desc: "Exchange on your domain, own server, Comply Core, ASystem KYC and Ranex KYT, email, two-factor login, knowledge check." },
    business: { title: "Business", desc: "Everything in Start, plus Finik, FinSupervision reports, Didit or BiometricVision and SMS." },
    buyout: { title: "Buyout", desc: "The platform is yours for good, no monthly fee. Modules as in the plans.", from: "from", unit: "one-time" },
    addons: {
      title: "Add-ons for any plan",
      price: "in the proposal",
      items: [
        { name: "Telegram", desc: "the exchange's bot for clients and staff" },
        { name: "Jivo live chat", desc: "chat window on the storefront" },
        { name: "Rates export", desc: "for BestChange and other monitors" },
        { name: "Auto rates", desc: "market pair with your margin" },
        { name: "Blog", desc: "articles for search engines" },
        { name: "Phone app", desc: "the site as an app" },
      ],
    },
  },
  cta: "Get a commercial proposal",
};

export const FAQ: typeof RU.FAQ = {
  title: "Questions",
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
  sentence: "We'll show the platform live, answer licence questions and send a commercial proposal.",
  button: "Request a demo",
  link: "Open the demo stand",
};

export const FOOTER: typeof RU.FOOTER = {
  menu: [
    { label: "What's inside", href: "#features" },
    { label: "How the launch goes", href: "#how" },
    { label: "Modules", href: "#modules" },
    { label: "Pricing", href: "#pricing" },
    { label: "Questions", href: "#faq" },
    { label: "Launch checklist", href: "/blueprint" },
    { label: "Platform status", href: "/status" },
  ],
  contactTitle: "Contact",
  socialTitle: "Messengers",
  legal: "© 2026 ASystem Core, ASystem LLC, Bishkek",
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
