import { useEffect } from "react";
import Lenis from "lenis";

// Инерционный скролл (Lenis) — фундамент моушн-языка страницы.
// Уважает prefers-reduced-motion: в этом случае не включается вовсе.
const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    // Якорные ссылки ведём через Lenis (нативный jump обходит smooth)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      history.pushState(null, "", href); // сохраняем deep-link/back по якорям
      lenis.scrollTo(el as HTMLElement, { offset: -76 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;
