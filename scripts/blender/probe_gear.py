"""Разведка сгенерированной шестерни: ось, центр, радиусы вершин и впадин зубьев, число зубьев и их фаза."""
import bpy, sys, math
import numpy as np

path = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)
objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
co = np.concatenate([np.array([(o.matrix_world @ v.co)[:] for v in o.data.vertices]) for o in objs])
ext = co.max(0) - co.min(0)
ax = int(np.argmin(ext))
print("EXTENT", ext.round(3).tolist(), "axis", "xyz"[ax])
u, v = [i for i in range(3) if i != ax]
c = (co.max(0) + co.min(0)) / 2
x, y = co[:, u] - c[u], co[:, v] - c[v]
r, a = np.hypot(x, y), np.arctan2(y, x)
B = 1440
bins = ((a + math.pi) / (2 * math.pi) * B).astype(int) % B
prof = np.zeros(B)
np.maximum.at(prof, bins, r)
prof = np.where(prof == 0, np.nan, prof)
ok = ~np.isnan(prof)
prof[~ok] = np.interp(np.flatnonzero(~ok), np.flatnonzero(ok), prof[ok])
tip, root = np.percentile(prof, 97), np.percentile(prof, 4)
F = np.fft.rfft(prof - prof.mean())
n = int(np.argmax(np.abs(F[6:60])) + 6)
phase = -np.angle(F[n])                                 # угол первого зуба (радианы, от оси u против часовой) × n
print(f"TEETH {n} tip {tip:.4f} root {root:.4f} pitch {(tip + root) / 2:.4f} toothphase {phase / n:.4f} center {c[u]:.4f},{c[v]:.4f} thick {ext[ax]:.4f}")
