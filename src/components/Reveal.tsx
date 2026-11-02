import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Вход секции по частям: прямые дети поднимаются на 16px с сильным ease-out,
 * задержка 60ms между ними (CSS .rise, задержка через --i). Один раз, когда
 * верх блока доходит до 90 % высоты экрана. Без JS всё видно сразу.
 * Блок выше экрана не прячется: вход для частей секции, а не для полотна.
 */
const Reveal = ({ children, className = "", as: Tag = "div", ...rest }: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  [key: string]: unknown;
}) => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
      { rootMargin: "0px 0px 8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rise ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
