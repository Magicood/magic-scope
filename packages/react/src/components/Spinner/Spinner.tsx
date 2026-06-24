import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends ComponentPropsWithoutRef<'span'> {
  /** 尺寸(同时决定圆环直径与边宽)。默认 md。 */
  size?: SpinnerSize;
  /** 无障碍文案,读屏播报。默认「加载中」。 */
  label?: string;
}

/**
 * Spinner —— 加载旋转器。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * role="status" 并带 aria-label,持续旋转的奥术发光圆环;尊重 reduced-motion(放慢而非静止,保留「加载中」语义)。
 * 样式见同目录 Spinner.css,需引入 @magic-scope/react/styles.css。
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', label = '加载中', className, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={['ms-spinner', `ms-spinner--${size}`, className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
Spinner.displayName = 'Spinner';
