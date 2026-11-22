import { WebGLRenderer, type Camera, type Scene } from "three";
import { every as paceEvery, scale, tick } from "@/three/pace";

/**
 * Общий рендерер для мелких фоновых вставок (гравюры из частиц): один WebGL-контекст, каждая
 * вставка — обычный <canvas> в потоке вёрстки (2D). За кадр рендерер рисует все вставки, которым
 * есть что менять, в свой буфер друг под другом, после чего каждая забирает свой участок через
 * drawImage: сначала все сцены, потом все копии — браузер снимает буфер один раз на кадр.
 * Вставка остаётся элементом вёрстки: маску, прозрачность и перекрытия делает CSS.
 * Большие сцены живут отдельно, по одной за раз — см. live.ts. Темп и разрешение задаёт pace.ts.
 */
export type ViewSize = { w: number; h: number; cssW: number; cssH: number; dpr: number };

export type View = {
  canvas: HTMLCanvasElement;
  scene: Scene;
  camera: Camera;
  /** верхняя граница плотности пикселей для этой вставки */
  maxDpr: number;
  /** обновление перед кадром: t и dt в секундах; false — в этом кадре перерисовывать нечего */
  frame: (t: number, dt: number, size: ViewSize) => boolean | void;
  /** запись в вёрстку (подписи и т. п.): после того как все вставки прочитали геометрию */
  post?: () => void;
};

type Slot = View & { ctx: CanvasRenderingContext2D; onScreen: boolean; cssW: number; cssH: number; dirty: boolean; io: IntersectionObserver; ro: ResizeObserver };
type Job = { s: Slot; w: number; h: number; y: number; size: ViewSize };

let renderer: WebGLRenderer | null = null;
let bufW = 0, bufH = 0, limit = 4096, roomy = 0;
const slots = new Set<Slot>();
let raf = 0, last = 0, count = 0;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** сводка для отладки и замеров: window.__asysStage */
export const stats = { buffer: "", views: 0, pixels: 0, msaa: false };

const ensureRenderer = () => {
  if (renderer) return renderer;
  const msaa = (window.devicePixelRatio || 1) < 1.5;
  const r = new WebGLRenderer({ antialias: msaa, alpha: true, premultipliedAlpha: true });
  r.setPixelRatio(1);
  r.setClearColor(0x000000, 0);
  r.autoClear = false;
  r.setScissorTest(true);
  r.debug.checkShaderErrors = import.meta.env.DEV;
  const gl = r.getContext();
  limit = Math.min(8192, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
  stats.msaa = msaa;
  renderer = r;
  return r;
};

/** буфер растёт сразу, а ужимается, если полсекунды велик на треть: копируется он целиком */
const fitBuffer = (r: WebGLRenderer, w: number, h: number) => {
  const needW = Math.ceil(w / 32) * 32, needH = Math.ceil(h / 32) * 32;
  roomy = needW * needH * 1.35 < bufW * bufH ? roomy + 1 : 0;
  if (needW > bufW || needH > bufH) { bufW = Math.max(bufW, needW); bufH = Math.max(bufH, needH); r.setSize(bufW, bufH, false); }
  else if (roomy > 30) { bufW = needW; bufH = needH; roomy = 0; r.setSize(bufW, bufH, false); }
};

const loop = (now: number) => {
  raf = 0;
  const t = now / 1000, delta = last ? (t - last) * 1000 : 16.7, dt = Math.min(0.05, delta / 1000);
  last = t;
  const still = reduced();
  let waiting = false;
  // на 120 Гц рисуем через кадр; на нижней ступени качества — ещё вдвое реже
  const every = paceEvery();
  const draw = still || count++ % every === 0;
  const jobs: Job[] = [];
  for (const s of slots) {
    if (!s.onScreen || s.cssW < 2 || s.cssH < 2) continue;
    if (still && !s.dirty) continue;
    waiting = true;
    if (!draw) continue;
    const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, s.maxDpr) * (still ? 1 : scale()));
    const w = Math.min(limit, Math.max(1, Math.round(s.cssW * dpr))), h = Math.min(limit, Math.max(1, Math.round(s.cssH * dpr)));
    const size = { w, h, cssW: s.cssW, cssH: s.cssH, dpr };
    const resized = s.canvas.width !== w || s.canvas.height !== h;
    // вставке нечего менять и кадр у неё уже есть — пропускаем
    if (s.frame(t, dt * every, size) === false && !s.dirty && !resized) continue;
    if (resized) { s.canvas.width = w; s.canvas.height = h; }
    jobs.push({ s, w, h, y: 0, size });
  }
  if (jobs.length) {
    const r = ensureRenderer();
    let pixels = 0;
    // вставки ложатся в буфер друг под другом; не помещаются по высоте — вторым заходом
    for (let i = 0; i < jobs.length;) {
      let j = i, tall = 0, wide = 0;
      while (j < jobs.length && (j === i || tall + jobs[j].h <= limit)) { jobs[j].y = tall; tall += jobs[j].h; wide = Math.max(wide, jobs[j].w); j++; }
      fitBuffer(r, wide, tall);
      for (let k = i; k < j; k++) {
        const { s, w, h, y } = jobs[k];
        r.setViewport(0, y, w, h);
        r.setScissor(0, y, w, h);
        r.clear();
        r.render(s.scene, s.camera);
        pixels += w * h;
      }
      for (let k = i; k < j; k++) {
        const { s, w, h, y } = jobs[k];
        s.ctx.clearRect(0, 0, w, h);
        // буфер WebGL считается снизу, drawImage — сверху
        s.ctx.drawImage(r.domElement, 0, bufH - y - h, w, h, 0, 0, w, h);
        s.dirty = false;
      }
      i = j;
    }
    for (const { s } of jobs) s.post?.();
    stats.buffer = `${bufW}x${bufH}`; stats.views = jobs.length; stats.pixels = pixels;
  }
  if (waiting && !still) tick(now, delta);
  if (waiting && !still && !document.hidden) raf = requestAnimationFrame(loop);
  else last = 0;
};

const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };

let listening = false;
const listen = () => {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", kick);
  (window as unknown as { __asysStage?: typeof stats }).__asysStage = stats;
};

/** Подключает вставку; возвращает функцию отключения. */
export const mountView = (view: View): (() => void) => {
  const ctx = view.canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ensureRenderer();
  const rect = view.canvas.getBoundingClientRect();
  const s: Slot = {
    ...view, ctx, onScreen: false, cssW: rect.width, cssH: rect.height, dirty: true,
    io: new IntersectionObserver(([e]) => { s.onScreen = e.isIntersecting; s.dirty = true; if (s.onScreen) kick(); }, { rootMargin: "120px 0px" }),
    ro: new ResizeObserver(([e]) => { s.cssW = e.contentRect.width; s.cssH = e.contentRect.height; s.dirty = true; kick(); }),
  };
  s.io.observe(view.canvas);
  s.ro.observe(view.canvas);
  slots.add(s);
  listen();
  kick();
  return () => {
    s.io.disconnect(); s.ro.disconnect(); slots.delete(s);
    if (slots.size === 0 && renderer) {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      renderer.dispose(); renderer.forceContextLoss();
      renderer = null; bufW = 0; bufH = 0;
    }
  };
};

/** Попросить один кадр (например, после загрузки данных под reduced-motion). */
export const invalidate = (canvas: HTMLCanvasElement) => {
  for (const s of slots) if (s.canvas === canvas) s.dirty = true;
  kick();
};
