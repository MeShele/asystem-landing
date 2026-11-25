import { Mesh, NeutralToneMapping, PCFShadowMap, PMREMGenerator, WebGLRenderer, type Camera, type Material, type Object3D, type Scene, type Texture } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { isStill, onStill } from "@/three/gpu";
import { every, scale, tick } from "@/three/pace";

/**
 * Одна живая сцена на страницу. Большие 3D-сцены сайта (карта, щит, запуск, механизм)
 * делят один WebGL-холст: он переезжает в ту сцену, которая сейчас занимает больше всего экрана,
 * и рисует её напрямую, без копирования кадра. Остальные сцены показывают свой последний кадр
 * обычной картинкой и ничего не стоят; у ушедших с экрана освобождается память видеокарты.
 * Так нагрузка не растёт с числом сцен на странице: в любой момент считается ровно одна.
 *
 * На слабых видеочипах (gpu.ts) живых сцен нет вовсе: каждая рисуется один раз в готовом виде
 * и остаётся картинкой на своём холсте; перерисовка — по запросу сцены (redraw) и при смене размера.
 */
export type LiveSize = { w: number; h: number; cssW: number; cssH: number; dpr: number; /** неподвижный режим: кадр один, движения нет */ still: boolean };

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
type Slot = LiveView & {
  ctx: CanvasRenderingContext2D; onScreen: boolean; cssW: number; cssH: number; away: number; shown: number; io: IntersectionObserver; ro: ResizeObserver;
  /** неподвижный режим: кадр надо нарисовать заново; clock — время сцены, оно идёт только на перерисовках */
  dirty: boolean; clock: number;
};
/** столько секунд сцена держит холст, чтобы доиграть вход, прежде чем уступить его непоказанной соседке */
const MIN_SHOW = 2.6;

let renderer: WebGLRenderer | null = null;
let live: Slot | null = null, liveW = 0, liveH = 0;
const slots = new Set<Slot>();
let raf = 0, last = 0, count = 0;

const ensure = () => {
  if (renderer) return renderer;
  // аппаратное сглаживание включено всегда: без него тонкие кромки на плотном экране лесенкой;
  // слабому видеочипу оно не по силам, как и тени, — там их нет
  const lite = isStill();
  const r = new WebGLRenderer({ antialias: !lite, alpha: true, premultipliedAlpha: true, powerPreference: lite ? "default" : "high-performance" });
  r.setPixelRatio(1);
  r.setClearColor(0x000000, 0);
  // студийный рендер макетов: тени и тональная кривая, которая не выбеливает насыщенный лайм
  // (киношная ACES делала его бледно-жёлтым); свои шейдеры (карта, пыль) этим не пользуются
  r.shadowMap.enabled = !lite;
  r.shadowMap.type = PCFShadowMap;
  r.toneMapping = NeutralToneMapping;
  r.toneMappingExposure = 1;
  r.debug.checkShaderErrors = import.meta.env.DEV;
  r.domElement.setAttribute("aria-hidden", "true");
  renderer = r;
  return r;
};

let env: Texture | null = null;
/** общее студийное окружение для отражений и мягкого света: строится один раз на рендерер */
export const studioEnv = (): Texture => {
  if (!env) {
    const p = new PMREMGenerator(ensure());
    env = p.fromScene(new RoomEnvironment(), 0.035).texture;
    p.dispose();
  }
  return env;
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
  s.dirty = false;
};

/** столько шагов сцена «проживает» перед неподвижным кадром: вход доигран, плавные величины дошли до места */
const SETTLE = 48, SETTLE_DT = 0.05;

/** неподвижный режим: сцена доводится до готового вида без отрисовки, рисуется один раз и копируется на свой холст */
const paint = (r: WebGLRenderer, s: Slot) => {
  if (!s.canvas.isConnected) return;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, s.maxDpr));
  const w = Math.max(1, Math.round(s.cssW * dpr)), h = Math.max(1, Math.round(s.cssH * dpr));
  r.setSize(w, h, false);
  const size: LiveSize = { w, h, cssW: s.cssW, cssH: s.cssH, dpr, still: true };
  // первый вызов задаёт сцене начало отсчёта, дальше её время сразу далеко за концом входа
  if (s.clock === 0) { s.clock = performance.now() / 1000; s.frame(s.clock, SETTLE_DT, size); s.clock += 40; }
  for (let k = 0; k < SETTLE; k++) s.frame((s.clock += SETTLE_DT), SETTLE_DT, size);
  r.setViewport(0, 0, w, h);
  r.clear();
  r.render(s.scene, s.camera);
  s.canvas.width = w; s.canvas.height = h;
  s.ctx.drawImage(r.domElement, 0, 0);
  s.canvas.style.visibility = "";
  s.shown += 1;
  s.post?.();
};

/** неподвижный режим: за кадр рисуется не больше одной сцены из тех, что на экране и ждут перерисовки */
const stillLoop = () => {
  const r = ensure();
  if (live) {
    if (slots.has(live)) freeze(r, live);
    live = null; liveW = 0; liveH = 0;
    r.domElement.remove();
  }
  let done = false, pending = false;
  for (const s of slots) {
    if (!s.dirty || !s.onScreen || s.cssW < 2 || s.cssH < 2) continue;
    if (done) { pending = true; continue; }
    paint(r, s);
    s.dirty = false; done = true;
  }
  if (pending && !document.hidden) raf = requestAnimationFrame(loop);
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
  if (isStill()) { last = 0; stillLoop(); return; }
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
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, live.maxDpr) * scale());
      const w = Math.max(1, Math.round(live.cssW * dpr)), h = Math.max(1, Math.round(live.cssH * dpr));
      if (w !== liveW || h !== liveH) { liveW = w; liveH = h; r.setSize(w, h, false); }
      const dt = Math.min(0.05, (delta / 1000) * step);
      live.shown += dt;
      live.frame(t, dt, { w, h, cssW: live.cssW, cssH: live.cssH, dpr, still: false });
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

/** Сцена изменилась по делу (выбрана другая строка): в неподвижном режиме её кадр рисуется заново. */
export const redraw = (canvas: HTMLCanvasElement) => {
  for (const s of slots) if (s.canvas === canvas) { s.dirty = true; if (isStill()) kick(); }
};

/** Подключает сцену; возвращает функцию отключения. */
export const mountLive = (view: LiveView): (() => void) => {
  const ctx = view.canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ensure();
  const rect = view.canvas.getBoundingClientRect();
  const s: Slot = {
    ...view, ctx, onScreen: false, cssW: rect.width, cssH: rect.height, away: 0, shown: 0, dirty: true, clock: 0,
    io: new IntersectionObserver(([e]) => { s.onScreen = e.isIntersecting; if (s.onScreen) kick(); }, { rootMargin: "60px 0px" }),
    ro: new ResizeObserver(([e]) => {
      const w = e.contentRect.width, h = e.contentRect.height;
      if (Math.abs(w - s.cssW) > 0.5 || Math.abs(h - s.cssH) > 0.5) s.dirty = true;
      s.cssW = w; s.cssH = h; kick();
    }),
  };
  s.io.observe(view.canvas);
  s.ro.observe(view.canvas);
  slots.add(s);
  // шейдеры сцены компилируются заранее и в фоне, пока она ещё не на экране
  void ensure().compileAsync(view.scene, view.camera).catch(() => {});
  if (!listening) {
    listening = true;
    document.addEventListener("visibilitychange", kick);
    // режим могли включить на ходу: живая сцена замирает на своём кадре, непоказанные дорисуются по одной
    onStill(kick);
    // окружение для отражений — тяжёлая разовая работа: делаем её в простое, пока посетитель читает первый экран
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
    if (idle) idle(() => { if (renderer) studioEnv(); }, { timeout: 5000 }); else setTimeout(() => { if (renderer) studioEnv(); }, 2500);
  }
  kick();
  return () => {
    s.io.disconnect(); s.ro.disconnect(); slots.delete(s);
    if (live === s) { live = null; renderer?.domElement.remove(); }
    if (slots.size === 0 && renderer) {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      env?.dispose(); env = null;
      renderer.dispose(); renderer.forceContextLoss();
      renderer = null;
    }
  };
};
