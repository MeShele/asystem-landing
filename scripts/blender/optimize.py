"""
Сгенерированная модель (Higgsfield: Tripo, Hunyuan) → лёгкий GLB для сайта.

  blender -b -P scripts/blender/optimize.py -- <вход.glb> <выход.glb> [ключ=значение ...]

Ключи:
  turn=<градусы>   поворот вокруг вертикали, чтобы лицо модели смотрело на зрителя (+Z сайта)
  height=<число>   высота модели на сайте; основание ставится на y=0, центр — на ось
  tris=<число>     сколько треугольников оставить (упрощение по рёбрам: форма держится, детали — в карте рельефа)
  planar=<градусы> перед упрощением слить почти плоские участки: сетка генератора «шумит», и без этого
                   ровные панели после упрощения идут волнами
  normal=0         выбросить карту рельефа (она запечена под исходную сетку и на упрощённой даёт рябь)
  tex=<px>         сторона цветовой карты и карты рельефа; tex_orm — карты металла и шероховатости
  quality=<0..100> качество WebP
Материал модели сохраняется как есть (цвет, металл/шероховатость, рельеф): свет сайта ложится на него сам.
"""
import bpy, sys, math, os

args = sys.argv[sys.argv.index("--") + 1:]
src, dst = args[0], args[1]
opt = dict(a.split("=", 1) for a in args[2:])
TURN, HEIGHT, TRIS = float(opt.get("turn", 0)), float(opt.get("height", 0)), int(opt.get("tris", 0))
TEX, TEX_ORM, QUALITY = int(opt.get("tex", 2048)), int(opt.get("tex_orm", 1024)), int(opt.get("quality", 86))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]

# всё в одну сетку без родителей: у генераторов бывают пустышки и масштаб на корне
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
for o in list(bpy.context.scene.objects):
    if o is not obj:
        bpy.data.objects.remove(o, do_unlink=True)

# лицом к зрителю: в осях Blender зритель на −Y, вертикаль — Z. Импорт glTF ставит поворот кватернионом:
# сначала вписываем его в сетку, потом поворачиваем уже в эйлеровых углах
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
obj.rotation_mode = "XYZ"
obj.rotation_euler = (0.0, 0.0, math.radians(TURN))
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

before = sum(len(p.vertices) - 2 for p in obj.data.polygons)
PLANAR = float(opt.get("planar", 0))
if PLANAR:
    m = obj.modifiers.new("flat", "DECIMATE")
    m.decimate_type = "DISSOLVE"
    m.angle_limit = math.radians(PLANAR)
    m.delimit = {"UV"}
    bpy.ops.object.modifier_apply(modifier="flat")
    t = obj.modifiers.new("tri", "TRIANGULATE")
    bpy.ops.object.modifier_apply(modifier="tri")
    print("PLANAR", before, "→", sum(len(p.vertices) - 2 for p in obj.data.polygons))
cur = sum(len(p.vertices) - 2 for p in obj.data.polygons)
if TRIS and cur > TRIS:
    m = obj.modifiers.new("dec", "DECIMATE")
    m.decimate_type = "COLLAPSE"
    m.ratio = TRIS / cur
    m.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier="dec")
for p in obj.data.polygons:
    p.use_smooth = True
# нормали по площади граней: плоские участки остаются плоскими, скругления — гладкими
w = obj.modifiers.new("wn", "WEIGHTED_NORMAL")
w.keep_sharp = True; w.weight = 50
bpy.ops.object.modifier_apply(modifier="wn")
if opt.get("normal") == "0":
    for mt in obj.data.materials:
        if mt and mt.use_nodes:
            for n in list(mt.node_tree.nodes):
                if n.type == "NORMAL_MAP":
                    mt.node_tree.nodes.remove(n)

# размер и место: основание на нуле, центр на вертикальной оси
xs = [v.co.x for v in obj.data.vertices]; ys = [v.co.y for v in obj.data.vertices]; zs = [v.co.z for v in obj.data.vertices]
if HEIGHT:
    k = HEIGHT / (max(zs) - min(zs))
    cx, cy, z0 = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, min(zs)
    for v in obj.data.vertices:
        v.co.x = (v.co.x - cx) * k; v.co.y = (v.co.y - cy) * k; v.co.z = (v.co.z - z0) * k
obj.data.update()

# текстуры: уменьшить (цвет и рельеф — TEX, металл/шероховатость — TEX_ORM)
for im in bpy.data.images:
    if im.size[0] == 0:
        continue
    n = im.name.lower()
    side = TEX_ORM if ("orm" in n or "metal" in n or "rough" in n or "occl" in n) else TEX
    if im.size[0] > side:
        im.scale(side, side)

after = sum(len(p.vertices) - 2 for p in obj.data.polygons)
bpy.context.view_layer.update()
dims = obj.dimensions
bpy.ops.export_scene.gltf(
    filepath=dst, export_format="GLB", export_yup=True, export_apply=False, export_materials="EXPORT",
    export_normals=True, export_texcoords=True, export_tangents=False, export_vertex_color="NONE", export_animations=False,
    export_image_format="WEBP", export_image_quality=QUALITY,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=12,
)
print(f"OPTIMIZED {os.path.basename(dst)}: {before} → {after} треугольников, {os.path.getsize(dst) // 1024} КБ, размер {dims.x:.2f}×{dims.z:.2f}×{dims.y:.2f}")
