import { WebGLRenderer, type Camera, type Scene } from "three";

/**
 * Сцена для всех 3D-вставок сайта: один WebGL-контекст на страницу. Каждая вставка — обычный
 * <canvas> в потоке вёрстки (2D), общий рендерер рисует её сцену в угол своего буфера и
 * копирует кадр через drawImage. Так вставка скроллится, маскируется и перекрывается средствами
 * CSS, а контекстов не становится больше с каждым элементом. Кадры идут только пока вставка
 * на экране и вкладка активна; под reduced-motion — по одному кадру на изменение размера.
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
let bufW = 0, bufH = 0;
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
  renderer = r;
  return r;
};

const draw = (s: Slot, t: number, dt: number) => {
  const r = ensureRenderer();
  const dpr = Math.min(window.devicePixelRatio || 1, s.maxDpr);
  const w = Math.max(1, Math.round(s.cssW * dpr)), h = Math.max(1, Math.round(s.cssH * dpr));
  if (s.canvas.width !== w || s.canvas.height !== h) { s.canvas.width = w; s.canvas.height = h; }
  if (w > bufW || h > bufH) { bufW = Math.max(bufW, w); bufH = Math.max(bufH, h); r.setSize(bufW, bufH, false); }
  s.frame(t, dt, { w, h, cssW: s.cssW, cssH: s.cssH, dpr });
  r.setViewport(0, 0, w, h);
  r.setScissor(0, 0, w, h);
  r.clear();
  r.render(s.scene, s.camera);
  s.ctx.clearRect(0, 0, w, h);
  // буфер WebGL считается снизу, drawImage — сверху
  s.ctx.drawImage(r.domElement, 0, bufH - h, w, h, 0, 0, w, h);
  s.dirty = false;
};

const loop = (now: number) => {
  raf = 0;
  const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016);
  last = t;
  const still = reduced();
  let live = false;
  for (const s of slots) {
    if (!s.onScreen || s.cssW < 2 || s.cssH < 2) continue;
    if (still && !s.dirty) continue;
    draw(s, t, dt);
    if (!still) live = true;
  }
  if (live && !document.hidden) raf = requestAnimationFrame(loop);
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
