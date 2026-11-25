"""
«Сделка без сотрудника» — механизм из сгенерированных деталей (Higgsfield: эскизы GPT Image 2.6 → 3D Tripo H3.1).

  blender -b -P scripts/blender/rig_gears.py -- <папка с исходниками> <выход.glb> [tex=1024]

Исходники: gear_big.glb, gear_small.glb, housing.glb, belt.glb — как их отдал Tripo.
Что делает скрипт:
  • корпус ставит на пол, шириной 5,0; ленты — по бокам, длиной 2,9, ширина ленты растянута под две дорожки;
  • шестерни кладёт на крышку корпуса в зацеплении: считает у каждой число зубьев, радиусы вершин
    и впадин, подгоняет малую под шаг зубьев большой, ставит на расстояние суммы делительных радиусов
    и разворачивает так, чтобы в точке касания у большой была впадина, а у малой — зуб.
    На сайте колёса крутятся в отношении числа зубьев и остаются в зацеплении;
  • в чёрное окно на лицевой стороне корпуса кладёт плоскость под табло (материал screen);
  • делает образцы монет: сом — серебро со знаком «с» и чертой, биткоин — золото с «B»; рифлёное ребро;
  • числа для сайта — в extras узла n_rig: зубья, высота дорожек, отрезки лент.
Узлы: n_housing, n_gear_0 (большая), n_gear_1, n_gear_2 (малые, одна сетка на двоих), n_belt_l, n_belt_r,
n_coin_som, n_coin_btc, n_rig.
"""
import bpy, bmesh, sys, os, math
import numpy as np
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
from lib import P, node, lathe, crisp, text, slab, screen as screen_plane

args = sys.argv[sys.argv.index("--") + 1:]
SRC, DST = args[0], args[1]
opt = dict(a.split("=", 1) for a in args[2:])
TEX = int(opt.get("tex", 1024))

lib.reset()


def load(name, turn_deg):
    """импорт исходника одной сеткой, лицом к зрителю (поворот вокруг вертикали), без родителей"""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, name))
    new = [o for o in bpy.context.scene.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    for o in new:
        if o is not obj and o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True); bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.rotation_mode = "XYZ"; obj.rotation_euler = (0, 0, math.radians(turn_deg))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def verts(o):
    return np.array([v.co[:] for v in o.data.vertices])


def place(o, sx, sy, sz, at):
    """масштаб по осям Blender (x, y — глубина, z — вверх) и перенос: основание на at.z, центр по x/y в at"""
    co = verts(o)
    c = (co.max(0) + co.min(0)) / 2
    for v in o.data.vertices:
        v.co = Vector(((v.co.x - c[0]) * sx + at[0], (v.co.y - c[1]) * sy + at[1], (v.co.z - co[:, 2].min()) * sz + at[2]))
    o.data.update()


def gear_profile(o):
    """центр, вершина, впадина, делительный радиус, число зубьев и угол первого зуба (в плоскости xy Blender)"""
    co = verts(o)
    c = (co.max(0) + co.min(0)) / 2
    x, y = co[:, 0] - c[0], co[:, 1] - c[1]
    r, a = np.hypot(x, y), np.arctan2(y, x)
    B = 1440
    bins = ((a + math.pi) / (2 * math.pi) * B).astype(int) % B
    prof = np.zeros(B); np.maximum.at(prof, bins, r)
    ok = prof > 0
    prof[~ok] = np.interp(np.flatnonzero(~ok), np.flatnonzero(ok), prof[ok])
    tip, root = np.percentile(prof, 97), np.percentile(prof, 4)
    F = np.fft.rfft(prof - prof.mean())
    n = int(np.argmax(np.abs(F[6:60])) + 6)
    tooth = (-np.angle(F[n]) / n - math.pi) % (2 * math.pi / n)
    return c, tip, root, (tip + root) / 2, n, tooth


def spin(o, ang, c):
    """повернуть сетку вокруг вертикали через точку c"""
    R = Matrix.Rotation(ang, 4, "Z")
    for v in o.data.vertices:
        p = v.co - Vector((c[0], c[1], 0))
        v.co = (R @ p) + Vector((c[0], c[1], 0))
    o.data.update()


# ── корпус ────────────────────────────────────────────────────────────────────────────────────
housing = load("housing.glb", -90)
co = verts(housing); ext = co.max(0) - co.min(0)
HW = 5.0; k = HW / ext[0]
place(housing, k, k, k, (0, 0, 0))
co = verts(housing)
H_TOP = float(np.percentile(co[np.abs(co[:, 0]) < 1.5][:, 2], 99.5))      # крышка: верхняя плоскость в середине
H_DEPTH = float(co[:, 1].max() - co[:, 1].min())
FRONT_Y = float(co[:, 1].min())
print("HOUSING", ext.round(3).tolist(), "→ top", round(H_TOP, 3), "depth", round(H_DEPTH, 3))
housing.name = "n_housing"

# окно табло: утопленный прямоугольник в середине лицевой стороны (решётки — по краям, их отсекает |x|)
bm = bmesh.new(); bm.from_mesh(housing.data)
cand = []
for f in bm.faces:
    c = f.calc_center_median()
    if f.normal.y < -0.8 and c.y > FRONT_Y + 0.015 and abs(c.x) < 1.3 and 0.12 * H_TOP < c.z < 0.9 * H_TOP:
        cand.extend((v.co.x, v.co.y, v.co.z) for v in f.verts)
bm.free()
cand = np.array(cand) if cand else np.zeros((0, 3))
if len(cand) > 8:
    x0, x1 = np.percentile(cand[:, 0], [2, 98]); z0, z1 = np.percentile(cand[:, 2], [2, 98]); fy = float(np.median(cand[:, 1]))
else:
    x0, x1, z0, z1, fy = -1.0, 1.0, 0.35 * H_TOP, 0.6 * H_TOP, FRONT_Y
print("WINDOW", round(x0, 3), round(x1, 3), round(z0, 3), round(z1, 3), "y", round(fy, 3), "front", round(FRONT_Y, 3), "вершин", len(cand))
disp = node("n_display", at=((x0 + x1) / 2, (z0 + z1) / 2, -fy + 0.004))
screen_plane("display_screen", (x1 - x0) * 0.96, (z1 - z0) * 0.9, "screen", parent=disp)

# ── шестерни ──────────────────────────────────────────────────────────────────────────────────
big = load("gear_big.glb", 0)
small = load("gear_small.glb", 0)
cb, tb, rb, pb, nb, ab = gear_profile(big)
cs, ts, rs, ps, ns, as_ = gear_profile(small)
print("BIG teeth", nb, "tip", round(tb, 4), "root", round(rb, 4), "| SMALL teeth", ns, "tip", round(ts, 4), "root", round(rs, 4))
module = 2 * pb / nb
s_small = (module * ns / 2) / ps                     # малая — под шаг зубьев большой
KB = float(opt.get("tip", 1.12)) / tb                # большая на сайте: радиус по вершинам зубьев
dist = (pb + ps * s_small + 0.006) * KB
# повернуть: у большой впадина на угле 0 (и на π — зубьев нечётно), у малой — зуб на угле π
spin(big, math.pi / nb - ab, cb)
spin(small, math.pi - as_, cs)
place(big, KB, KB, KB, (0, 0, H_TOP))
place(small, KB * s_small, KB * s_small, KB * s_small, (0, 0, H_TOP))
big.name = "gear_big_mesh"; small.name = "gear_small_mesh"
g0 = node("n_gear_0", at=(0, H_TOP, 0))
g1 = node("n_gear_1", at=(dist, H_TOP, 0))
g2 = node("n_gear_2", at=(-dist, H_TOP, 0))
for o in (big, small):
    for v in o.data.vertices:
        v.co.z -= H_TOP
    o.data.update()
big.parent = g0
small.parent = g1
small2 = small.copy(); small2.name = "gear_small_mesh_2"
bpy.context.scene.collection.objects.link(small2)
small2.parent = g2
print("GEARS dist", round(dist, 3), "big tip", round(tb * KB, 3), "small tip", round(ts * s_small * KB, 3))

# ── ленты ────────────────────────────────────────────────────────────────────────────────────
BL = 2.9
bl = load("belt.glb", -90)
co = verts(bl); ext = co.max(0) - co.min(0)
kx = BL / ext[0]; ky = 1.15 / ext[1]                      # ширина ленты — под две дорожки монет
GAPX = HW / 2 + 0.08
place(bl, kx, ky, kx, (-(GAPX + BL / 2), 0, 0))
co = verts(bl)
mid = (np.abs(co[:, 0] + GAPX + BL / 2) < BL * 0.3) & (np.abs(co[:, 1]) < 0.2)
BELT_TOP = float(np.percentile(co[mid][:, 2], 99))
bl.name = "n_belt_l"
# правая лента — та же сетка, отражённая масштабом −1 по x: в файле одна копия (three.js сам учитывает отражение)
br = bl.copy(); br.name = "n_belt_r"; br.scale = (-1, 1, 1)
bpy.context.scene.collection.objects.link(br)
print("BELT top", round(BELT_TOP, 3), "x", round(GAPX, 3), "…", round(GAPX + BL, 3))

# ── монеты: точёные, с рифлёным ребром ─────────────────────────────────────────────────────────
R, T = 0.19, 0.055
for key, metal, glyph in (("som", "silver", "с"), ("btc", "gold", "B")):
    n = node(f"n_coin_{key}")
    prof = [(R - 0.012, 0.0), (R, 0.008), (R, T - 0.008), (R - 0.012, T), (R - 0.03, T), (R - 0.036, T - 0.008), (0.0, T - 0.008)]
    crisp(lathe(f"coin_{key}", prof, metal, parent=n, seg=96, flutes=90, flute_range=(0.009, T - 0.009), flute_depth=0.02), angle=30)
    text(f"coin_{key}_glyph", glyph, 0.2, 0.012, metal, at=(0.005 if key == "btc" else 0, T - 0.006, 0.0), parent=n, bevel=0.0015, face="top")
    if key == "som":
        slab("coin_som_bar", 0.12, 0.012, 0.022, metal, at=(0, T - 0.002, 0.085), parent=n)
    else:
        for sx in (-1, 1):
            for sz in (-1, 1):
                slab(f"coin_btc_bar_{sx}{sz}", 0.014, 0.012, 0.03, metal, at=(sx * 0.022 - 0.004, T - 0.002, sz * 0.082), parent=n)

rig = node("n_rig")
rig["teeth_big"] = nb; rig["teeth_small"] = ns
rig["belt_top"] = BELT_TOP; rig["belt_x0"] = GAPX; rig["belt_x1"] = GAPX + BL; rig["housing_top"] = H_TOP; rig["housing_depth"] = H_DEPTH
rig["gear_dist"] = dist; rig["big_tip"] = tb * KB

# текстуры моделей — в размер
for im in bpy.data.images:
    if im.size[0] == 0:
        continue
    n = im.name.lower()
    side = TEX // 2 if ("orm" in n or "metal" in n or "rough" in n) else TEX
    if im.size[0] > side:
        im.scale(side, side)

lib.realize_all()
bpy.ops.export_scene.gltf(
    filepath=DST, export_format="GLB", export_yup=True, export_apply=False, export_materials="EXPORT", export_extras=True,
    export_normals=True, export_texcoords=True, export_vertex_color="NONE", export_animations=False,
    export_image_format="WEBP", export_image_quality=int(opt.get("quality", 86)),
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=12,
)
tris = sum(len(p.vertices) - 2 for o in bpy.context.scene.objects if o.type == "MESH" for p in o.data.polygons)
print(f"RIGGED {os.path.basename(DST)}: {tris} треугольников, {os.path.getsize(DST) // 1024} КБ")
