import {
  Reveal as MsReveal,
  RevealGroup as MsRevealGroup,
  type RevealGroupProps as MsRevealGroupProps,
  type RevealProps as MsRevealProps,
  type RevealVariant as MsRevealVariant,
} from '@magic-scope/react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

/**
 * 电商站兼容的特效变体别名 —— 旧站自有 'rise' 语义(上滑 + 轻模糊),
 * 映射到库的 'blur'(位移 + 模糊揭示),其余取值与库一一对应。
 */
export type RevealVariant = MsRevealVariant | 'rise';

/** 把站内别名解析成库变体。 */
function resolveVariant(variant: RevealVariant): MsRevealVariant {
  return variant === 'rise' ? 'blur' : variant;
}

interface RevealProps {
  children: ReactNode;
  /** 特效变体,默认上滑;支持库全部变体 + 站内别名 'rise'。 */
  variant?: RevealVariant;
  /** 触发模式;首屏区块用 'mount' 不等滚动。 */
  trigger?: MsRevealProps['trigger'];
  /** 位移距离 px(透传库的 distance)。 */
  distance?: number;
  /** 延迟毫秒(区块内错峰落位 → 库的 --ms-reveal-delay)。 */
  delay?: number;
  /** 时长毫秒(透传库的 duration;数字按 ms)。 */
  duration?: number;
  /** 进视口回调(挂 count-up / 描线等)。 */
  onReveal?: () => void;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * 电商站的 Reveal —— 直接复用 @magic-scope/react 的进场特效系统。
 * 受全局「动效 全/弱/关」+ prefers-reduced-motion 自动调制,无需自写降级。
 */
export function Reveal({
  children,
  variant = 'up',
  trigger,
  distance,
  delay,
  duration,
  onReveal,
  as,
  className,
  style,
}: RevealProps) {
  return (
    <MsReveal
      variant={resolveVariant(variant)}
      trigger={trigger}
      distance={distance}
      delay={delay}
      duration={duration}
      onReveal={onReveal}
      as={as}
      className={className}
      style={style}
    >
      {children}
    </MsReveal>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  /** 下发给各子项的默认变体,默认上滑。 */
  variant?: RevealVariant;
  /** 错峰步长毫秒(→ 库的 --ms-reveal-stagger)。 */
  stagger?: number;
  /** 序号策略:forward / reverse / center。 */
  order?: MsRevealGroupProps['order'];
  trigger?: MsRevealGroupProps['trigger'];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * 错峰容器 —— 一个 observer 管整组,进视口即给全组打波浪延迟(库 RevealGroup)。
 * 列表 / 产品网格出场用,比逐个 Reveal 更省 observer。
 */
export function RevealGroup({
  children,
  variant = 'up',
  stagger,
  order,
  trigger,
  as,
  className,
  style,
}: RevealGroupProps) {
  return (
    <MsRevealGroup
      variant={variant === 'rise' ? 'blur' : variant}
      stagger={stagger}
      order={order}
      trigger={trigger}
      as={as}
      className={className}
      style={style}
    >
      {children}
    </MsRevealGroup>
  );
}

// 门控 count-up / 描线等:进视口布尔,直接复用库 hook。
export { useReveal } from '@magic-scope/react';

/**
 * 视差:返回挂到元素的 ref;元素在滚动时按 strength 上下偏移(rAF 节流、尊重 reduce)。
 * 库的 'parallax' 变体走 CSS scroll-timeline;此处保留 JS ref 版给 Hero 主视觉细控。
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
