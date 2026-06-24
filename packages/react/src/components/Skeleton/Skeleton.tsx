import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends ComponentPropsWithoutRef<'div'> {
  /** 占位形状。text 为文本行(较矮 + 小圆角),circle 为等宽高圆形,rect 为矩形(默认)。 */
  variant?: SkeletonVariant;
}

/**
 * Skeleton —— 加载占位。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * surface-raised 底色叠加一道流光(linear-gradient + 移动 background-position),契合奥术魔法主题;
 * 纯装饰故 aria-hidden 且无语义角色。尊重 reduced-motion:降级为透明度呼吸,不完全静止。
 * 样式见同目录 Skeleton.css,需引入 @magic-scope/react/styles.css。
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rect', className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={['ms-skeleton', `ms-skeleton--${variant}`, className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';
