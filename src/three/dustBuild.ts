/**
 * Частицы гравюры из пикселей картинки. Чистый расчёт без DOM и three.js: его зовёт фоновый
 * поток (dust.worker.ts), чтобы сборка 150 тысяч частиц не задерживала прокрутку, а там, где
 * фоновых потоков с картинками нет, — основной.
 */
export type Particles = { n: number; pos: Float32Array<ArrayBuffer>; ink: Uint8Array<ArrayBuffer>; seed: Uint8Array<ArrayBuffer> };

/** размытие по квадрату: густота штриха вокруг точки → насколько она выступает */
const boxBlur = (src: Float32Array, n: number, r: number) => {
  const tmp = new Float32Array(n * n), out = new Float32Array(n * n), w = 2 * r + 1;
  for (let y = 0; y < n; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[y * n + Math.min(n - 1, Math.max(0, x))];
    for (let x = 0; x < n; x++) {
      tmp[y * n + x] = s / w;
      s += src[y * n + Math.min(n - 1, x + r + 1)] - src[y * n + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < n; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(n - 1, Math.max(0, y)) * n + x];
    for (let y = 0; y < n; y++) {
      out[y * n + x] = s / w;
      s += tmp[Math.min(n - 1, y + r + 1) * n + x] - tmp[Math.max(0, y - r) * n + x];
    }
  }
  return out;
};

// детерминированный шум (целочисленный хэш): одна и та же пыль при каждом заходе
const rnd = (i: number) => {
  let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** px — RGBA-пиксели картинки w×h; частицей становится каждая точка с заметной альфой */
export const buildParticles = (px: Uint8ClampedArray, w: number, h: number): Particles => {
  const n = Math.min(w, h);
  const ink = new Float32Array(n * n);
  let count = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const a = px[(y * w + x) * 4 + 3] / 255;
    ink[y * n + x] = a;
    if (a >= 0.1) count++;
  }
  const bulk = boxBlur(boxBlur(ink, n, 9), n, 9);
  const pos = new Float32Array(count * 3), inkA = new Uint8Array(count), seed = new Uint8Array(count * 4);
  let k = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = y * n + x, a = ink[i];
    if (a < 0.1) continue;
    const j = i * 7;
    // сдвиг внутри пикселя убирает муар регулярной сетки при повороте
    pos[k * 3] = ((x + rnd(j + 1)) / n) * 2 - 1;
    pos[k * 3 + 1] = 1 - ((y + rnd(j + 2)) / n) * 2;
    pos[k * 3 + 2] = (bulk[i] - 0.35) * 0.3;
    inkA[k] = Math.round(a * 255);
    seed[k * 4] = rnd(j + 3) * 255; seed[k * 4 + 1] = rnd(j + 4) * 255; seed[k * 4 + 2] = rnd(j + 5) * 255; seed[k * 4 + 3] = rnd(j + 6) * 255;
    k++;
  }
  return { n, pos, ink: inkA, seed };
};
