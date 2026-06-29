import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill' | 'square';
export type ButtonGlow = 'auto' | 'off' | 'hover' | 'always';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** 视觉变体:实底(发光)/ 柔色 / 描边 / 幽灵 / 链接。默认 solid。 */
  variant?: ButtonVariant;
  /** 语义色调,经全库 tone resolver 派生配色。默认 primary。 */
  tone?: ButtonTone;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: ButtonSize;
  /** 形状:默认圆角 / 胶囊 / 直角。默认 default。 */
  shape?: ButtonShape;
  /** 加载态:显示旋转图标、保持宽度防抖动、禁用交互、aria-busy。 */
  loading?: boolean;
  /** 前置图标。 */
  leftIcon?: ReactNode;
  /** 后置图标。 */
  rightIcon?: ReactNode;
  /** 仅图标(正方形紧凑);务必配 aria-label。 */
  iconOnly?: boolean;
  /** 块级铺满容器。 */
  fullWidth?: boolean;
  /** 发光强度(实例级,覆盖全局 fx):auto 由变体决定 / off / hover 仅悬停 / always 常亮。 */
  glow?: ButtonGlow;
  /** 渲染为子元素(如 <a> / 路由 Link)并保留按钮样式(Radix Slot 风格;由子元素自带内容)。 */
  asChild?: boolean;
}

/**
 * Button —— 主操作按钮(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 接全库统一 tone resolver(tone × 5 变体只读 6 槽位,不写死配色);尺寸随密度 data-ms-density 缩放;
 * loading / 图标(前/后/纯图标)/ fullWidth / 形状 / 实例级 glow / asChild 多态渲染。
 * 配套 ButtonGroup(吸附相邻按钮)。样式见同目录 Button.css,需引入 @magic-scope/react/styles.css。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      tone = 'primary',
      size = 'md',
      shape = 'default',
      loading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      fullWidth = false,
      glow = 'auto',
      asChild = false,
      type = 'button',
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'ms-button',
      `ms-button--${variant}`,
      `ms-button--${size}`,
      `ms-tone-${tone}`,
      shape !== 'default' && `ms-button--${shape}`,
      iconOnly && 'ms-button--icon-only',
      fullWidth && 'ms-button--full',
      loading && 'ms-button--loading',
      glow !== 'auto' && `ms-button--glow-${glow}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // asChild:把样式与按钮 props 合并到子元素(子元素自带内容),用于链接 / 路由 Link。
    // 事件 compose(子元素与 Button 的同名处理器都执行)、ref 合并到子元素(外部 ref 能拿到真实 DOM)。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps({ ...props, className: classes }, child.props);
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={classes}
        {...props}
      >
        {loading && <span className="ms-button__spinner" aria-hidden="true" />}
        <span className="ms-button__content">
          {leftIcon != null && (
            <span className="ms-button__icon" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children != null && <span className="ms-button__label">{children}</span>}
          {rightIcon != null && (
            <span className="ms-button__icon" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </span>
      </button>
    );
  },
);
Button.displayName = 'Button';

export interface ButtonGroupProps extends ComponentPropsWithoutRef<'div'> {
  /** 朝向。默认 horizontal。 */
  orientation?: 'horizontal' | 'vertical';
  /** 吸附:相邻按钮合并圆角与边界、消除重叠描边。默认 true。 */
  attached?: boolean;
}

/**
 * ButtonGroup —— 按钮组。吸附时相邻按钮共享边界、圆角只留两端,形成连续控件。
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ orientation = 'horizontal', attached = true, className, ...props }, ref) => (
    // biome-ignore lint/a11y/useSemanticElements: 按钮组是控件分组(非表单 fieldset),role="group" 是正确的 ARIA
    <div
      ref={ref}
      role="group"
      className={[
        'ms-button-group',
        `ms-button-group--${orientation}`,
        attached && 'ms-button-group--attached',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
ButtonGroup.displayName = 'ButtonGroup';
