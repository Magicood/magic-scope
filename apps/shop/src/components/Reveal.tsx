import type { ElementType, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}

/** 进入视口时加 .is-visible 触发渐入(app.css);尊重 prefers-reduced-motion。 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={['db-reveal', visible && 'is-visible', className].filter(Boolean).join(' ')}
      style={delay ? { ['--db-reveal-delay' as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
