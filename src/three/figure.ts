import { CapsuleGeometry, CylinderGeometry, Group, Mesh, SphereGeometry, Vector3, type Material } from "three";
import { box, limb } from "@/three/studio";

/**
 * Фигура человека для макетов: голова, шея, корпус, плечи, руки с локтями и кистями, ноги
 * с коленями, ботинки. Собрана из гладких тел, пропорции живого человека (рост ≈ 1,05).
 * Стоит лицом к +Z. Правая рука живёт в отдельной ветке с осью в плече — ею фигура жмёт руку.
 */
export type FigureLook = { suit: Material; legs: Material; skin: Material; shoe: Material };

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

export const figure = (look: FigureLook) => {
  const g = new Group(), geos: { dispose: () => void }[] = [];
  const add = <M extends Mesh>(m: M, parent: Group = g) => { geos.push(m.geometry); parent.add(m); return m; };

  // ноги и ботинки
  for (const s of [-1, 1]) {
    add(limb(v(s * 0.066, 0.5, 0), v(s * 0.072, 0.275, 0.006), 0.054, look.legs));
    add(limb(v(s * 0.072, 0.275, 0.006), v(s * 0.072, 0.075, 0), 0.044, look.legs));
    add(new Mesh(box(0.092, 0.062, 0.185, 0.028).translate(s * 0.072, 0.031, 0.034), look.shoe));
  }
  // таз, корпус, плечи
  add(new Mesh(new SphereGeometry(0.105, 28, 18).scale(1.16, 0.78, 0.86).translate(0, 0.5, 0), look.legs));
  add(new Mesh(new CapsuleGeometry(0.102, 0.2, 10, 28).scale(1.3, 1, 0.8).translate(0, 0.665, 0), look.suit));
  for (const s of [-1, 1]) add(new Mesh(new SphereGeometry(0.056, 20, 14).translate(s * 0.158, 0.795, 0), look.suit));
  // шея и голова
  add(new Mesh(new CylinderGeometry(0.036, 0.04, 0.07, 20).translate(0, 0.865, 0), look.skin));
  add(new Mesh(new SphereGeometry(0.09, 32, 24).scale(1, 1.14, 1.04).translate(0, 0.975, 0.004), look.skin));

  // левая рука опущена вдоль тела
  add(limb(v(0.16, 0.79, 0), v(0.185, 0.625, 0.012), 0.041, look.suit));
  add(limb(v(0.185, 0.625, 0.012), v(0.178, 0.47, 0.04), 0.036, look.suit));
  add(new Mesh(new SphereGeometry(0.043, 18, 14).scale(0.85, 1.15, 1).translate(0.176, 0.43, 0.046), look.skin));

  // правая рука протянута вперёд к середине: плечо → локоть → кисть, ось ветки в плече
  const arm = new Group(), S = v(-0.16, 0.79, 0);
  arm.position.copy(S);
  const E = v(0.0, -0.13, 0.17), Wr = v(0.125, -0.165, 0.335);
  add(limb(v(0, 0, 0), E, 0.041, look.suit), arm);
  add(limb(E, Wr, 0.036, look.suit), arm);
  add(new Mesh(new SphereGeometry(0.044, 18, 14).scale(1, 1.05, 1.2).translate(Wr.x + 0.012, Wr.y, Wr.z + 0.04), look.skin), arm);
  g.add(arm);

  return { group: g, arm, dispose: () => { for (const x of geos) x.dispose(); } };
};
