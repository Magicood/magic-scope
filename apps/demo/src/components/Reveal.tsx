import { Reveal as MsReveal, type RevealProps as MsRevealProps } from '@magic-scope/react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** 渐入延迟(毫秒),区块内错峰落位 → 库的 --ms-reveal-delay。 */
  delay?: number;
  as?: MsRevealProps['as'];
  className?: string;
  /** 特效变体,默认上滑进场;可换 zoom-in / clip-up / mask-up / blur 等。 */
  variant?: MsRevealProps['variant'];
  /** 触发模式;首屏区块用 'mount' 不等滚动。 */
  trigger?: MsRevealProps['trigger'];
  /** 进视口回调(挂 count-up / 图表描线等)。 */
  onReveal?: MsRevealProps['onReveal'];
  /** IntersectionObserver threshold 0–1,默认 0.2。 */
  amount?: MsRevealProps['amount'];
  /** 命中一次即定格(默认 true);false 时进出反复。 */
  once?: MsRevealProps['once'];
  /** 位移量 → --ms-reveal-distance。 */
  distance?: MsRevealProps['distance'];
  /** 时长 → --ms-reveal-duration。 */
  duration?: MsRevealProps['duration'];
  /** 缓动 → --ms-reveal-ease。 */
  ease?: MsRevealProps['ease'];
  /** 不加 DOM 层,把特效属性合并进唯一子元素。 */
  asChild?: MsRevealProps['asChild'];
  style?: MsRevealProps['style'];
}

/**
 * Vela 站的 Reveal —— 直接复用 @magic-scope/react 的进场特效系统(默认上滑)。
 * 保留 delay 向后兼容;受全局「动效 全/弱/关」+ prefers-reduced-motion 自动调制。
 * 透传底层完整能力(onReveal / amount / distance / asChild 等),便于区块差异化编排。
 */
export function Reveal({
  children,
  delay,
  as,
  className,
  variant = 'up',
  trigger,
  onReveal,
  amount,
  once,
  distance,
  duration,
  ease,
  asChild,
  style,
}: RevealProps) {
  return (
    <MsReveal
      variant={variant}
      trigger={trigger}
      as={as}
      delay={delay}
      className={className}
      onReveal={onReveal}
      amount={amount}
      once={once}
      distance={distance}
      duration={duration}
      ease={ease}
      asChild={asChild}
      style={style}
    >
      {children}
    </MsReveal>
  );
}
