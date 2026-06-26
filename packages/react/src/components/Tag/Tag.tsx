import type {
  ComponentPropsWithoutRef,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';

export type TagTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type TagVariant = 'soft' | 'solid' | 'outline';
export type TagSize = 'sm' | 'md';

export interface TagProps extends ComponentPropsWithoutRef<'span'> {
  /** 语义色调,经全库统一 tone resolver(`.ms-tone-*`)派生配色。默认 neutral。 */
  tone?: TagTone;
  /** 视觉变体:柔色底 / 实底(发光)/ 描边。默认 soft。 */
  variant?: TagVariant;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: TagSize;
  /** 是否可关闭:为真时在末尾渲染移除按钮。 */
  closable?: boolean;
  /**
   * 点击移除按钮时触发,携带原生鼠标事件(可据修饰键分支 / stopPropagation)。
   * 关闭按钮内部已 `stopPropagation`,不会冒泡触发根 `onClick`。
   */
  onRemove?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** 前缀槽:图标 / 头像(`.ms-tag__icon`)。 */
  icon?: ReactNode;
  /** 自定义关闭图标(替代默认的 ×)。 */
  closeIcon?: ReactNode;
  /** 透传给关闭按钮的原生属性(如 data-* / title);其 onClick 会与内部隔离逻辑 compose。 */
  closeButtonProps?: ComponentPropsWithoutRef<'button'>;
  /**
   * 可选标签(filter chip):为真时根可聚焦、可用 Enter/Space 激活,并暴露 `aria-pressed`。
   * 配合 `selected` 表示选中态(选中时切到 tone 实底)。
   */
  checkable?: boolean;
  /** 选中态(配合 `checkable`):tone 实底高亮,`aria-pressed=true`。 */
  selected?: boolean;
  /** 渲染为子元素(如 <a> / 路由 Link)并保留标签样式(Radix Slot 风格;由子元素自带内容)。 */
  asChild?: boolean;
}

/**
 * Tag —— 标签 / 标记 / chip(生产级深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 接全库统一 tone resolver(7 tone × 3 变体只读 6 槽位,不写死配色);尺寸随密度 data-ms-density 缩放;
 * 前缀图标/头像槽 + 可定制关闭图标;closable(事件携带、与根 onClick 隔离);checkable/selected 过滤标签
 * (键盘可激活 + aria-pressed);asChild 多态渲染。样式见同目录 Tag.css,需引入 @magic-scope/react/styles.css。
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      tone = 'neutral',
      variant = 'soft',
      size = 'md',
      closable = false,
      onRemove,
      icon,
      closeIcon,
      closeButtonProps,
      checkable = false,
      selected = false,
      asChild = false,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();

    const classes = [
      'ms-tag',
      `ms-tag--${variant}`,
      `ms-tag--${size}`,
      `ms-tone-${tone}`,
      closable && 'ms-tag--closable',
      checkable && 'ms-tag--checkable',
      checkable && selected && 'ms-tag--selected',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // 可交互态:可选标签(checkable)或仅可点击(传了根 onClick)。两者都补键盘激活与无障碍语义。
    const interactive = checkable || onClick != null;

    // 键盘语义:interactive 时 Enter/Space 激活根的 onClick(用户在自己的 onKeyDown 里 preventDefault 可阻断)。
    const handleKeyDown = interactive
      ? composeEventHandlers(onKeyDown, (event: ReactKeyboardEvent<HTMLSpanElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            (onClick as ((e: ReactKeyboardEvent<HTMLSpanElement>) => void) | undefined)?.(event);
          }
        })
      : onKeyDown;

    // 可交互时给根补 ARIA(checkable 额外暴露 aria-pressed 选中态)。
    const interactiveProps = checkable
      ? { role: 'button' as const, tabIndex: 0, 'aria-pressed': selected }
      : onClick != null
        ? { role: 'button' as const, tabIndex: 0 }
        : {};

    const label = <span className="ms-tag__label">{children}</span>;
    const iconNode = icon != null && (
      <span className="ms-tag__icon" aria-hidden="true">
        {icon}
      </span>
    );

    // 关闭按钮:onClick 必须 stopPropagation(不连带触发根 onClick),并与用户 closeButtonProps.onClick + onRemove compose。
    const closeNode = closable && (
      <button
        type="button"
        className="ms-tag__close"
        aria-label={t('tag.remove', undefined, '移除')}
        {...closeButtonProps}
        onClick={composeEventHandlers(closeButtonProps?.onClick, (event) => {
          event.stopPropagation();
          onRemove?.(event);
        })}
      >
        <span aria-hidden="true">{closeIcon ?? '×'}</span>
      </button>
    );

    // asChild:把样式与 props 合并到子元素(子元素自带内容),用于链接 / 路由 Link。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        {
          ...props,
          ...interactiveProps,
          className: classes,
          onClick,
          ...(interactive ? { onKeyDown: handleKeyDown } : {}),
        },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    return (
      // 可交互标签是 chip 语义(对标 MUI Chip clickable):根用 span + role="button"(经 interactiveProps spread),
      // 才能内嵌真实的关闭 <button>(button 不能嵌套 button),键盘 Enter/Space 激活已在 handleKeyDown 补齐。
      <span
        ref={ref}
        className={classes}
        {...(interactive ? { onClick, onKeyDown: handleKeyDown } : {})}
        {...interactiveProps}
        {...props}
      >
        {iconNode}
        {label}
        {closeNode}
      </span>
    );
  },
);
Tag.displayName = 'Tag';
