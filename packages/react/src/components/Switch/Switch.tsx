import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';

export type SwitchTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'size'> {
  /** 尺寸(轨道/滑块随密度 data-ms-density 缩放)。默认 md。 */
  size?: SwitchSize | undefined;
  /** 语义色调,经全库 tone resolver 派生 checked 配色与 glow。默认 primary。 */
  tone?: SwitchTone | undefined;
  /** 开关右侧文字(随轨道对齐,可点击切换)。 */
  children?: ReactNode | undefined;
  /** 轨道内「开」一端的图标(checked 时可见)。 */
  checkedIcon?: ReactNode | undefined;
  /** 轨道内「关」一端的图标(unchecked 时可见)。 */
  uncheckedIcon?: ReactNode | undefined;
  /** 加载态:滑块转为旋转图标、禁用交互、aria-busy。 */
  loading?: boolean | undefined;
  /** 根 label 的额外类名(同 className,语义化别名)。 */
  labelClassName?: string | undefined;
  /** 轨道部件类名留口。 */
  trackClassName?: string | undefined;
  /** 滑块部件类名留口。 */
  thumbClassName?: string | undefined;
}

/**
 * Switch —— 开关(旗舰深度组件)。基于 input[type=checkbox],自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 接全库统一 tone resolver(checked 染色 / glow / 前景只读 6 槽位,不写死配色);尺寸随密度 data-ms-density 缩放;
 * 支持右侧文字 children、轨道内两端图标(checked/unchecked)、loading(滑块转旋转图标、aria-busy);
 * 完整 hover / focus-visible(发光环) / disabled 状态与过渡;尊重 prefers-reduced-motion 与 data-ms-motion=off。
 * 留口:labelClassName / trackClassName / thumbClassName 暴露子部件,...rest 透传原生属性与事件(onChange 不被覆盖)。
 * 样式见同目录 Switch.css,需引入 @magic-scope/react/styles.css。
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = 'md',
      tone = 'primary',
      children,
      checkedIcon,
      uncheckedIcon,
      loading = false,
      className,
      labelClassName,
      trackClassName,
      thumbClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const hasIcons = checkedIcon != null || uncheckedIcon != null;

    const labelClasses = [
      'ms-switch',
      `ms-switch--${size}`,
      `ms-tone-${tone}`,
      loading && 'ms-switch--loading',
      className,
      labelClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const trackClasses = ['ms-switch__track', trackClassName].filter(Boolean).join(' ');
    const thumbClasses = ['ms-switch__thumb', thumbClassName].filter(Boolean).join(' ');

    return (
      <label className={labelClasses}>
        <input
          ref={ref}
          type="checkbox"
          className="ms-switch__input"
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          {...props}
        />
        <span className={trackClasses} aria-hidden="true">
          {hasIcons && (
            <>
              <span className="ms-switch__icon ms-switch__icon--on">{checkedIcon}</span>
              <span className="ms-switch__icon ms-switch__icon--off">{uncheckedIcon}</span>
            </>
          )}
          <span className={thumbClasses}>
            {/* 纯装饰旋转图标;loading 语义由 input 的 aria-busy 表达,故不重复加 role/label */}
            {loading && <span className="ms-switch__spinner" />}
          </span>
        </span>
        {children != null && <span className="ms-switch__label">{children}</span>}
      </label>
    );
  },
);
Switch.displayName = 'Switch';
