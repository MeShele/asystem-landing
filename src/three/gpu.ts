/**
 * Слабые видеочипы. Объёмные сцены сайта — физически точный металл со светом и тенью; на бюджетных
 * мобильных чипах (PowerVR, старые Mali и Adreno) и на программной отрисовке один такой кадр считается
 * дольше, чем длится сам кадр, и прокрутка всей страницы начинает запинаться.
 *
 * Для них есть «неподвижный» режим: каждая сцена рисуется один раз в готовом виде и остаётся картинкой;
 * перерисовка — только по делу (выбрана другая строка, изменился размер). Режим включается двумя путями:
 * сразу — по названию видеочипа, и на ходу — если регулятор нагрузки (pace.ts) видит, что кадры
 * безнадёжно не успевают на любом чипе.
 * Проверить вручную: ?gpu=lite (включить) и ?gpu=full (не включать по названию чипа).
 */
const WEAK = /PowerVR|SGX|Rogue|GE8\d{3}|Mali-4\d\d|Mali-T\d{3}|Adreno \(TM\) [3-5]0\d|VideoCore|Vivante|SwiftShader|llvmpipe|Software/i;

let still: boolean | null = null;
const subs = new Set<() => void>();

const probe = (): boolean => {
  try {
    const force = new URLSearchParams(location.search).get("gpu");
    if (force === "lite") return true;
    if (force === "full") return false;
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const o = { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: "low-power" } as const;
    const gl = (c.getContext("webgl2", o) ?? c.getContext("webgl", o)) as WebGLRenderingContext | null;
    if (!gl) return false;                      // WebGL нет вовсе: сцены и так не включатся
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return WEAK.test(name);
  } catch {
    return false;
  }
};

const mark = () => { document.documentElement.dataset.gpu = still ? "lite" : "full"; };

/** неподвижный режим включён: сцены рисуются по одному кадру */
export const isStill = (): boolean => {
  if (still === null) { still = probe(); mark(); }
  return still;
};

/** то же, но без пробы видеочипа: пока она не сделана — false (для чтения во время рендера React) */
export const peekStill = (): boolean => still === true;

/** включить неподвижный режим на ходу — когда кадры безнадёжно не успевают */
export const goStill = () => {
  if (isStill()) return;
  still = true;
  mark();
  for (const f of subs) f();
};

export const onStill = (f: () => void): (() => void) => { subs.add(f); return () => { subs.delete(f); }; };
