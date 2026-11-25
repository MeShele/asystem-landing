import { Group, PerspectiveCamera, Scene, Vector3, type Material, type Object3D } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, fonts, FONT, frameCamera, HEX, pointer } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { catcher, materials, rig, screen, solid } from "@/three/studio";

/**
 * «Сделка без сотрудника» как механизм: корпус платформы с шестернями, которые крутятся сами,
 * и две ленты. По ближней дорожке слева направо идёт покупка: сомы заезжают в корпус, с другой
 * стороны выезжает крипта. По дальней дорожке справа налево — продажа. Человека в сцене нет.
 * Модель сделана в Blender (scripts/blender/gears.py); здесь — материалы, свет и движение.
 * Сомы золотые с «с», крипта лаймовая со знаком биткоина.
 */
const HOUSE = { w: 4.9, h: 0.6, d: 2.8 }, BELT = { x0: 2.45, x1: 5.35, y: 0.22 }, LANE = 0.36;
const N1 = 24, N2 = 14;

/** табло на фасаде корпуса: пара валют, как на монетах */
const display = () => screen(1100, 200, (c, w, h) => {
  c.fillStyle = "#06100a"; c.beginPath(); c.roundRect(0, 0, w, h, 30); c.fill();
  c.font = FONT(92); c.textBaseline = "middle";
  c.textAlign = "right"; c.fillStyle = HEX.amber; c.fillText("KGS", w / 2 - 100, h / 2 + 6);
  c.textAlign = "left"; c.fillStyle = HEX.lime; c.fillText("BTC", w / 2 + 100, h / 2 + 6);
  c.strokeStyle = HEX.ice; c.lineWidth = 12; c.lineCap = "round"; c.lineJoin = "round";
  for (const [y, dir] of [[h / 2 - 22, 1], [h / 2 + 22, -1]]) {
    c.beginPath(); c.moveTo(w / 2 - 56, y); c.lineTo(w / 2 + 56, y); c.stroke();
    c.beginPath(); c.moveTo(w / 2 + dir * 56 - dir * 22, y - 18); c.lineTo(w / 2 + dir * 56, y); c.lineTo(w / 2 + dir * 56 - dir * 22, y + 18); c.stroke();
  }
}, false);

export const mountGears = async ({ canvas }: { canvas: HTMLCanvasElement }): Promise<() => void> => {
  const [model] = await Promise.all([loadModel("/models/gears.glb"), fonts()]);
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const mat = materials();
  const pad = mat.graphite.clone(); pad.color.set(0x2a3035);
  const board = display();
  const target = new Vector3(0, 0.4, 0);
  const light = rig(scene, group, { target, span: 6.6, rim: new Vector3(4.5, 3, -5) });
  const floor = catcher(16, 9, -0.01, 0.5);
  group.add(floor);

  const { nodes, dispose: free } = adopt(model, { ...mat, pad, screen: board.material } as unknown as Record<string, Material>, ["screen"]);
  group.add(model);
  // колёса в зацеплении: малые крутятся навстречу большому и быстрее во столько раз, во сколько у них меньше зубьев
  const wheels = [
    { holder: nodes.n_gear_0, dir: 1, phase: 0 },
    { holder: nodes.n_gear_1, dir: -N1 / N2, phase: Math.PI / N2 },
    { holder: nodes.n_gear_2, dir: -N1 / N2, phase: Math.PI / N2 },
  ];
  // монеты: образцы из модели размножаются по три на каждый отрезок каждой дорожки; слева сомы, справа крипта
  const protos: Record<string, Object3D> = { som: nodes.n_coin_som, btc: nodes.n_coin_btc };
  const len = BELT.x1 - BELT.x0, SPAN = len - 0.25;
  const coins: { holder: Object3D; lane: number; side: number; slot: number }[] = [];
  for (const lane of [1, -1]) for (const side of [-1, 1]) for (let slot = 0; slot < 3; slot++) {
    const holder = protos[side === -1 ? "som" : "btc"].clone();
    group.add(holder);
    coins.push({ holder, lane, side, slot });
  }
  for (const p of Object.values(protos)) p.removeFromParent();
  solid(group);

  const ptr = pointer(canvas);
  const { h, d } = HOUSE;
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0, ticks = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5;
      yaw0 = narrow ? -0.9 : -0.12;
      const pts: Vector3[] = [];
      for (const x of [-BELT.x1 - 0.2, BELT.x1 + 0.2]) for (const z of [-d / 2, d / 2]) for (const y of [0, h + 0.6]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(narrow ? 0.62 : 0.74), Math.cos(narrow ? 0.62 : 0.74)), pts, [0.97, 0.94, 0.94]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    // сцена вырастает из точки; колёса раскручиваются и дальше идут ровно
    group.scale.setScalar(0.86 + 0.14 * ease(age / 0.8));
    const run = Math.max(0, age - 0.3), turn = (run - 1.2 * (1 - Math.exp(-run / 1.2))) * 0.5;
    for (const g of wheels) g.holder.rotation.y = turn * g.dir + g.phase;
    // монеты едут по дорожкам: ближняя вправо, дальняя влево; у корпуса уходят в приёмное окно
    for (const c of coins) {
      const p = (((age * 0.11 + c.slot / 3) % 1) + 1) % 1, along = c.lane > 0 ? p : 1 - p;
      c.holder.position.set(c.side < 0 ? -BELT.x1 + 0.12 + along * SPAN : BELT.x0 + 0.13 + along * SPAN, BELT.y + 0.09, c.lane * LANE);
      c.holder.scale.setScalar(Math.max(0.001, ease(Math.min(1, p * 7, (1 - p) * 7))));
    }
    // движется всё время, но тени хватает пересчёта через кадр
    if (++ticks % 2 === 0) light.refresh();
    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.04 + ptr.p.nx * 0.07 - yaw) * k;
    pitch += (-ptr.p.ny * 0.03 - pitch) * k;
    group.rotation.set(pitch, yaw0 + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame });
  return () => {
    unmount(); ptr.off();
    free(); board.dispose(); pad.dispose();
    floor.geometry.dispose(); (floor.material as Material).dispose();
    light.dispose(); mat.dispose();
  };
};
