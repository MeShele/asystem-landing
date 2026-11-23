"""
«Запуск за четыре шага» — в том же языке, что щит: тёмные точёные предметы, цвет приходит от света.
Общая плита с полированной кромкой, на ней четыре поворотных подиума со шкалой и рифлёным бортом:
  1. договор  — две статуэтки (ASystem и клиент) жмут руки, над ними парит табличка договора с подписью и печатью;
  2. сервер   — стойка-монолит с блоками, огоньками и световой полосой, рядом блок питания;
  3. настройка — пульт на ножке: ползунки, рифлёная ручка, кнопки и экран;
  4. открытие — здание обменника: каннелированные колонны, окна светятся изнутри, на фронтоне золотая монета.

Подвижные узлы: n_station_0..3 (всё, что стоит на подиуме), n_arm_a / n_arm_b (руки в рукопожатии),
n_board (табличка договора), n_leds_0..2 (огоньки стойки), n_knob (ручка пульта).
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

W, D = 12.2, 3.6
RP = [1.2, 1.1, 1.1, 1.45]                 # радиусы подиумов
XS = [-4.28, -1.56, 1.06, 4.03]            # их центры: равные зазоры между бортами
PZ, PATH_Z, DECK, PAD = -0.15, 1.5, 0.006, 0.181


def rr(w, d, r, n=8):
    """скруглённый прямоугольник для плиты, лежащей лицом вверх"""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        pts += [(cx + math.cos(math.radians(a0 + 90 * i / n)) * r, cy + math.sin(math.radians(a0 + 90 * i / n)) * r) for i in range(n + 1)]
    return pts


def rect(w, h):
    return [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]


reset()

# ── плита: тёмное тело, утопленный цоколь, сатиновая палуба и полированная кромка по краю ────────
box("foot", W - 0.5, 0.1, D - 0.5, 0.03, "pit", at=(0, -0.31, 0))
box("slab", W, 0.26, D, 0.07, "shell", at=(0, -0.13, 0))
plate("lip", rr(W - 0.1, D - 0.1, 0.12), 0.012, 0.004, "trim", holes=[rr(W - 0.22, D - 0.22, 0.07)], face="top")
plate("deck", rr(W - 0.28, D - 0.28, 0.05), DECK, 0.0, "plate", face="top")
# дорожка шагов: тёмный паз вдоль переднего края, от него отводы к подиумам, на отводах полированные гнёзда
slab("path", XS[3] - XS[0] + 1.3, 0.004, 0.06, "pit", at=((XS[0] + XS[3]) / 2, DECK + 0.002, PATH_Z))
for i, x in enumerate(XS):
    z0 = PZ + RP[i] + 0.05
    slab(f"branch_{i}", 0.03, 0.004, PATH_Z - z0, "pit", at=(x, DECK + 0.002, (PATH_Z + z0) / 2))
    crisp(lathe(f"socket_{i}", [(0.085, 0.0), (0.15, 0.0), (0.15, 0.008), (0.138, 0.016), (0.097, 0.016), (0.085, 0.008)], "trim", at=(x, DECK, PATH_Z), seg=40, ring=True))

# ── подиумы: борт с рифлением, кольцо со шкалой, сатиновая площадка ─────────────────────────────
st = []
for i, x in enumerate(XS):
    r, at = RP[i], (x, DECK, PZ)
    crisp(lathe(f"pod_{i}", [(r + 0.05, 0.0), (r + 0.05, 0.034), (r + 0.03, 0.054), (r, 0.054), (r, 0.128), (r - 0.022, 0.15), (r - 0.2, 0.15)], "shell", at=at, seg=96))
    n_fl = round(r * 62)
    crisp(lathe(f"pod_knurl_{i}", [(r - 0.004, 0.062), (r + 0.014, 0.062), (r + 0.014, 0.066), (r + 0.014, 0.116), (r + 0.014, 0.12), (r - 0.004, 0.12)],
                "knurl", at=at, seg=n_fl * 4, flutes=n_fl, flute_range=(0.064, 0.118), flute_depth=0.011, ring=True), angle=24)
    ticks(f"pod_scale_{i}", 72, r - 0.165, r - 0.125, r - 0.06, 0.15, 0.1535, "mark", at=at, every=6, face="top", w_long=0.009, w_short=0.005)
    crisp(lathe(f"pod_top_{i}", [(r - 0.2, 0.14), (r - 0.2, 0.163), (r - 0.212, 0.175)], "plate", at=at, seg=96))
    st.append(node(f"n_station_{i}", at=(x, PAD, PZ)))


# ── 1. договор: две статуэтки жмут руки, над ними табличка договора ─────────────────────────────
FIG = 1.24                                 # статуэтки крупнее остального: на подиуме они главные


def figure(tag, parent, at, yaw, body):
    """статуэтка ростом ≈ 1,1: цельная, без лица — силуэт человека в пиджаке; правая рука протянута для рукопожатия"""
    p = node(f"figure_{tag}", at=at, parent=parent, yaw=yaw)
    p.scale = (FIG, FIG, FIG)
    for s in (-1, 1):
        tube(f"leg_{tag}{s}", [(s * 0.08, 0.5, 0), (s * 0.076, 0.28, 0.004), (s * 0.07, 0.06, 0)], 0.064, body, parent=p, taper=[1.0, 0.84, 0.64])
        ball(f"shoe_{tag}{s}", 0.058, body, at=(s * 0.07, 0.034, 0.034), parent=p, scale=(0.84, 0.6, 1.8), u=22, v=12)
    loft(f"torso_{tag}", [(0.42, 0.146, 0.098), (0.47, 0.152, 0.102), (0.57, 0.132, 0.09), (0.69, 0.158, 0.102), (0.768, 0.178, 0.094), (0.806, 0.132, 0.076), (0.832, 0.06, 0.054)], body, parent=p, seg=32)
    cyl(f"neck_{tag}", 0.043, 0.08, body, at=(0, 0.86, 0), parent=p, seg=24)
    ball(f"head_{tag}", 0.113, body, at=(0, 0.99, 0.004), parent=p, scale=(0.9, 1.08, 0.98), u=40, v=26)
    tube(f"arm_l_{tag}", [(0.18, 0.764, 0), (0.216, 0.6, 0.0), (0.208, 0.45, 0.036)], 0.051, body, parent=p, taper=[1.0, 0.9, 0.72])
    ball(f"hand_l_{tag}", 0.04, body, at=(0.206, 0.402, 0.046), parent=p, scale=(0.72, 1.2, 0.95), u=18, v=12)
    arm = node(f"n_arm_{tag}", at=(-0.18, 0.764, 0), parent=p)
    tube(f"arm_r_{tag}", [(0, 0, 0), (0.03, -0.175, 0.11), (0.15, -0.2, 0.28)], 0.051, body, parent=arm, taper=[1.0, 0.9, 0.72])
    ball(f"hand_r_{tag}", 0.04, body, at=(0.17, -0.2, 0.328), parent=arm, scale=(0.8, 0.95, 1.3), u=18, v=12)
    return p


figure("a", st[0], (-0.36 * FIG, 0, 0.32), math.pi / 2, "statue_a")
figure("b", st[0], (0.36 * FIG, 0, 0.32), -math.pi / 2, "statue_b")

# табличка парит над рукопожатием: стойка за спинами читалась как шест в руках у статуэток
board = node("n_board", at=(0, 1.86, -0.3), parent=st[0], tilt=-0.17)
board.scale = (0.86, 0.86, 0.86)
box("tablet", 0.72, 0.94, 0.05, 0.045, "shell", parent=board, seg=5)
box("tablet_glass", 0.63, 0.85, 0.012, 0.03, "gloss", at=(0, 0, 0.022), parent=board)
GZ = 0.0295
slab("doc_title", 0.24, 0.034, 0.004, "mark", at=(-0.155, 0.33, GZ), parent=board)
for k, w in enumerate((0.5, 0.5, 0.42, 0.5, 0.3)):
    slab(f"doc_line_{k}", w, 0.014, 0.003, "mark", at=(-0.275 + w / 2, 0.235 - k * 0.07, GZ), parent=board)
sig = [(-0.26 + k * 0.03, -0.24 + (0.036 if k % 2 else -0.026) * (0.3 if k in (0, 8) else 1), 0) for k in range(9)]
tube("doc_sign", sig, 0.0075, "gold", at=(0, 0, GZ + 0.003), parent=board)
slab("doc_under", 0.26, 0.008, 0.003, "mark", at=(-0.14, -0.31, GZ), parent=board)
# печать: светящееся кольцо с галочкой — тем же приёмом, что гравировка на щите
tube("seal_ring", [(math.cos(k / 40 * math.tau) * 0.088, math.sin(k / 40 * math.tau) * 0.088, 0) for k in range(40)], 0.008, "glowLime", at=(0.18, -0.255, GZ + 0.003), parent=board, smooth=False, closed=True)
tube("seal_tick", [(-0.04, 0.0, 0), (-0.012, -0.03, 0), (0.044, 0.034, 0)], 0.0095, "glowLime", at=(0.18, -0.255, GZ + 0.003), parent=board, smooth=False)


# ── 2. сервер: стойка-монолит, блоки с огоньками, световая полоса, блок питания ─────────────────
RX, RZ, RW, RH, RD = -0.17, -0.05, 0.92, 1.86, 0.84
FRONT = RZ + RD / 2
box("rack", RW, RH, RD, 0.045, "shell", at=(RX, RH / 2, RZ), parent=st[1])
plate("rack_trim", rect(RW - 0.09, RH - 0.09), 0.01, 0.003, "trim", at=(RX, RH / 2, FRONT), parent=st[1], holes=[rect(RW - 0.125, RH - 0.125)])
slab("rack_bay", RW - 0.13, RH - 0.13, 0.006, "pit", at=(RX, RH / 2, FRONT + 0.002), parent=st[1])
slab("rack_strip", 0.016, RH - 0.3, 0.008, "glowLime", at=(RX - RW / 2 + 0.105, RH / 2, FRONT + 0.008), parent=st[1])
leds = [node(f"n_leds_{k}", parent=st[1]) for k in range(3)]
UX = RX + 0.05
for u in range(8):
    y = 0.2 + u * 0.208
    box(f"unit_{u}", 0.66, 0.16, 0.03, 0.012, "plate", at=(UX, y, FRONT + 0.018), parent=st[1], seg=2)
    slab(f"handle_{u}", 0.018, 0.1, 0.02, "trim", at=(UX + 0.3, y, FRONT + 0.04), parent=st[1])
    for d in range(2):
        amber = (u * 2 + d) % 5 == 3
        slab(f"led_{u}{d}", 0.036, 0.03, 0.008, "glowAmber" if amber else "glowLime", at=(UX - 0.28 + d * 0.058, y + 0.03, FRONT + 0.035), parent=leds[2 if amber else (u + d) % 2])
    for v in range(7):
        slab(f"slot_{u}{v}", 0.016, 0.085, 0.006, "pit", at=(UX - 0.13 + v * 0.052, y, FRONT + 0.034), parent=st[1])
for k in range(6):
    slab(f"rack_vent_{k}", 0.56, 0.006, 0.03, "pit", at=(RX, RH + 0.002, RZ - 0.2 + k * 0.08), parent=st[1])
for sx in (-1, 1):
    for sz in (-1, 1):
        cyl(f"rack_foot_{sx}{sz}", 0.045, 0.02, "trim", at=(RX + sx * 0.36, 0.0, RZ + sz * 0.32), parent=st[1], seg=20)
UPX, UPZ = 0.56, 0.12
box("ups", 0.4, 0.5, 0.44, 0.04, "shell", at=(UPX, 0.25, UPZ), parent=st[1])
slab("ups_panel", 0.3, 0.3, 0.006, "pit", at=(UPX, 0.28, UPZ + 0.221), parent=st[1])
slab("ups_bar", 0.2, 0.026, 0.006, "glowAmber", at=(UPX, 0.35, UPZ + 0.226), parent=st[1])
for k in range(2):
    cyl(f"ups_btn_{k}", 0.022, 0.014, "trim", at=(UPX - 0.05 + k * 0.1, 0.22, UPZ + 0.226), parent=st[1], axis="z", seg=16)
tube("cable", [(0.22, 0.1, -0.42), (0.36, 0.035, -0.5), (0.56, 0.035, -0.4), (0.58, 0.16, -0.12)], 0.018, "pit", parent=st[1])


# ── 3. настройка: пульт на ножке — ползунки, рифлёная ручка, кнопки, экран ──────────────────────
crisp(lathe("ped", [(0.36, 0.0), (0.36, 0.028), (0.32, 0.05), (0.2, 0.085), (0.17, 0.12), (0.17, 0.5), (0.24, 0.57), (0.24, 0.6)], "shell", at=(0, 0, -0.06), parent=st[2], seg=64))
crisp(lathe("ped_ring", [(0.165, 0.3), (0.182, 0.3), (0.182, 0.33), (0.165, 0.33)], "trim", at=(0, 0, -0.06), parent=st[2], seg=48, ring=True))
deck = node("console", at=(0, 0.72, 0.04), parent=st[2], tilt=0.44)
box("console_body", 1.3, 0.1, 0.76, 0.04, "shell", parent=deck, seg=5)
box("console_panel", 1.2, 0.012, 0.66, 0.012, "plate", at=(0, 0.05, 0), parent=deck, seg=2)
Y = 0.057
for k, (x, z) in enumerate([(-0.47, -0.09), (-0.36, 0.07), (-0.25, -0.02)]):
    slab(f"fader_slot_{k}", 0.02, 0.004, 0.42, "pit", at=(x, Y, 0), parent=deck)
    box(f"fader_cap_{k}", 0.074, 0.034, 0.05, 0.01, "trim", at=(x, Y + 0.018, z), parent=deck, seg=3)
    slab(f"fader_line_{k}", 0.076, 0.004, 0.01, "glowLime", at=(x, Y + 0.037, z), parent=deck)
KX, KZ = 0.07, 0.03
ticks("knob_scale", 40, 0.215, 0.235, 0.262, Y, Y + 0.003, "mark", at=(KX, 0, KZ), parent=deck, every=5, face="top", w_long=0.007, w_short=0.004)
knob = node("n_knob", at=(KX, Y, KZ), parent=deck)
crisp(lathe("knob_ring", [(0.1, 0.0), (0.178, 0.0), (0.178, 0.006), (0.178, 0.058), (0.166, 0.072), (0.1, 0.072)], "knurl", parent=knob, seg=176, flutes=44, flute_range=(0.004, 0.06), flute_depth=0.035, ring=True), angle=24)
crisp(lathe("knob_cap", [(0.145, 0.06), (0.145, 0.078), (0.132, 0.088)], "gloss", parent=knob, seg=48))
slab("knob_mark", 0.014, 0.004, 0.07, "glowLime", at=(0, 0.09, -0.085), parent=knob)
for k, m in enumerate(("glowLime", "glowAmber", "mark")):
    z = -0.2 + k * 0.17
    crisp(lathe(f"btn_ring_{k}", [(0.04, 0.0), (0.062, 0.0), (0.062, 0.012), (0.054, 0.02), (0.04, 0.02)], "trim", at=(0.45, Y, z), parent=deck, seg=32, ring=True))
    cyl(f"btn_{k}", 0.041, 0.016, m, at=(0.45, Y + 0.008, z), parent=deck, seg=24)
box("display_arm", 0.14, 0.34, 0.07, 0.02, "shell", at=(0, 0.83, -0.36), parent=st[2])
disp = node("display", at=(0, 1.3, -0.39), parent=st[2], tilt=-0.19)
box("display_frame", 1.14, 0.74, 0.06, 0.04, "shell", parent=disp, seg=5)
screen("display_screen", 1.03, 0.634, "screen", at=(0, 0, 0.032), parent=disp)


# ── 4. открытие: здание обменника — окна светятся изнутри, на фронтоне золотая монета ───────────
BW, BH, BD, Y0, BZ = 1.5, 0.98, 0.84, 0.21, -0.14
for k, (w, d) in enumerate([(2.0, 1.4), (1.88, 1.28), (1.76, 1.16)]):
    box(f"step_{k}", w, 0.07, d, 0.014, "plate", at=(0, 0.035 + k * 0.07, 0), parent=st[3], seg=2)
box("body", BW, BH, BD, 0.012, "shell", at=(0, Y0 + BH / 2, BZ), parent=st[3], seg=2)
FZ = BZ + BD / 2
# дверной проём: свет изнутри, створки приоткрыты
slab("door_light", 0.36, 0.68, 0.006, "glowAmber", at=(0, Y0 + 0.34, FZ + 0.002), parent=st[3])
for s in (-1, 1):
    slab(f"door_leaf_{s}", 0.13, 0.52, 0.01, "pit", at=(s * 0.105, Y0 + 0.26, FZ + 0.008), parent=st[3])
    slab(f"door_jamb_{s}", 0.03, 0.72, 0.03, "trim", at=(s * 0.195, Y0 + 0.36, FZ + 0.012), parent=st[3])
slab("door_bar", 0.36, 0.022, 0.012, "pit", at=(0, Y0 + 0.535, FZ + 0.008), parent=st[3])
slab("door_lintel", 0.44, 0.03, 0.03, "trim", at=(0, Y0 + 0.735, FZ + 0.012), parent=st[3])
for s in (-1, 1):
    x = s * 0.49
    slab(f"win_{s}", 0.24, 0.5, 0.006, "glowAmber", at=(x, Y0 + 0.5, FZ + 0.002), parent=st[3])
    slab(f"win_v_{s}", 0.014, 0.5, 0.01, "pit", at=(x, Y0 + 0.5, FZ + 0.008), parent=st[3])
    slab(f"win_h_{s}", 0.24, 0.014, 0.01, "pit", at=(x, Y0 + 0.56, FZ + 0.008), parent=st[3])
    slab(f"win_sill_{s}", 0.3, 0.024, 0.04, "trim", at=(x, Y0 + 0.236, FZ + 0.016), parent=st[3])
# колонны: база, ствол с каннелюрами и лёгким утонением, капитель
H, CZ = BH, 0.43
profile = [(0.1, 0.0), (0.1, 0.026), (0.089, 0.04), (0.095, 0.054), (0.083, 0.068), (0.076, 0.078)]
profile += [(0.076 - 0.01 * (k / 10) ** 1.6, 0.078 + (H - 0.176) * k / 10) for k in range(1, 11)]
profile += [(0.071, H - 0.092), (0.086, H - 0.072), (0.096, H - 0.05), (0.096, H - 0.042)]
for k, x in enumerate([-0.72, -0.25, 0.25, 0.72]):
    crisp(lathe(f"column_{k}", profile, "satin", at=(x, Y0, CZ), parent=st[3], seg=56, flutes=14, flute_range=(0.085, H - 0.1), flute_depth=0.09), angle=32)
    box(f"abacus_{k}", 0.215, 0.042, 0.215, 0.008, "satin", at=(x, Y0 + H - 0.021, CZ), parent=st[3], seg=2)
# антаблемент: архитрав, тёмный фриз с полированными накладками, световая линия и полированный карниз
EY, EZ, ED = Y0 + BH, -0.01, 1.14
box("architrave", 1.84, 0.075, ED, 0.01, "shell", at=(0, EY + 0.0375, EZ), parent=st[3], seg=2)
box("frieze", 1.78, 0.065, ED - 0.06, 0.006, "pit", at=(0, EY + 0.1075, EZ), parent=st[3], seg=2)
for k in range(9):
    slab(f"stud_{k}", 0.05, 0.036, 0.012, "trim", at=(-0.76 + k * 0.19, EY + 0.1075, EZ + ED / 2 - 0.026), parent=st[3])
slab("cornice_light", 1.8, 0.01, 0.01, "glowLime", at=(0, EY + 0.146, EZ + ED / 2 - 0.012), parent=st[3])
box("cornice", 1.94, 0.045, ED + 0.1, 0.01, "trim", at=(0, EY + 0.1745, EZ), parent=st[3], seg=2)
# фронтон: тёмная призма крыши, утопленное поле и золотая монета со знаком биткоина
GY, GF = EY + 0.197, EZ + ED / 2 + 0.03
plate("gable", [(-0.97, 0.0), (0.97, 0.0), (0.0, 0.5)], ED + 0.06, 0.02, "shell", at=(0, GY, GF - ED - 0.06), parent=st[3])
plate("tympanum", [(-0.74, 0.05), (0.74, 0.05), (0.0, 0.43)], 0.008, 0.0, "pit", at=(0, GY, GF - 0.004), parent=st[3])
coin = node("coin", at=(0, GY + 0.2, GF + 0.004), parent=st[3])
crisp(lathe("coin_body", [(0.15, 0.0), (0.15, 0.022), (0.142, 0.03), (0.124, 0.03), (0.118, 0.022), (0.118, 0.02)], "gold", parent=coin, seg=64, axis="z"))
text("coin_b", "B", 0.19, 0.016, "gold", at=(0.003, 0.0, 0.026), parent=coin, bevel=0.002)
for sy in (-1, 1):
    for sx in (-1, 1):
        slab(f"coin_bar_{sy}{sx}", 0.016, 0.036, 0.014, "gold", at=(sx * 0.022 - 0.008, sy * 0.08, 0.026), parent=coin)

export(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../public/models/launch.glb"))
