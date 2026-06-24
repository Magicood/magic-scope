import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'size'> {
  /** 尺寸。默认 md。(影响 font-size 与 min-block-size) */
  size?: TextareaSize;
  /** 校验失败态:染 danger 色并设 aria-invalid。 */
  invalid?: boolean;
}

/**
 * Textarea —— 多行文本输入框。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 样式与 Input 一致:border、surface 底、focus-visible 染 primary + 发光环、invalid 染 danger、
 * disabled 半透明、placeholder 用 fg-subtle;仅允许垂直拖拽改高(resize: vertical)。
 * 完整覆盖 hover / focus-visible(发光) / disabled / invalid 状态与过渡;尊重 reduced-motion。
 * 样式见 Textarea.css,需引入 @magic-scope/react/styles.css。
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size = 'md', invalid = false, className, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={[
        'ms-textarea',
        `ms-textarea--${size}`,
        invalid && 'ms-textarea--invalid',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
