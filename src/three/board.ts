import { BoxGeometry, CylinderGeometry, Group, Mesh, PerspectiveCamera, Scene, Vector3, type BufferGeometry, type CanvasTexture } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { mountLive, type LiveSize } from "@/three/live";
import { art, beam, ease, engrave, frameCamera, headAt, nap, outline, pointer, ribbon, shadow, shared, tags } from "@/three/kit";

/**
 * Путь заявки как плата: платформа — печатная плата, пять шагов заявки — пять микросхем на общей
 * шине, сама плата — сервер в Бишкеке. По шине бежит импульс заявки; микросхема, до которой он
 * дошёл, вспыхивает. Подписи шагов стоят над микросхемами на тонких лучах, как подпись Бишкека
 * на карте героя.
 */
const W = 10, D = 2.9, T = 0.3;               // плата: ширина, глубина, толщина
const XS = [-3.8, -1.9, 0, 1.9, 3.8], Z = -0.2; // места микросхем
const SPEED = 0.15;                            // рейсов импульса в секунду
const CAPS: [number, number][] = [[-2.85, -1.0], [-0.95, 0.75], [0.95, -1.05], [2.85, 0.8], [-4.55, 0.85], [4.5, -0.95]]; // конденсаторы

// детерминированный шум: плата одинаковая при каждом заходе
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

/** дорожки, площадки и разъём — рисунок верхней стороны платы */
const boardArt = () => art(2048, 594, (c, w, h) => {
  const u = w / W, r = rng(7), X = (x: number) => (x + W / 2) * u, Y = (z: number) => (z + D / 2) * u;
  const line = (pts: [number, number][], width: number, alpha: number) => {
    c.globalAlpha = alpha; c.lineWidth = width; c.beginPath();
    pts.forEach(([x, z], i) => (i ? c.lineTo(X(x), Y(z)) : c.moveTo(X(x), Y(z))));
    c.stroke();
  };
  const dot = (x: number, z: number, rad: number, alpha: number, fill = true) => {
    c.globalAlpha = alpha; c.beginPath(); c.arc(X(x), Y(z), rad, 0, Math.PI * 2);
    if (fill) c.fill(); else { c.lineWidth = 2; c.stroke(); }
  };
  // шина между микросхемами: три дорожки
  for (let i = 0; i < XS.length - 1; i++) for (const dz of [-0.14, 0, 0.14]) line([[XS[i] + 0.62, Z + dz], [XS[i + 1] - 0.62, Z + dz]], dz ? 3 : 5, dz ? 0.55 : 0.95);
  line([[-W / 2 + 0.25, Z], [XS[0] - 0.62, Z]], 5, 0.8);
  line([[XS[4] + 0.7, Z], [W / 2 - 0.25, Z]], 5, 0.8);
  // от ножек каждой микросхемы — дорожки к краям платы с изломом под 45°
  for (const cx of XS) for (const side of [-1, 1]) for (let k = 0; k < 6; k++) {
    const x0 = cx - 0.42 + k * 0.168, z0 = Z + side * 0.6;
    const run = 0.18 + r() * 0.5, bend = (r() - 0.5) * 0.9, z1 = z0 + side * run, z2 = z1 + side * Math.abs(bend), zEnd = side > 0 ? D / 2 - 0.16 - r() * 0.25 : -D / 2 + 0.16 + r() * 0.3;
    const a = 0.3 + r() * 0.45;
    line([[x0, z0], [x0, z1], [x0 + bend, z2], [x0 + bend, zEnd]], 2.4, a);
    dot(x0 + bend, zEnd, 5, a + 0.2);
  }
  // переходные отверстия, площадки под конденсаторы, крепёж по углам
  for (let i = 0; i < 46; i++) dot((r() - 0.5) * (W - 0.8), (r() - 0.5) * (D - 0.5), 3.2, 0.22 + r() * 0.3);
  for (const [x, z] of CAPS) dot(x, z, 30, 0.5, false);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { dot(sx * (W / 2 - 0.3), sz * (D / 2 - 0.3), 20, 0.6, false); dot(sx * (W / 2 - 0.3), sz * (D / 2 - 0.3), 6, 0.6); }
  // краевой разъём: гребёнка контактов у ближнего края
  for (let k = 0; k < 34; k++) line([[-1.65 + k * 0.1, D / 2 - 0.02], [-1.65 + k * 0.1, D / 2 - 0.2]], 5, 0.6);
  c.globalAlpha = 0.35; c.lineWidth = 2; c.strokeRect(6, 6, w - 12, h - 12);
});

/** пиктограмма на крышке микросхемы: 0 клиент, 1 сайт, 2 оплата, 3 оператор, 4 Финнадзор */
const chipArt = (kind: number) => art(256, 256, (c, w) => {
  const r = rng(40 + kind);
  c.lineWidth = 7; c.globalAlpha = 0.5;
  c.strokeRect(14, 14, w - 28, w - 28);
  c.globalAlpha = 1;
  c.beginPath(); c.arc(38, 38, 7, 0, Math.PI * 2); c.fill();            // ключ первой ножки
  c.lineWidth = 9;
  if (kind === 0) {
    c.beginPath(); c.arc(128, 104, 30, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(128, 214, 62, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
  } else if (kind === 1) {
    c.strokeRect(54, 70, 148, 118);
    c.beginPath(); c.moveTo(54, 100); c.lineTo(202, 100); c.stroke();
    for (const x of [72, 90, 108]) { c.beginPath(); c.arc(x, 85, 4, 0, Math.PI * 2); c.fill(); }
    c.lineWidth = 7;
    for (const [y, x2] of [[124, 180], [146, 150], [168, 166]]) { c.beginPath(); c.moveTo(74, y); c.lineTo(x2, y); c.stroke(); }
  } else if (kind === 2) {
    c.lineWidth = 7;
    for (const [x, y] of [[58, 62], [150, 62], [58, 154]]) { c.strokeRect(x, y, 46, 46); c.fillRect(x + 15, y + 15, 16, 16); }
    for (let i = 0; i < 26; i++) { const x = 58 + Math.floor(r() * 9) * 16, y = 62 + Math.floor(r() * 9) * 16; if ((x < 116 && y < 120) || (x > 136 && y < 120) || (x < 116 && y > 140)) continue; c.fillRect(x, y, 12, 12); }
  } else if (kind === 3) {
    c.lineWidth = 8;
    for (const y of [78, 126, 174]) {
      c.strokeRect(58, y - 15, 30, 30);
      c.beginPath(); c.moveTo(64, y); c.lineTo(72, y + 8); c.lineTo(84, y - 9); c.stroke();
      c.beginPath(); c.moveTo(106, y); c.lineTo(y === 126 ? 178 : 198, y); c.stroke();
    }
  } else {
    c.beginPath(); c.moveTo(48, 100); c.lineTo(128, 56); c.lineTo(208, 100); c.closePath(); c.stroke();
    for (const x of [70, 108, 148, 186]) { c.beginPath(); c.moveTo(x, 112); c.lineTo(x, 184); c.stroke(); }
    c.beginPath(); c.moveTo(48, 198); c.lineTo(208, 198); c.stroke();
  }
});

export type BoardOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[]; base: HTMLElement | null };

export const mountBoard = async ({ canvas, labels, base }: BoardOptions): Promise<() => void> => {
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const kept: { dispose: () => void }[] = [];
  const edges: { line: ReturnType<typeof outline>; base: number }[] = [];
  const edged = (geo: BufferGeometry, opacity: number) => { const line = outline(geo, 0); edges.push({ line, base: opacity }); return line; };
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };

  // плата
  const boardGeo = keep(new BoxGeometry(W, T, D));
  const boardMat = keep(engrave(sh, { art: keep(boardArt()), rect: [-W / 2, -D / 2, W, D], strata: 22, top: 26, gain: 0.9, hatch: 0.3 }));
  const board = new Mesh(boardGeo, boardMat);
  board.position.y = -T / 2;
  const boardEdge = edged(boardGeo, 0.55);
  boardEdge.position.copy(board.position);
  const ground = shadow(sh, W * 1.25, D * 1.9, -T - 0.25, 0.55);
  group.add(ground, board, boardEdge);

  await nap();
  // микросхемы: последняя — итоговая, лаймовая и выше остальных
  const chipArts: CanvasTexture[] = [];
  for (let i = 0; i < XS.length; i++) { chipArts.push(keep(chipArt(i))); await nap(); }
  const chips = XS.map((x, i) => {
    const last = i === XS.length - 1, s = last ? 1.26 : 1.1, hgt = last ? 0.36 : 0.24;
    const geo = keep(new BoxGeometry(s, hgt, s));
    const mat = keep(engrave(sh, { kind: last ? 1 : 0, art: chipArts[i], rect: [-s / 2, -s / 2, s, s], strata: 30, top: 34, hatch: 0.35 }));
    const body = new Mesh(geo, mat), edge = edged(geo, last ? 0.9 : 0.6);
    const holder = new Group();
    holder.add(body, edge);
    holder.position.set(x, hgt / 2, Z);
    group.add(holder);
    return { holder, mat, hgt, t: (x + 4.6) / 9.2 };
  });

  await nap();
  // ножки микросхем и мелкие детали — одной геометрией
  const small: BufferGeometry[] = [];
  for (const x of XS) for (const side of [-1, 1]) for (let k = 0; k < 6; k++) small.push(new BoxGeometry(0.07, 0.05, 0.16).translate(x - 0.42 + k * 0.168, 0.025, Z + side * 0.62));
  for (const [x, z] of CAPS) small.push(new CylinderGeometry(0.15, 0.15, 0.34, 20).translate(x, 0.17, z));
  for (const [x, z] of [[-3.1, 0.95], [-1.2, 0.85], [1.4, -1.05], [3.3, 0.95], [0.3, 0.9]]) small.push(new BoxGeometry(0.34, 0.1, 0.16).translate(x, 0.05, z));
  const smallGeo = keep(mergeGeometries(small));
  for (const g of small) g.dispose();
  group.add(new Mesh(smallGeo, keep(engrave(sh, { strata: 40, top: 30 }))), edged(smallGeo, 0.35));

  await nap();
  // шина с импульсом и лучи-выноски к подписям
  const bus = ribbon(sh, [{ pts: Array.from({ length: 41 }, (_, i) => new Vector3(-4.6 + (i / 40) * 9.2, 0.02, Z)), phase: 0, speed: SPEED }], 0.0);
  bus.renderOrder = 2;
  group.add(bus);
  const BEAM = 1.85;
  const beams = chips.map((c) => { const b = beam(sh, new Vector3(c.holder.position.x, c.hgt, Z), BEAM, 1.3); b.renderOrder = 3; group.add(b); return b; });
  const tagAt = [...chips.map((c) => new Vector3(c.holder.position.x, c.hgt + BEAM, Z)), new Vector3(-W / 2 + 0.2, -T, D / 2)];
  const tag = tags([...labels, base], tagAt);

  const ptr = pointer(canvas);
  const target = new Vector3(0, 0.45, 0.1), fitPts: Vector3[] = [];
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      // на узком экране плата уходит в глубину по диагонали, иначе не поместится
      const narrow = aspect < 1.5, el = narrow ? 0.62 : 0.86;
      yaw0 = narrow ? -0.95 : 0;
      fitPts.length = 0;
      for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) fitPts.push(new Vector3(x, -T, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      if (!narrow) for (const p of tagAt.slice(0, 5)) fitPts.push(p.clone().setY(p.y + 0.75));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(el), Math.cos(el)), fitPts, narrow ? [0.96, 0.92, 0.92] : [0.95, 0.96, 0.8]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    for (const e of edges) e.line.material.opacity = e.base * sh.uShow.value;
    boardMat.uniforms.uReveal.value = ease((age - 0.15) / 1.5);
    const head = headAt(age, 0, SPEED);
    chips.forEach((c, i) => {
      // микросхемы вырастают по очереди; та, до которой дошёл импульс, вспыхивает
      const up = ease((age - 0.5 - i * 0.14) / 0.6);
      c.holder.scale.y = Math.max(0.001, up);
      c.holder.position.y = (c.hgt / 2) * up;
      c.mat.uniforms.uReveal.value = ease((age - 0.9 - i * 0.14) / 0.7);
      const since = head - c.t;
      c.mat.uniforms.uHot.value = age > 2 && since > 0 ? Math.exp(-since * 5) : 0;
      beams[i].material.uniforms.uGain.value = 1.3 * ease((age - 1.5 - i * 0.1) / 0.6) * (1 + (c.mat.uniforms.uHot.value as number) * 0.8);
    });
    bus.material.uniforms.uRes.value.set(size.w, size.h);
    bus.material.uniforms.uWidth.value = 2.2 * size.dpr;

    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.03 + ptr.p.nx * 0.05 - yaw) * k;
    pitch += (-ptr.p.ny * 0.025 - pitch) * k;
    group.rotation.set(pitch, yaw0 + yaw, 0);
    group.updateMatrixWorld();
    for (const b of beams) b.rotation.y = -(yaw0 + yaw);
    tag.place(group, camera, size, ease((age - 1.7) / 0.7));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    for (const k of kept) k.dispose();
    bus.geometry.dispose(); bus.material.dispose();
    for (const b of beams) { b.geometry.dispose(); b.material.dispose(); }
    for (const e of edges) { e.line.geometry.dispose(); e.line.material.dispose(); }
    ground.geometry.dispose(); ground.material.dispose();
  };
};
