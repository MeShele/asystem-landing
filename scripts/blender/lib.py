"""
Общий набор для моделей лендинга. Запуск: blender -b -P scripts/blender/<сцена>.py

Модели собираются скриптами, а не руками: так их можно пересобрать одной командой и держать
в git как исходник. В файл .glb уходит только геометрия с гладкими нормалями и имена:
материалы назначает сайт по именам (lime, graphite, gold …), подвижные части — узлы с именами n_*.

Координаты в скриптах — как на сайте: x вправо, y вверх, z на зрителя. P() переводит в оси Blender.
"""
import bpy, bmesh, math
from mathutils import Vector

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
_mats, _fonts = {}, {}


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear(); _fonts.clear()


def P(x, y, z):
    """точка сайта (x вправо, y вверх, z на зрителя) → точка Blender (z вверх, −y на зрителя)"""
    return Vector((x, -z, y))


def mat(name):
    if name not in _mats:
        _mats[name] = bpy.data.materials.new(name)
    return _mats[name]


def link(o, parent=None):
    bpy.context.scene.collection.objects.link(o)
    if parent is not None:
        o.parent = parent
    return o


def node(name, at=(0, 0, 0), parent=None, yaw=0.0, tilt=0.0):
    """узел-пустышка; с именем n_* сайт находит его и двигает. yaw — поворот вокруг вертикали, tilt — наклон вокруг оси x"""
    o = bpy.data.objects.new(name, None)
    o.location = P(*at)
    o.rotation_euler = (tilt, 0.0, yaw)
    return link(o, parent)


def _finish(o, material, smooth=True):
    me = o.data
    if material:
        me.materials.append(mat(material))
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return o


def hard(o, bevel=0.0, seg=4, angle=35):
    """жёсткое тело: скруглить кромки и выровнять нормали по площади граней — плоскости остаются плоскими"""
    if bevel > 0:
        m = o.modifiers.new("bevel", "BEVEL")
        m.width = bevel; m.segments = seg; m.limit_method = "ANGLE"; m.angle_limit = math.radians(angle)
    w = o.modifiers.new("wn", "WEIGHTED_NORMAL")
    w.keep_sharp = False; w.weight = 60
    return o


def crisp(o, angle=28, flat=False):
    """точёная деталь: грани остаются гладкими, а рёбра круче angle — жёсткими (фаска ловит блик, а не смазывается)"""
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    lim = math.radians(angle)
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > lim:
            e.smooth = False
    bm.to_mesh(o.data); bm.free()
    for p in o.data.polygons:
        p.use_smooth = not flat
    return o


def mesh_obj(name, verts, faces, material, at=(0, 0, 0), parent=None, edges=()):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], list(edges), list(faces))
    me.update()
    o = bpy.data.objects.new(name, me)
    o.location = P(*at)
    link(o, parent)
    return _finish(o, material)


def from_bm(name, bm, material, at=(0, 0, 0), parent=None):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    o.location = P(*at)
    link(o, parent)
    return _finish(o, material)


def box(name, w, h, d, r, material, at=(0, 0, 0), parent=None, seg=4):
    """скруглённый брусок: w по x, h вверх, d в глубину"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w; v.co.y *= d; v.co.z *= h
    return hard(from_bm(name, bm, material, at, parent), min(r, w / 2.02, h / 2.02, d / 2.02), seg)


def cyl(name, r, h, material, at=(0, 0, 0), parent=None, seg=48, bevel=0.0, r2=None, axis="y"):
    """цилиндр или усечённый конус; axis — вдоль какой оси сайта стоит: y (вверх), z (на зрителя), x"""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
    if axis == "z":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__("mathutils").Matrix.Rotation(math.radians(90), 3, "X"))
    elif axis == "x":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__("mathutils").Matrix.Rotation(math.radians(90), 3, "Y"))
    return hard(from_bm(name, bm, material, at, parent), bevel, 3, 50)


def ball(name, r, material, at=(0, 0, 0), parent=None, scale=(1, 1, 1), u=32, v=20, cut=None):
    """шар или эллипсоид; cut(x, y, z) в осях сайта на единичном шаре — какие точки убрать (получится чаша)"""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=1.0)
    if cut:
        bmesh.ops.delete(bm, geom=[vert for vert in bm.verts if cut(vert.co.x, vert.co.z, -vert.co.y)], context="VERTS")
    sx, sy, sz = scale
    for vert in bm.verts:
        vert.co.x *= r * sx; vert.co.y *= r * sz; vert.co.z *= r * sy          # scale дан в осях сайта (x, y вверх, z)
    return from_bm(name, bm, material, at, parent)


def slab(name, w, h, d, material, at=(0, 0, 0), parent=None):
    """мелкая деталь без фаски (прорезь, риска, огонёк): 12 треугольников, грани плоские"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w; v.co.y *= d; v.co.z *= h
    o = from_bm(name, bm, material, at, parent)
    for p in o.data.polygons:
        p.use_smooth = False
    return o


def loft(name, rings, material, at=(0, 0, 0), parent=None, seg=28, steps=5):
    """гладкое тело по эллиптическим сечениям снизу вверх: (высота, полуось x, полуось z[, сдвиг x, сдвиг z]);
    между сечениями — плавная кривая, торцы закрыты"""
    rs = [tuple(r) + (0.0,) * (5 - len(r)) for r in rings]
    fine = []
    for j in range(len(rs) - 1):
        p0, p1, p2, p3 = rs[max(j - 1, 0)], rs[j], rs[j + 1], rs[min(j + 2, len(rs) - 1)]
        for k in range(steps):
            t = k / steps
            fine.append(tuple(0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t ** 3) for a, b, c, d in zip(p0, p1, p2, p3)))
    fine.append(rs[-1])
    bm = bmesh.new()
    loops = []
    for y, rx, rz, cx, cz in fine:
        loops.append([bm.verts.new(P(cx + math.cos(i / seg * math.tau) * rx, y, cz + math.sin(i / seg * math.tau) * rz)) for i in range(seg)])
    for a, b in zip(loops, loops[1:]):
        for i in range(seg):
            bm.faces.new((a[i], a[(i + 1) % seg], b[(i + 1) % seg], b[i]))
    bm.faces.new(loops[0]); bm.faces.new(loops[-1])
    return from_bm(name, bm, material, at, parent)


def ticks(name, n, r_long, r_short, r1, lo, hi, material, at=(0, 0, 0), parent=None, every=5, face="front", w_long=0.011, w_short=0.006):
    """шкала по кругу: n рисок от r_long (каждая every-я) или r_short до r1; lo…hi — толщина вдоль оси круга.
    face=front — круг смотрит на зрителя, top — лежит лицом вверх"""
    verts, faces = [], []
    for i in range(n):
        a = i / n * math.tau
        r0, hw = (r_long, w_long) if i % every == 0 else (r_short, w_short)
        ca, sa = math.cos(a), math.sin(a)
        b = len(verts)
        for level in (lo, hi):
            for r, s in ((r0, -hw), (r0, hw), (r1, hw), (r1, -hw)):
                u, v = ca * r - sa * s, sa * r + ca * s
                verts.append(P(u, v, level) if face == "front" else P(u, level, v))
        faces += [(b, b + 1, b + 2, b + 3), (b + 4, b + 7, b + 6, b + 5), (b, b + 4, b + 5, b + 1), (b + 1, b + 5, b + 6, b + 2), (b + 2, b + 6, b + 7, b + 3), (b + 3, b + 7, b + 4, b)]
    return crisp(mesh_obj(name, verts, faces, material, at, parent), flat=True)


def screen(name, w, h, material, at=(0, 0, 0), parent=None):
    """плоскость с развёрткой под светящийся экран: лицом к зрителю"""
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for vert in bm.verts:
        x, y = vert.co.x * w, vert.co.y * h
        vert.co = (x, 0.0, y)
    bm.normal_update()
    for f in bm.faces:              # лицом к зрителю: в осях Blender это −Y
        if f.normal.y > 0:
            f.normal_flip()
    # развёртка пишется явно: calc_uvs у примитива работает, только если слой уже есть
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for loop in f.loops:
            loop[uv].uv = (loop.vert.co.x / w + 0.5, loop.vert.co.z / h + 0.5)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    o.location = P(*at)
    link(o, parent)
    me.materials.append(mat(material))
    return o


def lathe(name, profile, material, at=(0, 0, 0), parent=None, seg=48, flutes=0, flute_range=(0, 0), flute_depth=0.0, axis="y", ring=False):
    """тело вращения: profile — пары (радиус, высота) снизу вверх; flutes — каннелюры на отрезке высот.
    axis=y — ось вертикальна, axis=z — ось смотрит на зрителя (диск, кольцо, шкала);
    ring — профиль замкнут сам на себя (кольцо с отверстием), торцы не закрываются"""
    verts, faces, n = [], [], len(profile)
    for r, y in profile:
        for i in range(seg):
            a = i / seg * math.tau
            k = 1.0
            if flutes and flute_range[0] <= y <= flute_range[1]:
                k = 1.0 - flute_depth * abs(math.sin(a * flutes / 2)) ** 0.6
            verts.append((math.cos(a) * r * k, math.sin(a) * r * k, y))
    for j in range(n - 1):
        for i in range(seg):
            a, b = j * seg + i, j * seg + (i + 1) % seg
            faces.append((a, b, b + seg, a + seg))
    if ring:
        for i in range(seg):
            a, b = (n - 1) * seg + i, (n - 1) * seg + (i + 1) % seg
            faces.append((a, b, (i + 1) % seg, i))
    else:
        faces.append(tuple(reversed(range(seg))))
        faces.append(tuple(range((n - 1) * seg, n * seg)))
    o = mesh_obj(name, verts, faces, material, at, parent)
    if axis == "z":
        o.rotation_euler = (math.radians(90), 0.0, 0.0)
    return o


def plate(name, outline, depth, bevel, material, at=(0, 0, 0), parent=None, holes=(), face="front"):
    """пластина по контуру: face=front — стоит лицом к зрителю, толщина на зрителя; top — лежит, толщина вверх"""
    bm = bmesh.new()
    for loop in [outline] + list(holes):
        vs = [bm.verts.new((x, 0.0, y) if face == "front" else (x, y, 0.0)) for x, y in loop]
        for i in range(len(vs)):
            bm.edges.new((vs[i], vs[(i + 1) % len(vs)]))
    bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=True, edges=bm.edges[:])
    ext = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    bmesh.ops.translate(bm, vec=(0.0, -depth, 0.0) if face == "front" else (0.0, 0.0, depth), verts=[g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)])
    return hard(from_bm(name, bm, material, at, parent), bevel, 4, 40)


def tube(name, pts, r, material, at=(0, 0, 0), parent=None, smooth=True, res=10, closed=False, taper=None):
    """трубка вдоль точек сайта: smooth — плавная кривая через узлы, иначе ломаная; taper — доля толщины в каждой точке"""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"; cu.bevel_depth = r; cu.bevel_resolution = 5; cu.use_fill_caps = True; cu.resolution_u = res
    sp = cu.splines.new("NURBS" if smooth else "POLY")
    sp.points.add(len(pts) - 1)
    for i, (p, co) in enumerate(zip(sp.points, pts)):
        v = P(*co); p.co = (v.x, v.y, v.z, 1.0)
        if taper:
            p.radius = taper[i]
    sp.use_cyclic_u = closed
    if smooth:
        sp.order_u = min(4, len(pts)); sp.use_endpoint_u = not closed
    o = bpy.data.objects.new(name, cu)
    o.location = P(*at)
    link(o, parent)
    cu.materials.append(mat(material))
    return o


def text(name, body, size, depth, material, at=(0, 0, 0), parent=None, bevel=0.0, font=FONT_BOLD, face="front"):
    """объёмная надпись; face: front — стоит лицом к зрителю, top — лежит лицом вверх"""
    cu = bpy.data.curves.new(name, "FONT")
    if font not in _fonts:
        _fonts[font] = bpy.data.fonts.load(font)
    cu.font = _fonts[font]; cu.body = body; cu.size = size; cu.extrude = depth / 2; cu.bevel_depth = bevel; cu.bevel_resolution = 2
    cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.resolution_u = 6
    o = bpy.data.objects.new(name, cu)
    o.location = P(*at)
    o.rotation_euler = (math.radians(90), 0, 0) if face == "front" else (0, 0, 0)
    link(o, parent)
    cu.materials.append(mat(material))
    return o


def realize_all():
    """всё, что не сетка (кривые, надписи), и все модификаторы — в обычные сетки с готовыми нормалями"""
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    for o in list(bpy.context.scene.objects):
        if o.type not in {"MESH", "CURVE", "FONT"}:
            continue
        if o.type == "MESH" and not o.modifiers:
            continue
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
        for p in me.polygons:
            p.use_smooth = True
        if o.type == "MESH":
            o.modifiers.clear(); o.data = me
        else:
            n = bpy.data.objects.new(o.name, me)
            n.parent = o.parent
            n.matrix_parent_inverse = o.matrix_parent_inverse.copy()
            n.location = o.location; n.rotation_euler = o.rotation_euler; n.scale = o.scale
            bpy.context.scene.collection.objects.link(n)
            bpy.data.objects.remove(o, do_unlink=True)
            bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get()


def export(path):
    realize_all()
    tris = sum(len(p.vertices) - 2 for o in bpy.context.scene.objects if o.type == "MESH" for p in o.data.polygons)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", export_yup=True, export_apply=False, export_materials="EXPORT",
        export_normals=True, export_texcoords=True, export_vertex_color="NONE", export_animations=False,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
        export_draco_position_quantization=14, export_draco_normal_quantization=10,
    )
    import os
    print(f"EXPORTED {os.path.basename(path)}: {tris} треугольников, {os.path.getsize(path) // 1024} КБ, объектов {len(bpy.context.scene.objects)}")
