import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckSquare, Download, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { DEMO_URL } from "@/content";
import { useLang, type Lang } from "@/i18n";

/** Blueprint-лидмагнит: чек-лист запуска лицензированного криптообменника в КР.
 *  Текст выверен по первоисточникам (87/2018, ПКМ 739, приказы ГСФР) и прошёл
 *  ревью — правки согласовывать, юридические формулировки не ослаблять.
 *  RU — канон; EN — перевод для инвесторов/партнёров (шаблоны дисклеймеров
 *  остаются на русском: это юридические формулировки для рынка КР). */

type Stage = { title: string; intro?: string; items: string[] };

const STAGES: Record<Lang, Stage[]> = {
  ru: [
    {
      title: "Этап 1. Юридическая база",
      items: [
        "Юрлицо в КР (ОсОО, ООО или АО/ЗАО): устав, учредители, бенефициары раскрыты — база бенефициарных владельцев (ПКМ 739, прил. 8).",
        "Лицензия оператора обмена виртуальных активов КР — не «регистрация», а полноценная лицензия с требованиями к капиталу, помещению и персоналу. Порядок и пакет документов обновляются — сверяйтесь с актуальной редакцией НПА или берите сопровождение.",
        "Комплаенс-офицер — назначенное ответственное лицо по ПОД/ФТ (обучение в профильном учебном центре — плюс при проверке).",
        "Правила внутреннего контроля (ПВК) по прил. 11 ПКМ 739: риск-ориентированный подход, процедуры проверки клиентов, порядок выявления подозрительных операций, обучение сотрудников.",
        "Публичная оферта и правила обмена на сайте: клиент юридически принимает условия до сделки, согласие фиксируется.",
        "Согласие на обработку персональных данных — отдельным документом, лог принятий хранится.",
      ],
    },
    {
      title: "Этап 2. KYC — идентификация клиентов",
      intro: "Надлежащая проверка клиента (прил. 12 ПКМ 739) — до совершения операций:",
      items: [
        "Верификация личности по документу (паспорт/ID) с проверкой подлинности; liveness — сверка лица с документом.",
        "Возрастной гейт 18+ — несовершеннолетним операции запрещены (fail-closed: нет подтверждения возраста — нет сделки).",
        "Резидентство: декларация налогового резидентства КР (183+ дней) — влияет на отчётность; нерезиденты — отдельный режим внимания.",
        "PEP-скрининг: публичные должностные лица — усиленная проверка и подтверждение источника средств.",
        "Дедупликация: один человек — один аккаунт (сверка по документу/ИНН); повторные регистрации блокируются.",
        "Цель деловых отношений (ст. 21 закона 87/2018): фиксируется при онбординге.",
        "Анкета по каждой сделке: цель операции, источник средств, подтверждение достоверности — с электронной подписью клиента.",
      ],
    },
    {
      title: "Этап 3. AML — мониторинг операций",
      items: [
        "Скрининг по санкционным перечням (ПКМ 739, прил. 6): совпадение → замораживание и уведомление ГСФР по регламенту.",
        "156 критериев подозрительности (справочник кодов подозрительных операций — приложение 3 к приказу ГСФР): автоматическое выявление, разбор комплаенс-офицером.",
        "High-risk юрисдикции: 63 страны по приказу ГСФР № 78 от 20.06.2025 (перечень актуализируется); порядок мер — прил. 10 ПКМ 739. Операции с их резидентами — усиленный контроль.",
        "Лимиты и накопители: контроль сумм по клиенту за период, пороговые операции — на ручную проверку (комплаенс-холд до релиза офицером).",
        "Сроки сообщений в ГСФР (орган финансовой разведки) — жёсткие SLA (от часов до дней в зависимости от типа): подозрительные операции, пороговые, санкционные совпадения. Опоздание = нарушение.",
      ],
    },
    {
      title: "Этап 4. Отчётность и хранение данных",
      items: [
        "Отчётность в ГСФР по установленным формам — вручную в Excel это часы работы еженедельно; автоматизация окупается сразу.",
        "Хранение записей 5 лет — данные клиентов, сделки, KYC-документы, согласия: досрочное удаление, как правило, недопустимо даже по запросу клиента (коллизия с законодательством о персональных данных обычно разрешается в пользу требований ПОД/ФТ — выстраивайте процесс с юристом).",
        "Серверы и данные — в КР (требование регулятора к платформам ВА; гиперскейлеров в КР нет — планируйте self-hosted/ЦОД в КР).",
        "Бэкапы — регулярные, восстанавливаемые; фиксация IP-адресов операций.",
        "Аудит-трейл: каждое действие оператора и клиента журналируется — регулятор смотрит логи.",
      ],
    },
    {
      title: "Этап 5. Запреты, о которых забывают",
      items: [
        "Нет операциям с NFT и казино/гемблингом.",
        "Нет анонимным/«приватным» кошелькам без идентификации владельца.",
        "Ограничения безналичных схем — сверяйте конкретные конструкции с юристом.",
      ],
    },
    {
      title: "Этап 6. Технологическая платформа",
      intro: "Минимум, который должно уметь ПО (иначе этапы 2–4 превращаются в ручной труд):",
      items: [
        "Обменный сайт (web + mobile) с онбордингом: оферта → резидентство → цель → KYC → анкета сделки, всё с фиксацией согласий.",
        "Админ-панель: заявки, курсы/лимиты, роли (администратор / оператор / комплаенс-офицер — разделение прав).",
        "KYC-модуль (свой или провайдер: SumSub, Didit и др.) + AML-скрининг с автостопами.",
        "Автоотчёты в требуемых форматах, ретеншн-контроль 5 лет, аудит-журнал.",
        "Приём фиата (QR/банк) и крипто-кошельки (custody или собственные) с раздельными правами.",
        "Self-hosted-развёртывание в КР.",
      ],
    },
    {
      title: "Этап 7. Реклама и продвижение",
      intro:
        "Реклама виртуальных активов регулируется отдельно (глава 7 закона «О виртуальных активах», ст. 34; Положение об операторе обмена ВА, пп. 14–19) — и действует даже на рекламу за пределами КР, включая Telegram Ads и блогеров:",
      items: [
        "Текст рекламы виртуальных активов предварительно письменно согласуется с уполномоченным органом — до размещения (Положение об операторе обмена, пп. 16–17).",
        "Каждый материал содержит предупреждение о рисках: возможна полная потеря средств, волатильность, виртуальные активы — не средство платежа в КР и не обеспечены государством.",
        "Запрещены обещания и гарантии доходности (исключение — прошлые показатели, подтверждённые аудиторской организацией, с пояснением их вероятностного характера).",
        "Запрещены бонусы, скидки и предметы роскоши в рекламе ВА — классические акции «бонус за регистрацию» вне закона.",
        "Запрещены «лёгкое обогащение», успех-через-крипту, образы несовершеннолетних и осуждение неучастия.",
        "Информация о рисках — на главной странице сайта оператора, «с привлечением внимания», с подтверждением ознакомления клиентом до сделки (п. 18).",
        "Оператор не вправе консультировать клиентов с побуждением купить/продать конкретные виртуальные активы (п. 19).",
        "Нелицензированным компаниям запрещено использовать слова «криптовалюта», «виртуальный актив» в названиях и рекламе (ст. 37 ч. 4) — без лицензии легальный маркетинг невозможен в принципе.",
        "Учитывайте правила площадок: Google Ads не включает КР в одобренные страны для рекламы криптообменников; Telegram Ads запрещает get-rich-quick-подачу поверх требований ст. 34.",
      ],
    },
  ],
  en: [
    {
      title: "Stage 1. Legal foundation",
      items: [
        "A legal entity in the KR (an LLC or a JSC): charter, founders, beneficial owners disclosed — beneficial ownership register (decree 739, annex 8).",
        "The KR virtual asset exchange operator licence — not a mere “registration” but a full licence with capital, premises and staffing requirements. Procedures and document packages get updated — check the current regulations or get professional support.",
        "A compliance officer — a designated AML/CFT responsible person (training at a specialized center is a plus during inspections).",
        "Internal control rules per annex 11 of decree 739: a risk-based approach, customer due diligence procedures, suspicious transaction detection, staff training.",
        "A public offer and exchange rules on the website: the client legally accepts the terms before the transaction, acceptance is recorded.",
        "Personal data processing consent — a separate document, with an acceptance log retained.",
      ],
    },
    {
      title: "Stage 2. KYC — client identification",
      intro: "Customer due diligence (annex 12 of decree 739) — before any transactions:",
      items: [
        "Identity verification against a document (passport/ID) with authenticity checks; liveness — matching the face to the document.",
        "An 18+ age gate — minors are prohibited from transacting (fail-closed: no age confirmation, no deal).",
        "Residency: a KR tax residency declaration (183+ days) — affects reporting; non-residents get a separate scrutiny regime.",
        "PEP screening: politically exposed persons get enhanced due diligence and source-of-funds confirmation.",
        "Deduplication: one person — one account (matched by document/TIN); repeat registrations are blocked.",
        "Purpose of the business relationship (art. 21 of law 87/2018): recorded at onboarding.",
        "A per-transaction questionnaire: purpose, source of funds, accuracy confirmation — with the client's electronic signature.",
      ],
    },
    {
      title: "Stage 3. AML — transaction monitoring",
      items: [
        "Sanctions list screening (decree 739, annex 6): a match → freezing and notifying the SFIS per the regulations.",
        "156 suspicion criteria (the suspicious transaction code reference — annex 3 to the SFIS order): automatic detection, review by the compliance officer.",
        "High-risk jurisdictions: 63 countries per SFIS order No. 78 of 20.06.2025 (the list gets updated); measures per annex 10 of decree 739. Transactions with their residents get enhanced control.",
        "Limits and accumulators: tracking per-client totals over a period; threshold transactions go to manual review (a compliance hold until released by the officer).",
        "Reporting deadlines to the SFIS (the financial intelligence unit) are strict SLAs (hours to days depending on the type): suspicious transactions, thresholds, sanctions matches. Being late = a violation.",
      ],
    },
    {
      title: "Stage 4. Reporting and data retention",
      items: [
        "SFIS reporting in the prescribed forms — done manually in Excel it takes hours every week; automation pays for itself immediately.",
        "5-year record retention — client data, transactions, KYC documents, consents: early deletion is generally not allowed even at the client's request (the conflict with personal data law is usually resolved in favor of AML/CFT requirements — design the process with a lawyer).",
        "Servers and data in the KR (a regulator requirement for VA platforms; there are no hyperscalers in the KR — plan for self-hosted / a KR data center).",
        "Backups — regular and restorable; transaction IP addresses recorded.",
        "An audit trail: every operator and client action is logged — the regulator reads the logs.",
      ],
    },
    {
      title: "Stage 5. Prohibitions people forget",
      items: [
        "No NFT operations, no casino/gambling.",
        "No anonymous/“privacy” wallets without owner identification.",
        "Restrictions on cashless schemes — check specific structures with a lawyer.",
      ],
    },
    {
      title: "Stage 6. The technology platform",
      intro: "The minimum your software must handle (otherwise stages 2–4 turn into manual labor):",
      items: [
        "An exchange website (web + mobile) with onboarding: offer → residency → purpose → KYC → transaction questionnaire, all with recorded consents.",
        "An admin panel: orders, rates/limits, roles (admin / operator / compliance officer — separation of duties).",
        "A KYC module (your own or a provider: SumSub, Didit etc.) + AML screening with automatic stops.",
        "Automated reports in the required formats, 5-year retention control, an audit log.",
        "Fiat acceptance (QR/bank) and crypto wallets (custody or your own) with separated permissions.",
        "Self-hosted deployment in the KR.",
      ],
    },
    {
      title: "Stage 7. Advertising and promotion",
      intro:
        "Virtual asset advertising is regulated separately (chapter 7 of the VA law, art. 34; the exchange operator regulation, cl. 14–19) — and applies even to advertising outside the KR, including Telegram Ads and influencers:",
      items: [
        "VA advertising copy must be approved in writing by the authorized body — before publication (exchange operator regulation, cl. 16–17).",
        "Every piece must carry a risk warning: possible total loss of funds, volatility, virtual assets are not legal tender in the KR and are not backed by the state.",
        "Promises and guarantees of returns are prohibited (exception — past performance confirmed by an audit firm, with an explanation of its probabilistic nature).",
        "Bonuses, discounts and luxury items are prohibited in VA advertising — the classic “sign-up bonus” promo is against the law.",
        "“Easy money”, success-through-crypto, images of minors and shaming non-participation are prohibited.",
        "Risk information goes on the operator's homepage, “prominently”, with client acknowledgement before the transaction (cl. 18).",
        "The operator may not advise clients towards buying/selling specific virtual assets (cl. 19).",
        "Unlicensed companies may not use the words “cryptocurrency”, “virtual asset” in names and advertising (art. 37 p. 4) — without a licence, legal marketing is impossible in principle.",
        "Mind the platforms' own rules: Google Ads does not include the KR among approved countries for crypto exchange ads; Telegram Ads bans get-rich-quick framing on top of art. 34.",
      ],
    },
  ],
};

/** Готовые шаблоны риск-дисклеймеров (ст. 34 ч. 2 + Положение 514, п. 18).
 *  Тексты — только на русском: это юридические формулировки для рынка КР. */
const DISCLAIMERS = [
  {
    label: {
      ru: "Полный — для сайта оператора (главная / страница рисков)",
      en: "Full — for the operator's website (homepage / risk page)",
    },
    text: "Виртуальные активы не являются средством платежа или приёма оплаты на территории Кыргызской Республики и не обеспечиваются государством. Операции с виртуальными активами связаны с высоким риском, включая возможность полной потери денежных средств и иных объектов гражданских прав, переданных в обмен на виртуальные активы, — в том числе вследствие волатильности их стоимости, технических сбоев (ошибок) и противоправных действий, включая хищение. Оцените свои финансовые возможности и риски до совершения операций.",
  },
  {
    label: {
      ru: "Короткий — для рекламных материалов и креативов",
      en: "Short — for ad materials and creatives",
    },
    text: "Виртуальные активы — не средство платежа в КР и не обеспечены государством. Возможна полная потеря средств вследствие волатильности, технических сбоев и противоправных действий.",
  },
  {
    label: {
      ru: "Ультракороткий — для Telegram Ads и баннеров (≈100 символов)",
      en: "Ultra-short — for Telegram Ads and banners (≈100 chars)",
    },
    text: "ВА — не средство платежа в КР, не обеспечены государством. Возможна полная потеря средств.",
  },
];

const PITFALLS: Record<Lang, { t: string; d: string }[]> = {
  ru: [
    { t: "«Сначала запустимся, потом комплаенс»", d: "переделка обменника под ПВК дороже, чем закладка с первого дня." },
    { t: "KYC без liveness и дедупа", d: "первый же аудит вскрывает мультиаккаунты." },
    { t: "Ручная отчётность", d: "недельная рутина + человеческие ошибки в жёстких SLA." },
    { t: "Хостинг за пределами КР", d: "несоответствие требованию локализации; переезд под нагрузкой мучителен." },
    { t: "Удаление данных «по запросу клиента»", d: "упирается в 5-летнее хранение по 87/2018; нужен согласованный с юристом процесс, а не кнопка delete." },
    { t: "Один «универсальный» сотрудник", d: "вместо выделенной роли комплаенс-офицера с полномочиями." },
  ],
  en: [
    { t: "“Launch first, compliance later”", d: "retrofitting the exchange to internal control rules costs more than building them in from day one." },
    { t: "KYC without liveness and dedup", d: "the very first audit uncovers multi-accounts." },
    { t: "Manual reporting", d: "a weekly grind plus human error under strict SLAs." },
    { t: "Hosting outside the KR", d: "violates the localization requirement; migrating under load is painful." },
    { t: "Deleting data “at the client's request”", d: "collides with 5-year retention under 87/2018; you need a lawyer-approved process, not a delete button." },
    { t: "One “universal” employee", d: "instead of a dedicated, empowered compliance officer role." },
  ],
};

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
} as const;

const Blueprint = () => {
  const { lang, l, t } = useLang();

  useEffect(() => {
    const prev = document.title;
    document.title = t(
      "Чек-лист запуска лицензированного криптообменника в КР — ASystem Core",
      "Launch checklist for a licensed crypto exchange in the KR — ASystem Core",
    );
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      {/* топ-бар */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl print:hidden">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {t("На главную", "Back to home")}
            </Link>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Link to="/" className="hidden sm:block">
              <Logo />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <ThemeToggle />
            <Button variant="signal" size="sm" asChild>
              <Link to="/#demo">{t("Запросить демо", "Request a demo")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-12 sm:py-16">
        {/* шапка документа */}
        <motion.div variants={rise} initial="hidden" animate="show">
          <div className="flex items-center gap-3">
            <span className="h-2 w-10 rounded-sm bg-accent" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("Blueprint · Кыргызстан · 2026", "Blueprint · Kyrgyzstan · 2026")}
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {t(
              "Чек-лист запуска лицензированного криптообменника в Кыргызстане",
              "Launch checklist for a licensed crypto exchange in Kyrgyzstan",
            )}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {t(
              "Полный путь от юрлица до работающего обменника: что потребует регулятор, что должно уметь ваше ПО и на чём чаще всего теряют месяцы.",
              "The full path from a legal entity to a working exchange: what the regulator will demand, what your software must handle, and where people most often lose months.",
            )}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              "Источники: закон КР № 87/2018 «О ПОД/ФТ»; ПКМ № 739 от 14.11.2025 (прил. 11 — программа внутреннего контроля, прил. 12 — надлежащая проверка клиента, прил. 10 — порядок мер к высокорискованным странам); приказы ГСФР (справочник кодов подозрительных операций; перечень высокорискованных стран № 78 от 20.06.2025); требования ГСФР к отрасли виртуальных активов (2026); практика запусков на ASystem Core.",
              "Sources: KR law No. 87/2018 on AML/CFT; Cabinet decree No. 739 of 14.11.2025 (annex 11 — internal control program, annex 12 — customer due diligence, annex 10 — measures for high-risk countries); SFIS orders (suspicious transaction code reference; high-risk country list No. 78 of 20.06.2025); SFIS requirements for the virtual asset industry (2026); launch experience on ASystem Core.",
            )}
          </p>

          <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
            <TriangleAlert className="mb-1.5 h-4 w-4" />
            {t(
              "Обмен виртуальных активов в КР — лицензируемая деятельность. Работа без лицензии оператора обмена виртуальных активов — риск блокировок, штрафов и уголовной ответственности за незаконную предпринимательскую деятельность.",
              "Virtual asset exchange in the KR is a licensed activity. Operating without a VA exchange operator licence risks blocks, fines and criminal liability for illegal entrepreneurship.",
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> {t("Сохранить в PDF", "Save as PDF")}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                {t("Живое демо платформы", "Live platform demo")}
              </a>
            </Button>
          </div>
        </motion.div>

        {/* этапы */}
        <div className="mt-12 space-y-10">
          {STAGES[lang].map((s) => (
            <motion.section
              key={s.title}
              variants={rise}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{s.title}</h2>
              {s.intro && <p className="mt-2 text-sm text-muted-foreground">{s.intro}</p>}
              <ul className="mt-4 space-y-2.5">
                {s.items.map((it) => (
                  <li key={it.slice(0, 40)} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-muted-foreground">
                    <CheckSquare className="mt-0.5 h-4.5 w-4.5 shrink-0 text-foreground dark:text-accent" style={{ width: 18, height: 18 }} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}

          {/* шаблоны дисклеймеров */}
          <motion.section variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
              {t("Готовые шаблоны риск-дисклеймеров", "Ready-made risk disclaimer templates")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Составлены по требованиям ст. 34 ч. 2 закона «О виртуальных активах» и п. 18 Положения об операторе обмена. Финальную редакцию согласуйте с юристом и уполномоченным органом.",
                "Drafted to the requirements of art. 34 p. 2 of the VA law and cl. 18 of the exchange operator regulation. The templates are in Russian — the legally required wording for the KG market. Have the final wording approved by a lawyer and the authorized body.",
              )}
            </p>
            <div className="mt-4 space-y-3">
              {DISCLAIMERS.map((d) => (
                <div key={d.label.ru} className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l(d.label)}</div>
                  <p className="mt-2 rounded-lg bg-secondary/50 p-3 font-mono text-[13px] leading-relaxed text-foreground" lang="ru">
                    {d.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* грабли */}
          <motion.section variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
              {t("Типичные грабли (из практики запусков)", "Common pitfalls (from real launches)")}
            </h2>
            <div className="mt-4 space-y-3">
              {PITFALLS[lang].map((p, i) => (
                <div key={p.t} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs font-bold text-muted-foreground/70">0{i + 1}</span>
                    <div>
                      <span className="font-semibold text-foreground">{p.t}</span>{" "}
                      <span className="text-muted-foreground">— {p.d}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* сколько занимает + CTA */}
          <motion.section variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{t("Сколько это занимает", "How long it takes")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t(
                "Разработка собственной платформы под эти требования — 6–12 месяцев командой. Готовая платформа со встроенным комплаенсом КР сокращает технологическую часть до недель: остаётся лицензия и операционная подготовка.",
                "Building your own platform to these requirements takes a team 6–12 months. A ready platform with KR compliance built in cuts the technology part down to weeks: what's left is the licence and operational preparation.",
              )}
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-6">
              <p className="leading-relaxed text-foreground">
                <span className="font-display font-extrabold">ASystem Core</span>
                {t(
                  " — платформа, на которой уже работают криптообменники КР, выстроенные под эти требования: обменник под ключ, KYC/AML, автоотчётность ГСФР, хранение в КР, self-hosted.",
                  " is the platform already running KR crypto exchanges built to these requirements: a turnkey exchange, KYC/AML, automated SFIS reporting, KR data residency, self-hosted.",
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 print:hidden">
                <Button variant="signal" asChild>
                  <Link to="/#demo">
                    {t("Запросить демо", "Request a demo")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                    {t("Потрогать живое демо", "Try the live demo")}
                  </a>
                </Button>
              </div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              {t(
                "Документ носит информационный характер, не является юридической консультацией и не гарантирует получение лицензии. Актуальность НПА проверяйте на дату запуска. © 2026 ASystem Core.",
                "This document is informational, is not legal advice and does not guarantee licensing. Verify that regulations are current as of your launch date. © 2026 ASystem Core.",
              )}
            </p>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Blueprint;
