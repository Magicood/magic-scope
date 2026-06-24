import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type KbdSize = 'sm' | 'md';

export interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {
  /** 尺寸:sm 紧凑 / md 默认。 */
  size?: KbdSize;
}

/**
 * Kbd —— 键盘按键样式,用于展示快捷键(如 ⌘K、Ctrl + C)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * surface-raised 底 + 1px 描边 + 加粗底边模拟键帽立体感,radius-sm、小字号、font-mono、紧凑内边距、fg 文字。
 * 无交互状态,但保留 transition 以备未来。组合键用多个 <Kbd> 并以分隔符拼接即可。
 * 样式见同目录 Kbd.css,需引入 @magic-scope/react/styles.css。
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={['ms-kbd', `ms-kbd--${size}`, className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
Kbd.displayName = 'Kbd';
