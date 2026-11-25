"""
Разметка сгенерированного щита (Higgsfield → Tripo H3.1, ужат optimize.py) под сцену сайта.

  blender -b -P scripts/blender/rig_shield.py -- <щит.glb> <выход.glb> <маска.png> [tex=2048]

Что делает:
  • ставит щит в прежние координаты сцены: вершина на y=1.9, острие на y=−2.05, ось по центру;
  • находит диск сейфа (по латунной скважине и выступающему рифлёному кольцу) и вырезает кольцо
    в отдельный узел n_dial с осью точно в центре диска — на сайте кольцо поворачивается меткой
    к выбранной строке;
  • находит четыре окна со значками (по лаймовым пикселям текстуры) и ставит в их центры пустышки
    n_well_0..3: 0 — KYC (слева вверху), 1 — проверки, 2 — данные, 3 — отчёты;
  • рисует маску значков: R — где значок (мягкий край), G — номер окна (0.125, 0.375, 0.625, 0.875).
    По ней шейдер на сайте зажигает значок выбранного окна и приглушает остальные — без резки сетки.
"""
import bpy, bmesh, sys, math, os
import numpy as np
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
src, dst, mask_path = args[:3]
opt = dict(a.split("=", 1) for a in args[3:])
TEX = int(opt.get("tex", 2048))
TOP, BOT = 1.9, -2.05

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# в координаты сцены: Blender z — вверх сайта, −y — к зрителю
me = obj.data
co = np.array([v.co[:] for v in me.vertices])
k = (TOP - BOT) / (co[:, 2].max() - co[:, 2].min())
co[:, 0] -= (co[:, 0].max() + co[:, 0].min()) / 2
co[:, 1] -= (co[:, 1].max() + co[:, 1].min()) / 2
co[:, 2] -= co[:, 2].min()
co *= k
co[:, 2] += BOT
for v, c in zip(me.vertices, co):
    v.co = c
me.update()

# цветовая карта
mat = me.materials[0]
base = next(l.from_node for l in mat.node_tree.links if l.to_socket.name == "Base Color" and l.from_node.type == "TEX_IMAGE")
img = base.image
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)[:, :, :3]

# плотная выборка лицевых граней: на каждой треугольной грани сетка точек, у каждой — место и цвет
bm = bmesh.new(); bm.from_mesh(me)
bmesh.ops.triangulate(bm, faces=bm.faces[:])
uvl = bm.loops.layers.uv.active
tri_p, tri_uv, tri_n = [], [], []
for f in bm.faces:
    tri_p.append([l.vert.co[:] for l in f.loops])
    tri_uv.append([l[uvl].uv[:] for l in f.loops])
    tri_n.append(f.normal[:])
tri_p, tri_uv, tri_n = np.array(tri_p), np.array(tri_uv), np.array(tri_n)
front = tri_n[:, 1] < -0.3
S = 6
bary = np.array([(i / S, j / S) for i in range(S + 1) for j in range(S + 1 - i)])
w0 = 1 - bary[:, 0] - bary[:, 1]
fp, fuv = tri_p[front], tri_uv[front]
P = fp[:, None, 0] * w0[None, :, None] + fp[:, None, 1] * bary[None, :, 0, None] + fp[:, None, 2] * bary[None, :, 1, None]
U = fuv[:, None, 0] * w0[None, :, None] + fuv[:, None, 1] * bary[None, :, 0, None] + fuv[:, None, 2] * bary[None, :, 1, None]
P, U = P.reshape(-1, 3), U.reshape(-1, 2)
ix = np.clip(((U[:, 0] % 1) * W).astype(int), 0, W - 1)
iy = np.clip(((U[:, 1] % 1) * H).astype(int), 0, H - 1)
C = px[iy, ix]
R, G, B = C[:, 0], C[:, 1], C[:, 2]
X, D, Z = P[:, 0], P[:, 1], P[:, 2]
green = (G > 0.35) & (G > R * 1.45) & (G > B * 1.8)
gold = (R > 0.42) & (G > 0.26) & (B < 0.3) & (R > G * 1.08) & (G > B * 1.35)

# центр диска: сначала по скважине, потом по вершине рифлёного кольца (оно симметрично, скважина — нет)
# центр диска: латунная накладка скважины — самое выступающее место диска, и она круглая; скважина
# в ней несимметрична (прорезь вниз), поэтому берём не цвет, а выступающий круг вокруг неё
kx, kz = np.median(X[gold & (np.abs(X) < 0.6)]), np.median(Z[gold & (np.abs(X) < 0.6)])
near = np.hypot(X - kx, Z - kz) < 0.2
crest = D[near].min() + 0.012
esc = near & (D < crest)
cx, cz = X[esc].mean(), Z[esc].mean()
print("DIAL", round(cx, 4), round(cz, 4), "по накладке, точек", int(esc.sum()), "; по цвету скважины", round(kx, 4), round(kz, 4))

# окна: лаймовые точки вдали от диска, по четвертям вокруг него
rr = np.hypot(X - cx, Z - cz)
wells = []
for sx, sz in ((-1, 1), (1, 1), (-1, -1), (1, -1)):
    m = green & (rr > 0.75) & (np.sign(X - cx) == sx) & (np.sign(Z - cz) == sz)
    wx, wz = X[m].mean(), Z[m].mean()
    for _ in range(2):                                     # без случайных лаймовых бликов на рамке
        d = np.hypot(X[m] - wx, Z[m] - wz)
        keep = d < np.percentile(d, 90) * 1.15
        wx, wz = X[m][keep].mean(), Z[m][keep].mean()
    icon = np.percentile(np.hypot(X[m] - wx, Z[m] - wz), 95)
    wd = np.median(D[m])
    wells.append((wx, wd, wz, icon))
    print("WELL", round(wx, 4), round(wz, 4), "icon r95", round(icon, 4), "depth", round(wd, 4), "n", int(m.sum()))

# профиль диска по радиусу: где начинается и кончается выступающее кольцо
print("PROFILE")
vco = np.array([v.co[:] for v in me.vertices])
vr = np.hypot(vco[:, 0] - cx, vco[:, 2] - cz)
for r0 in np.arange(0.30, 0.64, 0.01):
    m = (vr >= r0) & (vr < r0 + 0.01) & (vco[:, 1] < -0.2)
    if m.sum():
        print(f"  {r0:.2f} min {vco[m, 1].min():+.4f} med {np.median(vco[m, 1]):+.4f} n {m.sum()}")
# по профилю: шляпка — до 0,38, выступающее кольцо — 0,39…0,56 с боковой стенкой, шкала — от 0,57 и утоплена
R_IN, R_OUT, D_RING = float(opt.get("r_in", 0.378)), float(opt.get("r_out", 0.58)), float(opt.get("d_ring", -0.30))

# вырезать кольцо: грани, все вершины которых в кольце и выступают над панелью
bm.free()
bm = bmesh.new(); bm.from_mesh(me)
ring = []
for f in bm.faces:
    ok = True
    for v in f.verts:
        r = math.hypot(v.co.x - cx, v.co.z - cz)
        if not (R_IN <= r <= R_OUT and v.co.y < D_RING):
            ok = False; break
    if ok:
        ring.append(f)
print("RING faces", len(ring), "of", len(bm.faces))
ids = set(f.index for f in ring)
bm.free()
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="DESELECT")
bpy.ops.object.mode_set(mode="OBJECT")
for p in me.polygons:
    p.select = p.index in ids
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.separate(type="SELECTED")
bpy.ops.object.mode_set(mode="OBJECT")
dial = next(o for o in bpy.context.scene.objects if o.type == "MESH" and o is not obj)
dial.name = "n_dial"; obj.name = "shield"
front_d = min(v.co.y for v in dial.data.vertices)
pivot = Vector((cx, front_d, cz))
for v in dial.data.vertices:
    v.co -= pivot
dial.location = pivot
dial.data.update()

if opt.get("calib"):
    for i, (wx, wd, wz, icon) in enumerate(wells):
        d = np.hypot(X - wx, Z - wz)
        for name, m in (("icon", green & (d < 0.2)), ("bezel", (d > 0.27) & (d < 0.38) & (G > R))):
            if m.sum():
                q = np.percentile(np.stack([R[m], G[m], B[m]], 1), [10, 50, 90], axis=0).round(2)
                print("CALIB", i, name, int(m.sum()), q.tolist())

# метка на кольце: лаймовый треугольник — его угол (от оси x против часовой) при нулевом повороте кольца
pm = green & (np.hypot(X - cx, Z - cz) > 0.39) & (np.hypot(X - cx, Z - cz) < 0.56) & (D < -0.4)
ang = math.atan2(np.sin(np.arctan2(Z[pm] - cz, X[pm] - cx)).mean(), np.cos(np.arctan2(Z[pm] - cz, X[pm] - cx)).mean()) if pm.sum() else math.pi / 4
dial["pointer"] = ang
print("POINTER", round(math.degrees(ang), 1), "точек", int(pm.sum()))

# пустышки в центрах окон
for i, (wx, wd, wz, icon) in enumerate(wells):
    e = bpy.data.objects.new(f"n_well_{i}", None)
    e.location = (wx, wd, wz)
    bpy.context.scene.collection.objects.link(e)

# маска значков: окна по UV (грани внутри круга окна), значок — лаймовые пиксели внутри окна
MW = MH = 1024
idmask = np.zeros((MH, MW), dtype=np.float32)
R_WIN = float(opt.get("r_win", 0.37))
bm = bmesh.new(); bm.from_mesh(me)
bmesh.ops.triangulate(bm, faces=bm.faces[:])
uvl = bm.loops.layers.uv.active
for f in bm.faces:
    c = f.calc_center_median()
    if f.normal.y > 0:
        continue
    for i, (wx, wd, wz, icon) in enumerate(wells):
        if math.hypot(c.x - wx, c.z - wz) < R_WIN:
            uv = np.array([l[uvl].uv[:] for l in f.loops]) * [MW, MH]
            x0, y0 = np.floor(uv.min(0)).astype(int); x1, y1 = np.ceil(uv.max(0)).astype(int)
            x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, MW - 1), min(y1, MH - 1)
            if x1 < x0 or y1 < y0:
                continue
            gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
            (ax, ay), (bx, by), (qx, qy) = uv
            den = (by - qy) * (ax - qx) + (qx - bx) * (ay - qy)
            if abs(den) < 1e-9:
                continue
            l1 = ((by - qy) * (gx - qx) + (qx - bx) * (gy - qy)) / den
            l2 = ((qy - ay) * (gx - qx) + (ax - qx) * (gy - qy)) / den
            inside = (l1 >= -0.02) & (l2 >= -0.02) & (1 - l1 - l2 >= -0.02)
            idmask[y0:y1 + 1, x0:x1 + 1][inside] = (i + 0.5) / 4
            break
bm.free()
# лаймовые пиксели цветовой карты в разрешении маски
small = px.reshape(MH, H // MH, MW, W // MW, 3).mean(axis=(1, 3)) if H >= MH else px
r_, g_, b_ = small[:, :, 0], small[:, :, 1], small[:, :, 2]
# значки — насыщенный лайм: синего почти нет, зелёный в полтора раза больше красного (замер: R≈0,6·G, B≈0);
# отражения на полированных ободках нейтрально-серые (R≈G≈B) и в маску не попадают
lime = np.clip((g_ - b_ - 0.15) * 3.0, 0, 1) * (g_ > r_ * 1.25)
icon = lime * (idmask > 0)
# мягкий край: два прохода размытия 3×3
for _ in range(2):
    pad = np.pad(icon, 1, mode="edge")
    icon = sum(pad[dy:dy + MH, dx:dx + MW] for dy in range(3) for dx in range(3)) / 9
icon = np.clip(icon * 1.6, 0, 1)
out = np.zeros((MH, MW, 4), dtype=np.float32)
out[:, :, 0] = icon; out[:, :, 1] = idmask; out[:, :, 3] = 1
mimg = bpy.data.images.new("shield_glow", MW, MH, alpha=False)
mimg.pixels = out.ravel()
mimg.filepath_raw = mask_path; mimg.file_format = "PNG"
mimg.save()
print("MASK windows", [int(((idmask > (i + 0.4) / 4) & (idmask < (i + 0.6) / 4)).sum()) for i in range(4)], "icon px", int((icon > 0.2).sum()))

# текстуры щита в нужный размер и выгрузка
for im in bpy.data.images:
    if im.name == "shield_glow" or im.size[0] == 0:
        continue
    n = im.name.lower()
    side = TEX // 2 if ("orm" in n or "metal" in n or "rough" in n) else TEX
    if im.size[0] > side:
        im.scale(side, side)
bpy.ops.export_scene.gltf(
    filepath=dst, export_format="GLB", export_yup=True, export_apply=False, export_materials="EXPORT", export_extras=True,
    export_normals=True, export_texcoords=True, export_vertex_color="NONE", export_animations=False,
    export_image_format="WEBP", export_image_quality=86,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=12,
)
print(f"RIGGED {os.path.basename(dst)}: {os.path.getsize(dst) // 1024} КБ; маска {os.path.getsize(mask_path) // 1024} КБ")
