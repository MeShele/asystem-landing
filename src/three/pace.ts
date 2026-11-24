/**
 * Регулятор нагрузки для 3D-вставок: смотрит, успевают ли кадры, и подсказывает сценам, как часто
 * рисовать и во сколько раз урезать разрешение. Сначала жертвуем частотой кадров, а чёткостью —
 * в последнюю очередь и немного: при прежних ступенях (до половины разрешения) картинка на
 * загруженном ноутбуке рассыпалась на пиксели, и это заметнее, чем 30 кадров вместо 60.
 * При устойчивом запасе качество возвращается. На 120-герцовом экране сцены рисуются через кадр.
 */
import { goStill } from "@/three/gpu";

const STEPS = [{ scale: 1, every: 1 }, { scale: 1, every: 2 }, { scale: 0.88, every: 2 }, { scale: 0.8, every: 3 }];
const g = { level: 0, floor: 0, raised: false, nominal: 16.7, deltas: [] as number[], calm: 0, since: 0, warm: 0, stamp: -1, slow: 0 };
/**
 * Даже лучшие кадры длиннее этого (мс) — значит, дело не в частоте экрана и не в экономии батареи
 * (она даёт ровные 33 мс), а видеочип не тянет сцену совсем: ступени не помогут, сцены замирают.
 */
const HOPELESS = 45;

/** сводка для отладки: window.__asysPace */
export const pace = { level: 0 };

/** вызывается каждой живой сценой раз в кадр: now — метка времени кадра, delta — мс с прошлого */
export const tick = (now: number, delta: number) => {
  if (now === g.stamp) return;                      // два цикла в одном кадре — считаем один раз
  g.stamp = now;
  if (delta > 250) { g.warm = 0; return; }          // вкладка засыпала — не замер
  if (g.warm++ < 45) return;                        // первые кадры после паузы всегда рваные
  const d = g.deltas;
  d.push(delta);
  if (d.length > 90) d.shift();
  if (d.length < 60) return;
  g.since++;
  // частота экрана — по быстрым кадрам; запаздывающим считаем кадр в полтора интервала и длиннее
  const sorted = [...d].sort((a, b) => a - b);
  g.nominal = sorted[Math.floor(sorted.length * 0.15)];
  g.slow = g.nominal > HOPELESS ? g.slow + 1 : 0;
  if (g.slow > 30) { goStill(); return; }
  const late = d.filter((x) => x > g.nominal * 1.5).length / d.length;
  if (late > 0.12 && g.level < STEPS.length - 1 && g.since > 45) {
    g.level++;
    // только что поднимали качество и снова не тянем — выше этой ступени больше не пробуем
    if (g.raised && g.since < 400) g.floor = g.level;
    g.raised = false; g.since = 0; g.calm = 0; d.length = 0;
  } else {
    g.calm = late < 0.02 ? g.calm + 1 : 0;
    if (g.calm > 600 && g.level > g.floor) { g.level--; g.raised = true; g.since = 0; g.calm = 0; d.length = 0; }
  }
  pace.level = g.level;
};

/** множитель разрешения сцен */
export const scale = () => STEPS[g.level].scale;
/** рисовать каждый N-й кадр: через кадр на 120 Гц и реже на нижних ступенях */
export const every = () => (g.nominal < 11 ? 2 : 1) * STEPS[g.level].every;

if (typeof window !== "undefined") (window as unknown as { __asysPace?: typeof pace }).__asysPace = pace;
