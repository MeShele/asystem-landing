"""
«Сделка без сотрудника»: корпус с тремя шестернями, две ленты, телефоны клиента на концах и касса обменника.
Поток всегда слева направо: слева клиент отдаёт (телефон с QR), справа получает (телефон с галочкой);
перед машиной — лоток кассы, в который после каждой сделки падает монета дохода.
Монета — один образец без знака: сайт размножает её, красит (фиат — золото, крипта — лайм) и кладёт
сверху знак валюты рисунком. Экраны телефонов и табло — плоскости с развёрткой (материалы screen_*).
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

HW, HH, HD = 4.9, 0.6, 2.8
BX0, BX1, BY, BD = 2.45, 4.75, 0.22, 0.86
CASH = (2.02, HD / 2 + 0.62)                     # лоток кассы: перед правой частью машины
R1, N1, N2 = 1.08, 24, 14
R2 = R1 * N2 / N1
GAP, THICK, LIFT = (R1 + R2) * 1.004, 0.24, 0.1


def gear_outline(r, teeth):
    """венец: зуб со скруглённой вершиной и плавным основанием"""
    tip, root, step, pts = r + 0.078, r - 0.078, math.tau / teeth, []
    for i in range(teeth):
        a = i * step
        for da, rad in [(-0.36, root), (-0.3, root + 0.012), (-0.2, tip - 0.04), (-0.15, tip - 0.01), (-0.1, tip), (0.1, tip), (0.15, tip - 0.01), (0.2, tip - 0.04), (0.3, root + 0.012), (0.36, root)]:
            pts.append((math.cos(a + step * da) * rad, math.sin(a + step * da) * rad))
    return pts


def ring(r, n=40):
    return [(math.cos(k / n * math.tau) * r, math.sin(k / n * math.tau) * r) for k in range(n)]


def window(ri, ro, a0, a1, n=10):
    """окно между спицами: сектор кольца со скруглёнными углами"""
    out = [(math.cos(a0 + (a1 - a0) * k / n) * ro, math.sin(a0 + (a1 - a0) * k / n) * ro) for k in range(n + 1)]
    out += [(math.cos(a1 - (a1 - a0) * k / n) * ri, math.sin(a1 - (a1 - a0) * k / n) * ri) for k in range(n + 1)]
    return out


def gear(name, r, teeth, spokes, material, parent):
    holes = [ring(r * 0.1, 24)]
    pad = 0.22
    for i in range(spokes):
        holes.append(window(r * 0.38, r * 0.7, i / spokes * math.tau + pad, (i + 1) / spokes * math.tau - pad))
    plate(name, gear_outline(r, teeth), THICK, 0.022, material, parent=parent, holes=holes, face="top")
    # обод и ступица приподняты над диском — у колеса появляется рельеф
    plate(name + "_rim", ring(r - 0.1, 64), 0.03, 0.01, material, at=(0, THICK, 0), parent=parent, holes=[ring(r * 0.72, 64)], face="top")
    cyl(name + "_hub", r * 0.27, 0.12, "graphite", at=(0, THICK + 0.06, 0), parent=parent, r2=r * 0.24, bevel=0.015)
    ball(name + "_cap", r * 0.13, "gold", at=(0, THICK + 0.12, 0), parent=parent, scale=(1, 0.6, 1), u=24, v=14)


reset()
# ── корпус: крышка-вставка, болты, решётки, табло, приёмные окна лент ──────────────────────────
box("house", HW, HH, HD, 0.08, "graphite", at=(0, HH / 2, 0))
box("lid", HW - 0.34, 0.03, HD - 0.34, 0.012, "pad", at=(0, HH + 0.01, 0))
for sx in (-1, 1):
    for sz in (-1, 1):
        cyl(f"bolt_{sx}{sz}", 0.062, 0.04, "steel", at=(sx * (HW / 2 - 0.36), HH + 0.04, sz * (HD / 2 - 0.36)), seg=6, bevel=0.008)
    for k in range(6):
        box(f"vent_{sx}{k}", 0.035, 0.014, 0.34, 0.005, "dark", at=(sx * (HW / 2 - 0.75 - k * 0.085), HH + 0.028, HD / 2 - 0.55))
    for k in range(6):
        box(f"louver_{sx}{k}", 0.03, 0.3, 0.014, 0.005, "dark", at=(sx * (1.2 + k * 0.085), HH / 2, HD / 2 + 0.004))
    # окно, в которое уходит лента
    box(f"mouth_{sx}", 0.06, 0.34, BD + 0.16, 0.02, "steel", at=(sx * (HW / 2 + 0.005), BY + 0.1, 0))
    box(f"mouth_in_{sx}", 0.04, 0.24, BD, 0.01, "dark", at=(sx * (HW / 2 + 0.03), BY + 0.11, 0))
box("display_frame", 1.94, 0.4, 0.04, 0.03, "dark", at=(0, HH / 2, HD / 2 + 0.004))
screen("display", 1.78, 0.32, "screen", at=(0, HH / 2, HD / 2 + 0.026))

# щель, из которой в кассу падают монеты дохода
box("slot", 0.4, 0.09, 0.04, 0.02, "steel", at=(CASH[0], HH * 0.6, HD / 2 + 0.01))
box("slot_in", 0.32, 0.035, 0.03, 0.008, "dark", at=(CASH[0], HH * 0.6, HD / 2 + 0.022))

# ── касса обменника: лоток с лаймовым ободом ─────────────────────────────────────────────────
cash = node("n_cash", at=(CASH[0], 0, CASH[1]))
cyl("tray", 0.4, 0.07, "graphite", at=(0, 0.035, 0), parent=cash, bevel=0.02, seg=48)
cyl("tray_in", 0.33, 0.02, "dark", at=(0, 0.071, 0), parent=cash, seg=48)
tube("tray_rim", [(p[0], 0, p[1]) for p in ring(0.37, 48)], 0.022, "lime", at=(0, 0.075, 0), parent=cash, smooth=False, closed=True)


def phone(tag, x):
    """телефон клиента на подставке у конца ленты; экран — плоскость с развёрткой, сайт рисует на нём"""
    n = node(f"n_phone_{tag}", at=(x, 0, 0.05))
    box(f"stand_{tag}", 0.62, 0.08, 0.5, 0.03, "graphite", at=(0, 0.04, -0.06), parent=n)
    body = node(f"phone_{tag}", at=(0, 0.66, 0), parent=n, tilt=-0.16)
    box(f"phone_body_{tag}", 0.66, 1.22, 0.08, 0.09, "graphite", parent=body)
    box(f"phone_glass_{tag}", 0.6, 1.16, 0.012, 0.07, "dark", at=(0, 0, 0.041), parent=body)
    screen(f"phone_screen_{tag}", 0.54, 1.04, f"screen_{tag}", at=(0, -0.01, 0.049), parent=body)
    box(f"phone_cam_{tag}", 0.14, 0.03, 0.01, 0.012, "ink", at=(0, 0.545, 0.05), parent=body)
    for k, y in enumerate((0.25, 0.08)):
        box(f"phone_btn_{tag}{k}", 0.014, 0.12, 0.03, 0.006, "steel", at=(0.335, y, 0), parent=body)


phone("in", -(BX1 + 0.5))
phone("out", BX1 + 0.5)

# ── колёса ───────────────────────────────────────────────────────────────────────────────
for i, (x, r, teeth, spokes, material) in enumerate([(0, R1, N1, 6, "lime"), (GAP, R2, N2, 4, "steel"), (-GAP, R2, N2, 4, "steel")]):
    cyl(f"post_{i}", r * 0.17, LIFT, "steel", at=(x, HH + LIFT / 2, 0), r2=r * 0.15, seg=24)
    n = node(f"n_gear_{i}", at=(x, HH + LIFT, 0))
    gear(f"gear_{i}", r, teeth, spokes, material, n)
    if i == 0:
        for k in range(6):
            a = k / 6 * math.tau
            cyl(f"hubbolt_{k}", 0.03, 0.03, "steel", at=(math.cos(a) * r * 0.2, THICK + 0.125, math.sin(a) * r * 0.2), parent=n, seg=6)

# ── ленты: полотно, борта, опоры, валики на концах ─────────────────────────────────────────
LEN = BX1 - BX0
for sx in (-1, 1):
    cx = sx * (BX0 + BX1) / 2
    box(f"belt_{sx}", LEN, 0.1, BD, 0.04, "dark", at=(cx, BY, 0))
    box(f"belt_mid_{sx}", LEN - 0.2, 0.012, 0.03, 0.004, "pad", at=(cx, BY + 0.052, 0))
    for sz in (-1, 1):
        box(f"rail_{sx}{sz}", LEN + 0.1, 0.17, 0.07, 0.025, "steel", at=(cx, BY + 0.03, sz * (BD / 2 + 0.035)))
    for k in (-0.34, 0.34):
        box(f"leg_{sx}{k}", 0.13, BY, BD * 0.82, 0.03, "graphite", at=(cx + k * LEN, BY / 2 - 0.05, 0))
    cyl(f"roller_{sx}", 0.125, BD + 0.14, "steel", at=(cx + sx * LEN / 2, BY, 0), axis="z", seg=32, bevel=0.012)
    for sz in (-1, 1):
        cyl(f"roller_cap_{sx}{sz}", 0.05, 0.03, "gold", at=(cx + sx * LEN / 2, BY, sz * (BD / 2 + 0.085)), axis="z", seg=20)

# ── монета-образец: стоит в нуле, без знака; сайт расставляет копии и кладёт знак валюты сверху ─────
n = node("n_coin")
cyl("coin", 0.27, 0.07, "gold", parent=n, bevel=0.015, seg=56)
tube("coin_rim", [(p[0], 0, p[1]) for p in ring(0.238, 48)], 0.014, "gold", at=(0, 0.034, 0), parent=n, smooth=False, closed=True)

export(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../public/models/gears.glb"))
