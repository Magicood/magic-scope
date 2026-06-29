import type { CSSProperties, ElementType, ReactNode } from 'react';
import { Children, isValidElement, useEffect, useRef, useState } from 'react';

export type RevealVariant = 'fade' | 'up' | 'down' | 'left' | 'right' | 'blur' | 'scale' | 'rise';

/** 各变体的初始(隐藏)态 CSS 变量;进入视口后 .is-visible 把它们归位,触发过渡。 */
function fromVars(variant: RevealVariant, distance: number): CSSProperties {
  const d = `${distance}px`;
  const map: Record<RevealVariant, CSSProperties> = {
    fade: {},
    up: { ['--rv-y' as string]: d },
    down: { ['--rv-y' as string]: `-${distance}px` },
    left: { ['--rv-x' as string]: d },
    right: { ['--rv-x' as string]: `-${distance}px` },
    blur: { ['--rv-b' as string]: '12px', ['--rv-y' as string]: `${distance / 2}px` },
    scale: { ['--rv-s' as string]: '0.92' },
    rise: { ['--rv-y' as string]: d, ['--rv-b' as string]: '6px' },
  };
  return map[variant];
}

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** 位移距离 px(默认 28)。 */
  distance?: number;
  /** 延迟毫秒。 */
  delay?: number;
  /** 时长秒(默认 0.8)。 */
  duration?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** 进入视口时落位的进场动效;尊重 prefers-reduced-motion(由 CSS 兜底)。 */
export function Reveal({
  children,
  variant = 'up',
  distance = 28,
  delay = 0,
  duration = 0.8,
  as: Tag = 'div',
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 偏好减少动效 / 无 IO 支持:直接落位,不做隐藏与过渡。
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
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
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 关键:隐藏态/归位态都用「内联」CSS 变量(内联优先级高于 class),否则归位被内联初值压住、永远清不掉。
  const stateVars: CSSProperties = visible
    ? {
        ['--rv-o' as string]: 1,
        ['--rv-x' as string]: '0px',
        ['--rv-y' as string]: '0px',
        ['--rv-s' as string]: 1,
        ['--rv-b' as string]: '0px',
      }
    : fromVars(variant, distance);

  return (
    <Tag
      ref={ref}
      className={['db-rv', visible && 'is-visible', className].filter(Boolean).join(' ')}
      style={{
        ['--rv-dur' as string]: `${duration}s`,
        ['--rv-delay' as string]: `${delay}ms`,
        ...stateVars,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** 相邻子项的错峰步进毫秒(默认 90)。 */
  stagger?: number;
  /** 整组起始延迟毫秒。 */
  baseDelay?: number;
  distance?: number;
  duration?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** 把每个直接子节点包成错峰落位的 Reveal —— 列表/网格出场用。 */
export function RevealGroup({
  children,
  variant = 'up',
  stagger = 90,
  baseDelay = 0,
  distance = 28,
  duration = 0.8,
  as: Tag = 'div',
  className,
  style,
}: RevealGroupProps) {
  return (
    <Tag className={className} style={style}>
      {Children.toArray(children)
        .filter(isValidElement)
        .map((child, i) => (
          <Reveal
            // biome-ignore lint/suspicious/noArrayIndexKey: 顺序稳定的展示列表,错峰延迟即用索引
            key={i}
            variant={variant}
            distance={distance}
            duration={duration}
            delay={baseDelay + i * stagger}
          >
            {child}
          </Reveal>
        ))}
    </Tag>
  );
}

/**
 * 视差:返回挂到元素的 ref;元素在滚动时按 strength 上下偏移(rAF 节流、尊重 reduce)。
 * strength 正值典型 20~40。
 */
export function useParallax<T extends HTMLElement>(strength = 30) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${(-progress * strength).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}
