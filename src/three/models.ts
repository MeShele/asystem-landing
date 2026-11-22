import { Mesh, Matrix4, type BufferGeometry, type Group, type Material, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Модели из Blender (public/models/*.glb, исходники — scripts/blender). В файле только геометрия
 * и имена: материалы назначаются здесь по именам (lime, graphite, gold …), подвижные части —
 * узлы с именами n_*. Внутри каждого узла детали одного материала сливаются в одно тело:
 * модель из сотни мелких деталей рисуется за десяток вызовов.
 */
let loader: GLTFLoader | null = null;

export const loadModel = async (url: string): Promise<Group> => {
  if (!loader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
  }
  return (await loader.loadAsync(url)).scene;
};

const isNode = (o: Object3D) => o.name.startsWith("n_");

/**
 * Назначает материалы по именам и сливает детали. mats — материалы сцены по именам из Blender;
 * keep — имена материалов, чьи детали остаются отдельными телами (экраны с собственной развёрткой).
 * Возвращает подвижные узлы по именам и функцию, освобождающую геометрию.
 */
export const adopt = (root: Group, mats: Record<string, Material>, keep: string[] = []) => {
  root.updateMatrixWorld(true);
  const nodes: Record<string, Object3D> = {}, owners = new Map<Object3D, Mesh[]>(), made: BufferGeometry[] = [];
  root.traverse((o) => {
    if (isNode(o)) nodes[o.name] = o;
    if (!(o instanceof Mesh)) return;
    let owner: Object3D = o.parent ?? root;
    while (owner !== root && !isNode(owner)) owner = owner.parent ?? root;
    owners.set(owner, [...(owners.get(owner) ?? []), o]);
  });
  const inv = new Matrix4(), rel = new Matrix4();
  for (const [owner, meshes] of owners) {
    inv.copy(owner.matrixWorld).invert();
    const groups = new Map<string, BufferGeometry[]>();
    for (const m of meshes) {
      const name = (m.material as Material).name.replace(/\.\d+$/, "");
      const g = (m.geometry as BufferGeometry).clone().applyMatrix4(rel.multiplyMatrices(inv, m.matrixWorld));
      (m.geometry as BufferGeometry).dispose();
      (m.material as Material).dispose();
      m.removeFromParent();
      if (!keep.includes(name)) { g.deleteAttribute("uv"); g.deleteAttribute("uv1"); }
      groups.set(name, [...(groups.get(name) ?? []), g]);
    }
    for (const [name, list] of groups) {
      const material = mats[name];
      if (!material) throw new Error(`model material "${name}" has no match`);
      const parts = keep.includes(name) ? list : [mergeGeometries(list)];
      if (!keep.includes(name)) for (const g of list) g.dispose();
      for (const g of parts) {
        g.computeBoundingSphere();
        made.push(g);
        owner.add(new Mesh(g, material));
      }
    }
  }
  return { nodes, dispose: () => { for (const g of made) g.dispose(); } };
};
