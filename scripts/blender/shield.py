"""
Щит для блока «Требования ГСФР» — точёное изделие, а не значок: тёмный корпус со ступенчатой рамой,
четыре вставки с углублёнными «окнами», в которых подсвечена гравировка (KYC, проверки, данные, отчёты),
и кодовый диск сейфа в центре. Рифлёное кольцо диска с лаймовой меткой поворачивается к выбранной вставке.

Подвижные узлы: n_plate_0..3 (вставки), n_well_0..3 (центры окон — туда сайт ставит свечение),
n_dial (рифлёное кольцо с меткой; метка смотрит вверх).
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

W, TOP, BOT, CY = 1.62, 1.9, -2.05, 0.25
R_CORNER, R_TOP = 0.36, 9.0             # скругление углов и радиус пологой дуги верха
GAP, NOTCH = 0.045, 0.76                # половина шва между вставками и вырез под диск
WELLS = [(-0.9, 1.07), (0.9, 1.07), (-0.57, -0.75), (0.57, -0.75)]
R_WELL = 0.33

# уровни по глубине (z на зрителя)
Z_BACK, Z_GROOVE, Z_BODY, Z_DECK, Z_RIM, Z_LIP = -0.14, 0.02, 0.07, 0.26, 0.40, 0.345
Z_PLATE = 0.335                          # лицо вставки; дно окна на 0.05 ниже


def bezier(p0, p1, p2, p3, n):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                    u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
    return out


def contour():
    """контур щита против часовой стрелки: пологая дуга верха, скруглённые плечи, бока сходятся к острию"""
    r = R_CORNER
    by = TOP - R_TOP                                         # центр большой дуги верха
    cx = W - r
    cy = by + math.sqrt((R_TOP - r) ** 2 - cx ** 2)          # центр скругления плеча: касается и дуги верха, и бока
    phi = math.atan2(cy - by, cx)                            # угол точки касания
    right = [(cx + math.cos(a) * r, cy + math.sin(a) * r) for a in [phi * (1 - i / 10) for i in range(11)]]     # плечо: от верха к боку
    right += [(W, 0.35)]
    right += bezier((W, 0.35), (W, -0.85), (0.8, -1.6), (0, BOT), 26)
    left = [(-x, y) for x, y in reversed(right[:-1])]
    top = [(math.cos(a) * R_TOP, by + math.sin(a) * R_TOP) for a in [math.pi - phi + (2 * phi - math.pi) * i / 24 for i in range(1, 24)]]
    pts = right + left + top                                 # сейчас по часовой: правый бок вниз, левый вверх, верх слева направо
    return list(reversed(pts))


def inset(poly, d):
    """контур, отступивший внутрь на d (контур выпуклый, d меньше радиуса углов)"""
    n, out = len(poly), []
    for i in range(n):
        (x0, y0), (x1, y1), (x2, y2) = poly[i - 1], poly[i], poly[(i + 1) % n]
        l0, l1 = math.hypot(x1 - x0, y1 - y0), math.hypot(x2 - x1, y2 - y1)
        n0, n1 = (-(y1 - y0) / l0, (x1 - x0) / l0), (-(y2 - y1) / l1, (x2 - x1) / l1)
        bx, by = n0[0] + n1[0], n0[1] + n1[1]
        bl = math.hypot(bx, by); bx, by = bx / bl, by / bl
        k = d / max(0.35, bx * n0[0] + by * n0[1])
        out.append((x1 + bx * k, y1 + by * k))
    return out


def clip(poly, keep):
    out = []
    for i, a in enumerate(poly):
        b = poly[(i + 1) % len(poly)]; da, db = keep(a), keep(b)
        if da >= 0: out.append(a)
        if (da >= 0) != (db >= 0):
            t = da / (da - db); out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return out


def quadrant(inner, sx, sy):
    """четверть щита с вырезом под диск: внутренний угол заменён дугой вокруг центра диска"""
    pts = clip(clip(inner, lambda p: sx * p[0] - GAP), lambda p: sy * (p[1] - CY) - GAP)
    corner = min(range(len(pts)), key=lambda i: (pts[i][0] - sx * GAP) ** 2 + (pts[i][1] - CY - sy * GAP) ** 2)
    prev = pts[corner - 1]
    k = math.sqrt(NOTCH**2 - GAP**2)
    on_v, on_h = (sx * GAP, CY + sy * k), (sx * k, CY + sy * GAP)
    start, end = (on_v, on_h) if abs(prev[0] - sx * GAP) < 1e-6 else (on_h, on_v)
    a0, a1 = math.atan2(start[1] - CY, start[0]), math.atan2(end[1] - CY, end[0])
    while a1 - a0 > math.pi: a1 -= math.tau
    while a1 - a0 < -math.pi: a1 += math.tau
    arc = [(math.cos(a0 + (a1 - a0) * i / 20) * NOTCH, CY + math.sin(a0 + (a1 - a0) * i / 20) * NOTCH) for i in range(21)]
    return pts[:corner] + arc + pts[corner + 1:]


def circle(cx, cy, r, n=48):
    return [(cx + math.cos(i / n * math.tau) * r, cy + math.sin(i / n * math.tau) * r) for i in range(n)]


def arc(cx, cy, r, a0, a1, n=20):
    """дуга в координатах значка (ось y вниз, как в SVG); углы в градусах по часовой от оси x"""
    return [(cx + math.cos(math.radians(a0 + (a1 - a0) * i / n)) * r, cy + math.sin(math.radians(a0 + (a1 - a0) * i / n)) * r) for i in range(n + 1)]


def rrect(x, y, w, h, r):
    return arc(x + w - r, y + r, r, -90, 0, 6) + arc(x + w - r, y + h - r, r, 0, 90, 6) + arc(x + r, y + h - r, r, 90, 180, 6) + arc(x + r, y + r, r, 180, 270, 6)


# Гравировка — те же значки, что стоят у строк списка (lucide, поле 24×24, линия 2): (точки, замкнут ли контур)
GLYPHS = [
    [   # KYC: человек с галочкой
        (circle(10, 8, 5, 32), True),
        (arc(10, 21, 8, 180, 311.4, 22), False),
        ([(16, 19), (18, 21), (22, 17)], False),
    ],
    [   # проверки: лупа с галочкой
        (circle(11, 11, 8, 40), True),
        ([(21, 21), (16.7, 16.7)], False),
        ([(8, 11), (10, 13), (14, 9)], False),
    ],
    [   # данные: два серверных блока
        (rrect(2, 2, 20, 8, 2), True),
        (rrect(2, 14, 20, 8, 2), True),
    ],
    [   # отчёты: лист с диаграммой
        ([(15, 2), (6, 2)] + arc(6, 4, 2, 270, 180, 5)[1:] + [(4, 20)] + arc(6, 20, 2, 180, 90, 5)[1:] + [(18, 22)] + arc(18, 20, 2, 90, 0, 5)[1:] + [(20, 7)], True),
        ([(14, 2), (14, 6)] + arc(16, 6, 2, 180, 90, 5)[1:] + [(20, 8)], False),
        ([(8, 18), (8, 17)], False),
        ([(12, 18), (12, 12)], False),
        ([(16, 18), (16, 15)], False),
    ],
]
DOTS = {2: [(6, 6), (6, 18)]}
G = 0.41 / 24                            # размер значка: поле 24 → 0.41


def ticks(name, n, r_long, r_short, r1, z0, z1, material, at, parent=None, every=5):
    """шкала вокруг диска: n рисок, каждая every-я длиннее и толще"""
    verts, faces = [], []
    for i in range(n):
        a = i / n * math.tau
        long = i % every == 0
        r0, hw = (r_long, 0.011) if long else (r_short, 0.006)
        ca, sa = math.cos(a), math.sin(a)
        base = len(verts)
        for z in (z0, z1):
            for r, s in ((r0, -hw), (r0, hw), (r1, hw), (r1, -hw)):
                verts.append(P(ca * r - sa * s, sa * r + ca * s, z))
        b = base
        faces += [(b, b + 1, b + 2, b + 3), (b + 4, b + 7, b + 6, b + 5), (b, b + 4, b + 5, b + 1), (b + 1, b + 5, b + 6, b + 2), (b + 2, b + 6, b + 7, b + 3), (b + 3, b + 7, b + 4, b)]
    return crisp(mesh_obj(name, verts, faces, material, at, parent), flat=True)


reset()
rim = contour()

# корпус: задняя плита, тёмная проточка по боку и основное тело; шов между телом и рамой — вторая линия на боку
plate("back", inset(rim, 0.05), Z_GROOVE - Z_BACK, 0.05, "shell", at=(0, 0, Z_BACK))
plate("groove", inset(rim, 0.115), Z_BODY - Z_GROOVE, 0.0, "pit", at=(0, 0, Z_GROOVE))
plate("body", rim, Z_DECK - Z_BODY, 0.035, "shell", at=(0, 0, Z_BODY))
# рама в две ступени: внешний борт и полированная кромка под ним
plate("rim", rim, Z_RIM - Z_DECK, 0.032, "shell", at=(0, 0, Z_DECK), holes=[inset(rim, 0.105)])
plate("lip", inset(rim, 0.1), Z_LIP - Z_DECK, 0.016, "trim", at=(0, 0, Z_DECK), holes=[inset(rim, 0.17)])
plate("field", inset(rim, 0.165), 0.015, 0.0, "pit", at=(0, 0, Z_DECK))

# утопленные полированные штифты на борту — корпус собран, а не отлит одним куском
mid = inset(rim, 0.052)
for j, (sx, ty) in enumerate([(s, y) for y in (TOP - 0.2, 0.3, -1.02) for s in (-1, 1)]):
    px, py = min((p for p in mid if p[0] * sx > 0.5), key=lambda p: abs(p[1] - ty) + (0.0 if ty < 1 else abs(abs(p[0]) - (W - 0.17))))
    crisp(lathe(f"pin_{j}", [(0.03, Z_RIM - 0.01), (0.03, Z_RIM + 0.004), (0.022, Z_RIM + 0.01)], "trim", at=(px, py, 0), seg=20, axis="z"))

# вставки: в каждой круглое окно с фаской, на дне — гравировка и тонкое кольцо
inner = inset(rim, 0.205)
T_PLATE = Z_PLATE - (Z_DECK + 0.015)
for i, (sx, sy) in enumerate([(-1, 1), (1, 1), (-1, -1), (1, -1)]):
    n = node(f"n_plate_{i}")
    wx, wy = WELLS[i]
    plate(f"plate_{i}", quadrant(inner, sx, sy), T_PLATE, 0.016, "plate", at=(0, 0, Z_DECK + 0.015), parent=n, holes=[circle(wx, wy, R_WELL, 56)])
    zf = Z_PLATE - 0.05
    crisp(lathe(f"well_{i}", [(R_WELL + 0.02, zf - 0.01), (R_WELL + 0.02, zf)], "pit", at=(wx, wy, 0), parent=n, seg=56, axis="z"))
    node(f"n_well_{i}", at=(wx, wy, Z_PLATE), parent=n)
    # полированный ободок окна — как у прибора
    crisp(lathe(f"collar_{i}", [(R_WELL - 0.004, Z_PLATE - 0.02), (R_WELL + 0.05, Z_PLATE - 0.02), (R_WELL + 0.05, Z_PLATE + 0.008), (R_WELL + 0.036, Z_PLATE + 0.02), (R_WELL + 0.008, Z_PLATE + 0.02), (R_WELL - 0.004, Z_PLATE + 0.006)],
                "trim", at=(wx, wy, 0), parent=n, seg=72, axis="z", ring=True))
    tube(f"ring_{i}", [(math.cos(k / 56 * math.tau) * (R_WELL - 0.045), math.sin(k / 56 * math.tau) * (R_WELL - 0.045), 0) for k in range(56)], 0.0075, "glyph", at=(wx, wy, zf + 0.004), parent=n, smooth=False, closed=True)
    for j, (pts, closed) in enumerate(GLYPHS[i]):
        tube(f"glyph_{i}_{j}", [((u - 12) * G, (12 - v) * G, 0) for u, v in pts], G * 0.95, "glyph", at=(wx, wy, zf + 0.006), parent=n, smooth=False, closed=closed)
    for j, (u, v) in enumerate(DOTS.get(i, [])):
        ball(f"dot_{i}_{j}", G * 1.25, "glyph", at=(wx + (u - 12) * G, wy + (12 - v) * G, zf + 0.006), parent=n, u=14, v=10)

# диск сейфа: неподвижный ободок со шкалой, рифлёное кольцо с меткой, глянцевая шляпка с проточками и скважина
at = (0, CY, 0)
crisp(lathe("bezel", [(0.5, Z_DECK), (0.71, Z_DECK), (0.71, 0.405), (0.692, 0.425), (0.575, 0.425), (0.56, 0.41), (0.56, 0.3), (0.5, 0.3)], "shell", at=at, seg=96, axis="z", ring=True))
ticks("scale", 60, 0.598, 0.632, 0.676, 0.425, 0.4285, "mark", at=at)

dial = node("n_dial", at=at)
Z0, Z1 = 0.31, 0.53
crisp(lathe("knurl", [(0.36, Z0), (0.545, Z0), (0.545, 0.43), (0.545, 0.436), (0.545, Z1 - 0.022), (0.528, Z1), (0.4, Z1), (0.36, Z1)],
            "knurl", at=(0, 0, 0), parent=dial, seg=320, flutes=80, flute_range=(0.434, Z1 - 0.02), flute_depth=0.03, axis="z", ring=True), angle=24)
tip = [(-0.052, 0.405), (0.052, 0.405), (0.0, 0.512)]
crisp(plate("pointer", tip, 0.007, 0.0, "pointer", at=(0, 0, Z1), parent=dial), flat=True)

cap = [(0.39, 0.5), (0.39, 0.57), (0.376, 0.586)]
for r in (0.335, 0.275, 0.215):                               # концентрические проточки
    cap += [(r + 0.013, 0.586), (r, 0.573), (r - 0.013, 0.586)]
cap += [(0.17, 0.586)]
crisp(lathe("cap", cap, "gloss", at=at, seg=96, axis="z"), angle=22)
crisp(lathe("escutcheon", [(0.16, 0.58), (0.16, 0.603), (0.148, 0.613)], "gold", at=at, seg=64, axis="z"))
crisp(lathe("keyhole", [(0.046, 0.61), (0.046, 0.617)], "hole", at=(0, CY + 0.032, 0), seg=28, axis="z"))
plate("keyslot", [(-0.019, 0.02), (0.019, 0.02), (0.033, -0.088), (-0.033, -0.088)], 0.007, 0.0, "hole", at=(0, CY, 0.61))

export(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../public/models/shield.glb"))
