"""
«Запуск за четыре шага»: основание сцены — плита с полированной кромкой, четыре поворотных подиума
со шкалой и рифлёным бортом, паз-дорожка шагов и парящая табличка договора.
Сами предметы на подиумах (статуэтки, стойка, пульт, здание) сгенерированы в Higgsfield
(эскиз GPT Image 2.6 → 3D Tripo H3.1 / Hunyuan3D v3) и ужаты optimize.py: public/models/launch-*.glb;
сайт ставит их в узлы n_station_0..3.

Подвижные узлы: n_station_0..3 (всё, что стоит на подиуме), n_board (табличка договора).
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


# ── договор: над рукопожатием статуэток парит табличка — подпись золотом и лаймовая печать ───────
board = node("n_board", at=(0, 2.06, -0.3), parent=st[0], tilt=-0.17)
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


export(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../public/models/launch.glb"))
