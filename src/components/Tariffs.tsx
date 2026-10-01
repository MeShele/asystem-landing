import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadDialog } from "@/components/LeadDialog";
import ScrollReveal from "@/components/ScrollReveal";
import { useLang, type L } from "@/i18n";
import { usePlatformStats, type PlatformTier } from "@/lib/platformStats";

/**
 * Тарифы на лендинге. Цены НЕ задаются здесь: их считает core из прайса
 * (edge platform-stats, тот же расчёт, что в КП и «Тарифах» из админки).
 * Состав — копия supabase/functions/_shared/pricingTiers.ts в репо core:
 * меняете там — поменяйте и здесь.
 */
const PLANS: { id: PlatformTier["id"]; title: L; tagline: L; points: L[]; popular?: boolean }[] = [
  {
    id: "start",
    title: { ru: "Старт", en: "Start" },
    tagline: { ru: "Всё, чтобы работать по лицензии", en: "Everything to operate under a licence" },
    points: [
      { ru: "Обменник на вашем домене", en: "Exchange on your domain" },
      { ru: "Свой сервер в Кыргызстане", en: "Your own server in Kyrgyzstan" },
      { ru: "Comply Core под ГСФР", en: "Comply Core for SFIS" },
      { ru: "ASystem KYC и Ranex KYT", en: "ASystem KYC and Ranex KYT" },
      { ru: "Запуск и настройка", en: "Launch and setup" },
    ],
  },
  {
    id: "business",
    title: { ru: "Бизнес", en: "Business" },
    tagline: { ru: "Приём денег, отчёты и внешний KYC", en: "Payments, reports and external KYC" },
    popular: true,
    points: [
      { ru: "Всё, что в «Старте»", en: "Everything in Start" },
      { ru: "Finik: приём по QR и выплаты", en: "Finik: QR payments and payouts" },
      { ru: "Отчёты Финнадзор", en: "FinSupervision reports" },
      { ru: "Didit или BiometricVision", en: "Didit or BiometricVision" },
      { ru: "SMS-уведомления", en: "SMS notifications" },
    ],
  },
];

const fmt = (n: number) => n.toLocaleString("ru-RU");

export const Tariffs = () => {
  const { t, l } = useLang();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  const prepay = stats?.prepayMonths ?? 3;
  const priceOf = (id: PlatformTier["id"]) => stats?.tiers?.find((x) => x.id === id) ?? null;

  const cta = (plan: string) =>
    openLead({
      source: "get.asystem.ai/tariffs",
      title: t("Получить коммерческое предложение", "Get a commercial proposal"),
      message: `${t("Тариф", "Plan")}: ${plan}`,
    });

  const cards = [
    ...PLANS.map((p) => {
      const price = priceOf(p.id);
      return {
        key: p.id,
        title: l(p.title),
        tagline: l(p.tagline),
        big: price ? `$${fmt(price.monthly)}` : null,
        unit: t("в месяц", "per month"),
        extra: price ? t(`+ $${fmt(price.setup)} подключение, разово`, `+ $${fmt(price.setup)} one-time setup`) : null,
        points: p.points.map(l),
        popular: !!p.popular,
      };
    }),
    {
      key: "buyout",
      title: t("Выкуп", "Buyout"),
      tagline: t("Платформа остаётся у вас насовсем", "The platform is yours for good"),
      big: stats?.buyout ? `${stats.buyout.from ? t("от ", "from ") : ""}$${fmt(stats.buyout.price)}` : null,
      unit: t("разово, вместо аренды", "one-time, instead of rent"),
      extra: t("условия — в договоре", "terms set in the contract"),
      points: [
        t("Без ежемесячной аренды", "No monthly rent"),
        t("Модули — как в тарифах", "Modules as in the plans"),
        t("Сервер в Кыргызстане", "Server in Kyrgyzstan"),
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="border-y border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("Тарифы", "Pricing")}
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("Два тарифа или выкуп", "Two plans or a buyout")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t(
              `Сервер в Кыргызстане и комплаенс под ГСФР входят в каждый тариф. Подписка оплачивается сразу за ${prepay} месяца вперёд.`,
              `A server in Kyrgyzstan and SFIS compliance come with every plan. The subscription is paid ${prepay} months in advance.`,
            )}
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <ScrollReveal
              key={c.key}
              delay={i * 90}
              className={`flex flex-col rounded-2xl border p-6 ${
                c.popular
                  ? "border-accent bg-card shadow-[0_28px_80px_-28px_hsl(79_100%_45%/0.45)] ring-1 ring-accent/40"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold">{c.title}</h3>
                {c.popular && (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                    {t("популярный", "popular")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>

              <div className="mt-6 min-h-[5.5rem]">
                {c.big ? (
                  <>
                    <div className="font-display text-4xl font-extrabold tabular-nums">{c.big}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{c.unit}</div>
                    <div className="mt-1 text-sm font-semibold">{c.extra}</div>
                  </>
                ) : (
                  <div className="text-base font-semibold text-muted-foreground">
                    {t("Цену пришлём в коммерческом предложении", "We'll send the price in our proposal")}
                  </div>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5">
                {c.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={c.popular ? "signal" : "outline"}
                className="mt-6 w-full"
                onClick={() => cta(c.title)}
              >
                {t("Получить КП", "Get a proposal")} <ArrowRight className="h-4 w-4" />
              </Button>
            </ScrollReveal>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-5xl text-center text-sm text-muted-foreground">
          {t(
            "Приложение на телефон, блог, кошельки клиентов и доработки под задачу — отдельно. KYC-провайдер, эквайринг и SMS оплачиваются провайдерам напрямую, без нашей наценки.",
            "A phone app, blog, client wallets and custom work are extra. The KYC provider, acquiring and SMS are paid to the providers directly, with no markup from us.",
          )}
        </p>
      </div>
    </section>
  );
};
