import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckSquare, Download, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { DEMO_URL } from "@/content";

/** Blueprint-лидмагнит: чек-лист запуска лицензированного криптообменника в КР.
 *  Текст выверен по первоисточникам (87/2018, ПКМ 739, приказы ГСФР) и прошёл
 *  ревью — правки согласовывать, юридические формулировки не ослаблять. */

const STAGES: { title: string; intro?: string; items: string[] }[] = [
  {
    title: "Этап 1. Юридическая база",
    items: [
      "Юрлицо в КР (обычно ОсОО): устав, учредители, бенефициары раскрыты — база бенефициарных владельцев (ПКМ 739, прил. 8).",
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
];

const PITFALLS = [
  { t: "«Сначала запустимся, потом комплаенс»", d: "переделка обменника под ПВК дороже, чем закладка с первого дня." },
  { t: "KYC без liveness и дедупа", d: "первый же аудит вскрывает мультиаккаунты." },
  { t: "Ручная отчётность", d: "недельная рутина + человеческие ошибки в жёстких SLA." },
  { t: "Хостинг за пределами КР", d: "несоответствие требованию локализации; переезд под нагрузкой мучителен." },
  { t: "Удаление данных «по запросу клиента»", d: "упирается в 5-летнее хранение по 87/2018; нужен согласованный с юристом процесс, а не кнопка delete." },
  { t: "Один «универсальный» сотрудник", d: "вместо выделенной роли комплаенс-офицера с полномочиями." },
];

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
} as const;

const Blueprint = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = "Чек-лист запуска лицензированного криптообменника в КР — ASystem Core";
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, []);

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
              <ArrowLeft className="h-4 w-4" /> На главную
            </Link>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Link to="/" className="hidden sm:block">
              <Logo />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="signal" size="sm" asChild>
              <Link to="/#demo">Запросить демо</Link>
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
              Blueprint · Кыргызстан · 2026
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Чек-лист запуска лицензированного криптообменника в Кыргызстане
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Полный путь от юрлица до работающего обменника: что потребует регулятор, что должно уметь ваше ПО
            и на чём чаще всего теряют месяцы.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Источники: закон КР № 87/2018 «О ПОД/ФТ»; ПКМ № 739 от 14.11.2025 (прил. 11 — программа внутреннего
            контроля, прил. 12 — надлежащая проверка клиента, прил. 10 — порядок мер к высокорискованным странам);
            приказы ГСФР (справочник кодов подозрительных операций; перечень высокорискованных стран № 78 от
            20.06.2025); требования ГСФР к отрасли виртуальных активов (2026); практика запусков на ASystem Core.
          </p>

          <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
            <TriangleAlert className="mb-1.5 h-4 w-4" />
            Обмен виртуальных активов в КР — лицензируемая деятельность. Работа без лицензии оператора обмена
            виртуальных активов — риск блокировок, штрафов и уголовной ответственности за незаконную
            предпринимательскую деятельность.
          </div>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Сохранить в PDF
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Живое демо платформы
              </a>
            </Button>
          </div>
        </motion.div>

        {/* этапы */}
        <div className="mt-12 space-y-10">
          {STAGES.map((s) => (
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

          {/* грабли */}
          <motion.section variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
              Типичные грабли (из практики запусков)
            </h2>
            <div className="mt-4 space-y-3">
              {PITFALLS.map((p, i) => (
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
            <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Сколько это занимает</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Разработка собственной платформы под эти требования — 6–12 месяцев командой. Готовая платформа со
              встроенным комплаенсом КР сокращает технологическую часть до недель: остаётся лицензия и
              операционная подготовка.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-6">
              <p className="leading-relaxed text-foreground">
                <span className="font-display font-extrabold">ASystem Core</span> — платформа, на которой уже
                работают криптообменники КР, выстроенные под эти требования: обменник под ключ, KYC/AML,
                автоотчётность ГСФР, хранение в КР, self-hosted.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 print:hidden">
                <Button variant="signal" asChild>
                  <Link to="/#demo">
                    Запросить демо <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Потрогать живое демо
                  </a>
                </Button>
              </div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Документ носит информационный характер, не является юридической консультацией и не гарантирует
              получение лицензии. Актуальность НПА проверяйте на дату запуска. © 2026 ASystem Core.
            </p>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Blueprint;
