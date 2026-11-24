import {
  AdditiveBlending, BufferAttribute, BufferGeometry, DoubleSide, Mesh, PlaneGeometry, ShaderMaterial, Vector2, Vector3,
  type Group, type PerspectiveCamera,
} from "three";
import type { LiveSize } from "@/three/live";

/**
 * Общие мелочи сцен-макетов: бегущий импульс, луч, камера, курсор, подписи, шрифты для экранов.
 * Сами тела, материалы и свет — в studio.ts. Тексты подписей остаются вёрсткой: сцена только
 * сообщает, где им стоять.
 */
export const LIME = "vec3(0.714, 1.0, 0.102)";
/** краски для рисунков на холсте (экраны, табло): лайм — действие и крипта, янтарь — сомы, лёд — нейтральные детали */
export const HEX = { lime: "#B6FF1A", amber: "#FFBD33", ice: "#DBF2E6" } as const;
export type Shared = { uTime: { value: number }; uShow: { value: number } };
export const shared = (): Shared => ({ uTime: { value: 0 }, uShow: { value: 0 } });

// ── путь с бегущим импульсом ─────────────────────────────────────────────────────
const RIBBON_VERT = /* glsl */ `
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

const RIBBON_FRAG = /* glsl */ `
uniform float uTime;
uniform float uShow;
uniform float uBase;
varying float vT;
varying float vSide;
varying vec2 vSeed;
const vec3 LIME = ${LIME};
void main() {
  float core = smoothstep(1.0, 0.2, abs(vSide));
  // импульс идёт от начала пути к концу, за ним гаснущий хвост; между рейсами пауза
  float head = fract(uTime * vSeed.y + vSeed.x) * 1.7;
  float dt = head - vT;
  float comet = dt > 0.0 ? exp(-dt * 7.0) * smoothstep(0.0, 0.012, dt) : 0.0;
  float a = (uBase + comet * 0.95) * core * uShow;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), comet * 0.45) * a, a);
}`;

/** положение головы импульса на пути (0…1,7) в момент time — та же формула, что в шейдере */
export const headAt = (time: number, phase: number, speed: number) => ((((time * speed + phase) % 1) + 1) % 1) * 1.7;

/** лента экранной ширины вдоль каждого пути; seed — фаза и скорость импульса на этом пути */
export const ribbon = (sh: Shared, paths: { pts: Vector3[]; phase: number; speed: number }[], base = 0.2) => {
  const pos: number[] = [], next: number[] = [], side: number[] = [], tt: number[] = [], seed: number[] = [], idx: number[] = [];
  for (const { pts, phase, speed } of paths) {
    const from = pos.length / 3, last = pts.length - 1;
    pts.forEach((p, i) => {
      const q = i < last ? pts[i + 1] : p.clone().multiplyScalar(2).sub(pts[i - 1]);
      for (const s of [-1, 1]) { pos.push(p.x, p.y, p.z); next.push(q.x, q.y, q.z); side.push(s); tt.push(i / last); seed.push(phase, speed); }
      if (i < last) { const a = from + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("aNext", new BufferAttribute(new Float32Array(next), 3));
  g.setAttribute("aSide", new BufferAttribute(new Float32Array(side), 1));
  g.setAttribute("aT", new BufferAttribute(new Float32Array(tt), 1));
  g.setAttribute("aSeed", new BufferAttribute(new Float32Array(seed), 2));
  g.setIndex(idx);
  const m = new Mesh(g, new ShaderMaterial({
    vertexShader: RIBBON_VERT, fragmentShader: RIBBON_FRAG, transparent: true, premultipliedAlpha: true, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide,
    uniforms: { uTime: sh.uTime, uShow: sh.uShow, uRes: { value: new Vector2(1, 1) }, uWidth: { value: 1.5 }, uBase: { value: base } },
  }));
  m.frustumCulled = false;
  return m;
};

// ── луч-выноска: от детали вверх к подписи ───────────────────────────────────────
const BEAM_FRAG = /* glsl */ `
uniform float uShow;
uniform float uGain;
varying vec2 vUv;
const vec3 LIME = ${LIME};
void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float fade = pow(1.0 - vUv.y, 1.3) * smoothstep(0.0, 0.03, vUv.y);
  float core = exp(-x * x * 220.0);
  float a = (exp(-x * x * 9.0) * 0.22 + core * 0.8) * fade * uShow * uGain;
  gl_FragColor = vec4(mix(LIME, vec3(1.0), core * 0.5) * a, a);
}`;

export const beam = (sh: Shared, at: Vector3, height: number, gain = 1) => {
  const m = new Mesh(new PlaneGeometry(0.16, height), new ShaderMaterial({
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: BEAM_FRAG, transparent: true, premultipliedAlpha: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide,
    uniforms: { uShow: sh.uShow, uGain: { value: gain } },
  }));
  m.position.set(at.x, at.y + height / 2, at.z);
  return m;
};

// ── камера, курсор, подписи ──────────────────────────────────────────────────────
export type Pointer = { nx: number; ny: number; inside: boolean };

/** курсор в координатах холста сцены (−1…1); слушает окно, чтобы сцена отзывалась и рядом с собой */
export const pointer = (canvas: HTMLCanvasElement) => {
  const p: Pointer = { nx: 0, ny: 0, inside: false };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const b = canvas.getBoundingClientRect();
    p.nx = Math.max(-1.6, Math.min(1.6, ((e.clientX - b.left) / b.width) * 2 - 1));
    p.ny = Math.max(-1.6, Math.min(1.6, -(((e.clientY - b.top) / b.height) * 2 - 1)));
    p.inside = Math.abs(p.nx) <= 1 && Math.abs(p.ny) <= 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return { p, off: () => window.removeEventListener("pointermove", onMove) };
};

/**
 * Ставит камеру так, чтобы все точки pts поместились в кадр: смотрит на target из направления dir,
 * расстояние подбирается делением пополам. box — пределы кадра (−1…1): [по ширине, сверху, снизу].
 */
export const frameCamera = (camera: PerspectiveCamera, aspect: number, target: Vector3, dir: Vector3, pts: Vector3[], box: [number, number, number] = [0.94, 0.9, 0.9]) => {
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  const tmp = new Vector3();
  let lo = 0.5, hi = 60;
  for (let i = 0; i < 26; i++) {
    const d = (lo + hi) / 2;
    camera.position.copy(target).addScaledVector(dir, d);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    let over = false;
    for (const p of pts) { tmp.copy(p).project(camera); if (Math.abs(tmp.x) > box[0] || tmp.y > box[1] || tmp.y < -box[2]) over = true; }
    if (over) lo = d; else hi = d;
  }
  camera.position.copy(target).addScaledVector(dir, hi);
  camera.lookAt(target);
  // Ближняя и дальняя границы — вплотную к сцене. Точность глубины зависит от ближней границы:
  // при 0,1 на телефонах с грубым буфером глубины детали, лежащие вплотную друг к другу
  // (риски, огоньки, строки), мерцали бы, «просвечивая» одна сквозь другую.
  let reach = 0;
  for (const p of pts) reach = Math.max(reach, p.distanceTo(target));
  camera.near = Math.max(0.1, hi - reach * 2.4);
  camera.far = hi + reach * 3;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
};

export type Tag = { el: HTMLElement; at: Vector3; x: number; y: number; shown: number };

/** подписи: at — точка в координатах группы сцены; place считает экранное место, write пишет в вёрстку */
export const tags = (els: (HTMLElement | null)[], points: Vector3[]) => {
  const list: Tag[] = [];
  els.forEach((el, i) => { if (el && points[i]) list.push({ el, at: points[i], x: -9, y: -9, shown: -1 }); });
  const v = new Vector3();
  const next: { x: number; y: number }[] = list.map(() => ({ x: 0, y: 0 }));
  let show = 0;
  return {
    place: (group: Group, camera: PerspectiveCamera, size: LiveSize, visible: number) => {
      show = visible;
      list.forEach((t, i) => {
        v.copy(t.at).applyMatrix4(group.matrixWorld).project(camera);
        next[i].x = (v.x * 0.5 + 0.5) * size.cssW; next[i].y = (-v.y * 0.5 + 0.5) * size.cssH;
      });
    },
    write: () => list.forEach((t, i) => {
      const { x, y } = next[i];
      if (Math.abs(x - t.x) > 0.25 || Math.abs(y - t.y) > 0.25) { t.x = x; t.y = y; t.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`; }
      if (show !== t.shown) { t.shown = show; t.el.style.opacity = String(show); }
    }),
  };
};

/**
 * Шрифты сайта для надписей на текстурах. Холст рисует тем, что уже загружено: без ожидания надпись
 * выйдет запасным шрифтом. Образец текста нужен, чтобы подгрузились и кириллица, и латиница.
 */
export const fonts = () => Promise.race([
  Promise.all(["600 40px Unbounded", "500 40px Unbounded"].map((f) => document.fonts.load(f, "Сс KGS USDT 09"))),
  new Promise((r) => setTimeout(r, 1800)),
]).then(() => undefined, () => undefined);
export const FONT = (px: number, weight = 600) => `${weight} ${px}px Unbounded, Onest, system-ui, sans-serif`;

export const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
