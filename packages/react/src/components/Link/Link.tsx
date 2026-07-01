import type {
  AnchorHTMLAttributes,
  CSSProperties,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';
import { resolveDisabledProps, resolveExternalProps } from './logic';

export type LinkUnderline = 'auto' | 'hover' | 'always' | 'none';
export type LinkTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type LinkSize = 'inherit' | 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type LinkGlow = 'off' | 'hover' | 'always';

export interface LinkOwnProps {
  /**
   * 下划线策略(Radix 式四态):
   * - `auto`(默认):静止有下划线、hover 去掉(经典正文内联链接);
   * - `hover`:静止无、hover 才出现;
   * - `always`:始终有;
   * - `none`:从不。
   */
  underline?: LinkUnderline;
  /**
   * 语义色调,经全库 tone resolver 派生(读 --ms-c)。
   * 不传时走专用的链接角色色 --ms-color-link(回退 --ms-color-primary),符合「链接 ≠ 主色按钮」的语义。
   */
  tone?: LinkTone;
  /** 字号档(走 --ms-type-step-*)。默认 inherit —— 内联链接应继承上下文字号。 */
  size?: LinkSize;
  /**
   * 外链:补 target=_blank + rel="noopener noreferrer" + 尾随外链图标 +
   * sr-only 的「在新窗口打开」提示(i18n: link.newWindow)。
   * 用户显式给 target/rel 时尊重并安全合并(见 logic.mergeRel)。
   */
  external?: boolean;
  /** 隐藏外链图标(仍保留 target/rel 与 sr-only 提示)。external 为 false 时无意义。 */
  hideExternalIcon?: boolean;
  /** 自定义外链图标(覆盖默认箭头图标);仅 external 时渲染。 */
  externalIcon?: ReactNode;
  /**
   * 禁用:<a> 无原生 disabled —— 用「去 href + aria-disabled + tabIndex=-1 + 拦截点击」综合模拟,
   * 读屏仍报为被禁用的链接。视觉降透明度、去交互反馈。
   */
  disabled?: boolean;
  /**
   * 弱化为次要前景色(fg-muted),hover 才点亮到链接色。用于面包屑/页脚等次级链接。
   * 与 tone 互斥语义:给了 tone 以 tone 为准。
   */
  muted?: boolean;
  /** 微光效果(text-shadow,受全局 --ms-fx-glow 与 motion 调制):off / 仅 hover / 常亮。默认 off。 */
  glow?: LinkGlow;
  /** 前置图标(图标在文字前,随链接色);务必是装饰性内容(aria-hidden)。 */
  leftIcon?: ReactNode;
  /**
   * 多态渲染:把 Link 的样式/props 合并到唯一子元素(Slot 模式),用于路由库的 <Link>。
   * 事件 compose、ref 合并,子元素自带 href/内容。
   */
  asChild?: boolean;
  /** 子部件 className 映射(图标/外链图标),给进阶用户精细定制。 */
  classNames?: {
    icon?: string;
    externalIcon?: string;
  };
}

/**
 * 根 <a> 原生属性透传;own props 同名键(如 target/rel 经 own 逻辑接管的)从原生集中剔除避免冲突。
 * exactOptionalPropertyTypes 下可选透传字段天然带 `| undefined`,无需额外处理。
 */
export type LinkProps = LinkOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/** 默认外链图标:右上箭头图标(线性、currentColor 跟随链接色)。 */
const DefaultExternalIcon = (
  <svg
    className="ms-link__external-icon"
    viewBox="0 0 24 24"
    width="0.85em"
    height="0.85em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

/**
 * Link —— 内联超链接(category: typography)。
 *
 * 真正的 `<a>` 原语,把链接的交互/语义/装饰收成 props:
 * 下划线四态(auto/hover/always/none)、tone 着色(默认走专用链接角色色)、字号档、
 * 外链一键安全化(target/rel + 图标 + sr-only 新窗口提示)、disabled(ARIA 模拟)、
 * muted 次级、前置图标、微光效果,以及 asChild 多态(路由 Link)。
 *
 * **留口**:`...rest` 透传所有原生 <a> 属性与事件;`className`/`style` 与计算值合并(用户优先);
 * `forwardRef` 到根 <a>;`asChild` 把样式/props 合并到自带子元素(事件 compose、ref 合并);
 * 自挂的 onClick(disabled 拦截)用 composeEventHandlers 合并用户处理器(用户 preventDefault 可阻断)。
 * 面向用户文案(新窗口提示)走 i18n(link.newWindow)。
 *
 * 样式见同目录 Link.css + 共享 token typography.css / tone.css,需引入 @magic-scope/react/styles.css。
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    underline = 'auto',
    tone,
    size = 'inherit',
    external = false,
    hideExternalIcon = false,
    externalIcon,
    disabled = false,
    muted = false,
    glow = 'off',
    leftIcon,
    asChild = false,
    classNames,
    className,
    style,
    children,
    href,
    target,
    rel,
    onClick,
    ...rest
  },
  ref,
) {
  const t = useMessages();

  // 外链安全属性(尊重用户显式 target/rel);禁用时这些会被禁用态覆盖(无 href 即不可点)
  const externalProps = resolveExternalProps(external, target, rel);

  // 禁用拦截:无 href 已使其不可激活,但键盘 Enter / 用户脚本仍可能触发 —— 显式 preventDefault 兜底
  const handleClickGuard = disabled
    ? (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
      }
    : undefined;
  const composedOnClick = composeEventHandlers(onClick, handleClickGuard);

  const classes = cx(
    'ms-link',
    `ms-link--underline-${underline}`,
    size !== 'inherit' && `ms-link--size-${size}`,
    tone && `ms-tone-${tone}`,
    tone && 'ms-link--toned',
    muted && !tone && 'ms-link--muted',
    glow !== 'off' && `ms-link--glow-${glow}`,
    external && 'ms-link--external',
    disabled && 'ms-link--disabled',
    className,
  );

  // 用户 style 在后(优先);组件本身不强加 inline 变量
  const mergedStyle: CSSProperties | undefined = style;

  // 禁用态属性:去 href + aria-disabled + tabIndex=-1 + role=link
  const disabledAttrs = disabled ? resolveDisabledProps() : undefined;

  // asChild:把样式/props 合并到唯一子元素(路由 Link 自带 href / 内容)
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const parentProps: Record<string, unknown> = {
      ...rest,
      className: classes,
      ...(mergedStyle ? { style: mergedStyle } : {}),
      onClick: composedOnClick,
      // 外链/禁用派生属性也带给子元素(子元素同名值仍优先,见 mergeAsChildProps)
      ...(external ? { target: externalProps.target, rel: externalProps.rel } : {}),
      ...(disabled ? disabledAttrs : { href }),
    };
    const merged = mergeAsChildProps(parentProps, child.props);
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  // 普通渲染:禁用时去 href（不可点）、补 ARIA；否则带上外链派生属性
  const anchorProps: AnchorHTMLAttributes<HTMLAnchorElement> = disabled
    ? { href: disabledAttrs?.href, 'aria-disabled': true, tabIndex: -1 }
    : { href, target: externalProps.target, rel: externalProps.rel };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <a> 是交互元素而非静态元素,带 onClick 合法(误报)。
    // biome-ignore lint/a11y/useKeyWithClickEvents: 原生 <a href> 的 Enter 激活已覆盖键盘可达性,无需额外 onKeyDown。
    <a
      ref={ref}
      className={classes}
      style={mergedStyle}
      // biome-ignore lint/a11y/useValidAnchor: 本元素始终承载 href(导航语义);onClick 仅作禁用拦截 + 透传用户处理器,不替代导航,故应保持 <a> 而非 <button>。
      onClick={composedOnClick}
      {...anchorProps}
      {...rest}
    >
      {leftIcon != null && (
        <span className={cx('ms-link__icon', classNames?.icon)} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="ms-link__label">{children}</span>
      {external && !hideExternalIcon && (
        <span className={cx('ms-link__external', classNames?.externalIcon)} aria-hidden="true">
          {externalIcon ?? DefaultExternalIcon}
        </span>
      )}
      {external && <span className="ms-link__sr-only">{t('link.newWindow')}</span>}
    </a>
  );
});
Link.displayName = 'Link';
