// Запекает рельеф массива пика Победы (Жеңиш чокусу, высшая точка Кыргызстана) для сцены «Запуск за четыре шага» (src/three/peak.ts).
//   node scripts/bake-peak.mjs        (нужны сеть, devDependency pngjs и cwebp в PATH)
// Источник: Terrain Tiles, формат Terrarium (AWS Open Data): высота = R*256 + G + B/256 - 32768.
// Выход: public/relief/peak.webp — квадрат 256×256, высота в канале R (0..255 от hMin до hMax).
// Константы печатаются в конце: они должны совпадать с PEAK в src/three/peak.ts.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "node_modules/.cache/relief/peak");
const Z = 10, TS = 256, TX0 = 739, TX1 = 740, TY0 = 378, TY1 = 380;
const OUT = 256, SIDE = 300;           // выход, сторона вырезки в пикселях мозаики (~34 км)
const AT = [0.58, 0.36];                // где в кадре стоит вершина (доли ширины и высоты)

const tile = (tx, ty) => path.join(CACHE, [Z, tx, ty].join("_") + ".png");
for (let tx = TX0; tx <= TX1; tx++) for (let ty = TY0; ty <= TY1; ty++) {
  if (fs.existsSync(tile(tx, ty))) continue;
  const res = await fetch("https://s3.amazonaws.com/elevation-tiles-prod/terrarium/" + [Z, tx, ty].join("/") + ".png");
  if (!res.ok) throw new Error("tile " + tx + "/" + ty + ": " + res.status);
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(tile(tx, ty), Buffer.from(await res.arrayBuffer()));
}

const MW = (TX1 - TX0 + 1) * TS, MH = (TY1 - TY0 + 1) * TS;
const m = new Float32Array(MW * MH);
let top = -1e9, sx = 0, sy = 0;
for (let tx = TX0; tx <= TX1; tx++) for (let ty = TY0; ty <= TY1; ty++) {
  const png = PNG.sync.read(fs.readFileSync(tile(tx, ty)));
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const i = (y * TS + x) * 4, h = png.data[i] * 256 + png.data[i + 1] + png.data[i + 2] / 256 - 32768;
    const gx = (tx - TX0) * TS + x, gy = (ty - TY0) * TS + y;
    m[gy * MW + gx] = h;
    if (h > top) { top = h; sx = gx; sy = gy; }
  }
}
const x0 = Math.max(0, Math.min(MW - SIDE, Math.round(sx - AT[0] * SIDE))), y0 = Math.max(0, Math.min(MH - SIDE, Math.round(sy - AT[1] * SIDE)));
const at = (x, y) => {
  x = Math.min(MW - 1.001, Math.max(0, x)); y = Math.min(MH - 1.001, Math.max(0, y));
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  return m[yi * MW + xi] * (1 - fx) * (1 - fy) + m[yi * MW + xi + 1] * fx * (1 - fy) + m[(yi + 1) * MW + xi] * (1 - fx) * fy + m[(yi + 1) * MW + xi + 1] * fx * fy;
};
const h = new Float32Array(OUT * OUT);
let lo = 1e9, hi = -1e9;
for (let j = 0; j < OUT; j++) for (let i = 0; i < OUT; i++) {
  const v = at(x0 + ((i + 0.5) / OUT) * SIDE, y0 + ((j + 0.5) / OUT) * SIDE);
  h[j * OUT + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
}
const png = new PNG({ width: OUT, height: OUT, colorType: 2 });
for (let k = 0; k < OUT * OUT; k++) { const v = Math.round(((h[k] - lo) / (hi - lo)) * 255); png.data[k * 4] = v; png.data[k * 4 + 1] = v; png.data[k * 4 + 2] = v; png.data[k * 4 + 3] = 255; }
const tmp = path.join(CACHE, "peak.png");
fs.writeFileSync(tmp, PNG.sync.write(png, { colorType: 2 }));
execFileSync("cwebp", ["-quiet", "-lossless", "-z", "9", tmp, "-o", path.join(ROOT, "public/relief/peak.webp")]);
console.log("PEAK", { size: OUT, hMin: Math.round(lo), hMax: Math.round(hi), summit: [+((sx - x0) / SIDE).toFixed(3), +((sy - y0) / SIDE).toFixed(3)], top: Math.round(top) });
