import { BufferAttribute, BufferGeometry, DataTexture, DoubleSide, Group, LinearFilter, Mesh, PerspectiveCamera, RGBAFormat, Scene, ShaderMaterial, UnsignedByteType, Vector3 } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { readPixels } from "@/three/reliefData";
import { LIME, beam, ease, frameCamera, headAt, nap, pointer, ribbon, shared, tags } from "@/three/kit";

/**
 * «Запуск за четыре шага» как восхождение: настоящий рельеф массива пика Победы (Жеңиш чокусу,
 * 7 439 м — высшая точка Кыргызстана), вырезанный квадратным блоком. По леднику к вершине идёт
 * маршрут с четырьмя лагерями — шагами запуска; на вершине стоит маяк «Открытие». Данные —
 * public/relief/peak.webp (scripts/bake-peak.mjs), константы ниже печатает тот же скрипт.
 */
const PEAK = { size: 256, hMin: 3112, hMax: 7382, summit: [0.58, 0.36] as [number, number] };
const HS = 0.62, DEPTH = 0.12;
/** лагеря в координатах кадра (u с запада на восток, v с севера на юг): по леднику к вершине */
const CAMPS: [number, number][] = [[0.07, 0.88], [0.25, 0.68], [0.43, 0.51], PEAK.summit];
const SPEED = 0.14;

const TOP_VERT = /* glsl */ `
attribute float aH;
uniform float uIntro;
varying vec2 vUv;
varying float vH;
varying float vShow;
void main() {
  vUv = uv; vH = aH;
  // массив поднимается от подножия к вершине
  float k = clamp(uIntro * 1.8 - aH * 0.8, 0.0, 1.0);
  vShow = smoothstep(0.0, 0.3, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, aH * ${HS.toFixed(2)} * (1.0 - pow(1.0 - k, 3.0)), position.z, 1.0);
}`;

const TOP_FRAG = /* glsl */ `
uniform sampler2D tData;
uniform float uTexel;
uniform float uRows;
uniform float uLine;
uniform vec3 uPointer;
varying vec2 vUv;
varying float vH;
varying float vShow;
const vec3 LIME = ${LIME};
const vec3 SNOW = vec3(0.95, 1.0, 0.86);
void main() {
  float hL = texture2D(tData, vUv - vec2(uTexel, 0.0)).r, hR = texture2D(tData, vUv + vec2(uTexel, 0.0)).r;
  float hU = texture2D(tData, vUv - vec2(0.0, uTexel)).r, hD = texture2D(tData, vUv + vec2(0.0, uTexel)).r;
  float shade = clamp(0.8 + dot(vec2(hR - hL, hD - hU), vec2(1.0, -0.6)) * 5.0, 0.35, 1.35);
  float fv = vUv.y * uRows;
  float wv = fwidth(fv);
  float dl = abs(fract(fv) - 0.5) / max(wv, 1e-5);
  float dense = 1.0 - smoothstep(0.26, 0.5, wv);
  float line = (1.0 - smoothstep(uLine - 0.55, uLine + 0.55, dl)) * dense;
  float alt = smoothstep(0.05, 0.75, vH);
  vec2 pq = vUv - uPointer.xy;
  float spot = exp(-dot(pq, pq) * 60.0) * uPointer.z;
  float lit = mix(0.4, 1.0, alt) * shade + spot * 0.8;
  vec3 col = vec3(0.026, 0.034, 0.022) + LIME * (0.02 + 0.05 * alt + 0.05 * spot);
  float l = clamp(line * lit, 0.0, 1.0) * vShow;
  col += LIME * exp(-dl * dl * 0.16) * dense * lit * 0.12 * vShow;
  col = mix(col, mix(LIME, SNOW, smoothstep(0.62, 0.92, vH)), l);
  // кромка блока
  vec2 e = min(vUv, 1.0 - vUv) / max(fwidth(vUv), vec2(1e-5));
  col = mix(col, LIME, (1.0 - smoothstep(0.8, 1.8, min(e.x, e.y))) * vShow);
  float a = mix(0.88, 1.0, l) * smoothstep(0.0, 0.2, vShow + 0.001);
  gl_FragColor = vec4(col * a, a);
}`;

const WALL_VERT = /* glsl */ `
attribute float aH;
attribute float aDown;
uniform float uIntro;
varying float vY;
varying float vTop;
varying float vShow;
void main() {
  float k = clamp(uIntro * 1.8 - aH * 0.8, 0.0, 1.0);
  vShow = smoothstep(0.0, 0.3, k);
  vTop = aH * ${HS.toFixed(2)} * (1.0 - pow(1.0 - k, 3.0));
  vY = mix(vTop, -${DEPTH.toFixed(2)}, aDown);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, vY, position.z, 1.0);
}`;

const WALL_FRAG = /* glsl */ `
varying float vY;
varying float vTop;
varying float vShow;
const vec3 LIME = ${LIME};
void main() {
  // срез блока: горизонтали через равный шаг высоты, ярче у поверхности
  float f = (vY + ${DEPTH.toFixed(2)}) / 0.026;
  float w = fwidth(f);
  float dl = abs(fract(f) - 0.5) / max(w, 1e-5);
  float strata = (1.0 - smoothstep(0.35, 1.25, dl)) * (1.0 - smoothstep(0.3, 0.55, w));
  float near = smoothstep(-${DEPTH.toFixed(2)}, max(vTop, 0.01), vY);
  vec3 col = vec3(0.02, 0.027, 0.018) + LIME * 0.03 * near;
  col = mix(col, LIME, strata * mix(0.12, 0.5, near) * vShow);
  float a = 0.95 * smoothstep(0.0, 0.2, vShow + 0.001) * smoothstep(-${DEPTH.toFixed(2)}, -${DEPTH.toFixed(2)} + fwidth(vY) * 1.5, vY);
  gl_FragColor = vec4(col * a, a);
}`;

export type PeakOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[]; url: string };

export const mountPeak = async ({ canvas, labels, url }: PeakOptions): Promise<() => void> => {
  const { w: n, px } = await readPixels(url);
  const hgt = new Float32Array(n * n), rgba = new Uint8Array(px.length);
  rgba.set(px);
  for (let i = 0; i < n * n; i++) hgt[i] = px[i * 4] / 255;
  const at = (u: number, v: number) => {
    const x = Math.min(n - 1.001, Math.max(0, u * n - 0.5)), y = Math.min(n - 1.001, Math.max(0, v * n - 0.5));
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, i = yi * n + xi;
    return hgt[i] * (1 - fx) * (1 - fy) + hgt[i + 1] * fx * (1 - fy) + hgt[i + n] * (1 - fx) * fy + hgt[i + n + 1] * fx * fy;
  };
  const world = (u: number, v: number, lift = 0) => new Vector3((u - 0.5) * 2, at(u, v) * HS + lift, (v - 0.5) * 2);

  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(28, 1.5, 0.1, 40);
  const tex = new DataTexture(rgba, n, n, RGBAFormat, UnsignedByteType);
  tex.minFilter = LinearFilter; tex.magFilter = LinearFilter; tex.needsUpdate = true;
  const uIntro = { value: 0 };

  // поверхность: массивы сразу нужного размера, между шагами — пауза
  await nap();
  const S = 200, V = (S + 1) * (S + 1);
  const pos = new Float32Array(V * 3), uv = new Float32Array(V * 2), ah = new Float32Array(V), idx = new Uint32Array(S * S * 6);
  for (let j = 0, k = 0; j <= S; j++) for (let i = 0; i <= S; i++, k++) {
    const u = i / S, v = j / S;
    pos[k * 3] = (u - 0.5) * 2; pos[k * 3 + 2] = (v - 0.5) * 2; uv[k * 2] = u; uv[k * 2 + 1] = v; ah[k] = at(u, v);
  }
  for (let j = 0, q = 0; j < S; j++) for (let i = 0; i < S; i++) { const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1; idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d; }
  await nap();
  const topGeo = new BufferGeometry();
  topGeo.setAttribute("position", new BufferAttribute(pos, 3));
  topGeo.setAttribute("uv", new BufferAttribute(uv, 2));
  topGeo.setAttribute("aH", new BufferAttribute(ah, 1));
  topGeo.setIndex(new BufferAttribute(idx, 1));
  const topMat = new ShaderMaterial({
    vertexShader: TOP_VERT, fragmentShader: TOP_FRAG, transparent: true, premultipliedAlpha: true,
    uniforms: { tData: { value: tex }, uTexel: { value: 1 / n }, uIntro, uRows: { value: 64 }, uLine: { value: 0.8 }, uPointer: { value: new Vector3(0.5, 0.5, 0) } },
  });
  const top = new Mesh(topGeo, topMat);
  top.frustumCulled = false;

  // четыре стенки среза
  const wp: number[] = [], wh: number[] = [], wd: number[] = [], wi: number[] = [];
  const edge = (f: (t: number) => [number, number]) => {
    const base = wp.length / 3;
    for (let i = 0; i <= S; i++) {
      const [u, v] = f(i / S), hh = at(u, v);
      for (const dn of [0, 1]) { wp.push((u - 0.5) * 2, 0, (v - 0.5) * 2); wh.push(hh); wd.push(dn); }
      if (i < S) { const a = base + i * 2; wi.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
    }
  };
  edge((t) => [t, 1]); edge((t) => [t, 0]); edge((t) => [0, t]); edge((t) => [1, t]);
  const wallGeo = new BufferGeometry();
  wallGeo.setAttribute("position", new BufferAttribute(new Float32Array(wp), 3));
  wallGeo.setAttribute("aH", new BufferAttribute(new Float32Array(wh), 1));
  wallGeo.setAttribute("aDown", new BufferAttribute(new Float32Array(wd), 1));
  wallGeo.setIndex(wi);
  const wallMat = new ShaderMaterial({ vertexShader: WALL_VERT, fragmentShader: WALL_FRAG, transparent: true, premultipliedAlpha: true, side: DoubleSide, uniforms: { uIntro } });
  const walls = new Mesh(wallGeo, wallMat);
  walls.frustumCulled = false;
  group.add(walls, top);

  await nap();
  // маршрут через лагеря: плавная ломаная по поверхности, по ней идёт импульс
  const route: Vector3[] = [];
  const stops: number[] = [];
  for (let s = 0; s < CAMPS.length - 1; s++) {
    stops.push(route.length);
    for (let i = 0; i < 26; i++) { const t = i / 26; route.push(world(CAMPS[s][0] + (CAMPS[s + 1][0] - CAMPS[s][0]) * t, CAMPS[s][1] + (CAMPS[s + 1][1] - CAMPS[s][1]) * t, 0.012)); }
  }
  stops.push(route.length);
  route.push(world(PEAK.summit[0], PEAK.summit[1], 0.012));
  const path = ribbon(sh, [{ pts: route, phase: 0, speed: SPEED }], 0.42);
  path.renderOrder = 2;
  group.add(path);

  // лагеря: короткие лучи, на вершине — высокий маяк
  const camps = CAMPS.map(([u, v], i) => {
    const p = world(u, v), last = i === CAMPS.length - 1, hBeam = last ? 0.62 : 0.3;
    const b = beam(sh, p, hBeam, last ? 1.5 : 1);
    b.renderOrder = 3;
    group.add(b);
    return { b, tagAt: p.clone().setY(p.y + hBeam), t: stops[i] / (route.length - 1), gain: last ? 1.5 : 1 };
  });
  const tag = tags(labels, camps.map((c) => c.tagAt));

  const ptr = pointer(canvas);
  const YAW = 0.4, EL = 0.56, axis = new Vector3(0, 1, 0), target = new Vector3(0.06, 0.2, -0.05).applyAxisAngle(axis, YAW);
  const hit = new Vector3(), ray = new Vector3(), origin = new Vector3();
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, spot = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-1, 1]) for (const z of [-1, 1]) pts.push(new Vector3(x, -DEPTH, z).applyAxisAngle(axis, YAW));
      pts.push(camps[3].tagAt.clone().setY(camps[3].tagAt.y + 0.3).applyAxisAngle(axis, YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(EL), Math.cos(EL)), pts, [0.98, 0.94, 0.96]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease((age - 1.5) / 0.9);
    uIntro.value = Math.min(1, age / 2.4);
    topMat.uniforms.uLine.value = 0.55 + 0.22 * size.dpr;
    topMat.uniforms.uRows.value = Math.round(Math.max(30, Math.min(70, size.cssW / 9)));
    path.material.uniforms.uRes.value.set(size.w, size.h);
    path.material.uniforms.uWidth.value = 1.5 * size.dpr;
    // лагерь, до которого дошёл импульс, вспыхивает
    const head = headAt(age, 0, SPEED);
    for (const c of camps) { const since = head - c.t; c.b.material.uniforms.uGain.value = c.gain * (1 + (since > 0 ? Math.exp(-since * 6) : 0)); }

    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.06 + ptr.p.nx * 0.1 - yaw) * k;
    pitch += (-ptr.p.ny * 0.04 - pitch) * k;
    group.rotation.set(pitch, YAW + yaw, 0);
    group.updateMatrixWorld();
    for (const c of camps) c.b.rotation.y = -(YAW + yaw);

    // луч курсора → плоскость средней высоты блока
    let on = 0;
    if (ptr.p.inside) {
      origin.copy(camera.position);
      ray.set(ptr.p.nx, ptr.p.ny, 0.5).unproject(camera).sub(origin).normalize();
      group.worldToLocal(origin);
      ray.applyAxisAngle(axis, -(YAW + yaw));
      const s = (0.2 - origin.y) / ray.y;
      if (s > 0) { hit.copy(origin).addScaledVector(ray, s); topMat.uniforms.uPointer.value.setX(hit.x / 2 + 0.5).setY(hit.z / 2 + 0.5); on = 1; }
    }
    spot += (on - spot) * (1 - Math.exp(-dt * 6));
    topMat.uniforms.uPointer.value.z = spot;
    tag.place(group, camera, size, ease((age - 1.9) / 0.7));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    topGeo.dispose(); topMat.dispose(); wallGeo.dispose(); wallMat.dispose(); tex.dispose();
    path.geometry.dispose(); path.material.dispose();
    for (const c of camps) { c.b.geometry.dispose(); c.b.material.dispose(); }
  };
};

