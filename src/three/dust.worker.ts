import { buildParticles } from "@/three/dustBuild";

/**
 * Фоновый поток: скачивает гравюру, декодирует её и собирает частицы, не занимая основной поток.
 * Сообщение: { id, url } → { id, n, pos, ink, seed } либо { id, error }. Массивы передаются
 * без копирования.
 */
type Ask = { id: number; url: string };

self.addEventListener("message", async (e: MessageEvent<Ask>) => {
  const { id, url } = e.data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const bmp = await createImageBitmap(await res.blob());
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2d context unavailable");
    ctx.drawImage(bmp, 0, 0);
    const { width, height } = bmp;
    bmp.close();
    const p = buildParticles(ctx.getImageData(0, 0, width, height).data, width, height);
    self.postMessage({ id, ...p }, { transfer: [p.pos.buffer, p.ink.buffer, p.seed.buffer] });
  } catch (err) {
    self.postMessage({ id, error: String(err) });
  }
});
