import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  /** 标签文字内容。 */
  children?: ReactNode;
  /** 必填标记:在文末追加视觉星号(仅 aria-hidden 装饰;真正的必填语义由表单控件的 aria-required 承担)。 */
  required?: boolean;
}

/**
 * Label —— 表单标签,基于原生 label 元素。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * fg 文字 + font-sans + 适当字重,与表单控件保持小间距;required 时在文末渲染装饰性星号(danger 色)。
 * 通过 htmlFor 关联控件;尊重 reduced-motion。
 * 样式见同目录 Label.css,需引入 @magic-scope/react/styles.css。
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required = false, className, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: 通用 Label 封装,与控件的关联由使用者通过 htmlFor 提供
    <label
      ref={ref}
      className={['ms-label', required && 'ms-label--required', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
      {required && (
        <span className="ms-label__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = 'Label';
