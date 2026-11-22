import { BufferAttribute, BufferGeometry, Camera, DoubleSide, Mesh, Scene, ShaderMaterial, Vector2, Vector3 } from "three";
import { mountView, type ViewSize } from "@/three/stage";
import type { Box, Kind, Laid, LaidNode, Variant } from "@/lib/schemaLayout";

/**
 * Схема как макет: плоскость экрана — стекло, глаз стоит ниже центра окна (взгляд с юга и сверху,
 * как на макет страны в герое) и чуть смещается за курсором. Верх каждого узла лежит в плоскости
 * стекла, поэтому текст вёрстки на нём неподвижен и не наклонён, а объём дают срезы, уходящие
 * в глубину; при прокрутке и движении мыши они меняются сами.
 *
 * Четыре подачи одного языка — у каждого блока сайта своя:
 * — chain  (герой, путь заявки): отдельные плиты со срезом-горизонталями, между ними мосты;
 * — glass  («Что внутри»): чертёж — стеклянные короба из лаймовых рёбер на миллиметровке;
 * — stairs («Запуск за четыре шага»): лестница — тумбы растут к запуску и стоят на общем полу;
 * — strip  («Сделка без сотрудника»): лента — одна сплошная плита, шаги на ней — деления.
 * По мостам и кромкам бежит импульс заявки; узел, в который он вошёл, отзывается светом по срезу.
 */
const RADIUS = 16;                 // скругление карточки, px
const EYE = 1400;                  // расстояние глаза от стекла, px
const EYE_DROP = 1150;             // глаз стоит ниже центра окна
const FLOOR = 22;                  // от низа плиты до пола, на который падает тень, px
const SPEED = 250;                 // скорость импульса, px/с
const REST = 1.5;                  // пауза между рейсами, с
const KIND_ID: Record<Kind, number> = { main: 0, accent: 1, side: 2, ghost: 3 };
const DEPTH: Record<Kind, number> = { main: 46, accent: 60, side: 28, ghost: 40 };

const COMMON = /* glsl */ `
uniform vec2 uRes;
uniform vec3 uEye;
uniform float uBleed;
uniform float uT;
uniform float uG;
uniform float uHead;
uniform float uCycle;
uniform float uFirst;
uniform float uFloor;
uniform vec3 uPointer;
const vec3 LIME = vec3(0.714, 1.0, 0.102);
const vec3 FG = vec3(0.93, 0.95, 0.9);
const float SPEED = ${SPEED.toFixed(1)};
/* окно: точки в плоскости стекла (z = 0) неподвижны, точки в глубине сходятся к глазу */
vec4 proj(vec3 p) {
  vec2 s = p.xy + uBleed;
  s = uEye.xy + (s - uEye.xy) * (uEye.z / (uEye.z + p.z));
  return vec4(s.x / uRes.x * 2.0 - 1.0, 1.0 - s.y / uRes.y * 2.0, -0.98 + p.z * 0.0006, 1.0);
}
/* глубина, при которой точка с экранной высотой y встаёт на общий пол (лестница) */
float floorDepth(float y) {
  float k = clamp((uFloor + uBleed - uEye.y) / (y + uBleed - uEye.y), 0.2, 1.0);
  return uEye.z * (1.0 / k - 1.0);
}
/* секунд с момента, когда импульс прошёл точку маршрута; 99 — ещё не проходил */
float since(float at) {
  if (at < 0.0) return 99.0;
  float ds = uHead - at;
  if (ds < 0.0) { if (uFirst > 0.5) return 99.0; ds += uCycle; }
  return ds / SPEED;
}
/* хвост света за импульсом в точке маршрута at (px пути); -1 — вне маршрута */
float trail(float at) {
  if (at < 0.0) return 0.0;
  float dt = uHead - at;
  if (dt < 0.0) { if (uFirst > 0.5) return 0.0; dt += uCycle; }
  return exp(-dt / 120.0) * smoothstep(0.0, 4.0, dt);
}
/* прямоугольник со своим радиусом у каждого угла: r = (правый нижний, правый верхний, левый нижний, левый верхний) */
float sdBox(vec2 p, vec2 b, vec4 r) {
  r.xy = p.x > 0.0 ? r.xy : r.zw;
  r.x = p.y > 0.0 ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r.x;
}`;

/* общий вершинный шейдер прямоугольных слоёв: верх узла, свечение, тень, дно короба, пол */
const RECT_VERT = /* glsl */ `
attribute vec4 aRect;
attribute vec4 aMeta;
attribute vec4 aPath;
attribute vec4 aRad;
attribute vec2 aLook;
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec4 vRad;
varying vec2 vLook;
varying vec2 vS;
${COMMON}
void main() {
  vP = position.xy; vRect = aRect; vMeta = aMeta; vPath = aPath; vRad = aRad; vLook = aLook;
  gl_Position = proj(position);
  // та же точка в пикселях экрана (в координатах схемы)
  vS = (gl_Position.xy * vec2(0.5, -0.5) + 0.5) * uRes - uBleed;
}`;

const RECT_VARY = /* glsl */ `
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec4 vRad;
varying vec2 vLook;
varying vec2 vS;
${COMMON}`;

const ROOF_FRAG = /* glsl */ `
${RECT_VARY}
const vec3 MAIN = vec3(0.071, 0.075, 0.065);
const vec3 SIDE = vec3(0.108, 0.116, 0.1);
void main() {
  vec2 p = vP - vRect.xy;
  float sd = sdBox(p, vRect.zw, vRad);
  float aa = max(fwidth(sd), 1e-3);
  float kind = vMeta.x;
  bool glass = vLook.x > 0.5;
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float s = since(vMeta.y);
  float glow = exp(-s * 1.7);
  // свет заявки бежит по узлу от входа к выходу: run — насколько он уже прошёл эту точку
  vec2 across = vPath.zw - vPath.xy;
  float span = max(length(across), 1.0);
  float at = vMeta.y < 0.0 ? -1.0 : vMeta.y + clamp(dot(vP - vPath.xy, across / span), 0.0, span);
  float run = trail(at);
  // внутри — мягкое пятно вокруг импульса, без резкого фронта под текстом
  float body = at < 0.0 ? 0.0 : exp(-pow((uHead - at - 30.0) / 75.0, 2.0));
  vec2 dp = vP + uBleed - uPointer.xy;
  float spot = exp(-dot(dp, dp) / 30000.0) * uPointer.z;

  if (kind > 2.5) {
    // пустое место: пунктирный контур сверху и слабее в глубине; дно видно только из-под верха
    if (vMeta.w > 0.5 && sdBox(vS - vRect.xy, vRect.zw, vRad) < 1.0) discard;
    float line = 1.0 - smoothstep(0.55, 0.55 + aa, abs(sd + 0.8));
    float along = (vRect.z - abs(p.x)) < (vRect.w - abs(p.y)) ? p.y : p.x;
    float dash = smoothstep(0.0, 0.1, abs(fract(along / 9.0) - 0.5) - 0.2);
    float a = line * dash * mix(0.32, 0.1, vMeta.w) * appear * (1.0 + spot * 1.5);
    if (a < 0.004) discard;
    gl_FragColor = vec4(FG * a, a);
    return;
  }
  if (vMeta.w > 0.5) {
    // дно стеклянного короба: сплошной тонкий контур, виден только из-под верха
    if (sdBox(vS - vRect.xy, vRect.zw, vRad) < 1.0) discard;
    float line = 1.0 - smoothstep(0.5, 0.5 + aa, abs(sd + 0.7));
    float a = line * (0.2 + glow * 0.3) * appear;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(FG, LIME, 0.6) * a, a);
    return;
  }
  if (sd > aa) discard;
  float inside = 1.0 - smoothstep(-aa, aa, sd);
  float rim = 1.0 - smoothstep(0.5, 0.5 + aa * 1.2, abs(sd + 0.9));
  float rr = length(vP - vPath.xy);
  float wave = exp(-pow((rr - s * 380.0) / 26.0, 2.0)) * exp(-s * 1.5);
  float top = clamp(0.5 - p.y / (vRect.w * 2.0), 0.0, 1.0);
  // деление ленты: тонкая черта по левому краю шага
  float cut = vLook.y > 0.5 ? 1.0 - smoothstep(0.4, 1.3, abs(p.x + vRect.z - 0.5)) : 0.0;
  vec3 col; float a = inside;
  if (kind > 0.5 && kind < 1.5) {
    col = LIME * (0.96 + 0.04 * top);
    col = mix(col, vec3(1.0), clamp(wave * 0.26 + body * 0.14 + rim * (0.2 + glow * 0.3 + run * 0.6), 0.0, 1.0));
  } else if (glass) {
    // чертёж: затемнённое стекло и лаймовый контур вместо сплошной плиты
    col = MAIN * 0.85 + LIME * (wave * 0.1 + body * 0.06 + glow * 0.03 + spot * 0.03);
    a = inside * (kind > 1.5 ? 0.42 : 0.6);
    float edge = clamp((kind > 1.5 ? 0.3 : 0.5) + glow * 0.3 + run * 0.6 + spot * 0.35, 0.0, 1.0);
    col = mix(col, mix(FG, LIME, clamp(0.62 + run + glow, 0.0, 1.0)), rim * edge);
    a = max(a, rim * edge * inside);
  } else {
    col = (kind > 1.5 ? SIDE : MAIN) + vec3(0.012) * top;
    col += LIME * (wave * 0.1 + body * 0.055 + glow * 0.03 + spot * 0.03);
    col = mix(col, mix(FG, LIME, clamp(0.3 + glow + run + spot, 0.0, 1.0)), rim * clamp(0.16 + glow * 0.3 + run * 0.85 + spot * 0.4, 0.0, 1.0));
    col = mix(col, mix(FG, LIME, clamp(0.5 + run, 0.0, 1.0)), cut * clamp(0.22 + run * 0.7 + glow * 0.3, 0.0, 1.0));
  }
  a *= appear;
  gl_FragColor = vec4(col * a, a);
}`;

const HALO_FRAG = /* glsl */ `
${RECT_VARY}
void main() {
  // свечение вокруг итогового узла: ярче в момент, когда заявка дошла
  float sd = sdBox(vP - vRect.xy, vRect.zw, vRad);
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float glow = exp(-since(vMeta.y) * 1.3);
  float a = exp(-max(sd, 0.0) / 15.0) * (0.13 + glow * 0.3) * appear;
  gl_FragColor = vec4(LIME * a, a);
}`;

const SHADOW_FRAG = /* glsl */ `
${RECT_VARY}
void main() {
  // пол под плитой: мягкая тень, под итоговым узлом — лужица света
  float sd = sdBox(vP - vRect.xy, vRect.zw, vRad);
  float appear = smoothstep(0.0, 1.0, clamp((uG - vMeta.z - 0.2) / 0.9, 0.0, 1.0));
  float soft = 1.0 - smoothstep(-16.0, 20.0, sd);
  if (vMeta.x > 0.5 && vMeta.x < 1.5) {
    float a = soft * (0.07 + exp(-since(vMeta.y) * 1.3) * 0.14) * appear;
    gl_FragColor = vec4(LIME * a, a);
  } else {
    float a = soft * 0.42 * appear;
    gl_FragColor = vec4(vec3(0.0), a);
  }
}`;

/* пол: миллиметровка под чертежом (aLook.x = 1) или линия земли под лестницей (aLook.x = 2) */
const GROUND_FRAG = /* glsl */ `
${RECT_VARY}
void main() {
  float show = smoothstep(0.0, 1.0, clamp(uG / 1.1, 0.0, 1.0));
  vec2 q = (vP - vRect.xy) / vRect.zw;
  if (vLook.x > 1.5) {
    // земля: тонкая линия и тень под ней, к краям растворяется
    float y = vP.y - (vRect.y - vRect.w);
    float line = 1.0 - smoothstep(0.4, 1.2, abs(y - 0.5));
    float shade = smoothstep(0.0, 2.0, y) * (1.0 - smoothstep(2.0, vRect.w * 2.0, y)) * 0.42;
    float ends = 1.0 - smoothstep(0.78, 1.0, abs(q.x));
    float lit = line * 0.26 * ends * show;
    gl_FragColor = vec4(mix(FG, LIME, 0.5) * lit, max(lit, shade * ends * show));
    return;
  }
  vec2 g = vP / 26.0;
  vec2 l = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-5));
  float fine = 1.0 - smoothstep(0.4, 1.3, min(l.x, l.y));
  vec2 g5 = vP / 130.0;
  vec2 l5 = abs(fract(g5 - 0.5) - 0.5) / max(fwidth(g5), vec2(1e-5));
  float bold = 1.0 - smoothstep(0.5, 1.5, min(l5.x, l5.y));
  float fade = 1.0 - smoothstep(0.45, 1.0, length(q));
  // к краю холста сетка растворяется, чтобы не было видно обреза
  vec2 sc = vS + uBleed;
  fade *= smoothstep(0.0, 48.0, min(min(sc.x, uRes.x - sc.x), min(sc.y, uRes.y - sc.y)));
  float a = (fine * 0.06 + bold * 0.07) * fade * show;
  gl_FragColor = vec4(LIME * a, a);
}`;

const WALL_VERT = /* glsl */ `
attribute vec4 aWall;
attribute vec4 aMeta;
attribute vec4 aPath;
attribute float aBase;
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec2 vXY;
varying vec4 vMeta;
varying float vAt;
${COMMON}
void main() {
  // срез вырастает в глубину вслед за появлением верха; на лестнице — до общего пола
  float g = clamp((uG - aMeta.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  float full = aBase >= 0.0 ? floorDepth(aBase) : aWall.y;
  vDepth = aWall.x * full * g;
  vDn = aWall.x; vN = aWall.zw; vMeta = aMeta; vXY = position.xy;
  vec2 across = aPath.zw - aPath.xy;
  float span = max(length(across), 1.0);
  vAt = aMeta.y < 0.0 ? -1.0 : aMeta.y + clamp(dot(position.xy - aPath.xy, across / span), 0.0, span);
  gl_Position = proj(vec3(position.xy, vDepth));
}`;

const WALL_FRAG = /* glsl */ `
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec2 vXY;
varying vec4 vMeta;
varying float vAt;
${COMMON}
void main() {
  float kind = vMeta.x;
  // срез плиты: горизонтали через равный шаг глубины, свет гаснет вниз
  float f = vDepth / 8.0;
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float line = (1.0 - smoothstep(0.4, 1.2, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  float fade = 1.0 - vDn;
  float light = 0.7 + 0.3 * dot(normalize(vN), normalize(vec2(-0.5, 0.86)));
  float s = since(vAt);
  float wave = exp(-pow((vDn - s * 1.9) * 3.2, 2.0)) * exp(-s * 0.9);
  vec3 base = kind > 0.5 && kind < 1.5 ? vec3(0.2, 0.29, 0.04) : kind > 1.5 ? vec3(0.062, 0.068, 0.058) : vec3(0.04, 0.05, 0.036);
  vec3 col = base * (0.6 + 0.4 * fade) * light;
  float lit = (0.2 + 0.5 * fade) * light + wave * 0.9;
  col = mix(col, LIME, clamp(line * lit, 0.0, 1.0));
  col += LIME * wave * 0.07;
  // кромки сглаживает шейдер: нижнюю — по глубине, боковую — по повороту стенки от глаза
  float a = 1.0 - smoothstep(1.0 - fwidth(vDn) * 1.5, 1.0, vDn);
  a *= smoothstep(0.0, 0.07, dot(normalize(vN), normalize(uEye.xy - vXY - uBleed)));
  if (a < 0.02) discard;
  gl_FragColor = vec4(col * a, a);
}`;

const BRIDGE_VERT = /* glsl */ `
attribute float aSide;
attribute vec4 aRoute;
attribute float aBorn;
varying float vSide;
varying vec4 vRoute;
varying float vBorn;
${COMMON}
void main() {
  vSide = aSide; vRoute = aRoute; vBorn = aBorn;
  gl_Position = proj(position);
}`;

const BRIDGE_HALF = 9;
const BRIDGE_FRAG = /* glsl */ `
varying float vSide;
varying vec4 vRoute;
varying float vBorn;
${COMMON}
void main() {
  float x = abs(vSide) * ${BRIDGE_HALF.toFixed(1)};
  float core = 1.0 - smoothstep(0.55, 1.45, x);
  float halo = exp(-x * x / 13.0);
  // мост прорастает от своего узла
  float rev = clamp((uG - vBorn - 0.25) / 0.55, 0.0, 1.0);
  float shown = 1.0 - smoothstep(rev * vRoute.z - 5.0, rev * vRoute.z + 0.01, vRoute.y);
  float a; vec3 col;
  if (vRoute.w > 0.5) {
    a = core * step(0.45, fract(vRoute.y / 9.0)) * 0.3;
    col = FG;
  } else {
    float comet = trail(vRoute.x), head = 0.0;
    if (vRoute.x >= 0.0) { float dt = uHead - vRoute.x; if (dt > 0.0) head = exp(-dt * dt / 140.0); }
    a = core * (0.5 + comet * 0.5) + halo * (0.05 + comet * 0.5 + head * 0.5);
    col = mix(LIME, vec3(1.0), clamp(comet * core * 0.7 + head * 0.5, 0.0, 1.0));
  }
  a *= shown;
  if (a < 0.003) discard;
  gl_FragColor = vec4(col * a, a);
}`;

const POST_VERT = /* glsl */ `
attribute vec3 aOther;
attribute vec4 aPost;
varying float vV;
varying float vSide;
varying vec2 vBornStyle;
${COMMON}
void main() {
  // тонкая стойка короба: лента экранной ширины вдоль ребра, уходящего в глубину
  float g = clamp((uG - aPost.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vec4 a = proj(vec3(position.xy, position.z * g));
  vec4 b = proj(vec3(aOther.xy, aOther.z * g));
  vec2 dir = (b.xy - a.xy) * uRes;
  dir = length(dir) > 1e-4 ? normalize(dir) : vec2(0.0, 1.0);
  if (aPost.y > 0.5) dir = -dir;
  a.xy += vec2(-dir.y, dir.x) * aPost.x * 1.6 / uRes;
  vV = aPost.y; vSide = aPost.x; vBornStyle = aPost.zw;
  gl_Position = a;
}`;

const POST_FRAG = /* glsl */ `
varying float vV;
varying float vSide;
varying vec2 vBornStyle;
${COMMON}
void main() {
  float appear = smoothstep(0.0, 1.0, clamp((uT - vBornStyle.x) / 0.6, 0.0, 1.0));
  float core = 1.0 - smoothstep(0.3, 1.0, abs(vSide));
  // пунктир у пустого узла, сплошная лаймовая стойка у стеклянного короба
  bool solid = vBornStyle.y > 0.5;
  float a = core * (solid ? mix(0.42, 0.14, vV) : step(0.45, fract(vV * 7.0)) * mix(0.3, 0.06, vV)) * appear;
  if (a < 0.004) discard;
  gl_FragColor = vec4((solid ? mix(FG, LIME, 0.6) : FG) * a, a);
}`;

type Buf = { pos: number[]; idx: number[]; [k: string]: number[] };
type Radii = [number, number, number, number];   // левый верхний, правый верхний, правый нижний, левый нижний

/**
 * Точки скруглённого прямоугольника по часовой стрелке с наружными нормалями.
 * cuts — x-координаты делений на нижней кромке (лента): в каждом стоят две точки вплотную,
 * чтобы цвет и свет среза менялись ровно на границе шагов, а не плавно через всю плиту.
 */
const outline = ({ x, y, w, h }: Box, [tl, tr, br, bl]: Radii, cuts: number[] = []) => {
  const out: [number, number, number, number][] = [];
  const corners: [number, number, number, number][] = [
    [x + w - tr, y + tr, -Math.PI / 2, tr], [x + w - br, y + h - br, 0, br], [x + bl, y + h - bl, Math.PI / 2, bl], [x + tl, y + tl, Math.PI, tl],
  ];
  corners.forEach(([cx, cy, a0, r], c) => {
    for (let i = 0; i <= 7; i++) {
      const a = a0 + (i / 7) * (Math.PI / 2);
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]);
    }
    // после правого нижнего угла нижняя кромка идёт справа налево
    if (c === 1) for (const cut of [...cuts].sort((p, q) => q - p)) out.push([cut + 0.6, y + h, 0, 1], [cut - 0.6, y + h, 0, 1]);
  });
  return out;
};

const rectBuf = (): Buf => ({ pos: [], idx: [], rect: [], meta: [], path: [], rad: [], look: [] });

const build = (l: Laid, variant: Variant) => {
  const roof = rectBuf(), halo = rectBuf(), shadow = rectBuf(), ground = rectBuf();
  const wall: Buf = { pos: [], idx: [], wall: [], meta: [], path: [], base: [] };
  const bridge: Buf = { pos: [], idx: [], side: [], route: [], born: [] };
  const post: Buf = { pos: [], idx: [], other: [], post: [] };
  // в столбике (телефон) плиты тоньше, а лестница и лента раскладываются обычной цепочкой
  const thin = l.wide ? 1 : 0.42;
  const mode: Variant = l.wide || variant === "glass" ? variant : "chain";
  const born = (n: LaidNode) => n.index * 0.07;
  const full = (b: Box): Radii => { const r = Math.min(RADIUS, b.w / 2, b.h / 2); return [r, r, r, r]; };

  /** прямоугольный слой: верх узла, свечение, тень, дно короба, пол */
  const quad = (b: Buf, n: LaidNode, box: Box, rad: Radii, pad: number, z: number, level: number, look: [number, number]) => {
    const { x, y, w, h } = box, base = b.pos.length / 3;
    for (const [px, py] of [[x - pad, y - pad], [x + w + pad, y - pad], [x - pad, y + h + pad], [x + w + pad, y + h + pad]]) {
      b.pos.push(px, py, z);
      b.rect.push(x + w / 2, y + h / 2, w / 2, h / 2);
      b.meta.push(KIND_ID[n.kind], n.hit, born(n), level);
      b.path.push(n.from[0], n.from[1], n.to[0], n.to[1]);
      b.rad.push(rad[2], rad[1], rad[3], rad[0]);
      b.look.push(look[0], look[1]);
    }
    b.idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  };
  /** срез: стенка по контуру от верха до глубины depth (или до пола лестницы); owner — чьим светом светится точка */
  const walls = (box: Box, rad: Radii, depth: number, owner: (x: number) => LaidNode, toFloor: boolean, cuts: number[] = []) => {
    const ring = outline(box, rad, cuts), base = wall.pos.length / 3;
    ring.forEach(([px, py, nx, ny], i) => {
      const n = owner(px);
      for (const dn of [0, 1]) {
        wall.pos.push(px, py, 0);
        wall.wall.push(dn, depth, nx, ny);
        wall.meta.push(KIND_ID[n.kind], n.hit, born(n), 0);
        wall.path.push(n.from[0], n.from[1], n.to[0], n.to[1]);
        wall.base.push(toFloor ? box.y + box.h : -1);
      }
      const a = base + i * 2, b = base + ((i + 1) % ring.length) * 2;
      wall.idx.push(a, a + 1, b, b, a + 1, b + 1);
    });
  };
  /** стойки короба по четырём углам */
  const posts = (n: LaidNode, depth: number, solid: boolean) => {
    const { x, y, w, h } = n.box, k = Math.min(RADIUS, w / 2, h / 2) * (1 - Math.SQRT1_2);
    for (const [cx, cy] of [[x + k, y + k], [x + w - k, y + k], [x + w - k, y + h - k], [x + k, y + h - k]]) {
      const base = post.pos.length / 3;
      for (const [v, side] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
        post.pos.push(cx, cy, v ? depth : 0);
        post.other.push(cx, cy, v ? 0 : depth);
        post.post.push(side, v, born(n), solid ? 1 : 0);
      }
      post.idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
    }
  };

  // лента: шаги маршрута стоят вплотную и образуют одну плиту
  const cells = mode === "strip" ? l.nodes.filter((n) => n.hit >= 0).sort((a, b) => a.hit - b.hit) : [];
  if (cells.length > 1) {
    const first = cells[0], last = cells[cells.length - 1];
    const y0 = Math.min(...cells.map((c) => c.box.y)), y1 = Math.max(...cells.map((c) => c.box.y + c.box.h));
    const whole: Box = { x: first.box.x, y: y0, w: last.box.x + last.box.w - first.box.x, h: y1 - y0 };
    const r = Math.min(RADIUS, whole.h / 2), depth = DEPTH.accent * thin;
    const owner = (x: number) => cells.find((c) => x <= c.box.x + c.box.w) ?? last;
    quad(shadow, first, whole, [r, r, r, r], 40, depth + FLOOR, 0, [0, 0]);
    walls(whole, [r, r, r, r], depth, owner, false, cells.slice(1).map((c) => c.box.x));
    cells.forEach((c, i) => {
      const rad: Radii = [i === 0 ? r : 0, c === last ? r : 0, c === last ? r : 0, i === 0 ? r : 0];
      const box: Box = { x: c.box.x, y: y0, w: c.box.w, h: y1 - y0 };
      quad(roof, c, box, rad, 3, 0, 0, [0, i > 0 && c.kind !== "accent" ? 1 : 0]);
      if (c.kind === "accent") quad(halo, c, box, rad, 56, 0, 0, [0, 0]);
    });
  }

  for (const n of l.nodes) {
    if (cells.length > 1 && cells.includes(n)) continue;
    const depth = DEPTH[n.kind] * thin, rad = full(n.box);
    if (n.kind === "ghost") {
      quad(roof, n, n.box, rad, 3, 0, 0, [0, 0]);
      quad(roof, n, n.box, rad, 3, depth, 1, [0, 0]);
      posts(n, depth, false);
      continue;
    }
    if (mode === "glass" && n.kind !== "accent") {
      // чертёж: стеклянный короб — верх, дно и стойки, без сплошного среза
      quad(roof, n, n.box, rad, 3, 0, 0, [1, 0]);
      quad(roof, n, n.box, rad, 3, depth, 1, [1, 0]);
      posts(n, depth, true);
      continue;
    }
    const stairs = mode === "stairs";
    quad(roof, n, n.box, rad, 3, 0, 0, [0, 0]);
    if (n.kind === "accent") quad(halo, n, n.box, rad, 56, 0, 0, [0, 0]);
    if (!stairs) quad(shadow, n, n.box, rad, 40, depth + FLOOR * thin, 0, [0, 0]);
    walls(n.box, rad, depth, () => n, stairs);
  }

  // пол: миллиметровка под чертежом, линия земли под лестницей
  if (l.nodes.length && (mode === "glass" || mode === "stairs")) {
    const x0 = Math.min(...l.nodes.map((n) => n.box.x)), x1 = Math.max(...l.nodes.map((n) => n.box.x + n.box.w));
    const y0 = Math.min(...l.nodes.map((n) => n.box.y)), y1 = Math.max(...l.nodes.map((n) => n.box.y + n.box.h));
    const anchor = l.nodes[0];
    if (mode === "glass") quad(ground, anchor, { x: x0 - 150, y: y0 - 130, w: x1 - x0 + 300, h: y1 - y0 + 260 }, [0, 0, 0, 0], 0, DEPTH.main * thin, 0, [1, 0]);
    else quad(ground, anchor, { x: x0 - 70, y: l.h, w: x1 - x0 + 140, h: 28 }, [0, 0, 0, 0], 0, 0, 0, [2, 0]);
  }

  // мосты: на лестнице и внутри ленты шаги стоят вплотную — свет переходит без моста
  for (const e of l.edges) {
    const pts = e.pts;
    if (pts.length < 2 || (mode === "stairs" && !e.dashed)) continue;
    let len = 0;
    const at: number[] = [0];
    for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); at.push(len); }
    if (len < 2) continue;
    const base = bridge.pos.length / 3, bornAt = e.after * 0.07;
    pts.forEach(([px, py], i) => {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
      const tl = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, nx = -(p1[1] - p0[1]) / tl, ny = (p1[0] - p0[0]) / tl;
      for (const s of [-1, 1]) {
        bridge.pos.push(px + nx * s * BRIDGE_HALF, py + ny * s * BRIDGE_HALF, 1);
        bridge.side.push(s);
        bridge.route.push(e.s0 >= 0 ? e.s0 + at[i] : -1, at[i], len, e.dashed ? 1 : 0);
        bridge.born.push(bornAt);
      }
      if (i < pts.length - 1) { const a = base + i * 2; bridge.idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
    });
  }
  return { roof, halo, shadow, ground, wall, bridge, post, floor: mode === "stairs" ? l.h : -1 };
};

const geometry = (b: Buf, attrs: Record<string, [string, number]>) => {
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(b.pos), 3));
  for (const [key, [name, size]] of Object.entries(attrs)) g.setAttribute(name, new BufferAttribute(new Float32Array(b[key]), size));
  g.setIndex(b.idx);
  return g;
};

export type Towers = {
  /** новая раскладка: узлы переехали или сменился размер */
  update: (l: Laid) => void;
  /** схема на экране уже elapsed секунд (ноль, если только что вышла) */
  start: (elapsed: number) => void;
  dispose: () => void;
};

export const mountTowers = (canvas: HTMLCanvasElement, bleed: number, variant: Variant): Towers => {
  const scene = new Scene(), camera = new Camera();
  const uniforms = {
    uRes: { value: new Vector2(1, 1) }, uEye: { value: new Vector3(0, 0, EYE) }, uBleed: { value: bleed },
    uT: { value: -10 }, uG: { value: -10 }, uHead: { value: -1e5 }, uCycle: { value: 1 }, uFirst: { value: 1 },
    uFloor: { value: -1 }, uPointer: { value: new Vector3(-9999, -9999, 0) },
  };
  const material = (vertexShader: string, fragmentShader: string, depthWrite: boolean, depthTest = true) =>
    new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, premultipliedAlpha: true, side: DoubleSide, depthWrite, depthTest });
  const mats = {
    ground: material(RECT_VERT, GROUND_FRAG, false, false),
    shadow: material(RECT_VERT, SHADOW_FRAG, false, false),
    halo: material(RECT_VERT, HALO_FRAG, false, false),
    wall: material(WALL_VERT, WALL_FRAG, true),
    roof: material(RECT_VERT, ROOF_FRAG, true),
    bridge: material(BRIDGE_VERT, BRIDGE_FRAG, false),
    post: material(POST_VERT, POST_FRAG, false),
  };
  let meshes: Mesh[] = [];
  let routeLen = 0, nodeCount = 0;

  const update = (l: Laid) => {
    for (const m of meshes) { scene.remove(m); m.geometry.dispose(); }
    const b = build(l, variant);
    const rect: Record<string, [string, number]> = { rect: ["aRect", 4], meta: ["aMeta", 4], path: ["aPath", 4], rad: ["aRad", 4], look: ["aLook", 2] };
    const parts: [Buf, ShaderMaterial, Record<string, [string, number]>][] = [
      [b.ground, mats.ground, rect],
      [b.shadow, mats.shadow, rect],
      [b.halo, mats.halo, rect],
      [b.wall, mats.wall, { wall: ["aWall", 4], meta: ["aMeta", 4], path: ["aPath", 4], base: ["aBase", 1] }],
      [b.roof, mats.roof, rect],
      [b.bridge, mats.bridge, { side: ["aSide", 1], route: ["aRoute", 4], born: ["aBorn", 1] }],
      [b.post, mats.post, { other: ["aOther", 3], post: ["aPost", 4] }],
    ];
    meshes = [];
    parts.forEach(([buf, mat, attrs], order) => {
      if (!buf.idx.length) return;
      const m = new Mesh(geometry(buf, attrs), mat);
      m.frustumCulled = false; m.renderOrder = order;
      scene.add(m); meshes.push(m);
    });
    routeLen = l.routeLen; nodeCount = l.nodes.length;
    uniforms.uFloor.value = b.floor;
    uniforms.uCycle.value = Math.max(1, routeLen + REST * SPEED);
  };

  // глаз чуть уходит за курсором; на тач-экранах остаётся на месте
  const ptr = { x: 0, y: 0, seen: false, on: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.seen = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  // t0 — когда схема вышла на экран (верх узлов проявляется вместе с текстом вёрстки),
  // g0 — когда сцена начала строиться: позже t0, если three.js догружался на глазах
  let t0 = -1, g0 = -1, ox = 0, oy = 0;
  let pending: number | null = null;
  const frame = (t: number, dt: number, size: ViewSize) => {
    if (pending !== null) { t0 = t - pending; g0 = t; pending = null; }
    uniforms.uRes.value.set(size.cssW, size.cssH);
    const b = canvas.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    const k = 1 - Math.exp(-dt * 4);
    ox += ((ptr.seen ? (ptr.x - vw / 2) * 1.2 : 0) - ox) * k;
    oy += ((ptr.seen ? (ptr.y - vh / 2) * 1.2 : 0) - oy) * k;
    uniforms.uEye.value.set(vw / 2 - b.left + ox, vh / 2 - b.top + EYE_DROP + oy, EYE);
    const px = ptr.x - b.left, py = ptr.y - b.top;
    const near = ptr.seen && px > -80 && py > -80 && px < b.width + 80 && py < b.height + 80 ? 1 : 0;
    ptr.on += (near - ptr.on) * (1 - Math.exp(-dt * 6));
    uniforms.uPointer.value.set(px, py, ptr.on);

    if (t0 < 0) return;
    uniforms.uT.value = t - t0;
    const age = t - g0;
    uniforms.uG.value = age;
    // первый рейс — когда схема достроилась
    const run = age - (1.0 + nodeCount * 0.07);
    if (run < 0 || routeLen <= 0) { uniforms.uHead.value = -1e5; uniforms.uFirst.value = 1; return; }
    const cycle = uniforms.uCycle.value, travelled = run * SPEED;
    uniforms.uHead.value = travelled % cycle;
    uniforms.uFirst.value = travelled < cycle ? 1 : 0;
  };

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const unmount = mountView({ canvas, scene, camera, maxDpr: coarse ? 1.75 : 1.5, frame });

  return {
    update,
    start: (elapsed) => { if (t0 < 0 && pending === null) pending = elapsed; },
    dispose: () => {
      unmount();
      window.removeEventListener("pointermove", onMove);
      for (const m of meshes) m.geometry.dispose();
      for (const m of Object.values(mats)) m.dispose();
    },
  };
};
