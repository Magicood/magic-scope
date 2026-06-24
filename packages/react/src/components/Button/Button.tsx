import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** 视觉变体:实底(带奥术发光)/ 描边 / 幽灵。默认 solid。 */
  variant?: ButtonVariant;
  /** 尺寸。默认 md。 */
  size?: ButtonSize;
}

/**
 * Button —— 主操作按钮。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 完整覆盖 hover / active / focus-visible / disabled 状态与平滑过渡;solid 变体带发光。
 * 样式见同目录 Button.css,需引入 @magic-scope/react/styles.css。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', type = 'button', className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={['ms-button', `ms-button--${variant}`, `ms-button--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
