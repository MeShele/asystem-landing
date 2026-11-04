import { useEffect, useRef } from "react";

/**
 * Переливающийся градиент на весь фон: четыре мягких пятна цвета медленно плывут по
 * экрану. Сырой WebGL без three.js (несколько килобайт вместо полумегабайта), один
 * fullscreen-треугольник, dpr не выше 1, пауза вне вкладки, под reduced-motion один
 * статичный кадр. Глубокие тона с лаймовым свечением складываются к чёрному.
 */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime;
float blob(vec2 uv, vec2 c, float r){ return smoothstep(r, 0.0, length(uv - c)); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.x *= uRes.x / uRes.y;
  float t = uTime * 0.05;
  vec3 base = vec3(0.040, 0.044, 0.037);
  /* лайм, глубокая зелень, холодный сине-фиолетовый, тёплая медь */
  vec3 d1 = vec3(0.33, 0.52, 0.06), d2 = vec3(0.05, 0.26, 0.22), d3 = vec3(0.16, 0.14, 0.36), d4 = vec3(0.30, 0.17, 0.06);
  float w1 = blob(uv, vec2(0.75 + 0.18 * sin(t * 1.1), 0.72 + 0.12 * cos(t * 0.9)), 0.70);
  float w2 = blob(uv, vec2(0.22 + 0.14 * cos(t * 0.7), 0.30 + 0.16 * sin(t * 1.3)), 0.65);
  float w3 = blob(uv, vec2(1.25 + 0.12 * sin(t * 0.8 + 2.0), 0.18 + 0.10 * cos(t * 1.1)), 0.60);
  float w4 = blob(uv, vec2(0.45 + 0.20 * cos(t * 0.5 + 1.0), 0.95 + 0.08 * sin(t * 0.6)), 0.55);
  vec3 col = base + d1 * w1 * 0.55 + d2 * w2 * 0.6 + d3 * w3 * 0.5 + d4 * w4 * 0.25;
  /* лёгкое зерно против полос */
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`;

const GradientBackground = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0; let running = true; let start = performance.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1);
      const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uRes, w, h);
    };
    const draw = (now: number) => {
      resize();
      gl.uniform1f(uTime, (now - start) / 1000 + 40);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => { if (!running) return; draw(now); raf = requestAnimationFrame(loop); };
    const onVis = () => {
      running = !document.hidden && !reduced;
      if (running) { start = performance.now() - 1000; raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
    };
    if (reduced) draw(performance.now()); else raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => { if (reduced) draw(performance.now()); };
    window.addEventListener("resize", onResize);
    return () => { running = false; cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full" style={{ zIndex: 0 }} />;
};

export default GradientBackground;
