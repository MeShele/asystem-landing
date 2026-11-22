import { CylinderGeometry, ExtrudeGeometry, Group, Mesh, Path, PerspectiveCamera, Scene, Shape, Vector3, type BufferGeometry, type Material, type ShaderMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, ease, engrave, frameCamera, nap, outline, pointer, shadow, shared } from "@/three/kit";

/**
 * Требования ГСФР как печать: круглая плита из секторов, по сектору на требование. Закрытые
 * платформой секторы лаймовые и приподняты, сектор «ваша сторона» остаётся тёмным контуром —
 * «семь из восьми» видно без чтения. Выбранный сектор поворачивается к зрителю и поднимается.
 * В центре — счёт закрытых требований.
 */
const R0 = 0.8, R1 = 1.84, RIM = 2.12, BASE = 0.16;

/** сектор кольца, развёрнутый вдоль +x; толщина вдоль Y */
const wedge = (span: number, h: number) => {
  const a = span / 2 - 0.035, s = new Shape();
  s.moveTo(Math.cos(-a) * R1, Math.sin(-a) * R1);
  s.absarc(0, 0, R1, -a, a, false);
  s.lineTo(Math.cos(a) * R0, Math.sin(a) * R0);
  s.absarc(0, 0, R0, a, -a, true);
  s.closePath();
  return new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 18 }).rotateX(-Math.PI / 2);
};

/** обод печати кольцом */
const ring = (r0: number, r1: number, h: number) => {
  const s = new Shape();
  s.absarc(0, 0, r1, 0, Math.PI * 2, false);
  const hole = new Path();
  hole.absarc(0, 0, r0, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 48 }).rotateX(-Math.PI / 2);
};

/**
 * Значок требования. Сектор развёрнут вдоль +x и в работе смотрит на зрителя, поэтому значок
 * рисуется повёрнутым на четверть оборота: тогда у зрителя он стоит прямо.
 */
const icon = (kind: number) => art(160, 160, (c) => {
  c.translate(80, 80); c.rotate(-Math.PI / 2); c.lineWidth = 9;
  const line = (...p: number[]) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); };
  const circle = (x: number, y: number, r: number, fill = false) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) c.fill(); else c.stroke(); };
  if (kind === 0) { circle(0, -18, 17); c.beginPath(); c.arc(0, 44, 36, Math.PI * 1.18, Math.PI * 1.82); c.stroke(); }                       // KYC: человек
  else if (kind === 1) { line(-40, -28, 14, -28); line(-40, -4, 0, -4); line(-40, 20, -8, 20); circle(22, 14, 18); line(35, 27, 46, 40); }   // перечни: список и лупа
  else if (kind === 2) { c.strokeRect(-44, -30, 88, 60); circle(-20, -4, 11); line(4, -10, 30, -10); line(4, 8, 24, 8); }                    // один кабинет: карточка
  else if (kind === 3) { circle(0, 0, 38); line(0, -22, 0, 0, 16, 12); }                                                                    // время и хранение: часы
  else if (kind === 4) { for (const y of [-34, -8, 18]) { c.strokeRect(-40, y, 80, 18); circle(-28, y + 9, 3, true); } }                     // серверы: стойка
  else if (kind === 5) { line(-30, -42, 14, -42, 32, -24, 32, 42, -30, 42, -30, -42); line(-16, -8, 18, -8); line(-16, 12, 18, 12); }        // безнал и отчёты: документ
  else if (kind === 6) { c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6, x = Math.cos(a) * 40, y = Math.sin(a) * 40; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.closePath(); c.stroke(); line(-16, 0, -4, 13, 18, -13); } // кошельки: шестиугольник с галочкой
  else { c.beginPath(); c.roundRect(-14, -44, 28, 52, 14); c.stroke(); c.beginPath(); c.arc(0, -4, 30, 0.15, Math.PI - 0.15); c.stroke(); line(0, 26, 0, 44); line(-18, 44, 18, 44); } // запись переговоров: микрофон
});

/** основание: кольца и риски по ободу, как на оттиске печати */
const baseArt = () => art(1024, 1024, (c, w) => {
  const cx = w / 2, u = cx / RIM;
  for (const [r, lw, a] of [[RIM * 0.985, 6, 0.9], [R1 + 0.09, 3, 0.6], [R0 - 0.07, 3, 0.6]]) { c.globalAlpha = a; c.lineWidth = lw; c.beginPath(); c.arc(cx, cx, r * u, 0, Math.PI * 2); c.stroke(); }
  c.globalAlpha = 0.75; c.lineWidth = 4;
  for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2, k = i % 5 ? 0.955 : 0.93; c.beginPath(); c.moveTo(cx + Math.cos(a) * RIM * 0.975 * u, cx + Math.sin(a) * RIM * 0.975 * u); c.lineTo(cx + Math.cos(a) * RIM * k * u, cx + Math.sin(a) * RIM * k * u); c.stroke(); }
});

/** центр: сколько требований закрыто из скольких */
const scoreArt = (done: number, total: number) => art(256, 256, (c) => {
  c.font = "700 104px system-ui, -apple-system, 'Segoe UI', sans-serif";
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(`${done}/${total}`, 128, 134);
  c.lineWidth = 5; c.globalAlpha = 0.6; c.beginPath(); c.arc(128, 128, 112, 0, Math.PI * 2); c.stroke();
});

export type SealOptions = { canvas: HTMLCanvasElement; done: boolean[] };
export type SealHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountSeal = async ({ canvas, done }: SealOptions): Promise<SealHandle> => {
  const n = done.length, span = (Math.PI * 2) / n;
  const sh = shared(), scene = new Scene(), group = new Group(), dial = new Group();
  scene.add(group);
  group.add(dial);
  const camera = new PerspectiveCamera(26, 1.2, 0.1, 80);
  const kept: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };
  const edges: { line: ReturnType<typeof outline>; base: number }[] = [];
  const add = (geo: BufferGeometry, parent: Group, mat: Material, edge = 0.6, angle = 30) => {
    const line = outline(geo, 0, angle);
    edges.push({ line, base: edge });
    parent.add(new Mesh(keep(geo), mat), line);
    return line;
  };
  const ground = shadow(sh, 5.3, 5.3, -0.03, 0.95);
  group.add(ground);

  // основание и обод не вращаются; на основании кольца и риски
  const baseMat = keep(engrave(sh, { art: keep(baseArt()), rect: [-RIM, -RIM, RIM * 2, RIM * 2], rings: true, top: 9, strata: 40, hatch: 0.3, gain: 0.8 }));
  add(new CylinderGeometry(RIM, RIM, BASE, 72).translate(0, BASE / 2, 0), group, baseMat, 0.7);
  add(ring(RIM - 0.16, RIM, 0.09).translate(0, BASE, 0), group, keep(engrave(sh, { rings: true, top: 30, strata: 60, ink: 1.2 })), 0.8);
  await nap();
  // центр со счётом
  const score = keep(engrave(sh, { kind: 1, art: keep(scoreArt(done.filter(Boolean).length, n)), rect: [-0.62, -0.62, 1.24, 1.24], strata: 40 }));
  add(new CylinderGeometry(0.62, 0.66, 0.34, 48).translate(0, BASE + 0.17, 0), group, score, 0.95);
  await nap();

  // секторы: закрытое требование — лаймовая плитка со значком, «ваша сторона» — тёмный контур
  const fullGeo = keep(wedge(span, 0.16)), thinGeo = keep(wedge(span, 0.04)), mid = (R0 + R1) / 2;
  const sectors: { holder: Group; mat: ShaderMaterial; line: ReturnType<typeof outline>; on: number; done: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    const holder = new Group();
    // сектор 0 стоит спереди; дальше по часовой стрелке, если смотреть сверху
    holder.rotation.y = -Math.PI / 2 - i * span;
    const mat = keep(engrave(sh, { kind: done[i] ? 1 : 0, art: keep(icon(i)), rect: [mid - 0.36, -0.36, 0.72, 0.72], rings: true, top: 14, strata: 50, hatch: done[i] ? 0.4 : 0.25, gain: done[i] ? 1 : 0.6, ink: done[i] ? 1 : 0.5 }));
    const line = add(done[i] ? fullGeo : thinGeo, holder, mat, done[i] ? 0.95 : 0.45, 20);
    dial.add(holder);
    sectors.push({ holder, mat, line, on: 0, done: done[i] });
    if (i % 3 === 2) await nap();
  }

  const ptr = pointer(canvas);
  const EL = 0.78, target = new Vector3(0, 0.2, 0.1);
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = 0, turn = 0, turned = false;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(new Vector3(Math.cos(a) * RIM, 0, Math.sin(a) * RIM), new Vector3(Math.cos(a) * RIM, 0.7, Math.sin(a) * RIM)); }
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(EL), Math.cos(EL)), pts, [0.9, 0.9, 0.9]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    baseMat.uniforms.uReveal.value = ease((age - 0.1) / 1.2);
    // диск поворачивается кратчайшим путём, чтобы выбранный сектор встал к зрителю
    const want = active * span;
    if (!turned) { turn = want; turned = true; }
    let diff = (want - turn) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2; else if (diff < -Math.PI) diff += Math.PI * 2;
    turn += diff * (1 - Math.exp(-dt * 4.5));
    dial.rotation.y = turn;
    const k = 1 - Math.exp(-dt * 6);
    sectors.forEach((s, i) => {
      s.on += ((i === active ? 1 : 0) - s.on) * k;
      const up = ease((age - 0.5 - i * 0.07) / 0.6);
      s.holder.position.y = BASE + s.on * 0.2 - (1 - up) * 0.3;
      s.holder.scale.y = Math.max(0.001, up);
      s.mat.uniforms.uHot.value = s.on * (s.done ? 0.9 : 1.4);
      s.mat.uniforms.uReveal.value = ease((age - 0.8 - i * 0.07) / 0.6);
      s.line.material.opacity = Math.min(1, (s.done ? 0.95 : 0.45) + s.on * 0.5) * sh.uShow.value;
    });
    for (const e of edges) if (!sectors.some((s) => s.line === e.line)) e.line.material.opacity = e.base * sh.uShow.value;
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.03 + ptr.p.nx * 0.06 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.04 - pitch) * kk;
    group.rotation.set(pitch, yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame });
  return {
    setActive: (i) => { active = ((i % n) + n) % n; },
    dispose: () => {
      unmount(); ptr.off();
      for (const k of kept) k.dispose();
      for (const e of edges) { e.line.geometry.dispose(); e.line.material.dispose(); }
      ground.geometry.dispose(); ground.material.dispose();
    },
  };
};
