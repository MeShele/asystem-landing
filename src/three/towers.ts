import { BufferAttribute, BufferGeometry, Camera, DoubleSide, Mesh, Scene, ShaderMaterial, Vector2, Vector3 } from "three";
import { mountView, type ViewSize } from "@/three/stage";
import type { Kind, Laid } from "@/lib/schemaLayout";

/**
 * Схема как макет: каждая карточка — верх плиты, уходящей в глубину экрана. Плоскость экрана —
 * стекло; глаз стоит ниже центра окна (взгляд с юга и сверху, как на макет страны в герое)
 * и чуть смещается за курсором, поэтому у плит видны срезы с горизонталями, а при прокрутке
 * и движении мыши они меняются. Текст остаётся обычной вёрсткой и лежит на плитах ровно:
 * их верх стоит в плоскости стекла и от положения глаза не зависит.
 * По мостам между крышами бежит импульс заявки; узел, в который он вошёл, отзывается
 * кольцом по крыше и волной света по стенкам.
 */
const RADIUS = 16;                 // скругление карточки, px
const EYE = 1400;                  // расстояние глаза от стекла, px
const EYE_DROP = 1150;             // глаз стоит ниже центра окна: взгляд с юга и сверху, как на макет в герое
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
/* секунд с момента, когда импульс вошёл в узел; 99 — ещё не входил */
float since(float hit) {
  if (hit < 0.0) return 99.0;
  float ds = uHead - hit;
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
float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}`;

const ROOF_VERT = /* glsl */ `
attribute vec4 aRect;
attribute vec4 aMeta;
attribute vec4 aPath;
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec2 vS;
${COMMON}
void main() {
  vP = position.xy; vRect = aRect; vMeta = aMeta; vPath = aPath;
  gl_Position = proj(position);
  // та же точка в пикселях экрана (в координатах схемы)
  vS = (gl_Position.xy * vec2(0.5, -0.5) + 0.5) * uRes - uBleed;
}`;

const ROOF_FRAG = /* glsl */ `
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
varying vec2 vS;
${COMMON}
const vec3 MAIN = vec3(0.071, 0.075, 0.065);
const vec3 SIDE = vec3(0.108, 0.116, 0.1);
void main() {
  vec2 p = vP - vRect.xy;
  float sd = sdBox(p, vRect.zw, ${RADIUS.toFixed(1)});
  float aa = max(fwidth(sd), 1e-3);
  float kind = vMeta.x;
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float s = since(vMeta.y);
  float glow = exp(-s * 1.7);
  // свет заявки бежит по плите от входа к выходу: run — насколько он уже прошёл эту точку
  vec2 across = vPath.zw - vPath.xy;
  float span = max(length(across), 1.0);
  float at = vMeta.y < 0.0 ? -1.0 : vMeta.y + clamp(dot(vP - vPath.xy, across / span), 0.0, span);
  float run = trail(at);
  // внутри плиты — мягкое пятно вокруг импульса, без резкого фронта под текстом
  float body = at < 0.0 ? 0.0 : exp(-pow((uHead - at - 30.0) / 75.0, 2.0));
  vec2 dp = vP + uBleed - uPointer.xy;
  float spot = exp(-dot(dp, dp) / 30000.0) * uPointer.z;

  if (kind > 2.5) {
    // пустое место: пунктирный контур сверху и слабее в глубине; дно видно только из-под верха
    if (vMeta.w > 0.5 && sdBox(vS - vRect.xy, vRect.zw, ${RADIUS.toFixed(1)}) < 1.0) discard;
    float line = 1.0 - smoothstep(0.55, 0.55 + aa, abs(sd + 0.8));
    float along = (vRect.z - abs(p.x)) < (vRect.w - abs(p.y)) ? p.y : p.x;
    float dash = smoothstep(0.0, 0.1, abs(fract(along / 9.0) - 0.5) - 0.2);
    float a = line * dash * mix(0.32, 0.1, vMeta.w) * appear * (1.0 + spot * 1.5);
    if (a < 0.004) discard;
    gl_FragColor = vec4(FG * a, a);
    return;
  }
  if (sd > aa) discard;
  float inside = 1.0 - smoothstep(-aa, aa, sd);
  float rim = 1.0 - smoothstep(0.5, 0.5 + aa * 1.2, abs(sd + 0.9));
  float rr = length(vP - vPath.xy);
  float wave = exp(-pow((rr - s * 380.0) / 26.0, 2.0)) * exp(-s * 1.5);
  float top = clamp(0.5 - p.y / (vRect.w * 2.0), 0.0, 1.0);
  vec3 col;
  if (kind > 0.5 && kind < 1.5) {
    col = LIME * (0.96 + 0.04 * top);
    col = mix(col, vec3(1.0), clamp(wave * 0.26 + body * 0.14 + rim * (0.2 + glow * 0.3 + run * 0.6), 0.0, 1.0));
  } else {
    col = (kind > 1.5 ? SIDE : MAIN) + vec3(0.012) * top;
    col += LIME * (wave * 0.1 + body * 0.055 + glow * 0.03 + spot * 0.03);
    col = mix(col, mix(FG, LIME, clamp(0.3 + glow + run + spot, 0.0, 1.0)), rim * clamp(0.16 + glow * 0.3 + run * 0.85 + spot * 0.4, 0.0, 1.0));
  }
  float a = inside * appear;
  gl_FragColor = vec4(col * a, a);
}`;

const HALO_FRAG = /* glsl */ `
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
${COMMON}
void main() {
  // свечение вокруг итогового узла: ярче в момент, когда заявка дошла
  float sd = sdBox(vP - vRect.xy, vRect.zw, ${RADIUS.toFixed(1)});
  float appear = smoothstep(0.0, 1.0, clamp((uT - vMeta.z) / 0.6, 0.0, 1.0));
  float glow = exp(-since(vMeta.y) * 1.3);
  float a = exp(-max(sd, 0.0) / 15.0) * (0.13 + glow * 0.3) * appear;
  gl_FragColor = vec4(LIME * a, a);
}`;

const SHADOW_FRAG = /* glsl */ `
varying vec2 vP;
varying vec4 vRect;
varying vec4 vMeta;
varying vec4 vPath;
${COMMON}
void main() {
  // пол под плитой: мягкая тень, под итоговым узлом — лужица света
  float sd = sdBox(vP - vRect.xy, vRect.zw, ${RADIUS.toFixed(1)});
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

const WALL_VERT = /* glsl */ `
attribute vec4 aWall;
attribute vec4 aMeta;
attribute vec4 aPath;
varying float vDepth;
varying float vDn;
varying vec2 vN;
varying vec4 vMeta;
varying float vAt;
${COMMON}
void main() {
  // столб вырастает в глубину вслед за появлением крыши
  float g = clamp((uG - aMeta.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vDepth = aWall.x * aWall.y * g;
  vDn = aWall.x; vN = aWall.zw; vMeta = aMeta;
  vec2 across = aPath.zw - aPath.xy;
  float span = max(length(across), 1.0);
  vAt = aMeta.y < 0.0 ? -1.0 : aMeta.y + clamp(dot(position.xy - aPath.xy, across / span), 0.0, span);
  gl_Position = proj(vec3(position.xy, vDepth));
}`;

const WALL_FRAG = /* glsl */ `
varying float vDepth;
varying float vDn;
varying vec2 vN;
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
  gl_FragColor = vec4(col, 1.0);
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
attribute vec3 aPost;
varying float vV;
varying float vSide;
varying float vBorn;
${COMMON}
void main() {
  // тонкая стойка пустого узла: лента экранной ширины вдоль ребра, уходящего в глубину
  float g = clamp((uG - aPost.z - 0.1) / 0.9, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vec4 a = proj(vec3(position.xy, position.z * g));
  vec4 b = proj(vec3(aOther.xy, aOther.z * g));
  vec2 dir = (b.xy - a.xy) * uRes;
  dir = length(dir) > 1e-4 ? normalize(dir) : vec2(0.0, 1.0);
  if (aPost.y > 0.5) dir = -dir;
  a.xy += vec2(-dir.y, dir.x) * aPost.x * 1.6 / uRes;
  vV = aPost.y; vSide = aPost.x; vBorn = aPost.z;
  gl_Position = a;
}`;

const POST_FRAG = /* glsl */ `
varying float vV;
varying float vSide;
varying float vBorn;
${COMMON}
void main() {
  float appear = smoothstep(0.0, 1.0, clamp((uT - vBorn) / 0.6, 0.0, 1.0));
  float a = (1.0 - smoothstep(0.3, 1.0, abs(vSide))) * step(0.45, fract(vV * 7.0)) * mix(0.3, 0.06, vV) * appear;
  if (a < 0.004) discard;
  gl_FragColor = vec4(FG * a, a);
}`;

type Buf = { pos: number[]; idx: number[]; [k: string]: number[] };

/** точки скруглённого прямоугольника по часовой стрелке с наружными нормалями */
const outline = (x: number, y: number, w: number, h: number, r: number) => {
  const out: [number, number, number, number][] = [];
  const corners: [number, number, number][] = [
    [x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI],
  ];
  for (const [cx, cy, a0] of corners) for (let i = 0; i <= 7; i++) {
    const a = a0 + (i / 7) * (Math.PI / 2);
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]);
  }
  return out;
};

const build = (l: Laid, thin: number) => {
  const roof: Buf = { pos: [], idx: [], rect: [], meta: [], path: [] };
  const halo: Buf = { pos: [], idx: [], rect: [], meta: [], path: [] };
  const shadow: Buf = { pos: [], idx: [], rect: [], meta: [], path: [] };
  const wall: Buf = { pos: [], idx: [], wall: [], meta: [], path: [] };
  const bridge: Buf = { pos: [], idx: [], side: [], route: [], born: [] };
  const post: Buf = { pos: [], idx: [], other: [], post: [] };

  const quad = (b: Buf, n: Laid["nodes"][number], pad: number, z: number, level: number) => {
    const { x, y, w, h } = n.box, base = b.pos.length / 3, born = n.index * 0.07;
    for (const [px, py] of [[x - pad, y - pad], [x + w + pad, y - pad], [x - pad, y + h + pad], [x + w + pad, y + h + pad]]) {
      b.pos.push(px, py, z);
      b.rect.push(x + w / 2, y + h / 2, w / 2, h / 2);
      b.meta.push(KIND_ID[n.kind], n.hit, born, level);
      b.path.push(n.from[0], n.from[1], n.to[0], n.to[1]);
    }
    b.idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  };

  for (const n of l.nodes) {
    const { x, y, w, h } = n.box, depth = DEPTH[n.kind] * thin, born = n.index * 0.07, r = Math.min(RADIUS, w / 2, h / 2);
    quad(roof, n, 3, 0, 0);
    if (n.kind === "accent") quad(halo, n, 56, 0, 0);
    if (n.kind === "ghost") {
      quad(roof, n, 3, depth, 1);
      const k = r * (1 - Math.SQRT1_2);
      for (const [cx, cy] of [[x + k, y + k], [x + w - k, y + k], [x + w - k, y + h - k], [x + k, y + h - k]]) {
        const base = post.pos.length / 3;
        for (const [v, side] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
          post.pos.push(cx, cy, v ? depth : 0);
          post.other.push(cx, cy, v ? 0 : depth);
          post.post.push(side, v, born);
        }
        post.idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
      }
      continue;
    }
    quad(shadow, n, 40, depth + FLOOR * thin, 0);
    const ring = outline(x, y, w, h, r), base = wall.pos.length / 3;
    ring.forEach(([px, py, nx, ny], i) => {
      for (const dn of [0, 1]) {
        wall.pos.push(px, py, 0);
        wall.wall.push(dn, depth, nx, ny);
        wall.meta.push(KIND_ID[n.kind], n.hit, born, 0);
        wall.path.push(n.from[0], n.from[1], n.to[0], n.to[1]);
      }
      const a = base + i * 2, b = base + ((i + 1) % ring.length) * 2;
      wall.idx.push(a, a + 1, b, b, a + 1, b + 1);
    });
  }

  for (const e of l.edges) {
    const pts = e.pts;
    if (pts.length < 2) continue;
    let len = 0;
    const at: number[] = [0];
    for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); at.push(len); }
    const base = bridge.pos.length / 3, born = e.after * 0.07;
    pts.forEach(([px, py], i) => {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
      const tl = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, nx = -(p1[1] - p0[1]) / tl, ny = (p1[0] - p0[0]) / tl;
      for (const s of [-1, 1]) {
        bridge.pos.push(px + nx * s * BRIDGE_HALF, py + ny * s * BRIDGE_HALF, 1);
        bridge.side.push(s);
        bridge.route.push(e.s0 >= 0 ? e.s0 + at[i] : -1, at[i], len, e.dashed ? 1 : 0);
        bridge.born.push(born);
      }
      if (i < pts.length - 1) { const a = base + i * 2; bridge.idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
    });
  }
  return { roof, halo, shadow, wall, bridge, post };
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

export const mountTowers = (canvas: HTMLCanvasElement, bleed: number): Towers => {
  const scene = new Scene(), camera = new Camera();
  const uniforms = {
    uRes: { value: new Vector2(1, 1) }, uEye: { value: new Vector3(0, 0, EYE) }, uBleed: { value: bleed },
    uT: { value: -10 }, uG: { value: -10 }, uHead: { value: -1e5 }, uCycle: { value: 1 }, uFirst: { value: 1 },
    uPointer: { value: new Vector3(-9999, -9999, 0) },
  };
  const material = (vertexShader: string, fragmentShader: string, depthWrite: boolean, depthTest = true) =>
    new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, premultipliedAlpha: true, side: DoubleSide, depthWrite, depthTest });
  const mats = {
    shadow: material(ROOF_VERT, SHADOW_FRAG, false, false),
    halo: material(ROOF_VERT, HALO_FRAG, false, false),
    wall: material(WALL_VERT, WALL_FRAG, true),
    roof: material(ROOF_VERT, ROOF_FRAG, true),
    bridge: material(BRIDGE_VERT, BRIDGE_FRAG, false),
    post: material(POST_VERT, POST_FRAG, false),
  };
  let meshes: Mesh[] = [];
  let routeLen = 0, nodeCount = 0;

  const update = (l: Laid) => {
    for (const m of meshes) { scene.remove(m); m.geometry.dispose(); }
    // в столбике плиты тоньше: срез должен помещаться в зазор между узлами
    const b = build(l, l.wide ? 1 : 0.42);
    const rectAttrs: Record<string, [string, number]> = { rect: ["aRect", 4], meta: ["aMeta", 4], path: ["aPath", 4] };
    const parts: [Buf, ShaderMaterial, Record<string, [string, number]>][] = [
      [b.shadow, mats.shadow, rectAttrs],
      [b.halo, mats.halo, rectAttrs],
      [b.wall, mats.wall, { wall: ["aWall", 4], meta: ["aMeta", 4], path: ["aPath", 4] }],
      [b.roof, mats.roof, rectAttrs],
      [b.bridge, mats.bridge, { side: ["aSide", 1], route: ["aRoute", 4], born: ["aBorn", 1] }],
      [b.post, mats.post, { other: ["aOther", 3], post: ["aPost", 3] }],
    ];
    meshes = [];
    parts.forEach(([buf, mat, attrs], order) => {
      if (!buf.idx.length) return;
      const m = new Mesh(geometry(buf, attrs), mat);
      m.frustumCulled = false; m.renderOrder = order;
      scene.add(m); meshes.push(m);
    });
    routeLen = l.routeLen; nodeCount = l.nodes.length;
    uniforms.uCycle.value = Math.max(1, routeLen + REST * SPEED);
  };

  // глаз чуть уходит за курсором; на тач-экранах остаётся над центром окна
  const ptr = { x: 0, y: 0, cx: 0, cy: 0, seen: false, on: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.seen = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  // t0 — когда схема вышла на экран (крыши проявляются вместе с текстом вёрстки),
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

  const unmount = mountView({ canvas, scene, camera, maxDpr: 2, frame });

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
