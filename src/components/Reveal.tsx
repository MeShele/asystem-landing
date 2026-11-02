import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Вход секции: прямые дети поднимаются по очереди (CSS .rise, задержка по --i).
 * Без JS класс html.js не ставится и всё видно сразу. Срабатывает один раз,
 * когда верх блока доходит до 88 % высоты экрана.
 */
const Reveal = ({ children, className = "", as: Tag = "div", id, ...rest }: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
  [key: string]: unknown;
}) => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Блок выше экрана не прячем: вход — для частей секции, а не для полотна каталога или цен.
    if (el.getBoundingClientRect().height > window.innerHeight * 0.9) {
      el.classList.add("is-in");
      return;
    }
    Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(Math.min(i, 8))));
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag ref={ref} id={id} className={`rise ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
