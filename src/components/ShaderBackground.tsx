import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "@/theme";
import * as THREE from "three";

/**
 * Фон героя: один полноэкранный треугольник с фрагментным шейдером. Медленно
 * текущие слои шума в тонах страницы, лаймовый отблеск на гребнях. Дёшево:
 * dpr ≤ 1.5, без antialias, кадры только пока герой на экране; под
 * prefers-reduced-motion рисуется один кадр и останавливается.
 */
const VERT = /* glsl */ `
  void main() { gl_Position = vec4(position, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uAccent;
  uniform float uLight;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
    float t = uTime * 0.045;

    float warp = fbm(p * 1.4 + vec2(t, -t * 0.5));
    float n = fbm(p * 2.2 + vec2(-t * 0.6, t * 0.35) + warp * 1.1);

    vec3 base = mix(vec3(0.043, 0.047, 0.039), vec3(0.955, 0.965, 0.935), uLight);
    vec3 fold = mix(vec3(0.21, 0.23, 0.18), vec3(0.82, 0.86, 0.76), uLight);
    float ridge = smoothstep(0.38, 0.8, n);
    vec3 col = mix(base, fold, ridge);

    /* лаймовый отблеск: только на самых высоких гребнях и сильнее к верху кадра */
    float glint = smoothstep(0.7, 0.95, n) * (0.3 + 0.7 * smoothstep(0.1, 0.95, uv.y));
    col += uAccent * glint * mix(0.9, 0.3, uLight);
    /* второй, широкий отблеск на складках справа сверху */
    float wide = smoothstep(0.55, 0.9, warp) * smoothstep(0.35, 1.0, uv.x) * smoothstep(0.3, 1.0, uv.y);
    col += uAccent * wide * mix(0.12, 0.05, uLight);

    /* виньетка к краям, чтобы текст слева читался */
    float v = smoothstep(1.25, 0.35, length((uv - vec2(0.62, 0.5)) * vec2(1.15, 1.0)));
    col = mix(col * (0.45 + 0.55 * v), mix(col, vec3(0.975, 0.98, 0.965), 0.6 * (1.0 - v)), uLight);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const Plane = ({ animate, light }: { animate: boolean; light: boolean }) => {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size, gl, invalidate } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uAccent: { value: new THREE.Color("#B6FF1A") },
      uLight: { value: 0 },
    }),
    [],
  );
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    return g;
  }, []);
  useEffect(() => {
    const dpr = gl.getPixelRatio();
    uniforms.uRes.value.set(size.width * dpr, size.height * dpr);
    invalidate();
  }, [size, gl, uniforms, invalidate]);
  // R3F копирует uniforms в материал: менять значение надо на материале (как uTime), не в memo-объекте.
  useEffect(() => {
    if (mat.current) mat.current.uniforms.uLight.value = light ? 1 : 0;
    invalidate();
  }, [light, invalidate]);
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uLight.value = light ? 1 : 0;
    if (!animate) return;
    mat.current.uniforms.uTime.value += Math.min(dt, 0.05);
  });
  return (
    <mesh geometry={geom} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
};

const ShaderBackground = ({ className = "" }: { className?: string }) => {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden && (el.getBoundingClientRect().bottom > 0));
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const animate = visible && !reduced;

  return (
    <div
      ref={ref}
      className={`pointer-events-none ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 1200ms ease" }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={animate ? "always" : "demand"}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", depth: false, stencil: false }}
        orthographic
        camera={{ position: [0, 0, 1], near: 0, far: 2 }}
        onCreated={() => setReady(true)}
        style={{ width: "100%", height: "100%" }}
      >
        <Plane animate={animate} light={theme === "light"} />
      </Canvas>
    </div>
  );
};

export default ShaderBackground;
