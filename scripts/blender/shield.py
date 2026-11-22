"""Щит для блока «Требования ГСФР»: основа, четыре эмалевые пластины с объёмными значками, золотой замок."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

W, TOP, BOT, CY, GAP, BASE_T, PLATE_T, BOSS_R = 1.62, 1.9, -2.05, 0.32, 0.07, 0.2, 0.13, 0.6


def bezier(p0, p1, p2, p3, n):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                    u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
    return out


def contour():
    """контур щита: ровный верх со скруглёнными углами, бока сходятся к острию"""
    r, pts = 0.26, []
    pts += [(-W + r, TOP), (W - r, TOP)]
    pts += [(W - r + math.sin(a) * r, TOP - r + math.cos(a) * r) for a in [i / 8 * math.pi / 2 for i in range(1, 9)]]
    pts += [(W, 0.35)]
    pts += bezier((W, 0.35), (W, -0.85), (0.8, -1.6), (0, BOT), 22)
    pts += bezier((0, BOT), (-0.8, -1.6), (-W, -0.85), (-W, 0.35), 22)
    pts += [(-W, TOP - r)]
    pts += [(-W + r - math.cos(a) * r, TOP - r + math.sin(a) * r) for a in [i / 8 * math.pi / 2 for i in range(1, 8)]]
    return pts


def clip(poly, keep):
    out = []
    for i, a in enumerate(poly):
        b = poly[(i + 1) % len(poly)]; da, db = keep(a), keep(b)
        if da >= 0: out.append(a)
        if (da >= 0) != (db >= 0):
            t = da / (da - db); out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return out


def quadrant(inner, sx, sy):
    """четверть щита с вырезом под замок: внутренний угол заменён дугой вокруг центра"""
    pts = clip(clip(inner, lambda p: sx * p[0] - GAP), lambda p: sy * (p[1] - CY) - GAP)
    corner = min(range(len(pts)), key=lambda i: (pts[i][0] - sx * GAP) ** 2 + (pts[i][1] - CY - sy * GAP) ** 2)
    prev = pts[corner - 1]
    k = math.sqrt(BOSS_R**2 - GAP**2)
    on_v, on_h = (sx * GAP, CY + sy * k), (sx * k, CY + sy * GAP)            # точки выреза на вертикальной и горизонтальной кромках
    start, end = (on_v, on_h) if abs(prev[0] - sx * GAP) < 1e-6 else (on_h, on_v)
    a0, a1 = math.atan2(start[1] - CY, start[0]), math.atan2(end[1] - CY, end[0])
    while a1 - a0 > math.pi: a1 -= math.tau
    while a1 - a0 < -math.pi: a1 += math.tau
    arc = [(math.cos(a0 + (a1 - a0) * i / 12) * BOSS_R, CY + math.sin(a0 + (a1 - a0) * i / 12) * BOSS_R) for i in range(13)]
    return pts[:corner] + arc + pts[corner + 1:]


reset()
rim = contour()
plate("base", rim, BASE_T, 0.05, "graphite", at=(0, 0, 0))

c0 = (0, 0.08)
inner = [(c0[0] + (x - c0[0]) * 0.9, c0[1] + (y - c0[1]) * 0.9) for x, y in rim]
Z = BASE_T + PLATE_T
for i, (sx, sy) in enumerate([(-1, 1), (1, 1), (-1, -1), (1, -1)]):
    n = node(f"n_plate_{i}")
    plate(f"plate_{i}", quadrant(inner, sx, sy), PLATE_T, 0.035, "lime", at=(0, 0, BASE_T), parent=n)
    if i == 0:      # KYC: бюст и золотая галочка
        ax, ay = -0.86, 1.1
        ball("head", 0.15, "ice", at=(ax - 0.04, ay + 0.17, Z + 0.07), parent=n, scale=(1, 1.05, 0.6))
        ball("shoulders", 0.27, "ice", at=(ax - 0.04, ay - 0.26, Z + 0.035), parent=n, scale=(1.05, 0.72, 0.36))
        cyl("badge", 0.13, 0.05, "gold", at=(ax + 0.25, ay - 0.2, Z + 0.07), parent=n, axis="z", bevel=0.012)
        tube("tick", [(-0.055, 0.0, 0), (-0.015, -0.04, 0), (0.06, 0.045, 0)], 0.016, "ink", at=(ax + 0.25, ay - 0.2, Z + 0.1), parent=n, smooth=False)
    if i == 1:      # проверки: лупа с галочкой
        ax, ay = 0.84, 1.12
        tube("ring", [(math.cos(a) * 0.23, math.sin(a) * 0.23, 0) for a in [k / 28 * math.tau for k in range(28)]], 0.04, "ice", at=(ax - 0.05, ay + 0.05, Z + 0.05), parent=n, smooth=False, closed=True)
        cyl("lens", 0.2, 0.03, "dark", at=(ax - 0.05, ay + 0.05, Z + 0.025), parent=n, axis="z")
        tube("handle", [(0.12, -0.12, 0), (0.3, -0.3, 0)], 0.05, "ink", at=(ax - 0.05, ay + 0.05, Z + 0.05), parent=n, smooth=False)
        tube("tick", [(-0.09, 0.0, 0), (-0.025, -0.065, 0), (0.1, 0.07, 0)], 0.022, "gold", at=(ax - 0.05, ay + 0.05, Z + 0.06), parent=n, smooth=False)
    if i == 2:      # данные: два серверных блока с огоньками
        ax, ay = -0.68, -0.42
        for k in (0, 1):
            y = ay + 0.11 - k * 0.24
            box(f"unit_{k}", 0.56, 0.19, 0.09, 0.035, "ice", at=(ax, y, Z + 0.045), parent=n)
            for d in (0, 1):
                ball(f"led_{k}{d}", 0.026, "glowLime" if (k + d) % 2 == 0 else "glowAmber", at=(ax - 0.19 + d * 0.085, y, Z + 0.095), parent=n, u=14, v=10)
            box(f"vent_{k}", 0.2, 0.035, 0.02, 0.008, "ink", at=(ax + 0.13, y, Z + 0.092), parent=n)
    if i == 3:      # отчёты: лист с диаграммой
        ax, ay = 0.66, -0.42
        box("sheet", 0.42, 0.54, 0.05, 0.03, "ice", at=(ax, ay, Z + 0.025), parent=n)
        for k, hgt in enumerate((0.12, 0.24, 0.17)):
            box(f"bar_{k}", 0.07, hgt, 0.04, 0.012, "ink" if k != 1 else "gold", at=(ax - 0.11 + k * 0.11, ay - 0.18 + hgt / 2, Z + 0.06), parent=n)
        box("rule", 0.26, 0.025, 0.02, 0.008, "ink", at=(ax, ay + 0.17, Z + 0.055), parent=n)

# замок в центре: золотая шестигранная площадка и настоящий замок на ней
boss = node("n_boss")
hexagon = [(math.cos(a) * 0.54, CY + math.sin(a) * 0.54) for a in [k / 6 * math.tau + math.pi / 6 for k in range(6)]]
plate("hex", hexagon, 0.2, 0.045, "gold", at=(0, 0, Z - 0.03), parent=boss)
LZ = Z + 0.17
box("lock_body", 0.42, 0.33, 0.14, 0.05, "ink", at=(0, CY - 0.09, LZ + 0.07), parent=boss)
tube("shackle", [(-0.12, 0.06, 0), (-0.12, 0.2, 0), (-0.09, 0.28, 0), (0, 0.32, 0), (0.09, 0.28, 0), (0.12, 0.2, 0), (0.12, 0.06, 0)], 0.04, "steel", at=(0, CY, LZ + 0.07), parent=boss)
cyl("keyhole", 0.045, 0.03, "gold", at=(0, CY - 0.06, LZ + 0.145), parent=boss, axis="z", seg=24)
box("keyslot", 0.03, 0.09, 0.03, 0.01, "gold", at=(0, CY - 0.13, LZ + 0.145), parent=boss)

export(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../public/models/shield.glb"))
