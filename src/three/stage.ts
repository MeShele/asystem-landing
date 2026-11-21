import { WebGLRenderer, type Camera, type Scene } from "three";

/**
 * Сцена для всех 3D-вставок сайта: один WebGL-контекст на страницу. Каждая вставка — обычный
 * <canvas> в потоке вёрстки (2D). За кадр общий рендерер рисует все видимые вставки в свой буфер
 * друг под другом, после чего каждая забирает свой участок через drawImage. Так вставка
 * скроллится, маскируется и перекрывается средствами CSS, а контекстов не становится больше
 * с каждым элементом. Сначала все сцены, потом все копии: браузер снимает буфер один раз на кадр,
 * а не перед каждой копией (иначе четыре вставки на экране роняют частоту кадров).
 * Кадры идут только пока вставка на экране и вкладка активна; под reduced-motion — по одному
 * кадру на изменение размера.
 */
export type ViewSize = { w: number; h: number; cssW: number; cssH: number; dpr: number };

export type View = {
  canvas: HTMLCanvasElement;
  scene: Scene;
  camera: Camera;
  /** верхняя граница плотности пикселей для этой вставки */
  maxDpr: number;
  /** обновление перед кадром: t и dt в секундах */
  frame: (t: number, dt: number, size: ViewSize) => void;
};

type Slot = View & { ctx: CanvasRenderingContext2D; onScreen: boolean; cssW: number; cssH: number; dirty: boolean; io: IntersectionObserver; ro: ResizeObserver };

let renderer: WebGLRenderer | null = null;
let bufW = 0, bufH = 0, limit = 4096, roomy = 0;
const slots = new Set<Slot>();
let raf = 0, last = 0;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ensureRenderer = () => {
  if (renderer) return renderer;
  const r = new WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
  r.setPixelRatio(1);
  r.setClearColor(0x000000, 0);
  r.autoClear = false;
  r.setScissorTest(true);
  const gl = r.getContext();
  limit = Math.min(8192, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
  renderer = r;
  return r;
};

/** буфер растёт сразу, а ужимается, только если давно велик вдвое: смена размера — дорогая операция */
const fitBuffer = (r: WebGLRenderer, w: number, h: number) => {
  const needW = Math.ceil(w / 64) * 64, needH = Math.ceil(h / 64) * 64;
  roomy = needW * needH * 2 < bufW * bufH ? roomy + 1 : 0;
  if (needW > bufW || needH > bufH) { bufW = Math.max(bufW, needW); bufH = Math.max(bufH, needH); r.setSize(bufW, bufH, false); }
  else if (roomy > 120) { bufW = needW; bufH = needH; roomy = 0; r.setSize(bufW, bufH, false); }
};

type Job = { s: Slot; w: number; h: number; y: number; size: ViewSize };

const loop = (now: number) => {
  raf = 0;
  const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016);
  last = t;
  const still = reduced();
  const jobs: Job[] = [];
  for (const s of slots) {
    if (!s.onScreen || s.cssW < 2 || s.cssH < 2) continue;
    if (still && !s.dirty) continue;
    const dpr = Math.min(window.devicePixelRatio || 1, s.maxDpr);
    const w = Math.min(limit, Math.max(1, Math.round(s.cssW * dpr))), h = Math.min(limit, Math.max(1, Math.round(s.cssH * dpr)));
    if (s.canvas.width !== w || s.canvas.height !== h) { s.canvas.width = w; s.canvas.height = h; }
    jobs.push({ s, w, h, y: 0, size: { w, h, cssW: s.cssW, cssH: s.cssH, dpr } });
  }
  if (jobs.length) {
    const r = ensureRenderer();
    // вставки ложатся в буфер друг под другом; не помещаются по высоте — вторым заходом
    for (let i = 0; i < jobs.length;) {
      let j = i, tall = 0, wide = 0;
      while (j < jobs.length && (j === i || tall + jobs[j].h <= limit)) { jobs[j].y = tall; tall += jobs[j].h; wide = Math.max(wide, jobs[j].w); j++; }
      fitBuffer(r, wide, tall);
      for (let k = i; k < j; k++) {
        const { s, w, h, y, size } = jobs[k];
        s.frame(t, dt, size);
        r.setViewport(0, y, w, h);
        r.setScissor(0, y, w, h);
        r.clear();
        r.render(s.scene, s.camera);
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
  }
  if (jobs.length && !still && !document.hidden) raf = requestAnimationFrame(loop);
  else last = 0;
};

const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };

let listening = false;
const listen = () => {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", kick);
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
