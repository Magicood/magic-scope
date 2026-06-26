import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import { forwardRef, useId, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { buildRange, clampPage, type PageItem, pageRange } from './logic';

export type PaginationTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type PaginationSize = 'sm' | 'md' | 'lg';

/** 渲染项类型,供 renderItem / itemRender / onItemClick 使用。 */
export type PaginationItemType = 'page' | 'prev' | 'next' | 'ellipsis';

/** renderItem 入参:描述一个可渲染的分页项。 */
export interface PaginationRenderItem {
  /** 项类型。 */
  type: PaginationItemType;
  /** 页码(type 为 page/prev/next 时存在,ellipsis 时为 undefined)。 */
  page?: number | undefined;
  /** 该页是否为当前页。 */
  active?: boolean | undefined;
  /** 该项是否禁用(首/尾页方向键)。 */
  disabled?: boolean | undefined;
}

/** 细分槽位 className。 */
export interface PaginationClassNames {
  list?: string;
  item?: string;
  button?: string;
  current?: string;
  ellipsis?: string;
}

export interface PaginationProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange' | 'title'> {
  /** 当前页(1 起)。 */
  page: number;
  /** 总页数。当传 `total`(条目数)+ `pageSize` 时可不传,内部据此推算。 */
  total?: number;
  /**
   * 翻页回调。
   * @param page 目标页码(1 起)。
   */
  onPageChange: (page: number) => void;
  /** 当前页两侧各显示的页码数。默认 1。 */
  siblingCount?: number;
  /** 语义色调,经全库 tone resolver 派生配色。默认 primary。 */
  tone?: PaginationTone;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: PaginationSize;
  /** 精简变体:仅「上一页 当前/总 下一页」,移动端友好。 */
  simple?: boolean;

  /** 总条目数(配合 pageSize 推算总页数、显示 showTotal / 区间)。 */
  totalItems?: number;
  /** 每页条数。传入即受控;不传则使用 pageSizeOptions[0] 作非受控默认。 */
  pageSize?: number;
  /** 每页条数候选,提供时渲染 page size 选择器。默认 [10, 20, 50, 100]。 */
  pageSizeOptions?: number[];
  /** 是否显示每页条数选择器(需 totalItems 才有意义)。默认在提供 pageSizeOptions 且有 totalItems 时显示。 */
  showSizeChanger?: boolean;
  /**
   * 每页条数变化回调。
   * @param pageSize 新的每页条数。
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * 聚合回调:页码或每页条数变化都会触发,便于直接驱动数据请求。
   * @param page 变化后的目标页码(1 起)。
   * @param pageSize 变化后的每页条数。
   */
  onChange?: (page: number, pageSize: number) => void;

  /** 显示总数/区间文案。`(total, range) => ReactNode`,range 为当前页覆盖的 [start, end]。 */
  showTotal?: (total: number, range: [number, number]) => ReactNode;

  /** 显示快速跳页输入框。 */
  showQuickJumper?: boolean;
  /**
   * 快速跳页(回车 / 失焦提交)回调。
   * @param page 跳页输入框提交的目标页码(已夹取到合法范围,1 起)。
   */
  onQuickJump?: (page: number) => void;

  /** 上一页图标(替换默认 CSS 箭头)。 */
  prevIcon?: ReactNode;
  /** 下一页图标。 */
  nextIcon?: ReactNode;

  /**
   * 自定义渲染单个分页项(页码 / 箭头 / 省略号)。返回的节点替换默认内容,
   * 仍由组件包裹 `<li>` 与按钮容器并接管点击。返回 `null` 用默认渲染。
   */
  renderItem?: (item: PaginationRenderItem) => ReactNode;
  /**
   * 包装页码项为自定义元素(如 `<a href>`)。优先级高于内部按钮:
   * 返回的元素由你负责承载内容,组件仍会 compose 其 onClick 触发翻页。
   */
  itemRender?: (page: number, type: PaginationItemType, originalElement: ReactNode) => ReactNode;
  /**
   * 页码项点击(在内部翻页之前),可 `preventDefault()` 阻断内部翻页。
   * @param page 该项对应的目标页码(prev/next 为相邻页)。
   * @param type 该项类型:'page' / 'prev' / 'next'(ellipsis 不触发点击)。
   * @param event 该次点击的原始鼠标事件,可 `preventDefault()` 阻断内部翻页。
   */
  onItemClick?: (page: number, type: PaginationItemType, event: MouseEvent) => void;

  /** 组件根 nav 自身 className。 */
  className?: string;
  /** 细分槽位 className。 */
  classNames?: PaginationClassNames;
}

const cx = (...parts: (string | false | undefined)[]): string => parts.filter(Boolean).join(' ');

/**
 * Pagination —— 分页导航(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * tone × size(随密度缩放)、当前页主色实底奥术发光(读 6 槽位,fx/motion 可一键降级)、
 * 过多页省略号折叠、simple 精简变体;每页条数选择 + 快速跳页 + showTotal 区间显示;
 * renderItem / itemRender(包成 <a>)/ onItemClick / prevIcon-nextIcon 全留口;
 * onPageChange + onPageSizeChange + onChange 聚合 + onQuickJump 全事件覆盖;
 * 内部 onClick 用 composeEventHandlers 合并用户处理器、根 nav 透传 ...rest;键盘可达 + focus-visible 发光环。
 * 纯逻辑在 ./logic(可平移 core)。样式见 Pagination.css,需引入 @magic-scope/react/styles.css。
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      total,
      onPageChange,
      siblingCount = 1,
      tone = 'primary',
      size = 'md',
      simple = false,
      totalItems,
      pageSize: pageSizeProp,
      pageSizeOptions = [10, 20, 50, 100],
      showSizeChanger,
      onPageSizeChange,
      onChange,
      showTotal,
      showQuickJumper = false,
      onQuickJump,
      prevIcon,
      nextIcon,
      renderItem,
      itemRender,
      onItemClick,
      className,
      classNames,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    // 待登记的新 i18n key(pagination.sizeLabel / pageSize / jump):字典里暂无,
    // 用兜底中文 + 走 resolver(主会话补进 messages.ts 后,override 机制即自动生效,无需改这里)。
    // 类型上 t() 仅接受已登记 MessageKey,这里对未登记 key 局部放宽,resolver 自身能优雅回退兜底。
    const tx = t as unknown as (
      key: string,
      vars?: Record<string, string | number>,
      fallback?: string,
    ) => string;
    const jumperId = useId();

    // 每页条数:受控(传 pageSize)或非受控(默认取候选首项)。
    const isSizeControlled = pageSizeProp !== undefined;
    const [innerPageSize, setInnerPageSize] = useState<number>(
      () => pageSizeProp ?? pageSizeOptions[0] ?? 10,
    );
    const pageSize = isSizeControlled ? (pageSizeProp as number) : innerPageSize;

    // 总页数:优先显式 total;否则由 totalItems + pageSize 推算;再否则 1。
    const derivedTotal =
      total ?? (totalItems !== undefined ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1);
    const safeTotal = Math.max(1, Math.floor(derivedTotal));
    const current = clampPage(page, safeTotal);
    const items = buildRange(current, safeTotal, siblingCount);

    const [jumpDraft, setJumpDraft] = useState('');

    /** 真正翻页:夹取 → 仅在变化时触发 onPageChange + onChange 聚合。 */
    const goto = (target: number) => {
      const next = clampPage(target, safeTotal);
      if (next !== current) {
        onPageChange(next);
        onChange?.(next, pageSize);
      }
    };

    /** 每页条数变化:更新(非受控)+ onPageSizeChange + onChange 聚合(回到首条所在页,夹取当前页)。 */
    const changePageSize = (nextSize: number) => {
      if (nextSize === pageSize) return;
      if (!isSizeControlled) setInnerPageSize(nextSize);
      onPageSizeChange?.(nextSize);
      // 换页大小后,基于新页数夹取当前页,聚合回调带新 size。
      const nextTotal =
        total ?? (totalItems !== undefined ? Math.max(1, Math.ceil(totalItems / nextSize)) : 1);
      const nextPage = clampPage(current, Math.max(1, Math.floor(nextTotal)));
      onChange?.(nextPage, nextSize);
    };

    /** 快速跳页提交。 */
    const submitJump = () => {
      const raw = Number.parseInt(jumpDraft, 10);
      if (Number.isNaN(raw)) {
        setJumpDraft('');
        return;
      }
      const next = clampPage(raw, safeTotal);
      onQuickJump?.(next);
      goto(next);
      setJumpDraft('');
    };

    const rootClass = cx('ms-pagination', `ms-pagination--${size}`, `ms-tone-${tone}`, className);

    // —— 方向按钮(prev/next)渲染 —— 共享内部点击 compose 逻辑。
    const renderNavButton = (type: 'prev' | 'next') => {
      const isPrev = type === 'prev';
      const targetPage = isPrev ? current - 1 : current + 1;
      const disabled = isPrev ? current <= 1 : current >= safeTotal;
      const label = isPrev
        ? t('pagination.prev', undefined, '上一页')
        : t('pagination.next', undefined, '下一页');
      const icon = isPrev ? prevIcon : nextIcon;

      const custom = renderItem?.({ type, page: disabled ? undefined : targetPage, disabled });

      // 先调用户的 onItemClick(可 preventDefault 阻断),未阻断再内部翻页。
      const handleClick = composeEventHandlers<MouseEvent>(
        onItemClick ? (event) => onItemClick(targetPage, type, event) : undefined,
        () => {
          if (!disabled) goto(targetPage);
        },
      );

      return (
        <li className={cx('ms-pagination__item', classNames?.item)}>
          <button
            type="button"
            className={cx(
              'ms-pagination__btn',
              'ms-pagination__btn--nav',
              `ms-pagination__btn--${type}`,
              classNames?.button,
            )}
            aria-label={label}
            disabled={disabled}
            onClick={handleClick}
          >
            {custom != null && custom !== false ? (
              custom
            ) : icon != null ? (
              <span className="ms-pagination__icon" aria-hidden="true">
                {icon}
              </span>
            ) : (
              <span
                className={cx(
                  'ms-pagination__chevron',
                  `ms-pagination__chevron--${isPrev ? 'prev' : 'next'}`,
                )}
                aria-hidden="true"
              />
            )}
          </button>
        </li>
      );
    };

    // —— 单个页码项渲染 —— 支持 renderItem(替换内容)/ itemRender(替换元素,含 onClick compose)。
    const renderPageItem = (pageNum: number) => {
      const isCurrent = pageNum === current;
      const label = t('pagination.page', { page: pageNum }, `第 ${pageNum} 页`);

      // 先调用户的 onItemClick(可 preventDefault 阻断),未阻断再内部翻页。
      const handleClick = composeEventHandlers<MouseEvent>(
        onItemClick ? (event) => onItemClick(pageNum, 'page', event) : undefined,
        () => goto(pageNum),
      );

      const custom = renderItem?.({ type: 'page', page: pageNum, active: isCurrent });
      const content = custom != null && custom !== false ? custom : pageNum;

      const btnClass = cx(
        'ms-pagination__btn',
        'ms-pagination__btn--page',
        isCurrent && 'ms-pagination__btn--current',
        isCurrent && classNames?.current,
        classNames?.button,
      );

      const defaultButton: ReactNode = (
        <button
          type="button"
          className={btnClass}
          aria-label={label}
          aria-current={isCurrent ? 'page' : undefined}
          onClick={handleClick}
        >
          {content}
        </button>
      );

      // itemRender:把页码项包成自定义元素(如 <a href>),compose 其 onClick。
      const inner = itemRender ? itemRender(pageNum, 'page', defaultButton) : defaultButton;

      return (
        <li className={cx('ms-pagination__item', classNames?.item)} key={pageNum}>
          {inner}
        </li>
      );
    };

    const renderEllipsis = (item: Extract<PageItem, string>) => {
      const custom = renderItem?.({ type: 'ellipsis' });
      return (
        <li className={cx('ms-pagination__item', classNames?.item)} key={item}>
          <span className={cx('ms-pagination__ellipsis', classNames?.ellipsis)} aria-hidden="true">
            {custom != null && custom !== false ? custom : '…'}
          </span>
        </li>
      );
    };

    // —— simple 精简变体 ——
    const listBody = simple ? (
      <>
        {renderNavButton('prev')}
        <li className={cx('ms-pagination__item', 'ms-pagination__simple', classNames?.item)}>
          <span className="ms-pagination__simple-current">{current}</span>
          <span className="ms-pagination__simple-sep" aria-hidden="true">
            /
          </span>
          <span className="ms-pagination__simple-total">{safeTotal}</span>
        </li>
        {renderNavButton('next')}
      </>
    ) : (
      <>
        {renderNavButton('prev')}
        {items.map((item) =>
          item === 'ellipsis-start' || item === 'ellipsis-end'
            ? renderEllipsis(item)
            : renderPageItem(item),
        )}
        {renderNavButton('next')}
      </>
    );

    // —— showTotal 区间文案 ——
    const range = pageRange(current, pageSize, totalItems);
    const totalNode =
      showTotal && totalItems !== undefined && range ? showTotal(totalItems, range) : null;

    // —— page size 选择器 ——
    const sizeChangerVisible =
      showSizeChanger ?? (pageSizeOptions.length > 0 && totalItems !== undefined);
    const sizeChanger =
      sizeChangerVisible && pageSizeOptions.length > 0 ? (
        <div className="ms-pagination__options">
          <select
            className="ms-pagination__size-select"
            aria-label={tx('pagination.sizeLabel', undefined, '每页条数')}
            value={pageSize}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              changePageSize(Number.parseInt(e.target.value, 10))
            }
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {tx('pagination.pageSize', { size: opt }, `${opt} / 页`)}
              </option>
            ))}
          </select>
        </div>
      ) : null;

    // —— quick jumper ——
    const handleJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitJump();
      }
    };
    const quickJumper = showQuickJumper ? (
      <div className="ms-pagination__jumper">
        <label className="ms-pagination__jumper-label" htmlFor={jumperId}>
          {tx('pagination.jump', undefined, '跳至')}
        </label>
        <input
          id={jumperId}
          className="ms-pagination__jumper-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={jumpDraft}
          onChange={(e) => setJumpDraft(e.target.value.replace(/[^\d]/g, ''))}
          onKeyDown={handleJumpKeyDown}
          onBlur={submitJump}
        />
      </div>
    ) : null;

    return (
      <nav
        ref={ref}
        aria-label={t('pagination.nav', undefined, '分页')}
        className={rootClass}
        {...props}
      >
        {totalNode != null && <div className="ms-pagination__total">{totalNode}</div>}
        <ul className={cx('ms-pagination__list', classNames?.list)}>{listBody}</ul>
        {sizeChanger}
        {quickJumper}
      </nav>
    );
  },
);
Pagination.displayName = 'Pagination';
