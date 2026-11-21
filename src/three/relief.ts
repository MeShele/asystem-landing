import {
  AdditiveBlending, BufferAttribute, BufferGeometry, DataTexture, DoubleSide, Group, LinearFilter, Matrix4, Mesh,
  NormalBlending, PerspectiveCamera, PlaneGeometry, Points, RGBAFormat, Scene, ShaderMaterial,
  UnsignedByteType, Vector2, Vector3,
} from "three";
import { mountView, type ViewSize } from "@/three/stage";
import { loadRelief, project, sample, type Relief } from "@/three/reliefData";

/**
 * Рельеф Кыргызстана в герое: настоящая карта высот страны, вырезанная по границе как макет.
 * Сверху — лаймовые линии широт (гравюра по рельефу), по срезу — горизонтали. Маяк стоит на месте
 * сервера в Бишкеке, к нему из городов идут импульсы заявок. Язык тот же, что у схем сайта:
 * лаймовая линия и бегущий по ней импульс.
 */
const H_SCALE = 0.25;         // высота мира на полную шкалу (300…7500 м), примерно 17× к настоящей
const DEPTH = 0.055;          // толщина подложки под нулевой высотой
const LIME = "vec3(0.714, 1.0, 0.102)";

const BISHKEK: [number, number] = [74.59, 42.87];
/** города, из которых идут импульсы: Ош, Джалал-Абад, Каракол, Нарын, Талас, Баткен, Чолпон-Ата */
const CITIES: [number, number][] = [
  [72.8, 40.53], [73.0, 40.93], [78.39, 42.49], [76.0, 41.43], [72.24, 42.52], [70.82, 40.06], [77.08, 42.65],
];

/** рельеф поднимается волной с запада на восток: k — местный прогресс, rise — высота */
const RISE = /* glsl */ `
uniform float uIntro;
float introK(float u) { return clamp(uIntro * 1.7 - u * 0.7, 0.0, 1.0); }
float introRise(float k) { return 1.0 - pow(1.0 - k, 3.0); }`;

const TERRAIN_VERT = /* glsl */ `
attribute float aH;
uniform float uHScale;
${RISE}
varying vec2 vUv;
varying float vH;
varying float vShow;
void main() {
  vUv = uv;
  vH = aH;
  float k = introK(uv.x);
  vShow = smoothstep(0.0, 0.3, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, aH * uHScale * introRise(k), position.z, 1.0);
}`;

const TERRAIN_FRAG = /* glsl */ `
uniform sampler2D tData;
uniform vec2 uTexel;
uniform float uTime;
uniform float uRows;
uniform float uLine;
uniform vec3 uPointer;
uniform vec2 uCity;
varying vec2 vUv;
varying float vH;
varying float vShow;
const vec3 LIME = ${LIME};
const vec3 SNOW = vec3(0.94, 1.0, 0.82);
const vec3 BODY = vec3(0.026, 0.034, 0.022);
void main() {
  vec4 d = texture2D(tData, vUv);
  float sdB = (d.g * 2.0 - 1.0) * 16.0;
  float sdL = (d.b * 2.0 - 1.0) * 8.0;
  float pxB = sdB / max(fwidth(sdB), 1e-4);
  if (pxB < -1.0) discard;
  float inside = clamp(pxB + 0.5, 0.0, 1.0);
  float pxL = sdL / max(fwidth(sdL), 1e-4);
  float lake = clamp(pxL + 0.5, 0.0, 1.0);

  // склоны: свет с запада-юго-запада
  float hL = texture2D(tData, vUv - vec2(uTexel.x, 0.0)).r, hR = texture2D(tData, vUv + vec2(uTexel.x, 0.0)).r;
  float hU = texture2D(tData, vUv - vec2(0.0, uTexel.y)).r, hD = texture2D(tData, vUv + vec2(0.0, uTexel.y)).r;
  float shade = clamp(0.78 + dot(vec2(hR - hL, hD - hU), vec2(1.0, -0.6)) * 7.0, 0.36, 1.3);

  // линии широт постоянной экранной толщины; слишком частые гаснут
  float fv = vUv.y * uRows;
  float wv = fwidth(fv);
  float dl = abs(fract(fv) - 0.5) / max(wv, 1e-5);
  float dense = 1.0 - smoothstep(0.26, 0.5, wv);
  float line = (1.0 - smoothstep(uLine - 0.55, uLine + 0.55, dl)) * dense;
  float halo = exp(-dl * dl * 0.16) * dense;

  float alt = smoothstep(0.03, 0.6, vH);
  float lit = mix(0.46, 1.0, alt) * shade;
  lit *= mix(1.0, 0.55, lake);

  // волны от сервера и подсветка под курсором
  vec2 q = (vUv - uCity) * vec2(2.0, 1.0);
  float r = length(q);
  float ring = pow(max(0.0, 1.0 - abs(fract(r * 4.2 - uTime * 0.42) - 0.5) * 2.0), 8.0) * exp(-r * 3.0);
  vec2 pq = (vUv - uPointer.xy) * vec2(2.0, 1.0);
  float spot = exp(-dot(pq, pq) * 42.0) * uPointer.z;
  lit += ring * 0.9 + spot * 0.9;

  vec3 col = BODY + LIME * (0.018 + 0.06 * alt + 0.06 * spot);
  col = mix(col, vec3(0.012, 0.03, 0.03), lake * 0.85);
  float alpha = 0.86;
  vec3 lcol = mix(LIME, SNOW, smoothstep(0.5, 0.86, vH) * (1.0 - lake));
  float l = clamp(line * lit, 0.0, 1.0) * vShow;
  col += LIME * halo * lit * 0.13 * vShow;
  col = mix(col, lcol, l);
  alpha = mix(alpha, 1.0, l);
  col += LIME * ring * 0.22 * vShow;

  // берег озёр и граница страны
  float shore = (1.0 - smoothstep(0.5, 1.5, abs(pxL))) * 0.7;
  col = mix(col, LIME, shore * vShow);
  float edge = 1.0 - smoothstep(0.9, 1.9, abs(pxB));
  col = mix(col, mix(LIME, SNOW, 0.35), edge * vShow);

  float a = alpha * inside * smoothstep(0.0, 0.2, vShow + 0.001);
  gl_FragColor = vec4(col * a, a);
}`;

const WALL_VERT = /* glsl */ `
attribute float aH;
attribute float aDown;
uniform float uHScale;
uniform float uDepth;
${RISE}
varying float vY;
varying float vTop;
varying float vShow;
void main() {
  float k = introK(uv.x);
  vShow = smoothstep(0.0, 0.3, k);
  vTop = aH * uHScale * introRise(k);
  vY = mix(vTop, -uDepth, aDown);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, vY, position.z, 1.0);
}`;

const WALL_FRAG = /* glsl */ `
uniform float uDepth;
uniform float uStep;
varying float vY;
varying float vTop;
varying float vShow;
const vec3 LIME = ${LIME};
const vec3 BODY = vec3(0.026, 0.034, 0.022);
void main() {
  // срез макета: горизонтали через равный шаг высоты, ярче у поверхности
  float f = (vY + uDepth) / uStep;
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float strata = (1.0 - smoothstep(0.35, 1.25, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  float near = smoothstep(-uDepth, max(vTop, 0.01), vY);
  vec3 col = BODY * 0.8 + LIME * 0.035 * near;
  col = mix(col, LIME, strata * mix(0.1, 0.5, near) * vShow);
  float a = 0.94 * smoothstep(0.0, 0.2, vShow + 0.001);
  gl_FragColor = vec4(col * a, a);
}`;

const SHADOW_FRAG = /* glsl */ `
uniform sampler2D tData;
uniform float uIntro;
varying vec2 vUv;
const vec3 LIME = ${LIME};
void main() {
  float sdB = (texture2D(tData, vUv).g * 2.0 - 1.0) * 16.0;
  float dark = smoothstep(-15.0, 2.0, sdB) * 0.6;
  float rim = exp(-abs(sdB + 3.0) * 0.26) * 0.16;
  float a = clamp(dark + rim, 0.0, 1.0) * uIntro;
  gl_FragColor = vec4(LIME * rim * uIntro, a);
}`;

const PLAIN_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const ARC_VERT = /* glsl */ `
attribute vec3 aNext;
attribute float aSide;
attribute float aT;
attribute vec2 aSeed;
uniform vec2 uRes;
uniform float uWidth;
varying float vT;
varying float vSide;
varying vec2 vSeed;
void main() {
  vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 n = projectionMatrix * modelViewMatrix * vec4(aNext, 1.0);
  vec2 dir = normalize((n.xy / n.w - c.xy / c.w) * uRes + vec2(1e-5, 0.0));
  c.xy += vec2(-dir.y, dir.x) * aSide * uWidth / uRes * 2.0 * c.w;
  gl_Position = c;
  vT = aT; vSide = aSide; vSeed = aSeed;
}`;

const ARC_FRAG = /* glsl */ `
uniform float uTime;
uniform float uShow;
varying float vT;
varying float vSide;
varying vec2 vSeed;
const vec3 LIME = ${LIME};
void main() {
  float core = smoothstep(1.0, 0.2, abs(vSide));
  // импульс идёт от города к серверу, за ним гаснущий хвост; между рейсами пауза
  float head = fract(uTime * vSeed.y + vSeed.x) * 1.7;
  float dt = head - vT;
  float comet = dt > 0.0 ? exp(-dt * 7.0) * smoothstep(0.0, 0.012, dt) : 0.0;
  float ends = smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
  float a = (0.2 + comet * 0.95) * core * ends * uShow;
  vec3 col = mix(LIME, vec3(1.0), comet * 0.45);
  gl_FragColor = vec4(col * a, a);
}`;

const DOT_VERT = /* glsl */ `
attribute float aSize;
uniform float uDpr;
uniform float uTime;
varying float vBig;
void main() {
  vBig = step(9.0, aSize);
  float pulse = 1.0 + vBig * 0.14 * sin(uTime * 2.4);
  gl_PointSize = aSize * uDpr * pulse;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const DOT_FRAG = /* glsl */ `
uniform float uShow;
varying float vBig;
const vec3 LIME = ${LIME};
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float disc = smoothstep(mix(0.62, 0.26, vBig), mix(0.42, 0.16, vBig), r);
  float halo = exp(-r * r * 3.5) * mix(0.25, 0.8, vBig);
  float a = clamp(disc + halo, 0.0, 1.0) * smoothstep(1.0, 0.85, r) * uShow;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), disc * vBig * 0.8) * a, a);
}`;

const BEAM_FRAG = /* glsl */ `
uniform float uShow;
uniform float uTime;
varying vec2 vUv;
const vec3 LIME = ${LIME};
void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float fade = pow(1.0 - vUv.y, 1.6) * smoothstep(0.0, 0.015, vUv.y);
  float core = exp(-x * x * 220.0);
  float a = (exp(-x * x * 9.0) * 0.34 + core * 0.95) * fade * uShow;
  a *= 0.9 + 0.1 * sin(uTime * 2.4 - vUv.y * 9.0);
  gl_FragColor = vec4(mix(LIME, vec3(1.0), core * 0.6) * a, a);
}`;

const world = (r: Relief, lon: number, lat: number, lift = 0) => {
  const [u, v] = project(lon, lat);
  return new Vector3((u - 0.5) * 2, sample(r.height, r, u, v) * H_SCALE + lift, v - 0.5);
};

const buildTerrain = (r: Relief, sx: number) => {
  const sy = sx / 2, nx = sx + 1, ny = sy + 1;
  const pos = new Float32Array(nx * ny * 3), uv = new Float32Array(nx * ny * 2), ah = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, u = i / sx, v = j / sy;
    pos[k * 3] = (u - 0.5) * 2; pos[k * 3 + 1] = 0; pos[k * 3 + 2] = v - 0.5;
    uv[k * 2] = u; uv[k * 2 + 1] = v;
    ah[k] = sample(r.height, r, u, v);
  }
  // только ячейки у страны: за границей всё равно ничего не рисуется
  const idx: number[] = [];
  for (let j = 0; j < sy; j++) for (let i = 0; i < sx; i++) {
    if (sample(r.border, r, (i + 0.5) / sx, (j + 0.5) / sy) < -3) continue;
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("uv", new BufferAttribute(uv, 2));
  g.setAttribute("aH", new BufferAttribute(ah, 1));
  g.setIndex(new BufferAttribute(new Uint32Array(idx), 1));
  return g;
};

/**
 * Срез по границе: изолиния нулевого расстояния (marching squares по полю границы),
 * каждый её отрезок — стенка от поверхности рельефа до низа подложки.
 */
const buildWalls = (r: Relief) => {
  const { w, h, border: f } = r;
  const pos: number[] = [], uv: number[] = [], ah: number[] = [], down: number[] = [], idx: number[] = [];
  const cut = (x0: number, y0: number, a: number, x1: number, y1: number, b: number): [number, number] => {
    const t = a / (a - b);
    return [(x0 + (x1 - x0) * t + 0.5) / w, (y0 + (y1 - y0) * t + 0.5) / h];
  };
  const quad = (p: [number, number], q: [number, number]) => {
    const base = pos.length / 3;
    for (const [u, v] of [p, q]) {
      const hh = sample(r.height, r, u, v);
      for (const dn of [0, 1]) { pos.push((u - 0.5) * 2, 0, v - 0.5); uv.push(u, v); ah.push(hh); down.push(dn); }
    }
    idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  };
  for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
    const a = f[y * w + x], b = f[y * w + x + 1], c = f[(y + 1) * w + x + 1], d = f[(y + 1) * w + x];
    const code = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
    if (code === 0 || code === 15) continue;
    const T = () => cut(x, y, a, x + 1, y, b), R = () => cut(x + 1, y, b, x + 1, y + 1, c);
    const B = () => cut(x, y + 1, d, x + 1, y + 1, c), L = () => cut(x, y, a, x, y + 1, d);
    switch (code) {
      case 1: case 14: quad(L(), B()); break;
      case 2: case 13: quad(B(), R()); break;
      case 3: case 12: quad(L(), R()); break;
      case 4: case 11: quad(T(), R()); break;
      case 6: case 9: quad(T(), B()); break;
      case 7: case 8: quad(L(), T()); break;
      case 5: quad(L(), T()); quad(B(), R()); break;
      case 10: quad(L(), B()); quad(T(), R()); break;
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  g.setAttribute("aH", new BufferAttribute(new Float32Array(ah), 1));
  g.setAttribute("aDown", new BufferAttribute(new Float32Array(down), 1));
  g.setIndex(new BufferAttribute(new Uint32Array(idx), 1));
  return g;
};

const buildArcs = (r: Relief) => {
  const SEG = 56, to = world(r, BISHKEK[0], BISHKEK[1], 0.012);
  const pos: number[] = [], next: number[] = [], side: number[] = [], tt: number[] = [], seed: number[] = [], idx: number[] = [];
  CITIES.forEach(([lon, lat], n) => {
    const from = world(r, lon, lat, 0.012);
    const lift = 0.1 + from.distanceTo(to) * 0.2;
    const at = (t: number) => new Vector3().lerpVectors(from, to, t).setY(from.y + (to.y - from.y) * t + Math.sin(Math.PI * t) * lift);
    const phase = (n * 0.37) % 1, speed = 0.11 + ((n * 7) % 5) * 0.012;
    const base = pos.length / 3;
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG, p = at(t), q = i < SEG ? at((i + 1) / SEG) : p.clone().multiplyScalar(2).sub(at((i - 1) / SEG));
      for (const s of [-1, 1]) { pos.push(p.x, p.y, p.z); next.push(q.x, q.y, q.z); side.push(s); tt.push(t); seed.push(phase, speed); }
      if (i < SEG) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("aNext", new BufferAttribute(new Float32Array(next), 3));
  g.setAttribute("aSide", new BufferAttribute(new Float32Array(side), 1));
  g.setAttribute("aT", new BufferAttribute(new Float32Array(tt), 1));
  g.setAttribute("aSeed", new BufferAttribute(new Float32Array(seed), 2));
  g.setIndex(idx);
  return g;
};

/** прямоугольник страны в координатах кадра (u, v) */
const bounds = (r: Relief) => {
  let u0 = 1, u1 = 0, v0 = 1, v1 = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    if (r.border[y * r.w + x] <= 0) continue;
    const u = (x + 0.5) / r.w, v = (y + 0.5) / r.h;
    if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v;
  }
  return { u0, u1, v0, v1 };
};

export type ReliefOptions = {
  canvas: HTMLCanvasElement;
  /** подпись у маяка: двигается за ним по экрану */
  label?: HTMLElement | null;
  url: string;
};

export const mountRelief = async ({ canvas, label, url }: ReliefOptions): Promise<() => void> => {
  const relief = await loadRelief(url);
  const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

  const tex = new DataTexture(relief.rgba, relief.w, relief.h, RGBAFormat, UnsignedByteType);
  tex.minFilter = LinearFilter; tex.magFilter = LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;

  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(30, 1.5, 0.1, 20);

  const city = project(BISHKEK[0], BISHKEK[1]);
  const shared = { uTime: { value: 0 }, uIntro: { value: 0 }, uShow: { value: 0 } };
  const uHScale = { value: H_SCALE }, uDepth = { value: DEPTH };

  const terrainMat = new ShaderMaterial({
    vertexShader: TERRAIN_VERT, fragmentShader: TERRAIN_FRAG, transparent: true, premultipliedAlpha: true, blending: NormalBlending,
    uniforms: {
      tData: { value: tex }, uTexel: { value: new Vector2(1 / relief.w, 1 / relief.h) }, uTime: shared.uTime, uIntro: shared.uIntro,
      uHScale, uRows: { value: 50 }, uLine: { value: 0.7 }, uPointer: { value: new Vector3(0.5, 0.5, 0) },
      uCity: { value: new Vector2(city[0], city[1]) },
    },
  });
  const terrain = new Mesh(buildTerrain(relief, coarse ? 320 : 512), terrainMat);
  terrain.frustumCulled = false;

  const walls = new Mesh(buildWalls(relief), new ShaderMaterial({
    vertexShader: WALL_VERT, fragmentShader: WALL_FRAG, transparent: true, premultipliedAlpha: true, side: DoubleSide,
    uniforms: { uIntro: shared.uIntro, uHScale, uDepth, uStep: { value: 0.0205 } },
  }));
  walls.frustumCulled = false;

  const shadow = new Mesh(new PlaneGeometry(2, 1), new ShaderMaterial({
    vertexShader: PLAIN_VERT, fragmentShader: SHADOW_FRAG, transparent: true, premultipliedAlpha: true, depthWrite: false, side: DoubleSide,
    uniforms: { tData: { value: tex }, uIntro: shared.uIntro },
  }));
  // PlaneGeometry лежит в XY с v снизу вверх: кладём в XZ так, чтобы v=0 оказался на севере
  shadow.geometry.rotateX(Math.PI / 2);
  shadow.position.y = -DEPTH - 0.05;
  shadow.renderOrder = -1;

  const arcMat = new ShaderMaterial({
    vertexShader: ARC_VERT, fragmentShader: ARC_FRAG, transparent: true, premultipliedAlpha: true, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide,
    uniforms: { uTime: shared.uTime, uShow: shared.uShow, uRes: { value: new Vector2(1, 1) }, uWidth: { value: 1.5 } },
  });
  const arcs = new Mesh(buildArcs(relief), arcMat);
  arcs.frustumCulled = false; arcs.renderOrder = 2;

  const home = world(relief, BISHKEK[0], BISHKEK[1], 0.008);
  const dotPos: number[] = [home.x, home.y, home.z], dotSize: number[] = [18];
  for (const [lon, lat] of CITIES) { const p = world(relief, lon, lat, 0.008); dotPos.push(p.x, p.y, p.z); dotSize.push(6.5); }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute("position", new BufferAttribute(new Float32Array(dotPos), 3));
  dotGeo.setAttribute("aSize", new BufferAttribute(new Float32Array(dotSize), 1));
  const dotMat = new ShaderMaterial({
    vertexShader: DOT_VERT, fragmentShader: DOT_FRAG, transparent: true, premultipliedAlpha: true, blending: AdditiveBlending,
    depthWrite: false, depthTest: false,
    uniforms: { uTime: shared.uTime, uShow: shared.uShow, uDpr: { value: 1 } },
  });
  const dots = new Points(dotGeo, dotMat);
  dots.frustumCulled = false; dots.renderOrder = 3;

  const BEAM_H = 0.6;
  const beam = new Mesh(new PlaneGeometry(0.1, BEAM_H), new ShaderMaterial({
    vertexShader: PLAIN_VERT, fragmentShader: BEAM_FRAG, transparent: true, premultipliedAlpha: true, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide, uniforms: { uTime: shared.uTime, uShow: shared.uShow },
  }));
  beam.position.set(home.x, home.y + BEAM_H / 2, home.z);
  beam.renderOrder = 4;

  group.add(shadow, walls, terrain, arcs, dots, beam);

  // ── камера: с юга и сверху, страна вписана в кадр по ширине ─────────────────
  const EL = 0.9, BASE_YAW = -0.12;
  const bb = bounds(relief);
  const X0 = (bb.u0 - 0.5) * 2, X1 = (bb.u1 - 0.5) * 2, Z0 = bb.v0 - 0.5, Z1 = bb.v1 - 0.5;
  const axisY = new Vector3(0, 1, 0);
  const turned = (x: number, y: number, z: number) => new Vector3(x, y, z).applyAxisAngle(axisY, BASE_YAW);
  const target = turned((X0 + X1) / 2, 0.03, (Z0 + Z1) / 2);
  const dirTo = new Vector3(0, Math.sin(EL), Math.cos(EL));
  const fitPts = [turned(X0, 0.1, Z0), turned(X1, 0.1, Z0), turned(X0, -DEPTH, Z1), turned(X1, -DEPTH, Z1), turned(X0, -DEPTH, Z0), turned(X1, -DEPTH, Z0)];
  const tmp = new Vector3();
  let fitAspect = 0, tagW = 0;
  const place = (d: number, shift: number) => {
    camera.position.copy(target).addScaledVector(dirTo, d);
    camera.lookAt(target);
    // сдвиг вниз: над страной нужно место для маяка и подписи
    camera.setViewOffset(fitAspect, 1, 0, shift, fitAspect, 1);
    camera.updateMatrixWorld();
  };
  const fit = (aspect: number) => {
    if (Math.abs(aspect - fitAspect) < 0.001) return;
    fitAspect = aspect;
    tagW = 0;
    camera.aspect = aspect;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    let lo = 1, hi = 14;
    for (let i = 0; i < 24; i++) {
      const d = (lo + hi) / 2;
      camera.position.copy(target).addScaledVector(dirTo, d);
      camera.lookAt(target);
      camera.updateMatrixWorld();
      let over = false;
      for (const c of fitPts) { tmp.copy(c).project(camera); if (Math.abs(tmp.x) > 0.96 || Math.abs(tmp.y) > 0.74) over = true; }
      if (over) lo = d; else hi = d;
    }
    place(hi, -0.1);
    camera.updateProjectionMatrix();
  };

  // ── курсор: лёгкий поворот и подсветка рельефа под ним ───────────────────────
  const ptr = { x: 0, y: 0, nx: 0, ny: 0, inside: false };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const b = canvas.getBoundingClientRect();
    ptr.nx = ((e.clientX - b.left) / b.width) * 2 - 1;
    ptr.ny = -(((e.clientY - b.top) / b.height) * 2 - 1);
    ptr.inside = Math.abs(ptr.nx) <= 1 && Math.abs(ptr.ny) <= 1;
    ptr.x = Math.max(-1.6, Math.min(1.6, ptr.nx));
    ptr.y = Math.max(-1.6, Math.min(1.6, ptr.ny));
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let t0 = -1, yaw = 0, pitch = 0, spot = 0;
  const hit = new Vector3(), ray = new Vector3(), origin = new Vector3(), inv = new Matrix4();
  const labelAt = new Vector3();
  let flipped = false, scrollTilt = 0, tagX = -9, tagY = -9, tagShown = -1;

  const frame = (t: number, dt: number, size: ViewSize) => {
    fit(size.cssW / size.cssH);
    if (t0 < 0) t0 = t;
    shared.uTime.value = t - t0;
    shared.uIntro.value = Math.min(1, (t - t0) / 2.6);
    shared.uShow.value = Math.max(0, Math.min(1, (t - t0 - 1.7) / 1.1));
    arcMat.uniforms.uRes.value.set(size.w, size.h);
    arcMat.uniforms.uWidth.value = 1.3 * size.dpr;
    dotMat.uniforms.uDpr.value = size.dpr;
    terrainMat.uniforms.uLine.value = 0.55 + 0.22 * size.dpr;
    terrainMat.uniforms.uRows.value = Math.round(Math.max(24, Math.min(50, size.cssW / 15)));

    const k = 1 - Math.exp(-dt * 3.2);
    const sway = Math.sin((t - t0) * 0.22) * 0.045;
    yaw += (sway + ptr.x * 0.085 - yaw) * k;
    pitch += (-ptr.y * 0.04 - pitch) * k;
    // при прокрутке макет чуть наклоняется к зрителю
    const top = canvas.getBoundingClientRect().top;
    const gone = Math.max(0, Math.min(1, (120 - top) / Math.max(1, size.cssH * 1.4)));
    scrollTilt += (gone * 0.32 - scrollTilt) * k;
    group.rotation.set(pitch + scrollTilt, BASE_YAW + yaw, 0);
    group.updateMatrixWorld();
    beam.rotation.y = Math.atan2(camera.position.x, camera.position.z) - BASE_YAW - yaw;

    // луч курсора → плоскость средней высоты в координатах карты
    let on = 0;
    if (ptr.inside) {
      origin.copy(camera.position);
      ray.set(ptr.nx, ptr.ny, 0.5).unproject(camera).sub(origin).normalize();
      inv.copy(group.matrixWorld).invert();
      origin.applyMatrix4(inv);
      ray.transformDirection(inv);
      const s = (0.06 - origin.y) / ray.y;
      if (s > 0) {
        hit.copy(origin).addScaledVector(ray, s);
        const u = hit.x / 2 + 0.5, v = hit.z + 0.5;
        if (u > -0.05 && u < 1.05 && v > -0.05 && v < 1.05) { terrainMat.uniforms.uPointer.value.setX(u).setY(v); on = 1; }
      }
    }
    spot += (on - spot) * (1 - Math.exp(-dt * 6));
    terrainMat.uniforms.uPointer.value.z = spot;

    if (label) {
      labelAt.set(home.x, home.y + 0.2, home.z).applyMatrix4(group.matrixWorld).project(camera);
      const x = (labelAt.x * 0.5 + 0.5) * size.cssW, y = (-labelAt.y * 0.5 + 0.5) * size.cssH;
      // справа от маяка, а если не помещается в кадр — слева
      if (!tagW) tagW = (label.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const flip = x + 16 + tagW > size.cssW;
      if (flip !== flipped) { flipped = flip; label.toggleAttribute("data-flip", flip); }
      // стиль трогаем, только когда подпись сдвинулась хотя бы на четверть пикселя
      if (Math.abs(x - tagX) > 0.25 || Math.abs(y - tagY) > 0.25) {
        tagX = x; tagY = y;
        label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
      if (shared.uShow.value !== tagShown) { tagShown = shared.uShow.value; label.style.opacity = String(tagShown); }
    }
  };

  const unmount = mountView({ canvas, scene, camera, maxDpr: coarse ? 2 : 1.75, frame });
  return () => {
    unmount();
    window.removeEventListener("pointermove", onMove);
    for (const m of [terrain, walls, shadow, arcs, beam]) { m.geometry.dispose(); (m.material as ShaderMaterial).dispose(); }
    dotGeo.dispose(); dotMat.dispose(); tex.dispose();
  };
};
