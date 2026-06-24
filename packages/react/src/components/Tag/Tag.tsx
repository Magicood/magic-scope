import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type TagTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export interface TagProps extends ComponentPropsWithoutRef<'span'> {
  /** 语义色调:主色 / 强调 / 成功 / 警告 / 危险 / 中性。默认 neutral。 */
  tone?: TagTone;
  /** 是否可关闭:为真时在末尾渲染移除按钮。 */
  closable?: boolean;
  /** 点击移除按钮时触发。 */
  onRemove?: () => void;
}

/**
 * Tag —— 标签。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * tone 柔和底(color-mix 18%)+ tone 文字 + 紧凑内边距;closable 时渲染移除按钮,
 * hover 加深、focus-visible 显示发光环。样式见同目录 Tag.css,需引入 @magic-scope/react/styles.css。
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ tone = 'neutral', closable = false, onRemove, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={['ms-tag', `ms-tag--${tone}`, closable && 'ms-tag--closable', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="ms-tag__label">{children}</span>
      {closable && (
        <button type="button" className="ms-tag__close" aria-label="移除" onClick={onRemove}>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  ),
);
Tag.displayName = 'Tag';
