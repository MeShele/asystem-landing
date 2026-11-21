import { BufferAttribute, BufferGeometry, Group, NormalBlending, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3 } from "three";
import { mountView, type ViewSize } from "@/three/stage";
import { readPixels } from "@/three/reliefData";

/**
 * Гравюра из пыли: каждая точка рисунка (public/illus/*.webp) — частица. Когда блок выходит
 * на экран, пыль слетается в рисунок; густые штрихи выступают к зрителю, поэтому при лёгком
 * повороте виден объём; курсор расталкивает частицы. В покое картинка совпадает с исходной.
 */
const VERT = /* glsl */ `
attribute vec4 aRnd;
attribute float aInk;
uniform float uGather;
uniform float uTime;
uniform float uSize;
uniform vec3 uPointer;
varying float vInk;
void main() {
  // слёт: у каждой частицы своя задержка, от центра к краям
  float k = clamp((uGather * 1.75 - aRnd.x * 0.5 - length(position.xy) * 0.22) / 0.95, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 4.0);
  vec3 away = (aRnd.yzw - 0.5) * vec3(1.1, 1.1, 3.2);
  away.xy += normalize(position.xy + 1e-4) * (0.25 + aRnd.x * 0.5);
  vec3 p = mix(position + away, position, e);
  p.z += sin(uTime * 0.8 + aRnd.y * 6.283) * 0.008;
  // курсор расталкивает пыль и приподнимает её
  vec2 d = p.xy - uPointer.xy;
  float push = exp(-dot(d, d) * 30.0) * uPointer.z;
  p.xy += normalize(d + 1e-4) * push * (0.02 + aRnd.z * 0.07);
  p.z += push * (0.1 + aRnd.w * 0.3);
  vInk = aInk * smoothstep(0.0, 0.4, k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (1.0 + (1.0 - e) * 1.2 + push * 1.5);
}`;

const FRAG = /* glsl */ `
varying float vInk;
const vec3 LIME = vec3(0.714, 1.0, 0.102);
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = vInk * smoothstep(1.0, 0.55, r);
  gl_FragColor = vec4(LIME * a, a);
}`;

/** размытие по квадрату: густота штриха вокруг точки → насколько она выступает */
const boxBlur = (src: Float32Array, n: number, r: number) => {
  const tmp = new Float32Array(n * n), out = new Float32Array(n * n), w = 2 * r + 1;
  for (let y = 0; y < n; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[y * n + Math.min(n - 1, Math.max(0, x))];
    for (let x = 0; x < n; x++) {
      tmp[y * n + x] = s / w;
      s += src[y * n + Math.min(n - 1, x + r + 1)] - src[y * n + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < n; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(n - 1, Math.max(0, y)) * n + x];
    for (let y = 0; y < n; y++) {
      out[y * n + x] = s / w;
      s += tmp[Math.min(n - 1, y + r + 1) * n + x] - tmp[Math.max(0, y - r) * n + x];
    }
  }
  return out;
};

const loadInk = async (url: string) => {
  const { w, h, px } = await readPixels(url);
  const n = Math.min(w, h);
  const ink = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) ink[y * n + x] = px[(y * w + x) * 4 + 3] / 255;
  return { n, ink };
};

// детерминированный шум (целочисленный хэш): одна и та же пыль при каждом заходе
const rnd = (i: number) => {
  let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
/** отдать кадр браузеру между этапами сборки, чтобы прокрутка не запиналась */
const pause = () => new Promise<void>((r) => setTimeout(r, 0));

export type DustOptions = { canvas: HTMLCanvasElement; url: string };

export const mountDust = async ({ canvas, url }: DustOptions): Promise<() => void> => {
  const { n, ink } = await loadInk(url);
  await pause();
  const bulk = boxBlur(boxBlur(ink, n, 9), n, 9);
  await pause();

  // типизированные массивы нужного размера: сборка не должна задерживать прокрутку
  let count = 0;
  for (let i = 0; i < n * n; i++) if (ink[i] >= 0.1) count++;
  const pos = new Float32Array(count * 3), inkA = new Uint8Array(count), seed = new Uint8Array(count * 4);
  let k = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = y * n + x, a = ink[i];
    if (a < 0.1) continue;
    // сдвиг внутри пикселя убирает муар регулярной сетки при повороте
    pos[k * 3] = ((x + rnd(i * 7 + 1)) / n) * 2 - 1;
    pos[k * 3 + 1] = 1 - ((y + rnd(i * 7 + 2)) / n) * 2;
    pos[k * 3 + 2] = (bulk[i] - 0.35) * 0.3;
    inkA[k] = Math.round(a * 255);
    const h = i * 7;
    seed[k * 4] = rnd(h + 3) * 255; seed[k * 4 + 1] = rnd(h + 4) * 255; seed[k * 4 + 2] = rnd(h + 5) * 255; seed[k * 4 + 3] = rnd(h + 6) * 255;
    k++;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aInk", new BufferAttribute(inkA, 1, true));
  geo.setAttribute("aRnd", new BufferAttribute(seed, 4, true));

  const mat = new ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, premultipliedAlpha: true, blending: NormalBlending,
    depthTest: false, depthWrite: false,
    uniforms: { uGather: { value: 0 }, uTime: { value: 0 }, uSize: { value: 1 }, uPointer: { value: new Vector3(9, 9, 0) } },
  });
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  const group = new Group();
  group.add(points);
  const scene = new Scene();
  scene.add(group);

  // рисунок занимает квадрат [-1, 1] и ровно вписан в кадр по высоте
  const FOV = 16, DIST = 1 / Math.tan((FOV * Math.PI) / 360);
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 30);
  camera.position.set(0, 0, DIST);

  const ptr = { x: 9, y: 9, on: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const b = canvas.getBoundingClientRect();
    if (b.bottom < 0 || b.top > window.innerHeight) { ptr.on = 0; return; }
    const nx = ((e.clientX - b.left) / b.width) * 2 - 1, ny = -(((e.clientY - b.top) / b.height) * 2 - 1);
    ptr.x = nx * (b.width / b.height); ptr.y = ny;
    ptr.on = Math.abs(nx) < 1.25 && Math.abs(ny) < 1.25 ? 1 : 0;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let started = -1, yaw = 0, pitch = 0, force = 0;
  const frame = (t: number, dt: number, size: ViewSize) => {
    camera.aspect = size.cssW / size.cssH;
    camera.updateProjectionMatrix();
    // слёт начинается, когда блок заметно вошёл в экран
    if (started < 0) {
      const b = canvas.getBoundingClientRect();
      if (b.top < window.innerHeight * 0.82 && b.bottom > 0) started = t;
    }
    const age = started < 0 ? 0 : t - started;
    mat.uniforms.uGather.value = Math.min(1, age / 2.5);
    mat.uniforms.uTime.value = age;
    mat.uniforms.uSize.value = Math.max(1.15, (size.h / n) * 1.3);

    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.35) * 0.07 + (ptr.on ? ptr.x * 0.1 : 0) - yaw) * k;
    pitch += ((ptr.on ? -ptr.y * 0.07 : 0) + Math.sin(age * 0.27 + 1.3) * 0.04 - pitch) * k;
    group.rotation.set(pitch, yaw, 0);
    force += (ptr.on - force) * (1 - Math.exp(-dt * 5));
    mat.uniforms.uPointer.value.set(ptr.x, ptr.y, force);

  };

  const unmount = mountView({ canvas, scene, camera, maxDpr: 1.5, frame });
  return () => {
    unmount();
    window.removeEventListener("pointermove", onMove);
    geo.dispose(); mat.dispose();
  };
};
