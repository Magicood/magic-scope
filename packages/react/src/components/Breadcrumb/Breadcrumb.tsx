import type { ReactNode } from 'react';
import { forwardRef } from 'react';

export interface BreadcrumbItem {
  /** 项文本(可为任意节点,如带图标)。 */
  label: ReactNode;
  /** 链接地址。提供且非当前项时渲染 <a>;省略则渲染为纯文本。 */
  href?: string;
  /** 是否为当前页。当前项用 fg 色、不可点,并标 aria-current="page"。 */
  current?: boolean;
}

export interface BreadcrumbProps {
  /** 面包屑层级项,自前往后。 */
  items: BreadcrumbItem[];
  /** 项间分隔符,装饰性(aria-hidden)。默认 "/"。 */
  separator?: ReactNode;
  /** 外部类名(作用于 <nav>)。 */
  className?: string;
}

/**
 * Breadcrumb —— 面包屑导航。自研、零依赖,消费 @magic-scope/tokens 的 CSS 变量。
 *
 * 结构:<nav aria-label="breadcrumb"> → <ol> → 每项 <li>。
 * - 非当前项:有 href 渲染 <a>(link 色 + hover 微光),无 href 渲染静态文本。
 * - 当前项:渲染 <span aria-current="page">,用 fg 色、不可点。
 * - 项间插入分隔符 <li aria-hidden="true">,屏幕阅读器忽略。
 *
 * 末项若未显式标 current,则按"末项即当前页"处理,符合面包屑通用语义。
 * 样式见同目录 Breadcrumb.css,需引入 @magic-scope/react/styles.css。
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', className }, ref) => {
    const lastIndex = items.length - 1;

    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={['ms-breadcrumb', className].filter(Boolean).join(' ')}
      >
        <ol className="ms-breadcrumb__list">
          {items.flatMap((item, index) => {
            // 显式 current,或未指定时把末项视为当前页。
            const isCurrent = item.current ?? index === lastIndex;
            const isLink = !isCurrent && typeof item.href === 'string';

            const li = (
              // biome-ignore lint/suspicious/noArrayIndexKey: items 为静态有序层级,index 即稳定标识
              <li key={index} className="ms-breadcrumb__item">
                {isLink ? (
                  <a href={item.href} className="ms-breadcrumb__link">
                    {item.label}
                  </a>
                ) : isCurrent ? (
                  <span aria-current="page" className="ms-breadcrumb__current">
                    {item.label}
                  </span>
                ) : (
                  <span className="ms-breadcrumb__text">{item.label}</span>
                )}
                {index < lastIndex && (
                  <span aria-hidden="true" className="ms-breadcrumb__separator">
                    {separator}
                  </span>
                )}
              </li>
            );

            // 窄容器折叠:在末项前注入「…」项(默认隐藏,仅窄容器显形,见 CSS @container)。
            // 仅当存在可折叠的中间项(items.length > 3)时注入。
            if (index === lastIndex && items.length > 3) {
              return [
                <li
                  key="ellipsis"
                  aria-hidden="true"
                  className="ms-breadcrumb__item ms-breadcrumb__item--ellipsis"
                >
                  <span className="ms-breadcrumb__ellipsis">…</span>
                  <span className="ms-breadcrumb__separator">{separator}</span>
                </li>,
                li,
              ];
            }
            return li;
          })}
        </ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = 'Breadcrumb';
