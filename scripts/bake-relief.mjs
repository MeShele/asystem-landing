// Запекает рельеф Кыргызстана для 3D-карты героя (src/three/relief.ts).
//   node scripts/bake-relief.mjs        (нужны сеть, devDependency pngjs и cwebp в PATH)
// Источники (скачиваются в node_modules/.cache/relief при первом запуске):
//   высоты  — Terrain Tiles, формат Terrarium (AWS Open Data): высота = R*256 + G + B/256 - 32768
//   граница и озёра — Natural Earth 10m (общественное достояние)
// Выход: public/relief/kg-relief.webp — R: высота 0..255, G: знаковое расстояние до границы,
//        B: до берега озёр. Константы кадра печатаются в конце: они должны совпадать с FRAME
//        в src/three/reliefData.ts.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "node_modules/.cache/relief");
const OUT = path.join(ROOT, "public/relief");
const Z = 7, N = 2 ** Z, TS = 256;
const TX0 = 88, TX1 = 92, TY0 = 46, TY1 = 48;

const W = 640, H = W / 2;
const SS = 4;                         // сверхвыборка масок
const LON0 = 68.75, LON1 = 80.8;      // кадр по долготе
const H_MIN = 300, H_MAX = 7500;      // шкала высоты, м
const SDF_BORDER = 16, SDF_LAKE = 8;  // диапазон расстояний, пикс. выхода

const fetchTo = async (url, file) => {
  if (fs.existsSync(file)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(url + ": " + res.status);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
};
const tileFile = (tx, ty) => path.join(CACHE, "tiles", [Z, tx, ty].join("_") + ".png");
for (let tx = TX0; tx <= TX1; tx++) for (let ty = TY0; ty <= TY1; ty++) {
  await fetchTo("https://s3.amazonaws.com/elevation-tiles-prod/terrarium/" + [Z, tx, ty].join("/") + ".png", tileFile(tx, ty));
}
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const COUNTRIES = path.join(CACHE, "countries10.geojson"), LAKES = path.join(CACHE, "lakes10.geojson");
await fetchTo(NE + "ne_10m_admin_0_countries.geojson", COUNTRIES);
await fetchTo(NE + "ne_10m_lakes.geojson", LAKES);

const rad = Math.PI / 180;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * rad) / 2)); // радианы
const latOf = (my) => (2 * Math.atan(Math.exp(my)) - Math.PI / 2) / rad;

// Кадр 2:1 в меркаторе вокруг центра страны по широте.
const KG_LAT0 = 39.172, KG_LAT1 = 43.238;
const myC = (mercY(KG_LAT0) + mercY(KG_LAT1)) / 2;
const myHalf = ((LON1 - LON0) * rad) / 4; // высота = ширина / 2
const MY0 = myC - myHalf, MY1 = myC + myHalf; // низ, верх

// ── мозаика высот ────────────────────────────────────────────────────────────
const MW = (TX1 - TX0 + 1) * TS, MH = (TY1 - TY0 + 1) * TS;
const mosaic = new Float32Array(MW * MH);
for (let tx = TX0; tx <= TX1; tx++) for (let ty = TY0; ty <= TY1; ty++) {
  const png = PNG.sync.read(fs.readFileSync(tileFile(tx, ty)));
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const i = (y * TS + x) * 4;
    const h = png.data[i] * 256 + png.data[i + 1] + png.data[i + 2] / 256 - 32768;
    mosaic[((ty - TY0) * TS + y) * MW + (tx - TX0) * TS + x] = h;
  }
}
const gx = (lon) => ((lon + 180) / 360) * N * TS - TX0 * TS;
const gyFromMerc = (my) => ((1 - my / Math.PI) / 2) * N * TS - TY0 * TS;
const sample = (x, y) => {
  x = Math.min(MW - 1.001, Math.max(0, x - 0.5)); y = Math.min(MH - 1.001, Math.max(0, y - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const a = mosaic[y0 * MW + x0], b = mosaic[y0 * MW + x0 + 1], c = mosaic[(y0 + 1) * MW + x0], d = mosaic[(y0 + 1) * MW + x0 + 1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
};

const height = new Float32Array(W * H);
const K = 3; // выборок на пиксель по стороне (сглаживание при уменьшении)
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  let s = 0;
  for (let b = 0; b < K; b++) for (let a = 0; a < K; a++) {
    const u = (i + (a + 0.5) / K) / W, v = (j + (b + 0.5) / K) / H;
    s += sample(gx(LON0 + u * (LON1 - LON0)), gyFromMerc(MY1 - v * (MY1 - MY0)));
  }
  height[j * W + i] = s / (K * K);
}

// ── растеризация полигонов (even-odd) ────────────────────────────────────────
const BW = W * SS, BH = H * SS;
const toPx = ([lon, lat]) => [((lon - LON0) / (LON1 - LON0)) * BW, ((MY1 - mercY(lat)) / (MY1 - MY0)) * BH];
const rasterize = (polys) => {
  const m = new Uint8Array(BW * BH);
  const edges = [];
  for (const poly of polys) for (const ring of poly) {
    const pts = ring.map(toPx);
    for (let k = 0; k < pts.length - 1; k++) {
      const [x1, y1] = pts[k], [x2, y2] = pts[k + 1];
      if (y1 !== y2) edges.push(y1 < y2 ? [x1, y1, x2, y2] : [x2, y2, x1, y1]);
    }
  }
  for (let y = 0; y < BH; y++) {
    const yc = y + 0.5, xs = [];
    for (const [x1, y1, x2, y2] of edges) if (yc >= y1 && yc < y2) xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1));
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(xs[k] - 0.5)), b = Math.min(BW - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = a; x <= b; x++) m[y * BW + x] = 1;
    }
  }
  return m;
};
const polysOf = (geom) => (geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates);

// ── точное евклидово расстояние (Фельценсвальб — Хуттенлохер) ────────────────
const INF = 1e20;
const edt1d = (f, n, d, v, z) => {
  let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s;
    do { const p = v[k]; s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p); } while (s <= z[k] && --k >= 0);
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const p = v[k]; d[q] = (q - p) * (q - p) + f[p]; }
};
const edt = (mask, inside) => {
  const g = new Float64Array(BW * BH);
  for (let i = 0; i < g.length; i++) g[i] = (mask[i] === 1) === inside ? INF : 0; // расстояние до «не inside»
  const n = Math.max(BW, BH), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < BW; x++) {
    for (let y = 0; y < BH; y++) f[y] = g[y * BW + x];
    edt1d(f, BH, d, v, z);
    for (let y = 0; y < BH; y++) g[y * BW + x] = d[y];
  }
  for (let y = 0; y < BH; y++) {
    for (let x = 0; x < BW; x++) f[x] = g[y * BW + x];
    edt1d(f, BW, d, v, z);
    for (let x = 0; x < BW; x++) g[y * BW + x] = Math.sqrt(d[x]);
  }
  return g;
};
/** знаковое расстояние в пикселях выхода: + внутри, − снаружи; усреднено до W×H */
const sdf = (mask) => {
  const din = edt(mask, true), dout = edt(mask, false);
  const out = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let b = 0; b < SS; b++) for (let a = 0; a < SS; a++) {
      const k = (j * SS + b) * BW + i * SS + a;
      s += mask[k] ? din[k] - 0.5 : -(dout[k] - 0.5);
    }
    out[j * W + i] = s / (SS * SS) / SS;
  }
  return out;
};

const kg = JSON.parse(fs.readFileSync(COUNTRIES, "utf8")).features.find((f) => f.properties.ADM0_A3 === "KGZ");
if (!kg) throw new Error("KGZ not found");
const borderSdf = sdf(rasterize(polysOf(kg.geometry)));

const latTop = latOf(MY1), latBot = latOf(MY0);
const lakes = JSON.parse(fs.readFileSync(LAKES, "utf8")).features.filter((f) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const poly of polysOf(f.geometry)) for (const [lon, lat] of poly[0]) { x0 = Math.min(x0, lon); x1 = Math.max(x1, lon); y0 = Math.min(y0, lat); y1 = Math.max(y1, lat); }
  return x1 > LON0 && x0 < LON1 && y1 > latBot && y0 < latTop;
});
console.log("lakes in frame:", lakes.map((f) => f.properties.name).join(" | "));
const lakeSdf = sdf(rasterize(lakes.flatMap((f) => polysOf(f.geometry))));

// ── запись ───────────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });
const enc = (v, range) => Math.max(0, Math.min(255, Math.round((v / range) * 127.5 + 127.5)));
const png = new PNG({ width: W, height: H, colorType: 2 });
for (let k = 0; k < W * H; k++) {
  png.data[k * 4] = Math.max(0, Math.min(255, Math.round(((height[k] - H_MIN) / (H_MAX - H_MIN)) * 255)));
  png.data[k * 4 + 1] = enc(borderSdf[k], SDF_BORDER);
  png.data[k * 4 + 2] = enc(lakeSdf[k], SDF_LAKE);
  png.data[k * 4 + 3] = 255;
}
const tmpPng = path.join(CACHE, "kg-relief.png");
fs.writeFileSync(tmpPng, PNG.sync.write(png, { colorType: 2 }));
// только без потерь: в каналах данные, а не картинка
execFileSync("cwebp", ["-quiet", "-lossless", "-z", "9", tmpPng, "-o", path.join(OUT, "kg-relief.webp")]);
console.log("FRAME", { w: W, h: H, lon0: LON0, lon1: LON1, my0: MY0, my1: MY1, hMin: H_MIN, hMax: H_MAX, sdfBorder: SDF_BORDER, sdfLake: SDF_LAKE });
