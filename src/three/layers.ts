import { BoxGeometry, BufferGeometry, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, Mesh, PerspectiveCamera, Scene, Vector3, type CanvasTexture } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, ease, engrave, frameCamera, nap, outline, pointer, ribbon, shared, tags } from "@/three/kit";

/**
 * «Что внутри» как взрыв-схема: платформа разобрана на четыре слоя — витрина, кабинет клиента,
 * админка, отчёты. На каждом слое линиями нарисован его экран. Выбранный слой выдвигается
 * и светится, остальные гаснут; сквозь стопку сверху вниз идёт импульс заявки.
 */
const W = 4.4, D = 2.9, H = 0.12, GAP = 0.88, N = 4;

const round = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = false) => {
  c.beginPath(); c.roundRect(x, y, w, h, r);
  if (fill) c.fill(); else c.stroke();
};
const row = (c: CanvasRenderingContext2D, x1: number, x2: number, y: number) => { c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); };
const ring = (c: CanvasRenderingContext2D, x: number, y: number, r: number, fill = false) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) c.fill(); else c.stroke(); };

/** экран слоя линиями: 0 витрина, 1 кабинет, 2 админка, 3 отчёты */
const screen = (kind: number) => art(1024, 675, (c, w, h) => {
  c.lineWidth = 5;
  c.globalAlpha = 0.5; round(c, 10, 10, w - 20, h - 20, 26); c.globalAlpha = 1;
  // шапка: знак, пункты меню, кнопка
  round(c, 44, 40, 40, 40, 10, true);
  for (let i = 0; i < 4; i++) row(c, 130 + i * 96, 190 + i * 96, 60);
  round(c, w - 190, 38, 146, 44, 12);
  c.globalAlpha = 0.4; row(c, 30, w - 30, 108); c.globalAlpha = 1;
  if (kind === 0) {
    // виджет обмена: два поля, стрелка между ними, кнопка; справа курсы
    round(c, 60, 150, 520, 470, 24);
    for (const y of [200, 356]) { round(c, 96, y, 448, 96, 18); ring(c, 150, y + 48, 24); row(c, 196, 330, y + 48); round(c, 420, y + 26, 96, 44, 12); }
    ring(c, 320, 326, 22, true);
    round(c, 96, 494, 448, 84, 18, true);
    for (let i = 0; i < 5; i++) { const y = 176 + i * 90; ring(c, 660, y, 20); row(c, 700, 820, y - 10); c.globalAlpha = 0.55; row(c, 700, 780, y + 14); c.globalAlpha = 1; row(c, 880, 960, y); }
  } else if (kind === 1) {
    // кабинет: меню слева, шаги заявки, карточка с QR
    ring(c, 110, 190, 38);
    for (let i = 0; i < 5; i++) row(c, 60, 200 - (i % 2) * 40, 280 + i * 60);
    c.globalAlpha = 0.4; row(c, 250, 250, 130); c.beginPath(); c.moveTo(250, 130); c.lineTo(250, h - 40); c.stroke(); c.globalAlpha = 1;
    row(c, 330, 930, 190);
    for (let i = 0; i < 4; i++) ring(c, 330 + i * 200, 190, 22, i < 2);
    round(c, 300, 270, 660, 350, 24);
    for (let i = 0; i < 4; i++) { row(c, 340, 560 - (i % 2) * 70, 330 + i * 66); }
    round(c, 700, 310, 220, 220, 12);
    for (const [x, y] of [[720, 330], [850, 330], [720, 460]]) { round(c, x, y, 50, 50, 6); c.fillRect(x + 16, y + 16, 18, 18); }
    for (let i = 0; i < 14; i++) c.fillRect(790 + ((i * 37) % 110), 400 + ((i * 53) % 110), 16, 16);
    round(c, 340, 560, 200, 40, 12, true);
  } else if (kind === 2) {
    // админка: доска заявок по статусам, одна карточка в работе
    for (let i = 0; i < 4; i++) round(c, 50 + i * 130, 140, 108, 38, 12);
    for (let k = 0; k < 4; k++) {
      const x = 50 + k * 236;
      row(c, x, x + 150, 230);
      for (let j = 0; j < 3 - (k % 2); j++) {
        const y = 262 + j * 122, hot = k === 1 && j === 0;
        round(c, x, y, 212, 100, 16, hot);
        if (hot) { c.globalCompositeOperation = "destination-out"; row(c, x + 22, x + 150, y + 34); row(c, x + 22, x + 110, y + 66); c.globalCompositeOperation = "source-over"; }
        else { row(c, x + 22, x + 150, y + 34); c.globalAlpha = 0.55; row(c, x + 22, x + 110, y + 66); c.globalAlpha = 1; }
      }
    }
  } else {
    // отчёты: листы с таблицей, печать, календарь
    for (let s = 2; s >= 0; s--) {
      const x = 330 + s * 36, y = 150 + s * 26;
      c.globalAlpha = s ? 0.45 : 1;
      round(c, x, y, 420, 440, 14);
      if (!s) { for (let i = 0; i < 7; i++) row(c, x + 30, x + 390, y + 70 + i * 50); for (const dx of [150, 270]) { c.beginPath(); c.moveTo(x + dx, y + 70); c.lineTo(x + dx, y + 370); c.stroke(); } }
    }
    c.globalAlpha = 1;
    ring(c, 800, 500, 78); ring(c, 800, 500, 58);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; c.beginPath(); c.moveTo(800 + Math.cos(a) * 62, 500 + Math.sin(a) * 62); c.lineTo(800 + Math.cos(a) * 74, 500 + Math.sin(a) * 74); c.stroke(); }
    c.beginPath(); c.moveTo(770, 500); c.lineTo(792, 522); c.lineTo(834, 474); c.stroke();
    round(c, 50, 150, 230, 220, 14);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) c.fillRect(74 + j * 40, 214 + i * 36, 18, 18);
    round(c, 50, 400, 230, 60, 14, true);
  }
});

export type LayersOptions = { canvas: HTMLCanvasElement; tag: HTMLElement | null };
export type LayersHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountLayers = async ({ canvas, tag }: LayersOptions): Promise<LayersHandle> => {
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 1.4, 0.1, 80);
  const geo = new BoxGeometry(W, H, D);
  const screens: CanvasTexture[] = [];
  for (let i = 0; i < N; i++) { screens.push(screen(i)); await nap(); }
  const plates = Array.from({ length: N }, (_, i) => {
    const tex = screens[i];
    const mat = engrave(sh, { art: tex, rect: [-W / 2, -D / 2, W, D], strata: 60, alpha: 0.94 });
    const body = new Mesh(geo, mat), edge = outline(geo, 0.4);
    const holder = new Group();
    holder.add(body, edge);
    group.add(holder);
    return { holder, mat, edge, tex, on: 0 };
  });

  // направляющие взрыв-схемы: четыре тонкие вертикали по углам стопки
  const guideGeo = new BufferGeometry();
  const top = (N - 1) * GAP + 0.3, gp: number[] = [];
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) gp.push(x, -0.3, z, x, top, z);
  guideGeo.setAttribute("position", new Float32BufferAttribute(gp, 3));
  const guideMat = new LineBasicMaterial({ color: 0xb6ff1a, transparent: true, opacity: 0 });
  group.add(new LineSegments(guideGeo, guideMat));

  // импульс заявки идёт сквозь слои сверху вниз
  const pulse = ribbon(sh, [{ pts: Array.from({ length: 24 }, (_, i) => new Vector3(-0.6, top + 0.25 - (i / 23) * (top + 0.7), 0.3)), phase: 0.2, speed: 0.22 }], 0.12);
  pulse.renderOrder = 2;
  group.add(pulse);

  const anchor = new Vector3();
  const tagSet = tags([tag], [anchor]);
  const ptr = pointer(canvas);
  const YAW = -0.62, target = new Vector3(0.25, ((N - 1) * GAP) / 2, 0), axis = new Vector3(0, 1, 0);
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-W / 2, W / 2 + 0.9]) for (const z of [-D / 2, D / 2]) for (const y of [-0.2, top]) pts.push(new Vector3(x, y, z).applyAxisAngle(axis, YAW));
      // на широком экране стопка смещена влево: справа место под список выбранного слоя
      const roomy = size.cssW >= 640;
      camera.clearViewOffset();
      frameCamera(camera, aspect, target.clone().applyAxisAngle(axis, YAW), new Vector3(0, Math.sin(0.52), Math.cos(0.52)), pts, [roomy ? 0.8 : 0.94, 0.94, 0.94]);
      if (roomy) { camera.setViewOffset(aspect, 1, 0.09 * aspect, 0, aspect, 1); camera.updateMatrixWorld(); }
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    // стопка разъезжается из сложенного состояния
    const open = ease((age - 0.2) / 1.3), k = 1 - Math.exp(-dt * 5);
    plates.forEach((p, i) => {
      p.on += ((i === active ? 1 : 0) - p.on) * k;
      p.holder.position.set(p.on * 0.9, (N - 1 - i) * (0.16 + (GAP - 0.16) * open) + p.on * 0.06, p.on * 0.35);
      p.mat.uniforms.uGain.value = 0.22 + 0.78 * p.on;
      p.mat.uniforms.uHot.value = p.on * 0.25;
      p.mat.uniforms.uReveal.value = ease((age - 0.5 - i * 0.12) / 0.9);
      p.edge.material.opacity = (0.28 + 0.62 * p.on) * sh.uShow.value;
    });
    guideMat.opacity = 0.2 * open * sh.uShow.value;
    pulse.material.uniforms.uRes.value.set(size.w, size.h);
    pulse.material.uniforms.uWidth.value = 1.6 * size.dpr;
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.22) * 0.05 + ptr.p.nx * 0.09 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.04 - pitch) * kk;
    group.rotation.set(pitch, YAW + yaw, 0);
    group.updateMatrixWorld();
    // подпись держится у правого дальнего угла выбранного слоя: там свободно
    anchor.set(W / 2 + 0.05, 0, -D / 2).add(plates[active].holder.position);
    tagSet.place(group, camera, size, ease((age - 1.2) / 0.6));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame, post: tagSet.write });
  return {
    setActive: (i) => { active = Math.max(0, Math.min(N - 1, i)); },
    dispose: () => {
      unmount(); ptr.off();
      geo.dispose(); guideGeo.dispose(); guideMat.dispose();
      for (const p of plates) { p.mat.dispose(); p.tex.dispose(); p.edge.geometry.dispose(); p.edge.material.dispose(); }
      pulse.geometry.dispose(); pulse.material.dispose();
    },
  };
};
