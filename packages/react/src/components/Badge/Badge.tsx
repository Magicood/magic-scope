import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  /** 视觉变体:实底 / 柔和底 / 描边。默认 soft。 */
  variant?: BadgeVariant;
  /** 语义色调。默认 primary。neutral 走中性的 fg-muted / border。 */
  tone?: BadgeTone;
}

/**
 * Badge —— 小标签,用于状态、计数或分类标记。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 小字号、圆角 full、紧凑内边距;solid 实底配 on-* 文字,soft 用 color-mix 柔和底,outline 走描边。
 * 样式见同目录 Badge.css,需引入 @magic-scope/react/styles.css。
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'soft', tone = 'primary', className, ...props }, ref) => (
    <span
      ref={ref}
      className={['ms-badge', `ms-badge--${variant}`, `ms-badge--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';
