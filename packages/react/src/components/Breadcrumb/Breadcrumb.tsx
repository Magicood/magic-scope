import type { ComponentPropsWithoutRef, ElementType, MouseEvent, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { buildRenderEntries } from './logic';

/** 语义色调,经全库 tone resolver 派生配色(读 6 槽位)。 */
export type BreadcrumbTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 渲染单项时透出的上下文。 */
export interface BreadcrumbItemState {
  /** 是否为当前页(末项或显式 current)。 */
  isCurrent: boolean;
  /** 该项在原始 items 中的下标。 */
  index: number;
}

export interface BreadcrumbItem {
  /** 项文本(可为任意节点,如带图标)。 */
  label: ReactNode;
  /** 链接地址。提供且非当前项时渲染 <a>;省略则渲染为纯文本。 */
  href?: string;
  /** 是否为当前页。当前项用 fg 色、不可点,并标 aria-current="page"。 */
  current?: boolean;
  /** 该项前置图标(渲染在 label 前,aria-hidden)。 */
  icon?: ReactNode;
  /**
   * 点击该项链接时的回调(SPA 路由拦截入口):
   * 在用户处理器里 `e.preventDefault()` 即可阻止 <a> 默认跳转,改用 router.push。
   * @param item 被点击的本项数据
   * @param index 该项在原始 items 中的下标
   * @param event 原生鼠标点击事件(可 preventDefault 拦截默认跳转)
   */
  onClick?: (item: BreadcrumbItem, index: number, event: MouseEvent) => void;
  /**
   * 自定义该项的渲染(优先级最高):返回的节点完全替换默认 <a>/<span>。
   * 接入路由库时返回 <Link>/<a>;此处覆盖全局 itemRender。
   */
  render?: (item: BreadcrumbItem, state: BreadcrumbItemState) => ReactNode;
}

/** 关键子部件类名钩子。 */
export interface BreadcrumbClassNames {
  /** <ol> 列表。 */
  list?: string;
  /** 每个 <li>。 */
  item?: string;
  /** 链接 <a>。 */
  link?: string;
  /** 当前项 <span>。 */
  current?: string;
  /** 分隔符 <span>。 */
  separator?: string;
  /** 省略占位。 */
  ellipsis?: string;
}

export interface BreadcrumbProps extends ComponentPropsWithoutRef<'nav'> {
  /** 面包屑层级项,自前往后。 */
  items: BreadcrumbItem[];
  /** 项间分隔符,装饰性(aria-hidden)。默认 "/"。 */
  separator?: ReactNode;
  /** 语义色调,接 tone 槽位(链接 / hover 微光 / 分隔符)。默认 neutral。 */
  tone?: BreadcrumbTone;
  /** 覆盖 <nav> 的 aria-label;不传则走字典 breadcrumb.nav(默认「面包屑」)。 */
  ariaLabel?: string;
  /**
   * 超过该数量则折叠中间项为可展开的省略号(…)。`0`/未设视为不折叠。
   * 折叠时保留头 itemsBeforeCollapse 项、尾 itemsAfterCollapse 项。
   */
  maxItems?: number;
  /** 折叠时头部保留的条目数。默认 1。 */
  itemsBeforeCollapse?: number;
  /** 折叠时尾部保留的条目数。默认 1。 */
  itemsAfterCollapse?: number;
  /**
   * 自定义链接元素(替换 <a>):接入 React Router / Next 时传 Link。
   * 仅作用于「有 href 的非当前项」;href 会作为该元素的 props 透传。
   */
  linkAs?: ElementType;
  /**
   * 全局自定义单项渲染(item.render 优先级更高):返回节点完全替换默认渲染。
   * 适合统一接路由库;拿到 isCurrent 决定渲染 <Link> 还是当前页文本。
   */
  itemRender?: (item: BreadcrumbItem, state: BreadcrumbItemState) => ReactNode;
  /**
   * 任意项链接点击时回调(item.onClick 之后触发,二者都会调):
   * 委托式 SPA 拦截入口,`e.preventDefault()` 阻止默认跳转。
   * @param item 被点击的项数据
   * @param index 该项在原始 items 中的下标
   * @param event 原生鼠标点击事件(可 preventDefault 拦截默认跳转)
   */
  onItemClick?: (item: BreadcrumbItem, index: number, event: MouseEvent) => void;
  /** 关键子部件类名钩子。 */
  classNames?: BreadcrumbClassNames;
}

/**
 * Breadcrumb —— 面包屑导航(生产级深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 结构:<nav aria-label> → <ol> → 每项 <li>。
 * - 非当前项:有 href 渲染链接(tone 色 + hover 微光,可 fx/motion 降级),无 href 渲染静态文本。
 * - 当前项:渲染 <span aria-current="page">,用 fg 色、不可点。
 * - 项间插入分隔符 <li aria-hidden="true">,屏幕阅读器忽略。
 *
 * 留口:tone 色调 / 折叠省略(maxItems)/ 自定义渲染(itemRender·item.render·linkAs)/
 * 路由拦截(onItemClick·item.onClick)/ icon / classNames 子部件类名 / ...rest 透传 nav 原生事件。
 * 样式见同目录 Breadcrumb.css,需引入 @magic-scope/react/styles.css。
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = '/',
      tone = 'neutral',
      ariaLabel,
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      linkAs,
      itemRender,
      onItemClick,
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const [expanded, setExpanded] = useState(false);

    const lastIndex = items.length - 1;
    const LinkComponent = (linkAs ?? 'a') as ElementType;

    const entries = buildRenderEntries(
      items,
      { maxItems, itemsBeforeCollapse, itemsAfterCollapse },
      expanded,
    );

    const navClassName = [`ms-breadcrumb`, `ms-tone-${tone}`, className].filter(Boolean).join(' ');

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel ?? t('breadcrumb.nav', undefined, '面包屑')}
        className={navClassName}
        {...rest}
      >
        <ol className={['ms-breadcrumb__list', classNames?.list].filter(Boolean).join(' ')}>
          {entries.map((entry, renderIndex) => {
            const showSeparator = renderIndex < entries.length - 1;

            // 省略占位:可点击展开被折叠的中间项
            if (entry.ellipsis) {
              const collapsedCount = entry.collapsed?.length ?? 0;
              return (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: 折叠结构稳定,renderIndex 即标识
                  key={`ellipsis-${renderIndex}`}
                  className={['ms-breadcrumb__item', classNames?.item].filter(Boolean).join(' ')}
                >
                  <button
                    type="button"
                    className={['ms-breadcrumb__ellipsis', classNames?.ellipsis]
                      .filter(Boolean)
                      .join(' ')}
                    // i18n: breadcrumb.expand 尚未登记到字典,先用中文字面量兜底(见 notes)
                    aria-label={`展开省略的 ${collapsedCount} 项`}
                    aria-expanded={false}
                    onClick={() => setExpanded(true)}
                  >
                    …
                  </button>
                  {showSeparator && (
                    <span
                      aria-hidden="true"
                      className={['ms-breadcrumb__separator', classNames?.separator]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {separator}
                    </span>
                  )}
                </li>
              );
            }

            const item = entry.item as BreadcrumbItem;
            const index = entry.index as number;
            // 显式 current,或未指定时把末项视为当前页
            const isCurrent = item.current ?? index === lastIndex;
            const isLink = !isCurrent && typeof item.href === 'string';
            const state: BreadcrumbItemState = { isCurrent, index };

            // 自定义渲染优先级:item.render > itemRender(全局)> 默认
            const customRender = item.render ?? itemRender;
            const customNode = customRender?.(item, state);

            let content: ReactNode;
            if (customNode != null) {
              content = customNode;
            } else if (isLink) {
              const handleClick = composeEventHandlers<MouseEvent>(
                item.onClick ? (e) => item.onClick?.(item, index, e) : undefined,
                onItemClick ? (e) => onItemClick(item, index, e) : undefined,
              );
              content = (
                <LinkComponent
                  href={item.href}
                  className={['ms-breadcrumb__link', classNames?.link].filter(Boolean).join(' ')}
                  onClick={handleClick}
                >
                  {item.icon != null && (
                    <span className="ms-breadcrumb__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </LinkComponent>
              );
            } else if (isCurrent) {
              content = (
                <span
                  aria-current="page"
                  className={['ms-breadcrumb__current', classNames?.current]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.icon != null && (
                    <span className="ms-breadcrumb__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              );
            } else {
              content = (
                <span className="ms-breadcrumb__text">
                  {item.icon != null && (
                    <span className="ms-breadcrumb__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              );
            }

            return (
              <li
                key={index}
                className={['ms-breadcrumb__item', classNames?.item].filter(Boolean).join(' ')}
              >
                {content}
                {showSeparator && (
                  <span
                    aria-hidden="true"
                    className={['ms-breadcrumb__separator', classNames?.separator]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = 'Breadcrumb';
