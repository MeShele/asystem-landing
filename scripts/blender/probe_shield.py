"""Разведка сгенерированного щита: где окна со значками, где диск и какой у диска профиль по радиусу."""
import bpy, bmesh, sys, math
import numpy as np

path = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)
obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
mat = obj.data.materials[0]
img = next(n.image for n in mat.node_tree.nodes if n.type == "TEX_IMAGE" and n.image and "color" in n.image.name.lower() or (n.type == "TEX_IMAGE" and n.outputs[0].links and n.outputs[0].links[0].to_socket.name == "Base Color"))
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
print("IMG", img.name, W, H)

bm = bmesh.new(); bm.from_mesh(obj.data); bm.faces.ensure_lookup_table()
uv = bm.loops.layers.uv.active
mw = obj.matrix_world
F = []
for f in bm.faces:
    c = mw @ f.calc_center_median()
    n = (mw.to_3x3() @ f.normal).normalized()
    u = sum((l[uv].uv for l in f.loops), start=__import__("mathutils").Vector((0, 0))) / len(f.loops)
    x, y = int((u.x % 1) * (W - 1)), int((u.y % 1) * (H - 1))
    r, g, b = px[y, x, :3]
    F.append((c.x, c.y, c.z, n.y, r, g, b, f.calc_area()))
F = np.array(F)
X, D, Z, NY, R, G, B, A = F.T                  # x вправо, D — глубина (минус — к зрителю), Z — вверх
print("bounds x", X.min(), X.max(), "z", Z.min(), Z.max(), "depth", D.min(), D.max())
front = NY < -0.3
green = front & (G > 0.4) & (G > R * 1.5) & (G > B * 2.0)
gold = front & (R > 0.45) & (G > 0.28) & (B < 0.28) & (R > G * 1.1) & (G > B * 1.4)
print("green faces", green.sum(), "gold faces", gold.sum())
gx, gz = X[gold].mean(), Z[gold].mean()
print("DIAL center (keyhole)", round(gx, 4), round(gz, 4), "spread", round(X[gold].std(), 4), round(Z[gold].std(), 4))
# окна: зелёные грани по четвертям вокруг диска (метка диска тоже зелёная — она близко к центру, отсекаем)
far = np.hypot(X - gx, Z - gz) > 0.75
for name, sx, sz in (("UL", -1, 1), ("UR", 1, 1), ("LL", -1, -1), ("LR", 1, -1)):
    m = green & far & (np.sign(X - gx) == sx) & (np.sign(Z - gz) == sz)
    cx, cz = np.average(X[m], weights=A[m]), np.average(Z[m], weights=A[m])
    rr = np.hypot(X[m] - cx, Z[m] - cz)
    print("WIN", name, round(cx, 4), round(cz, 4), "icon r95", round(np.percentile(rr, 95), 4), "n", m.sum())
ptr = green & ~far
if ptr.sum():
    a = math.degrees(math.atan2(np.average(Z[ptr] - gz, weights=A[ptr]), np.average(X[ptr] - gx, weights=A[ptr])))
    print("POINTER angle", round(a, 1), "r", round(np.average(np.hypot(X[ptr] - gx, Z[ptr] - gz), weights=A[ptr]), 4), "n", ptr.sum())
# профиль диска: насколько выступает поверхность на каждом радиусе (минимальная глубина в кольце)
rad = np.hypot(X - gx, Z - gz)
print("PROFILE r → protrusion (min depth), mean brightness")
for r0 in np.arange(0.0, 0.95, 0.025):
    m = (rad >= r0) & (rad < r0 + 0.025) & (NY < 0.5)
    if m.sum():
        lum = (0.3 * R[m] + 0.59 * G[m] + 0.11 * B[m]).mean()
        print(f"  {r0:.3f} {D[m].min():+.4f} {np.median(D[m]):+.4f} lum {lum:.2f} n {m.sum()}")
