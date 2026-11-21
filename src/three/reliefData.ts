/**
 * Данные рельефа Кыргызстана для карты героя. public/relief/kg-relief.webp собран скриптом
 * scripts/bake-relief.mjs: высоты — открытые Terrain Tiles (AWS Open Data), граница и озёра —
 * Natural Earth 10m. Каналы: R — высота, G — знаковое расстояние до границы, B — до берега озёр.
 * Константы кадра ниже должны совпадать с теми, что печатает скрипт.
 */
export const FRAME = {
  w: 640, h: 320,
  lon0: 68.75, lon1: 80.8,
  /** меркатор, радианы: низ и верх кадра */
  my0: 0.7387664704195094, my1: 0.8439225578521676,
  hMin: 300, hMax: 7500,
  sdfBorder: 16, sdfLake: 8,
} as const;

export type Relief = {
  w: number; h: number;
  /** высота 0..1 (hMin..hMax), слегка сглажена */
  height: Float32Array;
  /** расстояние до границы в текселях, плюс внутри страны */
  border: Float32Array;
  /** исходные RGBA-байты для текстуры шейдера */
  rgba: Uint8Array<ArrayBuffer>;
};

/** Долгота и широта → (u, v) кадра: u с запада на восток, v с севера на юг. */
export const project = (lon: number, lat: number): [number, number] => {
  const my = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return [(lon - FRAME.lon0) / (FRAME.lon1 - FRAME.lon0), (FRAME.my1 - my) / (FRAME.my1 - FRAME.my0)];
};

/**
 * Картинка → пиксели. Данные рельефа лежат в цветовых каналах, поэтому просим браузер
 * не трогать цвет; где такие параметры не поддержаны, берём обычное декодирование.
 */
export const readPixels = async (url: string): Promise<{ w: number; h: number; px: Uint8ClampedArray }> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const blob = await res.blob();
  let src: ImageBitmap | HTMLImageElement;
  try {
    src = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  } catch {
    const img = new Image();
    const href = URL.createObjectURL(blob);
    try { img.src = href; await img.decode(); } finally { URL.revokeObjectURL(href); }
    src = img;
  }
  const w = src.width, h = src.height;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.drawImage(src, 0, 0);
  if ("close" in src) src.close();
  return { w, h, px: ctx.getImageData(0, 0, w, h).data };
};

export const loadRelief = async (url: string): Promise<Relief> => {
  const { w, h, px } = await readPixels(url);
  const rgba = new Uint8Array(px.length);
  rgba.set(px);

  const raw = new Float32Array(w * h), border = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    raw[i] = px[i * 4] / 255;
    border[i] = (px[i * 4 + 1] / 127.5 - 1) * FRAME.sdfBorder;
  }
  // 8 бит дают ступени в плоских долинах: один проход 1-2-1 по обеим осям
  const tmp = new Float32Array(w * h), height = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = raw[y * w + Math.max(0, x - 1)], b = raw[y * w + x], d = raw[y * w + Math.min(w - 1, x + 1)];
    tmp[y * w + x] = (a + 2 * b + d) / 4;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = tmp[Math.max(0, y - 1) * w + x], b = tmp[y * w + x], d = tmp[Math.min(h - 1, y + 1) * w + x];
    height[y * w + x] = (a + 2 * b + d) / 4;
  }
  return { w, h, height, border, rgba };
};

/** Билинейная выборка поля по (u, v). */
export const sample = (field: Float32Array, r: Relief, u: number, v: number): number => {
  const x = Math.min(r.w - 1.001, Math.max(0, u * r.w - 0.5)), y = Math.min(r.h - 1.001, Math.max(0, v * r.h - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const i = y0 * r.w + x0;
  return field[i] * (1 - fx) * (1 - fy) + field[i + 1] * fx * (1 - fy) + field[i + r.w] * (1 - fx) * fy + field[i + r.w + 1] * fx * fy;
};
