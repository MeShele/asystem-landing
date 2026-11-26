import {
  CanvasTexture, CircleGeometry, Group, LinearFilter, Mesh, MeshBasicMaterial, PerspectiveCamera, SRGBColorSpace, Scene, Vector3,
  type Material,
} from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, fonts, FONT, frameCamera, HEX, pointer, tags } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { catcher, materials, rig, solid } from "@/three/studio";

/**
 * «Сделка без сотрудника» как конвейер. Поток всегда слева направо: слева клиент отдаёт (телефон с QR),
 * монета едет в машину, шестерни крутятся, справа выезжает другая валюта и уходит в телефон клиента
 * с галочкой. Пары меняются от сделки к сделке — фиат и крипта в обе стороны: монеты фиата золотые,
 * крипты — лаймовые, на каждой свой знак. После каждой сделки машина выбрасывает монету дохода
 * в кассу обменника перед собой — блок в этот момент прибавляет доход к счётчику.
 * Модель — scripts/blender/gears.py; здесь движение, знаки валют, экраны телефонов и табло.
 */
const HOUSE = { w: 4.9, h: 0.6, d: 2.8 }, BELT = { x0: 2.45, x1: 4.75, y: 0.22 }, CASH = { x: 2.02, z: 2.8 / 2 + 0.62 };
const N1 = 24, N2 = 14;
/** ритм: новая сделка каждые T секунд; монета едет по ленте IN/OUT секунд, машина держит её PROC */
const T = 1.1, IN = 1.3, PROC = 0.25, OUT = 1.3, POP = 0.45, START = 0.9, STACK = 10;

export type Deal = { from: string; to: string };
export type GearsOptions = {
  canvas: HTMLCanvasElement;
  /** подписи: клиент отдаёт, клиент получает, касса, доход над лотком */
  labels: (HTMLElement | null)[];
  deals: Deal[];
  /** сколько монет дохода уже упало в кассу */
  onDeal: (landed: number) => void;
};

function text(c: CanvasRenderingContext2D, ch: string, s: number, dy: number, dx = 0) {
  c.font = FONT(s * 0.62, 700); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(ch, s * (0.5 + dx), s * (0.53 + dy));
}
function bar(c: CanvasRenderingContext2D, s: number, x: number, y: number, w: number, h: number) {
  c.fillRect(s * (0.5 + x - w / 2), s * (0.5 + y - h / 2), s * w, s * h);
}
/** валюты: фиат или крипта и знак — шрифтом сайта, со штрихами там, где готового знака в шрифте нет */
const CUR: Record<string, { crypto: boolean; glyph: (c: CanvasRenderingContext2D, s: number) => void }> = {
  KGS: { crypto: false, glyph: (c, s) => { text(c, "с", s, -0.03); bar(c, s, 0, 0.27, 0.3, 0.07); } },
  USD: { crypto: false, glyph: (c, s) => text(c, "$", s, 0.02) },
  RUB: { crypto: false, glyph: (c, s) => { text(c, "P", s, 0, 0.04); bar(c, s, -0.03, 0.15, 0.36, 0.07); } },
  USDT: { crypto: true, glyph: (c, s) => { text(c, "T", s, 0.03); bar(c, s, 0, 0.0, 0.46, 0.07); } },
  BTC: { crypto: true, glyph: (c, s) => { text(c, "B", s, 0.02, 0.03); for (const y of [-0.31, 0.33]) for (const x of [-0.04, 0.1]) bar(c, s, x, y, 0.05, 0.1); } },
  ETH: { crypto: true, glyph: (c, s) => {
    c.beginPath(); c.moveTo(s * 0.5, s * 0.14); c.lineTo(s * 0.72, s * 0.5); c.lineTo(s * 0.5, s * 0.62); c.lineTo(s * 0.28, s * 0.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(s * 0.28, s * 0.56); c.lineTo(s * 0.5, s * 0.68); c.lineTo(s * 0.72, s * 0.56); c.lineTo(s * 0.5, s * 0.88); c.closePath(); c.fill();
  } },
};
const cur = (code: string) => CUR[code] ?? CUR.USDT;

/** холст-экран, который можно перерисовывать: развёртка Blender (flipY=false), светится сам */
const liveScreen = (w: number, h: number) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2d context unavailable");
  const map = new CanvasTexture(cv);
  map.flipY = false; map.colorSpace = SRGBColorSpace; map.minFilter = LinearFilter; map.generateMipmaps = false; map.anisotropy = 4;
  const material = new MeshBasicMaterial({ map, toneMapped: false });
  let key = "";
  return {
    material,
    /** нарисовать, если содержимое сменилось */
    draw: (k: string, f: (c: CanvasRenderingContext2D, w: number, h: number) => void) => {
      if (k === key) return;
      key = k;
      c.clearRect(0, 0, w, h); c.lineCap = "round"; c.lineJoin = "round";
      f(c, w, h);
      map.needsUpdate = true;
    },
    dispose: () => { map.dispose(); material.dispose(); },
  };
};

/** знак валюты на лице монеты: прозрачный холст, знак тёмной краской */
const faceMaterial = (code: string) => {
  const s = 256, cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2d context unavailable");
  c.fillStyle = "#fff";
  cur(code).glyph(c, s);
  const map = new CanvasTexture(cv);
  map.colorSpace = SRGBColorSpace; map.anisotropy = 4;
  return new MeshBasicMaterial({ map, color: cur(code).crypto ? 0x0c1a04 : 0x2a1a02, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
};

/** QR-код для экрана: условный, но одинаковый от сделки к сделке, с тремя опорными квадратами */
const qr = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const n = 21, q = size / n;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  c.fillStyle = HEX.ice;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rnd() > 0.52) c.fillRect(x + i * q, y + j * q, q * 0.92, q * 0.92);
  for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    c.fillStyle = HEX.ice; c.fillRect(x + fx * q, y + fy * q, q * 7, q * 7);
    c.fillStyle = "#06100a"; c.fillRect(x + (fx + 1) * q, y + (fy + 1) * q, q * 5, q * 5);
    c.fillStyle = HEX.ice; c.fillRect(x + (fx + 2) * q, y + (fy + 2) * q, q * 3, q * 3);
  }
};

export const mountGears = async ({ canvas, labels, deals, onDeal }: GearsOptions): Promise<() => void> => {
  const [model] = await Promise.all([loadModel("/models/gears.glb"), fonts()]);
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const mat = materials();
  const pad = mat.graphite.clone(); pad.color.set(0x2a3035);
  const board = liveScreen(1100, 200), phoneIn = liveScreen(270, 520), phoneOut = liveScreen(270, 520);
  const target = new Vector3(0, 0.5, 0.35);
  const light = rig(scene, group, { target, span: 6.8, rim: new Vector3(4.5, 3, -5) });
  const floor = catcher(17, 10, -0.01, 0.5);
  group.add(floor);

  const { nodes, dispose: free } = adopt(model, { ...mat, pad, screen: board.material, screen_in: phoneIn.material, screen_out: phoneOut.material } as unknown as Record<string, Material>, ["screen", "screen_in", "screen_out"]);
  group.add(model);
  // колёса в зацеплении: малые крутятся навстречу большому и быстрее во столько раз, во сколько у них меньше зубьев
  const wheels = [
    { holder: nodes.n_gear_0, dir: 1, phase: 0 },
    { holder: nodes.n_gear_1, dir: -N1 / N2, phase: Math.PI / N2 },
    { holder: nodes.n_gear_2, dir: -N1 / N2, phase: Math.PI / N2 },
  ];

  // монеты: образец без знака; фиат — золото, крипта — лайм; знак кладётся сверху тонким диском
  const faces: Record<string, MeshBasicMaterial> = {};
  for (const code of new Set([...deals.flatMap((d) => [d.from, d.to]), "KGS"])) faces[code] = faceMaterial(code);
  const faceGeo = new CircleGeometry(0.205, 40).rotateX(-Math.PI / 2);
  const proto = nodes.n_coin;
  proto.removeFromParent();
  const coin = (scale = 1) => {
    const holder = proto.clone();
    const body = holder.children.find((o) => o instanceof Mesh) as Mesh | undefined;
    const face = new Mesh(faceGeo, faces.KGS);
    face.position.y = 0.0365; face.renderOrder = 2;
    holder.add(face);
    holder.scale.setScalar(scale);
    holder.visible = false;
    group.add(holder);
    return { holder, face, body, scale, code: "" };
  };
  type Coin = ReturnType<typeof coin>;
  const paint = (c: Coin, code: string) => {
    if (c.code === code) return;
    c.code = code;
    c.face.material = faces[code] ?? faces.KGS;
    if (c.body) c.body.material = cur(code).crypto ? mat.lime : mat.gold;
  };
  const inCoins = [coin(), coin(), coin()], outCoins = [coin(), coin(), coin()], pops = [coin(0.62), coin(0.62)];
  const stack = Array.from({ length: STACK }, () => coin(0.62));
  for (const c of [...pops, ...stack]) paint(c, "KGS");
  solid(group);

  // подписи: над телефонами, сбоку от кассы и над самим лотком — там всплывает доход с только что закрытой сделки
  const tag = tags(labels, [
    new Vector3(-(BELT.x1 + 0.5), 1.36, 0.05), new Vector3(BELT.x1 + 0.5, 1.36, 0.05),
    new Vector3(CASH.x + 0.5, 0.25, CASH.z), new Vector3(CASH.x, 0.62, CASH.z),
  ]);

  // экраны: телефон слева — QR и валюта, которую клиент отдаёт; справа — галочка и валюта, которую он получил; табло — пара в работе
  const label = (c: CanvasRenderingContext2D, code: string, w: number) => {
    c.fillStyle = cur(code).crypto ? HEX.lime : HEX.amber; c.font = FONT(code.length > 3 ? 60 : 72, 700); c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(code, w / 2, 372);
    c.fillStyle = "rgba(219,242,230,0.3)"; c.fillRect(w / 2 - 60, 440, 120, 12);
  };
  const drawIn = (d: { from: string }) => phoneIn.draw(d.from, (c, w, h) => {
    c.fillStyle = "#06100a"; c.fillRect(0, 0, w, h);
    qr(c, 35, 60, 200);
    label(c, d.from, w);
  });
  const drawOut = (d: { to: string }) => phoneOut.draw(d.to, (c, w, h) => {
    c.fillStyle = "#06100a"; c.fillRect(0, 0, w, h);
    c.strokeStyle = HEX.lime; c.lineWidth = 16;
    c.beginPath(); c.arc(w / 2, 165, 84, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 20; c.beginPath(); c.moveTo(w / 2 - 40, 168); c.lineTo(w / 2 - 10, 198); c.lineTo(w / 2 + 42, 136); c.stroke();
    label(c, d.to, w);
  });
  const drawBoard = (d: Deal) => board.draw(`${d.from}>${d.to}`, (c, w, h) => {
    c.fillStyle = "#06100a"; c.beginPath(); c.roundRect(0, 0, w, h, 30); c.fill();
    c.font = FONT(92); c.textBaseline = "middle";
    c.textAlign = "right"; c.fillStyle = cur(d.from).crypto ? HEX.lime : HEX.amber; c.fillText(d.from, w / 2 - 90, h / 2 + 6);
    c.textAlign = "left"; c.fillStyle = cur(d.to).crypto ? HEX.lime : HEX.amber; c.fillText(d.to, w / 2 + 90, h / 2 + 6);
    c.strokeStyle = HEX.ice; c.lineWidth = 12;
    c.beginPath(); c.moveTo(w / 2 - 50, h / 2); c.lineTo(w / 2 + 50, h / 2); c.stroke();
    c.beginPath(); c.moveTo(w / 2 + 26, h / 2 - 22); c.lineTo(w / 2 + 50, h / 2); c.lineTo(w / 2 + 26, h / 2 + 22); c.stroke();
  });
  const deal = (k: number) => deals[((k % deals.length) + deals.length) % deals.length];
  drawIn(deal(0)); drawOut(deal(deals.length - 1)); drawBoard(deal(0));

  const ptr = pointer(canvas);
  const { d } = HOUSE;
  const xIn0 = -BELT.x1 + 0.12, xIn1 = -BELT.x0 + 0.02, xOut0 = BELT.x0 - 0.02, xOut1 = BELT.x1 - 0.12, Y = BELT.y + 0.09;
  const slot = new Vector3(CASH.x, HOUSE.h * 0.6, d / 2 + 0.08);
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0, ticks = 0, told = -1;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5;
      yaw0 = narrow ? -0.9 : -0.12;
      // в кадр вписываются настоящие контуры — корпус, ленты с телефонами и касса; общий ящик вокруг всего
      // конвейера на узком экране оставлял пустые углы, и сцена выходила мелкой
      const pts: Vector3[] = [];
      const box = (x0: number, x1: number, z0: number, z1: number, y1: number) => {
        for (const x of [x0, x1]) for (const z of [z0, z1]) for (const y of [0, y1]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      };
      box(-HOUSE.w / 2, HOUSE.w / 2, -d / 2, d / 2, HOUSE.h + 0.5);
      box(-BELT.x1 - 0.9, BELT.x1 + 0.9, -0.5, 0.5, 1.45);
      box(CASH.x - 0.45, CASH.x + 0.45, CASH.z - 0.45, CASH.z + 0.45, 0.6);
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(0.6), Math.cos(0.6)), pts, [0.97, 0.94, 0.94]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0, tau = age - START;
    // сцена вырастает из точки; колёса раскручиваются и дальше идут ровно и быстро
    group.scale.setScalar(0.86 + 0.14 * ease(age / 0.8));
    const run = Math.max(0, age - 0.3), turn = (run - 0.8 * (1 - Math.exp(-run / 0.8))) * 1.15;
    for (const g of wheels) g.holder.rotation.y = turn * g.dir + g.phase;

    const now = Math.floor(tau / T);
    for (const c of [...inCoins, ...outCoins, ...pops]) c.holder.visible = false;
    for (let back = 0; back < 4; back++) {
      const k = now - back;
      if (k < 0) continue;
      const since = tau - k * T;
      // монета клиента: из телефона по ленте в машину; в начале пути появляется, в конце уходит в окно
      const pIn = since / IN;
      if (pIn >= 0 && pIn <= 1) {
        const c = inCoins[k % 3];
        paint(c, deal(k).from);
        c.holder.visible = true;
        c.holder.position.set(xIn0 + (xIn1 - xIn0) * pIn, Y, 0);
        c.holder.scale.setScalar(Math.max(0.001, ease(Math.min(1, pIn * 9, (1 - pIn) * 9))));
        if (pIn < 0.15) drawIn(deal(k));
      }
      // другая валюта: из машины по ленте в телефон клиента
      const pOut = (since - IN - PROC) / OUT;
      if (pOut >= 0 && pOut <= 1) {
        const c = outCoins[k % 3];
        paint(c, deal(k).to);
        c.holder.visible = true;
        c.holder.position.set(xOut0 + (xOut1 - xOut0) * pOut, Y, 0);
        c.holder.scale.setScalar(Math.max(0.001, ease(Math.min(1, pOut * 9, (1 - pOut) * 9))));
        if (pOut > 0.86) drawOut(deal(k));
      }
      if (since > IN - 0.1 && since < IN + PROC + 0.5) drawBoard(deal(k));
      // монета дохода: из щели машины дугой в кассу
      const pPop = (since - IN - 0.1) / POP;
      if (pPop >= 0 && pPop < 1) {
        const c = pops[k % 2];
        c.holder.visible = true;
        const top = 0.08 + Math.min(STACK, k) * 0.045;
        c.holder.position.set(slot.x, slot.y + (top + 0.03 - slot.y) * pPop + Math.sin(pPop * Math.PI) * 0.45, slot.z + (CASH.z - slot.z) * ease(pPop));
        c.holder.rotation.x = (1 - pPop) * 1.6;
        c.holder.scale.setScalar(c.scale * Math.min(1, pPop * 6));
      }
    }
    // сколько монет дохода уже в кассе: столбик растёт до десяти, дальше новые ложатся сверху
    const landed = tau > IN + 0.1 + POP ? Math.floor((tau - IN - 0.1 - POP) / T) + 1 : 0;
    stack.forEach((c, i) => {
      c.holder.visible = i < Math.min(STACK, landed);
      c.holder.position.set(CASH.x + Math.sin(i * 2.3) * 0.012, 0.08 + i * 0.045, CASH.z + Math.cos(i * 1.7) * 0.012);
    });
    if (landed !== told) { told = landed; onDeal(landed); }
    // монеты и колёса движутся всё время; тени хватает пересчёта через кадр
    if (++ticks % 2 === 0) light.refresh();
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.04 + ptr.p.nx * 0.07 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.03 - pitch) * kk;
    group.rotation.set(pitch, yaw0 + yaw, 0);
    group.updateMatrixWorld();
    tag.place(group, camera, size, ease((age - 0.8) / 0.6));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    free(); board.dispose(); phoneIn.dispose(); phoneOut.dispose(); pad.dispose();
    faceGeo.dispose(); for (const m of Object.values(faces)) { m.map?.dispose(); m.dispose(); }
    floor.geometry.dispose(); (floor.material as Material).dispose();
    light.dispose(); mat.dispose();
  };
};
