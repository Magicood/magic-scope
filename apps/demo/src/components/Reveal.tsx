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
}

/**
 * Vela 站的 Reveal —— 直接复用 @magic-scope/react 的进场特效系统(默认上滑)。
 * 保留 delay 向后兼容;受全局「动效 全/弱/关」+ prefers-reduced-motion 自动调制。
 */
export function Reveal({ children, delay, as, className, variant = 'up', trigger }: RevealProps) {
  return (
    <MsReveal variant={variant} trigger={trigger} as={as} delay={delay} className={className}>
      {children}
    </MsReveal>
  );
}
