import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  /** 尺寸。默认 md。(覆盖原生 size 数值属性为尺寸枚举) */
  size?: InputSize;
  /** 校验失败态:染 danger 色并设 aria-invalid。 */
  invalid?: boolean;
}

/**
 * Input —— 文本输入框。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 完整覆盖 hover / focus-visible(发光) / disabled / invalid 状态与过渡;尊重 reduced-motion。
 * 样式见 Input.css,需引入 @magic-scope/react/styles.css。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', invalid = false, className, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={['ms-input', `ms-input--${size}`, invalid && 'ms-input--invalid', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
