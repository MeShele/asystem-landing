import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Настоящая запись интерфейса платформы (Remotion-рендер из живого продукта,
 * тёмная тема). Играет без звука, только пока на экране. Постер снят ffmpeg.
 */
const ProductVideo = ({ src, poster, label, className = "", style, ratio }: {
  src: string;
  poster: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  /** width / height, чтобы рамка держала место до загрузки */
  ratio: number;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause(); }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);
  return (
    <div className={`frame ${className}`} style={{ aspectRatio: String(ratio), ...style }}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export default ProductVideo;
