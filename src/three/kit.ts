import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, EdgesGeometry, LinearFilter, LineBasicMaterial,
  LineSegments, Mesh, PlaneGeometry, ShaderMaterial, Vector2, Vector3, Vector4, type Group, type PerspectiveCamera, type Texture,
} from "three";
import type { LiveSize } from "@/three/live";

/**
 * Общий набор для сцен-макетов (плата, слои, вершина, механизм). Один язык с картой героя:
 * тёмное тело, лаймовая гравировка линиями, срез с горизонталями, бегущий импульс, подпись
 * на тонком луче. Тексты подписей остаются вёрсткой: сцена только сообщает, где им стоять.
 */
export const LIME = "vec3(0.714, 1.0, 0.102)";
export type Shared = { uTime: { value: number }; uShow: { value: number } };
export const shared = (): Shared => ({ uTime: { value: 0 }, uShow: { value: 0 } });

// ── гравированное тело ───────────────────────────────────────────────────────────
const ENGRAVE_VERT = /* glsl */ `
varying vec3 vObj;
varying vec3 vNo;
varying vec3 vNw;
void main() {
  vObj = position; vNo = normal;
  vNw = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ENGRAVE_FRAG = /* glsl */ `
uniform float uShow;
uniform float uKind;
uniform float uHot;
uniform float uAlpha;
uniform float uStrata;
uniform float uTop;
uniform float uArtOn;
uniform float uGain;
uniform float uInk;
uniform float uReveal;
uniform vec4 uRect;
uniform sampler2D tArt;
varying vec3 vObj;
varying vec3 vNo;
varying vec3 vNw;
const vec3 LIME = ${LIME};
void main() {
  vec3 no = normalize(vNo);
  float lit = 0.32 + 0.68 * clamp(dot(normalize(vNw), normalize(vec3(-0.5, 0.75, 0.45))), 0.0, 1.0);
  float up = smoothstep(0.6, 0.9, no.y);
  float side = 1.0 - smoothstep(0.3, 0.6, abs(no.y));
  // срез — горизонтали, верх — тонкие линии; слишком частые гаснут
  float f = mix(vObj.z * uTop, vObj.y * uStrata, side);
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float line = (1.0 - smoothstep(0.4, 1.2, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  bool accent = uKind > 0.5;
  vec3 col = (accent ? vec3(0.2, 0.29, 0.04) : vec3(0.034, 0.042, 0.03)) * (0.45 + 0.65 * lit);
  float ink = line * (0.16 + 0.5 * lit) * uInk;
  float art = 0.0;
  if (uArtOn > 0.5 && up > 0.5) {
    // рисунок на верхней грани: координаты из положения точки, проявляется слева направо
    vec2 uv = vec2((vObj.x - uRect.x) / uRect.z, (vObj.z - uRect.y) / uRect.w);
    art = texture2D(tArt, vec2(uv.x, 1.0 - uv.y)).a * smoothstep(uv.x - 0.08, uv.x, uReveal * 1.08) * uGain;
    ink = art;
  }
  if (accent && up > 0.5) {
    // итоговая деталь: лаймовый верх, рисунок на нём тёмный
    col = mix(LIME * (0.9 + 0.1 * lit), vec3(0.05, 0.07, 0.02), clamp(art, 0.0, 1.0) * 0.9);
    col = mix(col, vec3(1.0), uHot * 0.3);
  } else {
    col = mix(col, LIME, clamp(ink * (1.0 + uHot * 1.3), 0.0, 1.0));
    col += LIME * uHot * 0.07;
  }
  float a = uAlpha * uShow;
  gl_FragColor = vec4(col * a, a);
}`;

export type EngraveOptions = { kind?: 0 | 1; art?: Texture | null; rect?: [number, number, number, number]; strata?: number; top?: number; alpha?: number; gain?: number; ink?: number };

/** rect — прямоугольник верхней грани в координатах детали (x0, z0, ширина, глубина) под рисунок */
export const engrave = (sh: Shared, o: EngraveOptions = {}) => new ShaderMaterial({
  vertexShader: ENGRAVE_VERT, fragmentShader: ENGRAVE_FRAG, transparent: true, premultipliedAlpha: true,
  uniforms: {
    uShow: sh.uShow, uKind: { value: o.kind ?? 0 }, uHot: { value: 0 }, uAlpha: { value: o.alpha ?? 1 },
    uStrata: { value: o.strata ?? 14 }, uTop: { value: o.top ?? 9 }, uArtOn: { value: o.art ? 1 : 0 }, uGain: { value: o.gain ?? 1 }, uInk: { value: o.ink ?? 1 },
    uReveal: { value: 1 }, uRect: { value: new Vector4(...(o.rect ?? [0, 0, 1, 1])) }, tArt: { value: o.art ?? null },
  },
});

/** тонкий лаймовый контур детали по её рёбрам */
export const outline = (geo: BufferGeometry, opacity = 0.5, angle = 30) => {
  const m = new LineBasicMaterial({ color: 0xb6ff1a, transparent: true, opacity });
  const l = new LineSegments(new EdgesGeometry(geo, angle), m);
  l.frustumCulled = false;
  return l;
};

// ── рисунок линиями: холст 2D → текстура ─────────────────────────────────────────
export const art = (w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void): CanvasTexture => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2d context unavailable");
  c.strokeStyle = "#fff"; c.fillStyle = "#fff"; c.lineCap = "round"; c.lineJoin = "round";
  draw(c, w, h);
  const t = new CanvasTexture(cv);
  t.minFilter = LinearFilter; t.magFilter = LinearFilter; t.generateMipmaps = false;
  return t;
};

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

/** отдать кадр браузеру между шагами сборки сцены: без этого сборка одним куском дёргает прокрутку */
export const nap = () => new Promise<void>((r) => setTimeout(r, 0));

export const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
