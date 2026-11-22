import { Group, Mesh, PerspectiveCamera, Scene, Vector3, type Material, type MeshPhysicalMaterial, type Object3D } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, frameCamera, pointer } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { catcher, materials, rig, solid } from "@/three/studio";

/**
 * Требования ГСФР как щит: четыре эмалевые пластины — KYC, проверки, данные, отчёты — на тёмной
 * основе, в центре золотая площадка с замком. Модель сделана в Blender (scripts/blender/shield.py):
 * на пластинах объёмные значки, у пластин вырез под замок — выдвигаясь, они проходят рядом с ним.
 * Выбранная строка списка выдвигает свою пластину вперёд и добавляет ей свечения.
 */
const W = 1.62, TOP = 1.9, BOT = -2.05;

export type ShieldOptions = { canvas: HTMLCanvasElement };
export type ShieldHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountShield = async ({ canvas }: ShieldOptions): Promise<ShieldHandle> => {
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 1.25, 0.1, 80);
  const mat = materials();
  const target = new Vector3(0, -0.12, 0.15);
  // щит висит над «полом»: свет почти сверху, иначе тень уезжает вбок и режется краем холста
  const light = rig(scene, group, { target, span: 3.4, rim: new Vector3(2.4, 1.2, -2.6), from: new Vector3(-0.1, 1.6, 0.5) });
  const floor = catcher(9, 7, BOT - 0.4, 0.5);
  group.add(floor);

  const model = await loadModel("/models/shield.glb");
  const { nodes, dispose: free } = adopt(model, mat as unknown as Record<string, Material>);
  group.add(model);
  // у каждой пластины своя эмаль: выбранная светится ярче остальных
  const plates = [0, 1, 2, 3].map((i) => {
    const holder = nodes[`n_plate_${i}`], enamel = mat.lime.clone();
    holder.traverse((o) => { if (o instanceof Mesh && o.material === mat.lime) o.material = enamel; });
    return { holder, enamel: enamel as MeshPhysicalMaterial, on: 0 };
  });
  const boss: Object3D = nodes.n_boss;
  solid(group);

  const ptr = pointer(canvas);
  const YAW = -0.34;
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = -1;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-W - 0.4, W + 0.4]) for (const y of [BOT - 0.5, TOP + 0.12]) for (const z of [0, 0.8]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(0.1), Math.cos(0.1)), pts, [0.97, 0.97, 0.97]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    const k = 1 - Math.exp(-dt * 7);
    // тень пересчитывается, только пока что-то движется: вход и выдвижение пластины
    if (age < 2.4 || plates.some((p, i) => Math.abs((i === active ? 1 : 0) - p.on) > 0.004)) light.refresh();
    plates.forEach((p, i) => {
      // пластины встают на основу по одной; выбранная выдвигается и светится ярче
      const land = ease((age - 0.25 - i * 0.14) / 0.75);
      p.on += ((i === active ? 1 : 0) - p.on) * k;
      p.holder.position.z = (1 - land) * 1.2 + p.on * 0.14;
      p.holder.scale.setScalar(0.6 + 0.4 * land);
      p.holder.visible = age > 0.25 + i * 0.14;
      p.enamel.emissiveIntensity = 0.1 + p.on * 0.3;
    });
    const lock = ease((age - 1.0) / 0.7);
    boss.position.z = (1 - lock) * 1.0;
    boss.scale.setScalar(0.5 + 0.5 * lock);
    boss.visible = age > 1.0;
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.45) * 0.09 + ptr.p.nx * 0.22 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.1 - pitch) * kk;
    group.rotation.set(pitch, YAW + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame });
  return {
    setActive: (i) => { active = i; },
    dispose: () => {
      unmount(); ptr.off();
      free();
      for (const p of plates) p.enamel.dispose();
      floor.geometry.dispose(); (floor.material as Material).dispose();
      light.dispose(); mat.dispose();
    },
  };
};
