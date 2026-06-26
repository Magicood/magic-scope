import type { AriaRole, ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { useMessages } from '../../i18n';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

/** 各部件的细粒度 className,便于深度定制而不丢内部布局。 */
export interface AlertClassNames {
  /** 根容器。 */
  root?: string;
  /** 图标槽。 */
  icon?: string;
  /** 标题行。 */
  title?: string;
  /** 描述/正文区。 */
  description?: string;
  /** 行动区。 */
  action?: string;
  /** 关闭按钮。 */
  close?: string;
}

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /** 语义变体:信息 / 成功 / 警告 / 危险。映射到统一 tone 槽位。默认 info。 */
  variant?: AlertVariant;
  /**
   * 图标:不传按 variant 给默认符文;传 ReactNode 覆盖;传 false 完全关闭图标列。
   */
  icon?: ReactNode | false;
  /** 标题行(渲染在正文上方,加粗)。 */
  title?: ReactNode;
  /** 行动区(按钮 / 链接等),渲染在正文下方。 */
  action?: ReactNode;
  /** 是否可关闭(右上角关闭钮)。默认 false。 */
  dismissible?: boolean;
  /** 关闭回调(点击关闭钮时触发)。仅在 dismissible 时渲染关闭钮。 */
  onClose?: () => void;
  /**
   * role 覆盖。默认按语义分流:danger/warning → "alert"(打断式播报),
   * info/success → "status"(礼貌播报)。
   */
  role?: AriaRole | undefined;
  /** 各部件细粒度 className。 */
  classNames?: AlertClassNames;
  /** 渲染为子元素(合并样式 / props 到子元素,Radix Slot 风格)。与子部件槽位互斥。 */
  asChild?: boolean;
}

/** variant → tone 类(读统一 6 槽位,与 Button 同源)。 */
const VARIANT_TONE: Record<AlertVariant, string> = {
  info: 'ms-tone-info',
  success: 'ms-tone-success',
  warning: 'ms-tone-warning',
  danger: 'ms-tone-danger',
};

/** variant → 默认图标符文(可被 icon prop 覆盖或 false 关闭)。 */
const VARIANT_ICON: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

/** 语义 role 分流:危险/警告打断式,信息/成功礼貌式。 */
const VARIANT_ROLE: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

/**
 * Alert —— 语义化提示框(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 接全库统一 tone resolver(variant → ms-tone-* 只读 6 槽位,不写死配色);
 * 子部件 icon / title / description / action / 关闭钮,各带 classNames 细粒度定制;
 * dismissible 关闭带进出场动画(受 data-ms-motion 降级);role 按语义自动分流且可覆盖;
 * 关闭按钮 aria-label 走 i18n(alert.close);asChild 多态渲染。
 * 样式见同目录 Alert.css,需引入 @magic-scope/react/styles.css。
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      icon,
      title,
      action,
      dismissible = false,
      onClose,
      role,
      classNames,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();

    const classes = [
      'ms-alert',
      `ms-alert--${variant}`,
      VARIANT_TONE[variant],
      dismissible && 'ms-alert--dismissible',
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    const resolvedRole = role ?? VARIANT_ROLE[variant];

    // asChild:把样式与 props 合并到子元素(子元素自带内容);子部件槽位在此模式下不生效
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; role?: AriaRole }>;
      return cloneElement(child, {
        role: resolvedRole,
        ...props,
        ...(child.props as object),
        className: [classes, child.props.className].filter(Boolean).join(' '),
      });
    }

    // 图标:false 关闭整列;未传按 variant 给默认符文;传 ReactNode 覆盖
    const showIcon = icon !== false;
    const iconNode = icon === false ? null : (icon ?? VARIANT_ICON[variant]);

    return (
      <div ref={ref} role={resolvedRole} className={classes} {...props}>
        {showIcon && (
          <span
            className={['ms-alert__icon', classNames?.icon].filter(Boolean).join(' ')}
            aria-hidden="true"
          >
            {iconNode}
          </span>
        )}
        <div className="ms-alert__body">
          {title != null && (
            <div className={['ms-alert__title', classNames?.title].filter(Boolean).join(' ')}>
              {title}
            </div>
          )}
          {children != null && (
            <div
              className={['ms-alert__description', classNames?.description]
                .filter(Boolean)
                .join(' ')}
            >
              {children}
            </div>
          )}
          {action != null && (
            <div className={['ms-alert__action', classNames?.action].filter(Boolean).join(' ')}>
              {action}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            className={['ms-alert__close', classNames?.close].filter(Boolean).join(' ')}
            aria-label={t('alert.close', undefined, '关闭')}
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = 'Alert';
