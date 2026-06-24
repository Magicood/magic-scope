import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends ComponentPropsWithoutRef<'hr'> {
  /** 朝向:水平(横跨容器宽度)/ 垂直(贴满容器高度,行内)。默认 horizontal。 */
  orientation?: DividerOrientation;
}

/**
 * Divider —— 分隔线。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 用语义 <hr>(隐含 separator role),按朝向设 aria-orientation;
 * 水平用 border-block-start,垂直用 border-inline-start。样式见同目录 Divider.css。
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', className, ...props }, ref) => (
    <hr
      ref={ref}
      aria-orientation={orientation}
      className={['ms-divider', `ms-divider--${orientation}`, className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
Divider.displayName = 'Divider';
