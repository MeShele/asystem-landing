import { Mesh, WebGLRenderer, type Camera, type Material, type Object3D, type Scene, type Texture } from "three";
import { every, scale, tick } from "@/three/pace";

/**
 * Одна живая сцена на страницу. Большие 3D-сцены сайта (карта, щит, запуск, механизм)
 * делят один WebGL-холст: он переезжает в ту сцену, которая сейчас занимает больше всего экрана,
 * и рисует её напрямую, без копирования кадра. Остальные сцены показывают свой последний кадр
 * обычной картинкой и ничего не стоят; у ушедших с экрана освобождается память видеокарты.
 * Так нагрузка не растёт с числом сцен на странице: в любой момент считается ровно одна.
 */
export type LiveSize = { w: number; h: number; cssW: number; cssH: number; dpr: number };

export type LiveView = {
  /** холст сцены в вёрстке: на нём остаётся последний кадр, когда сцена не живая */
  canvas: HTMLCanvasElement;
  scene: Scene;
  camera: Camera;
  /** верхняя граница плотности пикселей */
  maxDpr: number;
  /** обновление перед кадром: t и dt в секундах */
  frame: (t: number, dt: number, size: LiveSize) => void;
  /** запись в вёрстку (подписи): после отрисовки */
  post?: () => void;
};

/** shown — сколько секунд сцена уже была живой: у непоказанной на её месте пусто, ей нужен первый показ */
type Slot = LiveView & { ctx: CanvasRenderingContext2D; onScreen: boolean; cssW: number; cssH: number; away: number; shown: number; io: IntersectionObserver; ro: ResizeObserver };
/** столько секунд сцена держит холст, чтобы доиграть вход, прежде чем уступить его непоказанной соседке */
const MIN_SHOW = 2.6;

let renderer: WebGLRenderer | null = null;
let live: Slot | null = null, liveW = 0, liveH = 0;
const slots = new Set<Slot>();
let raf = 0, last = 0, count = 0;

const ensure = () => {
  if (renderer) return renderer;
  // на плотных экранах без аппаратного сглаживания: кромки сглаживают шейдеры
  const r = new WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 1.5, alpha: true, premultipliedAlpha: true });
  r.setPixelRatio(1);
  r.setClearColor(0x000000, 0);
  r.debug.checkShaderErrors = import.meta.env.DEV;
  r.domElement.setAttribute("aria-hidden", "true");
  renderer = r;
  return r;
};

/** площадь сцены, видимая в окне */
const seen = (s: Slot) => {
  const b = s.canvas.getBoundingClientRect();
  const w = Math.min(b.right, window.innerWidth) - Math.max(b.left, 0), h = Math.min(b.bottom, window.innerHeight) - Math.max(b.top, 0);
  return w > 0 && h > 0 ? w * h : 0;
};

/**
 * Живой становится сцена с наибольшей видимой площадью; текущую сменяет только заметно бо́льшая.
 * Исключение — сцена, которую ещё ни разу не показывали: у неё нет последнего кадра, на её месте
 * пусто. Если она видна хотя бы на треть, холст переходит к ней, как только текущая доиграла вход.
 */
const pick = () => {
  let best: Slot | null = null, area = 0, rookie: Slot | null = null, rookieArea = 0;
  for (const s of slots) {
    if (!s.onScreen || s.cssW < 2 || s.cssH < 2) continue;
    const a = seen(s);
    if (a > area) { area = a; best = s; }
    if (s.shown === 0 && a > s.cssW * s.cssH * 0.33 && a > rookieArea) { rookieArea = a; rookie = s; }
  }
  if (live && slots.has(live) && live.onScreen) {
    const mine = seen(live);
    if (mine > 0) {
      if (live.shown < MIN_SHOW && mine > live.cssW * live.cssH * 0.33) return live;
      if (rookie && rookie !== live) return rookie;
      if (area < mine * 1.35) return live;
    }
  }
  return area > 0 ? best : null;
};

/** последний кадр живой сцены остаётся на её собственном холсте */
const freeze = (r: WebGLRenderer, s: Slot) => {
  if (!s.canvas.isConnected) return;
  r.clear();
  r.render(s.scene, s.camera);               // буфер после показа пуст: рисуем ещё раз и сразу копируем
  s.canvas.width = liveW; s.canvas.height = liveH;
  s.ctx.drawImage(r.domElement, 0, 0);
  s.canvas.style.visibility = "";
};

/** память видеокарты сцены, давно ушедшей с экрана; при возвращении всё загрузится заново само */
const release = (root: Object3D) => root.traverse((o) => {
  if (!(o instanceof Mesh)) return;
  o.geometry.dispose();
  for (const m of (Array.isArray(o.material) ? o.material : [o.material]) as Material[]) {
    for (const u of Object.values((m as unknown as { uniforms?: Record<string, { value: unknown }> }).uniforms ?? {})) {
      const v = u.value as Texture | null;
      if (v && (v as Texture).isTexture) v.dispose();
    }
  }
});

const loop = (now: number) => {
  raf = 0;
  const t = now / 1000, delta = last ? (t - last) * 1000 : 16.7;
  last = t;
  let waiting = false;
  for (const s of slots) {
    if (s.onScreen) { waiting = true; s.away = 0; }
    else if (s !== live && s.away >= 0 && ++s.away > 240) { release(s.scene); s.away = -1; }
    else if (s.away >= 0) waiting = waiting || s.away > 0;
  }
  const step = every();
  if (count++ % step === 0) {
    const next = pick();
    const r = ensure();
    if (next !== live) {
      if (live && slots.has(live)) freeze(r, live);
      live = next; liveW = 0; liveH = 0;
      if (live) {
        // холст встаёт рядом с холстом сцены и берёт его место в вёрстке
        r.domElement.className = live.canvas.className;
        r.domElement.style.cssText = live.canvas.style.cssText;
        live.canvas.after(r.domElement);
      } else r.domElement.remove();
    }
    if (live) {
      const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, live.maxDpr) * scale());
      const w = Math.max(1, Math.round(live.cssW * dpr)), h = Math.max(1, Math.round(live.cssH * dpr));
      if (w !== liveW || h !== liveH) { liveW = w; liveH = h; r.setSize(w, h, false); }
      const dt = Math.min(0.05, (delta / 1000) * step);
      live.shown += dt;
      live.frame(t, dt, { w, h, cssW: live.cssW, cssH: live.cssH, dpr });
      r.setViewport(0, 0, w, h);
      r.clear();
      r.render(live.scene, live.camera);
      if (live.canvas.style.visibility !== "hidden") live.canvas.style.visibility = "hidden";
      live.post?.();
    }
  }
  tick(now, delta);
  if (waiting && !document.hidden) raf = requestAnimationFrame(loop);
  else last = 0;
};

const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };
let listening = false;

/** Подключает сцену; возвращает функцию отключения. */
export const mountLive = (view: LiveView): (() => void) => {
  const ctx = view.canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ensure();
  const rect = view.canvas.getBoundingClientRect();
  const s: Slot = {
    ...view, ctx, onScreen: false, cssW: rect.width, cssH: rect.height, away: 0, shown: 0,
    io: new IntersectionObserver(([e]) => { s.onScreen = e.isIntersecting; if (s.onScreen) kick(); }, { rootMargin: "60px 0px" }),
    ro: new ResizeObserver(([e]) => { s.cssW = e.contentRect.width; s.cssH = e.contentRect.height; kick(); }),
  };
  s.io.observe(view.canvas);
  s.ro.observe(view.canvas);
  slots.add(s);
  // шейдеры сцены компилируются заранее и в фоне, пока она ещё не на экране
  void ensure().compileAsync(view.scene, view.camera).catch(() => {});
  if (!listening) { listening = true; document.addEventListener("visibilitychange", kick); }
  kick();
  return () => {
    s.io.disconnect(); s.ro.disconnect(); slots.delete(s);
    if (live === s) { live = null; renderer?.domElement.remove(); }
    if (slots.size === 0 && renderer) {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      renderer.dispose(); renderer.forceContextLoss();
      renderer = null;
    }
  };
};
