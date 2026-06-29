import type { ElementType, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: ReactNode;
  /** 渐入延迟(毫秒),用于同一区块内的错峰落位。 */
  delay?: number;
  /** 渲染的标签,默认 div。 */
  as?: ElementType;
  className?: string;
}

/** 进入视口时加 .is-visible,触发 app.css 里的渐入落位;尊重 prefers-reduced-motion。 */
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
      className={['v-reveal', visible && 'is-visible', className].filter(Boolean).join(' ')}
      style={delay ? { ['--v-reveal-delay' as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
