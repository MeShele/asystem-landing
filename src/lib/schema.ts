/**
 * Схемы лендинга: граф из узлов на сетке и рёбер между ними. Одна идея на весь сайт —
 * путь заявки через закон: клиент → сайт → оплата → оператор → Финнадзор. Каждая секция
 * показывает этот путь или его участок крупно. Тексты узлов живут в content.ts / content.en.ts.
 */
export type SchemaNode = {
  id: string;
  title: string;
  text?: string;
  /** колонка и строка на сетке (с 1), span — сколько колонок занимает */
  col: number;
  row: number;
  span?: number;
  /** main — обычный узел; accent — лаймовый итог; side — вспомогательный; ghost — пунктир (то, чего нет) */
  kind?: "main" | "accent" | "side" | "ghost";
};

export type SchemaEdge = { from: string; to: string; dashed?: boolean };

export type Graph = {
  cols: number;
  nodes: SchemaNode[];
  edges: SchemaEdge[];
  /** узлы, по которым бежит импульс заявки */
  route?: string[];
};
