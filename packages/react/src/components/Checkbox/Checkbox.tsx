import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  /** 复选框右侧的文字标签内容。 */
  children?: ReactNode;
}

/**
 * Checkbox —— 复选框,基于原生 input[type=checkbox]。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 结构:label 包视觉隐藏的原生 input + 视觉方块(checked 时染主色并以 ::after 画对勾)+ 可选文字。
 * 完整覆盖 hover / focus-visible(发光环) / checked / disabled 状态与过渡;尊重 reduced-motion。
 * 样式见同目录 Checkbox.css,需引入 @magic-scope/react/styles.css。
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, className, ...props }, ref) => (
    <label className={['ms-checkbox', className].filter(Boolean).join(' ')}>
      <input ref={ref} type="checkbox" className="ms-checkbox__input" {...props} />
      <span className="ms-checkbox__box" aria-hidden="true" />
      {children != null && <span className="ms-checkbox__label">{children}</span>}
    </label>
  ),
);
Checkbox.displayName = 'Checkbox';
