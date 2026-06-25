import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export interface PaginationProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** 当前页(1 起)。 */
  page: number;
  /** 总页数。 */
  total: number;
  /** 翻页回调,入参为目标页码(1 起)。 */
  onPageChange: (page: number) => void;
  /** 当前页两侧各显示的页码数。默认 1。 */
  siblingCount?: number;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** 生成页码序列:首尾恒显,当前页两侧各 siblingCount 个,缺口处用省略号占位。 */
function buildRange(page: number, total: number, siblingCount: number): PageItem[] {
  // 首页 + 尾页 + 当前页 + 两侧 + 两个省略号,最多展示的"页码槽"数量。
  const totalSlots = siblingCount * 2 + 5;
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, total);
  // 距首/尾仅差 1 时不画省略号(省略号只省掉 >=2 个时才有意义)。
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const items: PageItem[] = [1];

  if (showLeftEllipsis) {
    items.push('ellipsis-start');
  } else {
    // 不画左省略号时,补齐 2..leftSibling-1 这段被跳过的页码。
    for (let p = 2; p < leftSibling; p++) items.push(p);
  }

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== total) items.push(p);
  }

  if (showRightEllipsis) {
    items.push('ellipsis-end');
  } else {
    for (let p = rightSibling + 1; p < total; p++) items.push(p);
  }

  items.push(total);
  return items;
}

/**
 * Pagination —— 分页导航。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * <nav aria-label="pagination"> 内:上一页 / 页码 / 下一页;当前页 primary 实底 + aria-current,
 * 其余 ghost;页数过多时用省略号折叠;首尾页禁用对应方向键;键盘可达且 focus-visible 显示发光环。
 * 样式见同目录 Pagination.css,需引入 @magic-scope/react/styles.css。
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ page, total, onPageChange, siblingCount = 1, className, ...props }, ref) => {
    const safeTotal = Math.max(1, Math.floor(total));
    const current = Math.min(Math.max(1, Math.floor(page)), safeTotal);
    const items = buildRange(current, safeTotal, Math.max(0, siblingCount));

    const goto = (target: number) => {
      const next = Math.min(Math.max(1, target), safeTotal);
      if (next !== current) onPageChange(next);
    };

    return (
      <nav
        ref={ref}
        aria-label="pagination"
        className={['ms-pagination', className].filter(Boolean).join(' ')}
        {...props}
      >
        <ul className="ms-pagination__list">
          <li className="ms-pagination__item">
            <button
              type="button"
              className="ms-pagination__btn ms-pagination__btn--nav"
              aria-label="上一页"
              disabled={current <= 1}
              onClick={() => goto(current - 1)}
            >
              <span
                className="ms-pagination__chevron ms-pagination__chevron--prev"
                aria-hidden="true"
              />
            </button>
          </li>

          {items.map((item) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <li className="ms-pagination__item" key={item}>
                  <span className="ms-pagination__ellipsis" aria-hidden="true">
                    &#8230;
                  </span>
                </li>
              );
            }
            const isCurrent = item === current;
            return (
              <li className="ms-pagination__item" key={item}>
                <button
                  type="button"
                  className={[
                    'ms-pagination__btn',
                    'ms-pagination__btn--page',
                    isCurrent && 'ms-pagination__btn--current',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`第 ${item} 页`}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => goto(item)}
                >
                  {item}
                </button>
              </li>
            );
          })}

          <li className="ms-pagination__item">
            <button
              type="button"
              className="ms-pagination__btn ms-pagination__btn--nav"
              aria-label="下一页"
              disabled={current >= safeTotal}
              onClick={() => goto(current + 1)}
            >
              <span
                className="ms-pagination__chevron ms-pagination__chevron--next"
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
      </nav>
    );
  },
);
Pagination.displayName = 'Pagination';
