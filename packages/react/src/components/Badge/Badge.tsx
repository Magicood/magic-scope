import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { type CountInput, resolveCount } from './logic';

export type BadgeVariant = 'solid' | 'soft' | 'outline' | 'glow';
export type BadgeTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type BadgeSize = 'sm' | 'md';
/** 角标定位(standalone=false 时,相对包裹内容的角)。 */
export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';

export interface BadgeProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** 视觉变体:实底 / 柔和底 / 描边 / 发光实底。默认 soft。 */
  variant?: BadgeVariant;
  /** 语义色调,经全库 tone resolver 派生配色(只读 6 槽位)。默认 primary。 */
  tone?: BadgeTone;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: BadgeSize;
  /** 纯圆点徽标(无文字),仅 tone 着色;配 pulse 呼吸动效。 */
  dot?: boolean;
  /** 圆点 / 角标的脉冲呼吸动效(受 --ms-motion-scale 门控,可一键降级)。 */
  pulse?: boolean;
  /** 数字徽标:计数值。提供时按 count/max/showZero 推导显示文本(优先于 children)。 */
  count?: number;
  /** 计数上限,超出显示 `${max}+`。默认 99。 */
  max?: number;
  /** count 为 0 时是否仍显示。默认 false。 */
  showZero?: boolean;
  /** 前置图标 / 装饰槽位(ReactNode)。 */
  icon?: ReactNode;
  /**
   * 独立徽标(默认 true):自身就是一个 inline 标签。
   * 为 false 时作为角标:用 children 包裹宿主内容,徽标绝对定位到角上(overlap)。
   */
  standalone?: boolean;
  /** 角标定位(仅 standalone=false 生效)。默认 top-end。 */
  placement?: BadgePlacement;
  /** 渲染为子元素并保留徽标样式(Radix Slot 风格;仅 standalone 时生效)。 */
  asChild?: boolean;
  /** 徽标内容。 */
  children?: ReactNode;
}

/** 拼接 className,过滤假值。 */
const cx = (...parts: Array<string | false | undefined | null>): string =>
  parts.filter(Boolean).join(' ');

/**
 * Badge —— 状态 / 计数 / 角标徽标(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 接全库统一 tone resolver(7 tone × 4 变体只读 6 槽位,零硬编码配色);尺寸随密度缩放;
 * 圆点(可 pulse)/ 数字(count·max·showZero,圆角 full)/ 角标 overlap(standalone=false 包裹宿主)/
 * icon 槽位 / asChild 多态渲染;动效尊重 prefers-reduced-motion 与 data-ms-motion。
 * 样式见同目录 Badge.css,需引入 @magic-scope/react/styles.css。
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'soft',
      tone = 'primary',
      size = 'md',
      dot = false,
      pulse = false,
      count,
      max = 99,
      showZero = false,
      icon,
      standalone = true,
      placement = 'top-end',
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // 数字徽标推导(纯逻辑,可平移 core)
    const hasCount = typeof count === 'number';
    const countInput: CountInput = { count: count ?? 0, max, showZero };
    const counted = hasCount ? resolveCount(countInput) : null;

    // 内容:dot 无文字;有 count 用推导文本;否则 children
    const content = dot ? null : (counted?.display ?? children);

    // count 模式下命中隐藏规则(0 且未 showZero):角标模式仅渲染宿主,独立模式不渲染
    const countHidden = counted?.hidden ?? false;

    const badgeClasses = cx(
      'ms-badge',
      `ms-badge--${variant}`,
      `ms-badge--${size}`,
      `ms-tone-${tone}`,
      dot && 'ms-badge--dot',
      pulse && 'ms-badge--pulse',
      hasCount && 'ms-badge--count',
      !standalone && cx('ms-badge--anchored', `ms-badge--${placement}`),
      className,
    );

    // 徽标内部内容(icon 槽位 + 标签),dot 模式两者皆空
    const inner = (
      <>
        {icon != null && (
          <span className="ms-badge__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {content != null && content !== '' && <span className="ms-badge__label">{content}</span>}
      </>
    );

    // —— 角标模式:用 children 包裹宿主,徽标 overlap 到角上 ——
    if (!standalone) {
      return (
        <span className="ms-badge-anchor">
          {children}
          {/* count 命中隐藏时不渲染徽标本体,仅保留宿主内容 */}
          {!countHidden && (
            <span ref={ref} className={badgeClasses} {...props}>
              {inner}
            </span>
          )}
        </span>
      );
    }

    // —— 独立 count 模式命中隐藏:不渲染 ——
    if (hasCount && countHidden) return null;

    // asChild:把样式与 props 合并到子元素(子元素自带内容)
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        ...props,
        ...(child.props as object),
        className: cx(badgeClasses, child.props.className),
      });
    }

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {inner}
      </span>
    );
  },
);
Badge.displayName = 'Badge';
