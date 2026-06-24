import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {}

/**
 * Switch —— 开关。基于 input[type=checkbox],自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 视觉隐藏原生 checkbox,checked 时轨道染 primary、滑块右移并发光。
 * 完整覆盖 hover / focus-visible(发光环) / disabled 状态与过渡;尊重 prefers-reduced-motion。
 * 样式见同目录 Switch.css,需引入 @magic-scope/react/styles.css。
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => (
  <label className={['ms-switch', className].filter(Boolean).join(' ')}>
    <input ref={ref} type="checkbox" className="ms-switch__input" {...props} />
    <span className="ms-switch__track">
      <span className="ms-switch__thumb" />
    </span>
  </label>
));
Switch.displayName = 'Switch';
