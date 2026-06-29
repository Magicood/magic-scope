import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useMessages } from '../../i18n';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'ring' | 'dots' | 'bars';
export type SpinnerTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type SpinnerLabelPlacement = 'end' | 'start' | 'top' | 'bottom';

export interface SpinnerProps extends ComponentPropsWithoutRef<'span'> {
  /** 尺寸(同时决定指示器直径与边宽/点径)。默认 md。 */
  size?: SpinnerSize;
  /** 形态变体:ring 旋转圆环(默认)/ dots 三点跳动 / bars 多条波动。 */
  variant?: SpinnerVariant;
  /**
   * 语义色调,经全库 tone resolver 派生配色(读 --ms-c / --ms-c-glow 槽位)。
   * 不传时不加 tone 类,跟随上下文 currentColor / 父级 tone(放进彩色 Button 内会自动随之)。
   */
  tone?: SpinnerTone;
  /** 无障碍文案,读屏播报。默认走 i18n 字典 spinner.label(「加载中」)。 */
  label?: string;
  /** 是否把 label 同时渲染为可见旁注文字(默认 false,仅作 aria-label 隐形播报)。 */
  showLabel?: boolean;
  /** 可见 label 相对指示器的位置(showLabel 为 true 时生效)。默认 end。 */
  labelPlacement?: SpinnerLabelPlacement;
  /**
   * 自定义可见旁注内容(ReactNode 槽位)。给出时覆盖 label 文本作为可见内容,
   * 但 aria-label 仍用 label 保证读屏语义。隐含 showLabel。
   */
  labelContent?: ReactNode;
}

/**
 * Spinner —— 加载旋转器(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * `role="status"` + aria-label(走 i18n,不写死中文)。三种形态变体:
 * ring 发光圆环 / dots 三点跳动 / bars 多条波动。接全库统一 tone resolver
 * (只读 --ms-c / --ms-c-glow 6 槽位,不写死配色;不传 tone 时跟随上下文 currentColor,
 * 放进彩色 Button / success / danger 语境会自动随之)。可选可见旁注 label(四向放置)。
 *
 * **留口**:`...rest` 透传所有原生属性与事件到根容器;`className`/`style` 给根;`forwardRef` 到根。
 * **动效**:旋转/跳动受全局 data-ms-motion 与 prefers-reduced-motion 调制,关闭时停转但保留
 * role=status 语义(读屏仍播报「加载中」)。**发光**:受全局 data-ms-fx 调制,data-ms-fx=off 消失。
 * 样式见同目录 Spinner.css,需引入 @magic-scope/react/styles.css。
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'ring',
      tone,
      label,
      showLabel = false,
      labelPlacement = 'end',
      labelContent,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    const resolvedLabel = label ?? t('spinner.label', undefined, '加载中');
    const hasVisibleLabel = showLabel || labelContent != null;

    const classes = [
      'ms-spinner',
      `ms-spinner--${size}`,
      `ms-spinner--${variant}`,
      tone && `ms-tone-${tone}`,
      hasVisibleLabel && 'ms-spinner--with-label',
      hasVisibleLabel && `ms-spinner--label-${labelPlacement}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} role="status" aria-label={resolvedLabel} className={classes} {...props}>
        <span className="ms-spinner__indicator" aria-hidden="true">
          {variant === 'dots' && (
            <>
              <span className="ms-spinner__dot" />
              <span className="ms-spinner__dot" />
              <span className="ms-spinner__dot" />
            </>
          )}
          {variant === 'bars' && (
            <>
              <span className="ms-spinner__bar" />
              <span className="ms-spinner__bar" />
              <span className="ms-spinner__bar" />
              <span className="ms-spinner__bar" />
            </>
          )}
        </span>
        {hasVisibleLabel && (
          <span className="ms-spinner__label">{labelContent ?? resolvedLabel}</span>
        )}
      </span>
    );
  },
);
Spinner.displayName = 'Spinner';
