import { BufferAttribute, BufferGeometry, Group, NormalBlending, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3 } from "three";
import { mountView, type ViewSize } from "@/three/stage";
import { readPixels } from "@/three/reliefData";
import { buildParticles, type Particles } from "@/three/dustBuild";

/**
 * Гравюра из пыли: каждая точка рисунка (public/illus/*.webp) — частица. Когда блок выходит
 * на экран, пыль слетается в рисунок; густые штрихи выступают к зрителю, поэтому при повороте
 * за курсором виден объём; курсор расталкивает частицы. Собранная гравюра неподвижна и совпадает
 * с исходной картинкой — в покое она не перерисовывается и ничего не стоит.
 */
const VERT = /* glsl */ `
attribute vec4 aRnd;
attribute float aInk;
uniform float uGather;
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

// ── сборка частиц: в фоновом потоке, а где его нет — в основном ───────────────────
let worker: Worker | null = null, seq = 0;
const asked = new Map<number, { resolve: (p: Particles) => void; reject: (e: Error) => void }>();

const viaWorker = (url: string) => new Promise<Particles>((resolve, reject) => {
  if (!worker) {
    worker = new Worker(new URL("./dust.worker.ts", import.meta.url), { type: "module" });
    worker.addEventListener("message", (e: MessageEvent<Particles & { id: number; error?: string }>) => {
      const { id, error, ...p } = e.data, ask = asked.get(id);
      asked.delete(id);
      if (!ask) return;
      if (error) ask.reject(new Error(error)); else ask.resolve(p);
    });
    worker.addEventListener("error", () => {
      for (const ask of asked.values()) ask.reject(new Error("dust worker failed"));
      asked.clear(); worker = null;
    });
  }
  const id = ++seq;
  asked.set(id, { resolve, reject });
  worker.postMessage({ id, url: new URL(url, location.href).href });
});

const loadParticles = async (url: string): Promise<Particles> => {
  if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
    try { return await viaWorker(url); } catch { /* не вышло в фоне — соберём здесь */ }
  }
  const { w, h, px } = await readPixels(url);
  return buildParticles(px, w, h);
};

export type DustOptions = { canvas: HTMLCanvasElement; url: string };

export const mountDust = async ({ canvas, url }: DustOptions): Promise<() => void> => {
  const { n, pos, ink, seed } = await loadParticles(url);
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aInk", new BufferAttribute(ink, 1, true));
  geo.setAttribute("aRnd", new BufferAttribute(seed, 4, true));

  const mat = new ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, premultipliedAlpha: true, blending: NormalBlending,
    depthTest: false, depthWrite: false,
    uniforms: { uGather: { value: 0 }, uSize: { value: 1 }, uPointer: { value: new Vector3(9, 9, 0) } },
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

  const ptr = { cx: 0, cy: 0, seen: false };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    ptr.cx = e.clientX; ptr.cy = e.clientY; ptr.seen = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let started = -1, yaw = 0, pitch = 0, force = 0;
  const frame = (t: number, dt: number, size: ViewSize) => {
    const b = canvas.getBoundingClientRect();
    // слёт начинается, когда блок заметно вошёл в экран; до этого рисовать нечего
    if (started < 0) {
      if (b.top < window.innerHeight * 0.82 && b.bottom > 0) started = t; else return false;
    }
    const age = t - started;
    const nx = ((ptr.cx - b.left) / b.width) * 2 - 1, ny = -(((ptr.cy - b.top) / b.height) * 2 - 1);
    const on = ptr.seen && Math.abs(nx) < 1.25 && Math.abs(ny) < 1.25 ? 1 : 0;
    const k = 1 - Math.exp(-dt * 3);
    yaw += ((on ? nx * 0.1 : 0) - yaw) * k;
    pitch += ((on ? -ny * 0.07 : 0) - pitch) * k;
    force += (on - force) * (1 - Math.exp(-dt * 5));
    // собранная гравюра без курсора рядом неподвижна — кадр не нужен
    if (age > 3.2 && !on && force < 0.004 && Math.abs(yaw) + Math.abs(pitch) < 0.0015) return false;

    camera.aspect = size.cssW / size.cssH;
    camera.updateProjectionMatrix();
    mat.uniforms.uGather.value = Math.min(1, age / 2.5);
    mat.uniforms.uSize.value = Math.max(1.15, (size.h / n) * 1.3);
    group.rotation.set(pitch, yaw, 0);
    mat.uniforms.uPointer.value.set(nx * (b.width / b.height), ny, force);
  };

  const unmount = mountView({ canvas, scene, camera, maxDpr: 1.25, frame });
  return () => {
    unmount();
    window.removeEventListener("pointermove", onMove);
    geo.dispose(); mat.dispose();
  };
};
