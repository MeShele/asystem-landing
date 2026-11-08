import type { Callout, Shard } from "@/components/Collage";

/**
 * Раскладки коллажей: какие вырезки экранов стенда (public/art) где лежат и куда
 * указывают выноски. Размеры вырезок — реальные пиксели кропа (пропорция слоя).
 * Тексты выносок живут в content.ts (TOUR.items[].callouts), здесь только точки.
 */
const SH = {
  storeWidget: { src: "store-widget", w: 570, h: 900 },
  storeH1: { src: "store-h1", w: 880, h: 330 },
  cabCard5: { src: "cab-card5", w: 962, h: 362 },
  cabCard4: { src: "cab-card4", w: 962, h: 362 },
  admKpi: { src: "adm-kpi", w: 1409, h: 118 },
  admReady: { src: "adm-ready", w: 1409, h: 78 },
  admKanban: { src: "adm-kanban", w: 1409, h: 758 },
  repForm: { src: "rep-form", w: 722, h: 746 },
  compStats: { src: "comp-stats", w: 1409, h: 225 },
} as const;

export type Layout = { aspect: string; shards: Shard[]; anchors: Omit<Callout, "text">[] };

/** Герой: админка оператора сзади, виджет витрины спереди — клиент создаёт, оператор видит. */
export const HERO_COLLAGE: Layout = {
  aspect: "10 / 9",
  shards: [
    { ...SH.admKpi, left: 20, top: 4, width: 90 },
    { ...SH.admKanban, left: 20, top: 15, width: 90 },
    { ...SH.storeWidget, left: 0, top: 28, width: 35, z: 10 },
  ],
  anchors: [],
};

export const TOUR_COLLAGES: Record<string, Layout> = {
  // Правило выносок: точка у края фрагмента, подпись снаружи в пустой зоне, линия не пересекает другие слои.
  store: {
    aspect: "16 / 11",
    shards: [
      { ...SH.storeWidget, left: 60, top: 0, width: 38 },
      { ...SH.storeH1, left: 0, top: 56, width: 58, z: 10 },
    ],
    anchors: [
      { x: 6, y: 56, lx: 14, ly: 44 },    // домен и бренд → верх заголовка витрины
      { x: 60, y: 7, lx: 36, ly: 10 },    // купить / продать / обмен → вкладки
      { x: 60, y: 52, lx: 34, ly: 38 },   // курс → строка курса
    ],
  },
  cabinet: {
    aspect: "16 / 11",
    shards: [
      { ...SH.cabCard5, left: 28, top: 2, width: 72 },
      { ...SH.cabCard4, left: 0, top: 46, width: 72, z: 10 },
    ],
    anchors: [
      { x: 66, y: 51, lx: 86, ly: 58 },   // статус → бейдж «Ожидаем выплату» второй карточки
      { x: 34, y: 25, lx: 13, ly: 32 },   // курс → строка курса первой карточки
      { x: 6, y: 74, lx: 18, ly: 95 },    // реквизиты → строка реквизитов второй карточки
    ],
  },
  admin: {
    aspect: "16 / 11",
    shards: [
      { ...SH.admKanban, left: 10, top: 24, width: 90 },
      { ...SH.admReady, left: 0, top: 86, width: 70, z: 10 },
    ],
    anchors: [
      { x: 6, y: 88, lx: 16, ly: 98 },    // чек-лист → 52 %
      { x: 21, y: 28, lx: 22, ly: 12 },   // заявки по статусам → колонка «Ожидает оплаты»
      { x: 66, y: 28, lx: 66, ly: 12 },   // проверка комплаенс → колонка комплаенса
    ],
  },
  reports: {
    aspect: "16 / 11",
    shards: [
      { ...SH.repForm, left: 4, top: 0, width: 48 },
      { ...SH.admKpi, left: 46, top: 7, width: 54 },
      { ...SH.compStats, left: 36, top: 58, width: 64, z: 10 },
    ],
    anchors: [
      { x: 28, y: 60, lx: 22, ly: 84 },   // приложения → кнопка «Скачать отчёт»
      { x: 62, y: 10, lx: 76, ly: 30 },   // цифры из заявок → счётчики заявок
      { x: 55, y: 65, lx: 62, ly: 88 },   // KYC → «KYC пройден»
    ],
  },
};
