import { useSyncExternalStore } from "react";
import { isStill, onStill, peekStill } from "@/three/gpu";

/**
 * Неподвижный режим сцен на слабом видеочипе (src/three/gpu.ts). Блокам он нужен, чтобы не менять
 * картинку самим по таймеру: каждая смена там — отдельная тяжёлая отрисовка.
 * Проба видеочипа создаёт WebGL-контекст, поэтому делается не в рендере, а сразу после подписки.
 */
const subscribe = (f: () => void) => {
  const off = onStill(f);
  queueMicrotask(() => { if (isStill()) f(); });
  return off;
};

export const useStill = () => useSyncExternalStore(subscribe, peekStill, () => false);
