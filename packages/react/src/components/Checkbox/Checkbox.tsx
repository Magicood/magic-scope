import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback } from 'react';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  /** 复选框右侧的文字标签内容。 */
  children?: ReactNode;
  /** 半选(部分选中)态:仅视觉,不改变 checked 取值。常用于「全选」框。 */
  indeterminate?: boolean;
}

/**
 * Checkbox —— 复选框,基于原生 input[type=checkbox]。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 结构:label 包视觉隐藏的原生 input + 视觉方块(checked 时染主色画对勾、indeterminate 画横杠)+ 可选文字。
 * 完整覆盖 hover / focus-visible(发光环) / checked / indeterminate / disabled 状态与过渡;尊重 reduced-motion。
 * 样式见同目录 Checkbox.css,需引入 @magic-scope/react/styles.css。
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, className, indeterminate = false, ...props }, ref) => {
    // indeterminate 只能经 DOM 属性设置(无对应 HTML 属性),用合并 ref 落到 input 上
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        if (node) node.indeterminate = indeterminate;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
      },
      [ref, indeterminate],
    );

    return (
      <label className={['ms-checkbox', className].filter(Boolean).join(' ')}>
        <input ref={setRef} type="checkbox" className="ms-checkbox__input" {...props} />
        <span className="ms-checkbox__box" aria-hidden="true" />
        {children != null && <span className="ms-checkbox__label">{children}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
