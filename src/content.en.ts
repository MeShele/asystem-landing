import type * as RU from "@/content";
import { MODULE_COUNT } from "@/modulesCatalog";

/**
 * English mirror of content.ts (RU is canonical). SFIS = State Financial
 * Intelligence Service of the KR (ГСФР), FinSupervision = Financial Market
 * Regulation and Supervision Service (Финнадзор), NBKR = National Bank.
 */

export const NAV: typeof RU.NAV = [
  { label: "Features", href: "#features" },
  { label: "How the launch goes", href: "#how" },
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
  { label: "Checklist", href: "/blueprint" },
];

export const DEMO_URL = "https://demo.asystem.ai";

export const HERO: typeof RU.HERO = {
  h1Lines: ["Crypto exchange", "under the KR licence"],
  sub: "Website, client account, admin panel, KYC/AML and regulator reports on your domain and server in Kyrgyzstan. You hold the licence, we run the software.",
  cta: "Request a demo",
  ctaSecondary: "Open the demo stand",
  demoUrl: DEMO_URL,
  fact: (n: number | null) => (n ? `${n} exchanges already live` : "Exchanges already live"),
  facts: ["Server in Bishkek", "Comply Core for SFIS", "Launch in weeks"],
  videoLabel: "Orders in the operator admin panel: kanban, statuses, payouts",
};

export const PROOF: typeof RU.PROOF = {
  lead: "Works together with",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

export const FEATURES: typeof RU.FEATURES = {
  title: "What's inside the platform",
  lead: "Not mock-ups: below are the real admin and storefront screens every exchange gets.",
  items: [
    { stage: "kyc", title: "Client verification", text: ["Passport, selfie, age and residency. Reviewed by your officer or an automated provider, Didit or BiometricVision.", "After verification the client is screened against the SFIS lists. A match stops the order until the officer decides."] },
    { stage: "compliance", title: "Compliance by SFIS rules", text: ["A directory of 156 suspicious-activity codes, limits and accumulators, a threshold above which an order waits for the officer.", "Every decision stays in the order history together with who made it."] },
    { stage: "reports", title: "FinSupervision reports", text: ["Deal and client registries build themselves from orders in the required format. Financial figures are entered monthly by the officer.", "Data is kept for at least five years, as the regulator requires."] },
    { stage: "server", title: "Your own server in Kyrgyzstan", text: ["Each exchange has a separate server and database in a Bishkek data centre. Client data never mixes with anyone else's.", "Daily backups, provider keys stored encrypted, updates shipped by us."] },
    { stage: "brand", title: "Storefront under your brand", text: ["Logo, colours, texts, bank details and domain are changed in the admin panel. The client sees your exchange, not our platform.", "Two storefront templates, dark theme, emails and a Telegram bot in the exchange's name."] },
    { stage: "api", title: "Standalone cores via API", text: ["Identity verification, payment acceptance and reporting data can be built into your own system without our exchange.", "Access by key, connection by arrangement."] },
  ],
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
  title: "How the launch goes",
  note: "We deploy the server and database. Timing depends on how quickly bank details, domain and setup data are ready: weeks, not months of development from scratch.",
  stages: [
    { short: "Brief", clause: "Brief and domain", text: "Company data, bank details, currency list and domain. One call and a form." },
    { short: "Server", clause: "Server in Bishkek", text: "Separate server and database, domain, certificate, email from your domain." },
    { short: "Setup", clause: "Setup and modules", text: "Brand, rates and fees, identity checks, payments, notifications." },
    { short: "Launch", clause: "First clients", text: "We walk staff through orders and compliance, then open the doors." },
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
    { label: "Features", href: "#features" },
    { label: "How the launch goes", href: "#how" },
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
