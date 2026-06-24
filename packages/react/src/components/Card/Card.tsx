import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type CardVariant = 'elevated' | 'outline';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** 视觉变体:elevated(surface 底 + 柔和阴影)/ outline(透明底 + 描边)。默认 elevated。 */
  variant?: CardVariant;
  /** 可交互:true 时 hover 上浮 + 奥术发光,并暴露键盘聚焦环(tabIndex/focus-visible)。 */
  interactive?: boolean;
}

/**
 * Card —— 内容卡片容器。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * elevated 用 surface 底配柔和阴影,outline 用透明底配描边;interactive 时 hover 上浮并发光,
 * 并补 focus-visible 聚焦环。尊重 reduced-motion。样式见同目录 Card.css,需引入 @magic-scope/react/styles.css。
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', interactive = false, className, tabIndex, ...props }, ref) => (
    <div
      ref={ref}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      className={[
        'ms-card',
        `ms-card--${variant}`,
        interactive && 'ms-card--interactive',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
