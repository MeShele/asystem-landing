"""«Запуск за четыре шага»: площадка с четырьмя остановками — рукопожатие над договором, сервер, пульт, здание обменника."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

W, D, T, PAD = 12.2, 3.3, 0.22, 0.07
XS = [-4.6, -1.75, 1.15, 4.3]

reset()
box("platform", W, T, D, 0.09, "graphite", at=(0, -T / 2, 0))
st = []
for i, x in enumerate(XS):
    box(f"pad_{i}", 3.6 if i == 3 else 2.6, PAD, 2.5, 0.03, "pad", at=(x, PAD / 2, -0.2))
    st.append(node(f"n_station_{i}", at=(x, PAD, 0)))


# ── 1. договор: два человека жмут руки, за ними планшет с договором ────────────────────────────
def person(tag, parent, at, yaw, suit, shirt, tie, hair):
    """стилизованный человек ростом ≈ 1,03: крупная голова с причёской, пиджак с рубашкой и галстуком, брюки, ботинки"""
    p = node(f"person_{tag}", at=at, parent=parent, yaw=yaw)
    for s in (-1, 1):
        box(f"shoe_{tag}{s}", 0.115, 0.07, 0.215, 0.03, "dark", at=(s * 0.078, 0.035, 0.036), parent=p, seg=5)
        cyl(f"leg_{tag}{s}", 0.052, 0.36, "graphite", at=(s * 0.078, 0.235, 0), parent=p, r2=0.062, bevel=0.02, seg=28)
    box(f"hips_{tag}", 0.3, 0.13, 0.19, 0.055, "graphite", at=(0, 0.405, 0), parent=p, seg=5)
    box(f"jacket_{tag}", 0.375, 0.33, 0.215, 0.09, suit, at=(0, 0.565, 0), parent=p, seg=7)
    for s in (-1, 1):
        ball(f"shoulder_{tag}{s}", 0.072, suit, at=(s * 0.19, 0.665, 0), parent=p, u=24, v=16)
    # рубашка, галстук и лацканы — на груди
    plate(f"shirt_{tag}", [(-0.062, 0.725), (0.062, 0.725), (0.0, 0.575)], 0.012, 0.0, shirt, at=(0, 0, 0.102), parent=p)
    plate(f"tie_{tag}", [(-0.022, 0.712), (0.022, 0.712), (0.03, 0.625), (0.0, 0.575), (-0.03, 0.625)], 0.02, 0.004, tie, at=(0, 0, 0.106), parent=p)
    for s in (-1, 1):
        plate(f"lapel_{tag}{s}", [(s * 0.062, 0.728), (s * 0.118, 0.7), (s * 0.03, 0.555), (s * 0.004, 0.578)], 0.016, 0.004, suit, at=(0, 0, 0.104), parent=p)
    # левая рука вдоль тела
    tube(f"arm_l_{tag}", [(0.2, 0.655, 0), (0.232, 0.52, 0.012), (0.226, 0.4, 0.05)], 0.05, suit, parent=p)
    ball(f"hand_l_{tag}", 0.054, "skin", at=(0.224, 0.355, 0.058), parent=p, scale=(0.85, 1.1, 1), u=20, v=14)
    # правая рука протянута вперёд: отдельный узел с осью в плече — ею фигура жмёт руку
    arm = node(f"n_arm_{tag}", at=(-0.2, 0.655, 0), parent=p)
    tube(f"arm_r_{tag}", [(0, 0, 0), (0.035, -0.125, 0.15), (0.14, -0.15, 0.31)], 0.05, suit, parent=arm)
    ball(f"hand_r_{tag}", 0.056, "skin", at=(0.158, -0.15, 0.37), parent=arm, scale=(0.95, 1, 1.2), u=20, v=14)
    # шея, голова, уши, глаза, причёска
    cyl(f"neck_{tag}", 0.046, 0.07, "skin", at=(0, 0.75, 0), parent=p, seg=24)
    ball(f"head_{tag}", 0.136, "skin", at=(0, 0.89, 0.005), parent=p, scale=(1, 1.06, 1.02), u=40, v=26)
    for s in (-1, 1):
        ball(f"ear_{tag}{s}", 0.03, "skin", at=(s * 0.134, 0.88, 0), parent=p, scale=(0.6, 1, 0.8), u=14, v=10)
        ball(f"eye_{tag}{s}", 0.017, "ink", at=(s * 0.05, 0.9, 0.127), parent=p, scale=(1, 1.25, 0.6), u=14, v=10)
    ball(f"hair_{tag}", 0.146, hair, at=(0, 0.905, -0.008), parent=p, scale=(1.02, 1.0, 1.05), u=40, v=26,
         cut=lambda x, y, z: (y < 0.28 and z > 0.05) or y < -0.42)
    return p


person("a", st[0], (-0.42, 0, 0.32), math.pi / 2, "lime", "ice", "ink", "ink")
person("b", st[0], (0.42, 0, 0.32), -math.pi / 2, "ice", "pad", "lime", "pad")

board = node("board", at=(0, 0.66, -0.6), parent=st[0], tilt=-0.1)
box("sheet", 0.9, 1.18, 0.04, 0.03, "ice", parent=board)
box("clip", 0.32, 0.1, 0.05, 0.02, "steel", at=(0, 0.57, 0.02), parent=board)
box("title", 0.46, 0.055, 0.014, 0.008, "lime", at=(-0.1, 0.4, 0.024), parent=board)
for k in range(4):
    box(f"line_{k}", 0.34 if k == 3 else 0.66, 0.03, 0.012, 0.006, "pad", at=(-0.16 if k == 3 else 0, 0.26 - k * 0.09, 0.022), parent=board)
for s in (-1, 1):
    pts = [(s * 0.21 - 0.13 + k * 0.0325, -0.3 + (0.04 if k % 2 else -0.03) * (0.3 if k in (0, 8) else 1), 0.024) for k in range(9)]
    tube(f"sign_{s}", pts, 0.009, "gold", parent=board)
    box(f"under_{s}", 0.28, 0.012, 0.01, 0.004, "pad", at=(s * 0.21, -0.38, 0.022), parent=board)
cyl("seal", 0.095, 0.03, "lime", at=(0.27, 0.42, 0.03), parent=board, axis="z", bevel=0.008)
tube("seal_tick", [(-0.04, 0.0, 0), (-0.012, -0.03, 0), (0.045, 0.035, 0)], 0.012, "ink", at=(0.27, 0.42, 0.05), parent=board, smooth=False)


# ── 2. сервер: стойка с блоками и огоньками, блок питания, кабель ─────────────────────────────
RX, RZ = -0.12, -0.15
FRONT = RZ + 0.45
box("rack", 1.0, 1.76, 0.9, 0.05, "graphite", at=(RX, 0.88, RZ), parent=st[1])
box("rack_door", 0.86, 1.6, 0.03, 0.02, "dark", at=(RX, 0.88, FRONT), parent=st[1])
box("rack_top", 0.7, 0.03, 0.6, 0.012, "pad", at=(RX, 1.765, RZ), parent=st[1])
for k in range(5):
    box(f"rack_grill_{k}", 0.5, 0.012, 0.04, 0.004, "dark", at=(RX, 1.784, RZ - 0.18 + k * 0.09), parent=st[1])
leds = [node(f"n_leds_{k}", parent=st[1]) for k in range(3)]
for u in range(7):
    y = 0.26 + u * 0.207
    box(f"unit_{u}", 0.78, 0.17, 0.05, 0.02, "pad", at=(RX, y, FRONT + 0.03), parent=st[1])
    for s in (-1, 1):
        box(f"handle_{u}{s}", 0.022, 0.11, 0.03, 0.008, "steel", at=(RX + s * 0.355, y, FRONT + 0.066), parent=st[1])
    for d in range(2):
        amber = (u * 2 + d) % 5 == 3
        ball(f"led_{u}{d}", 0.024, "glowAmber" if amber else "glowLime", at=(RX - 0.27 + d * 0.075, y, FRONT + 0.058), parent=leds[2 if amber else (u + d) % 2], u=14, v=10)
    for v in range(7):
        box(f"slot_{u}{v}", 0.022, 0.1, 0.012, 0.004, "ink", at=(RX - 0.05 + v * 0.055, y, FRONT + 0.056), parent=st[1])
for sx in (-1, 1):
    for sz in (-1, 1):
        cyl(f"foot_{sx}{sz}", 0.05, 0.03, "steel", at=(RX + sx * 0.4, 0.0, RZ + sz * 0.36), parent=st[1], seg=20)
box("ups", 0.5, 0.56, 0.62, 0.05, "graphite", at=(0.74, 0.28, 0.1), parent=st[1])
box("ups_panel", 0.36, 0.3, 0.02, 0.02, "dark", at=(0.74, 0.32, 0.412), parent=st[1])
box("ups_bar", 0.26, 0.035, 0.02, 0.008, "glowAmber", at=(0.74, 0.39, 0.422), parent=st[1])
for k in range(2):
    cyl(f"ups_btn_{k}", 0.025, 0.02, "steel", at=(0.68 + k * 0.12, 0.25, 0.425), parent=st[1], axis="z", seg=16)
tube("cable", [(0.38, 0.12, -0.5), (0.5, 0.05, -0.62), (0.74, 0.05, -0.55), (0.78, 0.2, -0.24)], 0.022, "dark", parent=st[1])


# ── 3. настройка: пульт с экраном, клавиатурой и мышью ───────────────────────────────────────
box("desk", 1.2, 0.5, 0.72, 0.05, "graphite", at=(0, 0.25, -0.12), parent=st[2])
box("desk_top", 1.32, 0.05, 0.84, 0.02, "pad", at=(0, 0.52, -0.12), parent=st[2])
cyl("mon_base", 0.2, 0.03, "steel", at=(0, 0.56, -0.3), parent=st[2], bevel=0.008)
box("mon_neck", 0.1, 0.36, 0.06, 0.02, "steel", at=(0, 0.72, -0.3), parent=st[2])
mon = node("monitor", at=(0, 1.3, -0.27), parent=st[2], tilt=-0.14)
box("mon_frame", 1.56, 1.0, 0.07, 0.05, "graphite", parent=mon)
screen("mon_screen", 1.43, 0.88, "screen", at=(0, 0, 0.037), parent=mon)
box("keyboard", 0.74, 0.03, 0.26, 0.012, "dark", at=(-0.08, 0.56, 0.1), parent=st[2])
for r in range(3):
    for c in range(10):
        lime_key = r == 2 and c == 9
        box(f"key_{r}{c}", 0.055, 0.014, 0.055, 0.008, "lime" if lime_key else "pad", at=(-0.08 - 0.3 + c * 0.0667, 0.582, 0.1 - 0.075 + r * 0.075), parent=st[2], seg=2)
ball("mouse", 0.06, "ice", at=(0.43, 0.565, 0.12), parent=st[2], scale=(0.75, 0.42, 1.15), u=20, v=14)


# ── 4. открытие: здание с каннелированными колоннами, фронтоном и золотой монетой биткоина ─────
BW, BH, Y0 = 2.1, 1.05, 0.24
for k, (w, d) in enumerate([(2.9, 2.15), (2.72, 1.97), (2.54, 1.79)]):
    box(f"step_{k}", w, 0.08, d, 0.02, "stone", at=(0, 0.04 + k * 0.08, -0.05 - k * 0.03), parent=st[3])
box("body", BW, BH, 1.25, 0.02, "graphite", at=(0, Y0 + BH / 2, -0.3), parent=st[3])
FZ = -0.3 + 0.625
# дверь с порталом и светящейся фрамугой
box("door", 0.44, 0.74, 0.04, 0.02, "dark", at=(0, Y0 + 0.37, FZ + 0.005), parent=st[3])
box("door_gap", 0.016, 0.7, 0.012, 0.004, "glowAmber", at=(0, Y0 + 0.37, FZ + 0.028), parent=st[3])
for s in (-1, 1):
    box(f"jamb_{s}", 0.05, 0.86, 0.06, 0.012, "stone", at=(s * 0.25, Y0 + 0.43, FZ + 0.015), parent=st[3])
    ball(f"knob_{s}", 0.022, "gold", at=(s * 0.035, Y0 + 0.36, FZ + 0.04), parent=st[3], u=14, v=10)
box("lintel", 0.6, 0.06, 0.07, 0.012, "stone", at=(0, Y0 + 0.88, FZ + 0.015), parent=st[3])
box("transom", 0.4, 0.08, 0.02, 0.01, "glowAmber", at=(0, Y0 + 0.795, FZ + 0.012), parent=st[3])
# окна с рамами и переплётом
for s in (-1, 1):
    x = s * 0.67
    box(f"win_{s}", 0.3, 0.52, 0.02, 0.02, "glowAmber", at=(x, Y0 + 0.56, FZ + 0.006), parent=st[3])
    box(f"win_v_{s}", 0.022, 0.52, 0.016, 0.004, "dark", at=(x, Y0 + 0.56, FZ + 0.018), parent=st[3])
    box(f"win_h_{s}", 0.3, 0.022, 0.016, 0.004, "dark", at=(x, Y0 + 0.6, FZ + 0.018), parent=st[3])
    box(f"sill_{s}", 0.38, 0.04, 0.07, 0.012, "stone", at=(x, Y0 + 0.28, FZ + 0.02), parent=st[3])
    box(f"head_{s}", 0.38, 0.04, 0.06, 0.012, "stone", at=(x, Y0 + 0.84, FZ + 0.02), parent=st[3])
# колонны: база, ствол с каннелюрами и лёгким утонением, капитель
H = BH
profile = [(0.118, 0.0), (0.118, 0.03), (0.105, 0.045), (0.112, 0.062), (0.098, 0.08), (0.09, 0.09)]
profile += [(0.09 - 0.012 * (k / 10) ** 1.6, 0.09 + (H - 0.2) * k / 10) for k in range(1, 11)]
profile += [(0.084, H - 0.105), (0.1, H - 0.085), (0.112, H - 0.06), (0.112, H - 0.05)]
for k, x in enumerate([-0.98, -0.36, 0.36, 0.98]):
    lathe(f"column_{k}", profile, "stone", at=(x, Y0, 0.56), parent=st[3], seg=48, flutes=16, flute_range=(0.1, H - 0.115), flute_depth=0.085)
    box(f"abacus_{k}", 0.25, 0.05, 0.25, 0.012, "stone", at=(x, Y0 + H - 0.025, 0.56), parent=st[3])
# антаблемент: архитрав, фриз с золотыми накладками, карниз
EY = Y0 + BH
box("architrave", 2.46, 0.09, 1.78, 0.015, "stone", at=(0, EY + 0.045, -0.14), parent=st[3])
box("frieze", 2.4, 0.08, 1.72, 0.01, "graphite", at=(0, EY + 0.13, -0.14), parent=st[3])
for k in range(9):
    box(f"stud_{k}", 0.07, 0.045, 0.02, 0.008, "gold", at=(-1.0 + k * 0.25, EY + 0.13, -0.14 + 0.866), parent=st[3])
box("cornice", 2.6, 0.06, 1.92, 0.015, "stone", at=(0, EY + 0.2, -0.14), parent=st[3])
# фронтон и крыша: лаймовая призма, на ней золотая монета со знаком биткоина
GY, GZ = EY + 0.23, -0.14 + 0.93
plate("gable", [(-1.3, 0.0), (1.3, 0.0), (0.0, 0.68)], 1.86, 0.03, "lime", at=(0, GY, GZ - 1.86), parent=st[3])
coin = node("coin", at=(0, GY + 0.255, GZ + 0.0), parent=st[3])
cyl("coin_body", 0.205, 0.05, "gold", at=(0, 0, 0.02), parent=coin, axis="z", bevel=0.012)
tube("coin_rim", [(math.cos(a) * 0.178, math.sin(a) * 0.178, 0) for a in [k / 40 * math.tau for k in range(40)]], 0.013, "gold", at=(0, 0, 0.046), parent=coin, smooth=False, closed=True)
text("coin_b", "B", 0.25, 0.03, "ink", at=(0.004, 0.0, 0.052), parent=coin, bevel=0.003)
for sy in (-1, 1):
    for sx in (-1, 1):
        box(f"coin_bar_{sy}{sx}", 0.022, 0.05, 0.03, 0.006, "ink", at=(sx * 0.03 - 0.012, sy * 0.105, 0.052), parent=coin)

export(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../public/models/launch.glb"))
