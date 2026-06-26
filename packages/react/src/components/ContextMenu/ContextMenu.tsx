import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
} from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { composeEventHandlers } from '../../utils/compose';
import { Kbd } from '../Kbd/Kbd';
import {
  type FlatRow,
  firstFocusable,
  flattenItems,
  lastFocusable,
  type MenuItem,
  type MenuItemRole,
  nextFocusIndex,
  typeaheadMatch,
} from '../Menu/logic';
import { clampToViewport } from './logic';

export type { MenuItem };

export type ContextMenuTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** renderItem render-prop 拿到的上下文,便于自定义渲染时复用内部能力。 */
export interface ContextMenuItemRenderContext {
  /** 当前项。 */
  item: MenuItem;
  /** 在「可聚焦序列」里的序号(分隔线 / 分组标题为 -1)。 */
  index: number;
  /** 触发选中(等价点击该项)。 */
  select: () => void;
  /** 是否禁用。 */
  disabled: boolean;
}

/** 关键子部件 className 定制。 */
export interface ContextMenuClassNames {
  /** 包裹区域 .ms-context-menu-area。 */
  area?: string;
  /** 浮层根 .ms-context-menu。 */
  root?: string;
  /** 菜单项 .ms-menu__item。 */
  item?: string;
  /** 分隔线 .ms-menu__separator。 */
  separator?: string;
  /** 分组标题 .ms-menu__group-label。 */
  groupLabel?: string;
}

/**
 * 根容器(包裹区域)props:extends div 以透传所有原生属性与事件 / data-* / aria-*。
 * onContextMenu 单独抽出,内部会与之 compose(先调用户的,未 preventDefault 再开菜单)。
 */
export interface ContextMenuProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect' | 'children'> {
  /** 菜单项列表(与 Menu 同结构:item / separator / group + icon / shortcut / checked / href)。 */
  items: MenuItem[];
  /** 响应右键的区域内容。 */
  children: ReactNode;
  /** 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与辉光。默认 primary。 */
  tone?: ContextMenuTone;
  /** 菜单浮层附加类名(作用于 .ms-context-menu)。 */
  className?: string;
  /** 关键子部件 className 定制。 */
  classNames?: ContextMenuClassNames;
  /** 自定义渲染每一项(render-prop)。返回的元素会替换默认项的内部内容。 */
  renderItem?: (ctx: ContextMenuItemRenderContext) => ReactNode;
  /** 浮层根上挂载的原生属性 / 事件(data-* / onScroll / aria-* 等)。 */
  overlayProps?: ComponentPropsWithoutRef<'div'> & {
    /** 透传任意 data-* 自定义属性(独立对象不带 JSX 的 data-* 宽松检查,这里显式放开)。 */
    [key: `data-${string}`]: string | number | boolean | undefined;
  };
  /** 受控开合状态。传入即受控,需配合 onOpenChange。 */
  open?: boolean;
  /** 非受控初始开合。默认 false。 */
  defaultOpen?: boolean;
  /** 开合变化回调(受控 / 非受控双通道都会触发)。 */
  onOpenChange?: (open: boolean) => void;
  /**
   * 菜单打开前回调(右键定位算出坐标后、open 置 true 前触发)。
   * 可 `preventDefault()` 阻止本次打开(便于「按目标决定是否弹菜单」)。
   */
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
  /** 菜单已打开回调,带原生事件与光标坐标(右键坐标对外)。 */
  onOpen?: (event: MouseEvent<HTMLDivElement>, position: { x: number; y: number }) => void;
  /** 菜单级统一选中回调(任一项被选中都触发,便于集中埋点 / 分发)。 */
  onSelect?: (item: MenuItem, index: number) => void;
  /** Esc 关闭前回调,可 `preventDefault()` 拦截阻止关闭。 */
  onEscapeKeyDown?: (event: globalThis.KeyboardEvent) => void;
  /** 点击浮层外部关闭前回调,可 `preventDefault()` 拦截阻止关闭。 */
  onPointerDownOutside?: (event: PointerEvent) => void;
}

/**
 * ContextMenu —— 右键菜单(旗舰深度组件)。自研、零依赖。
 * 右键(contextmenu)在包裹区域内弹出,定位在光标处(越界自动夹回视口),portal 到 body;
 * 点选 / 点外 / Esc / 滚动关闭;↑↓ / Home / End / Enter / typeahead 键盘可达,role=menu/menuitem。
 *
 * 深度能力:
 * - 复用 Menu 的 MenuItem 与 logic(item / separator / group + icon / shortcut / checked / href),
 *   拍平 / typeahead / 方向键全部走 Menu/logic.ts 同一套纯函数,避免行为分叉;
 * - tone 7 色调只读 6 槽位(不写死配色)+ 辉光;
 * - 受控 open / defaultOpen + onOpenChange 双通道;
 * - 事件全留口:包裹区 onContextMenu(可 preventDefault 拦截打开)+ onOpen(带坐标)、
 *   菜单级 onSelect、可拦截的 onEscapeKeyDown / onPointerDownOutside;
 * - 包裹根与浮层根 spread ...rest / overlayProps,所有原生事件 / data-* 可挂;
 * - classNames / renderItem 定制。
 *
 * 视口夹回为纯函数(同目录 logic.ts,零 React 依赖,可平移 core)。
 * 样式见同目录 ContextMenu.css,需引入 @magic-scope/react/styles.css。
 */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  {
    items,
    children,
    tone = 'primary',
    className,
    classNames,
    renderItem,
    overlayProps,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onContextMenu,
    onOpen,
    onSelect,
    onEscapeKeyDown,
    onPointerDownOutside,
    ...rest
  },
  ref,
) {
  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolledOpen;
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  // 受控关闭去抖:防多路径(点外 + Esc)同帧重复触发 onOpenChange。
  const closingRef = useRef(false);
  // typeahead 缓冲与计时器。
  const typeaheadRef = useRef<{ query: string; timer: number | null }>({
    query: '',
    timer: null,
  });

  // 统一改开合:非受控写 state,始终通知 onOpenChange(去重避免重复触发)。
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
    requestAnimationFrame(() => {
      closingRef.current = false;
    });
  }, [setOpen]);

  // 拍平 items:得到渲染行 + 可聚焦序列(复用 Menu 的纯函数,行为一致)。
  const { rows, focusable } = useMemo(() => flattenItems(items), [items]);

  // 打开后:夹回视口(一次性,夹住即不再变 → 不会循环)+ 聚焦首个可用项。
  useEffect(() => {
    if (!open) return;
    const el = menuRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPos((p) => {
        const next = clampToViewport(
          p,
          { width: rect.width, height: rect.height },
          {
            width: window.innerWidth,
            height: window.innerHeight,
            pad: 8,
          },
        );
        return next.x === p.x && next.y === p.y ? p : next;
      });
    }
    const first = firstFocusable(focusable);
    if (first >= 0) requestAnimationFrame(() => itemRefs.current[first]?.focus());
  }, [open, focusable]);

  // 点外 / Esc / 滚动关闭。Esc / 点外可经回调拦截(preventDefault 阻止关闭)。
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onPointerDownOutside?.(e);
      if (!e.defaultPrevented) close();
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      onEscapeKeyDown?.(e);
      if (!e.defaultPrevented) close();
    };
    const onScroll = () => close();
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, close, onEscapeKeyDown, onPointerDownOutside]);

  const focusByIndex = useCallback((index: number) => {
    if (index >= 0) itemRefs.current[index]?.focus();
  }, []);

  const select = useCallback(
    (
      item: MenuItem,
      index: number,
      event?: { defaultPrevented?: boolean; preventDefault: () => void },
    ) => {
      if (item.disabled) return;
      // 项级 onClick 先跑,用户可 preventDefault 阻断后续(含 onSelect 与关闭)。
      if (event && item.onClick) {
        item.onClick(event);
        if (event.defaultPrevented) return;
      }
      item.onSelect?.();
      onSelect?.(item, index);
      // checkbox / radio 项保持菜单打开(便于连续切换);普通 / 链接项关闭。
      const keepOpen = item.checked !== undefined && item.selectionRole !== undefined;
      if (!keepOpen) close();
    },
    [close, onSelect],
  );

  // typeahead:累积输入,匹配到则聚焦该项(复用 Menu 的 typeaheadMatch)。
  const runTypeahead = useCallback(
    (char: string, currentFocusIndex: number) => {
      const state = typeaheadRef.current;
      if (state.timer !== null) window.clearTimeout(state.timer);
      state.query += char;
      const matched = typeaheadMatch(focusable, state.query, currentFocusIndex);
      if (matched >= 0) focusByIndex(matched);
      state.timer = window.setTimeout(() => {
        state.query = '';
        state.timer = null;
      }, 500);
    },
    [focusable, focusByIndex],
  );

  const onItemKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, focusIndex: number) => {
      const total = focusable.length;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusByIndex(nextFocusIndex(focusIndex, 1, total, true));
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusByIndex(nextFocusIndex(focusIndex, -1, total, true));
          break;
        case 'Home':
          e.preventDefault();
          focusByIndex(firstFocusable(focusable));
          break;
        case 'End':
          e.preventDefault();
          focusByIndex(lastFocusable(focusable));
          break;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const item = focusable[focusIndex];
          if (item) select(item, focusIndex, e);
          break;
        }
        default:
          // 单字符可打印键 → typeahead。
          if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
            runTypeahead(e.key, focusIndex);
          }
          break;
      }
    },
    [focusable, focusByIndex, select, runTypeahead],
  );

  // 包裹区右键:先调用户 onContextMenu(可 preventDefault 拦截打开),未拦截再定位 + 开菜单。
  const handleContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const position = { x: e.clientX, y: e.clientY };
      setPos(position);
      setOpen(true);
      onOpen?.(e, position);
    },
    [setOpen, onOpen],
  );

  const rootClassName = ['ms-context-menu', `ms-tone-${tone}`, className, classNames?.root]
    .filter(Boolean)
    .join(' ');

  // 渲染单个可聚焦项(item / 链接项)。
  const renderActionRow = (row: FlatRow): ReactNode => {
    const { item, focusIndex } = row;
    const isLink = typeof item.href === 'string' && !item.disabled;
    const selectionRole: MenuItemRole | undefined =
      item.checked !== undefined ? (item.selectionRole ?? 'checkbox') : undefined;
    const ariaRole =
      selectionRole === 'radio'
        ? 'menuitemradio'
        : selectionRole === 'checkbox'
          ? 'menuitemcheckbox'
          : 'menuitem';

    const itemClass = [
      'ms-menu__item',
      item.danger && 'ms-menu__item--danger',
      selectionRole && 'ms-menu__item--selectable',
      classNames?.item,
    ]
      .filter(Boolean)
      .join(' ');

    const innerContent = renderItem ? (
      renderItem({
        item,
        index: focusIndex,
        select: () => select(item, focusIndex),
        disabled: !!item.disabled,
      })
    ) : (
      <>
        {selectionRole && (
          <span className="ms-menu__check" aria-hidden="true">
            {item.checked ? (selectionRole === 'radio' ? '●' : '✓') : ''}
          </span>
        )}
        {item.icon != null && (
          <span className="ms-menu__icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="ms-menu__label">{item.label}</span>
        {item.shortcut != null && (
          <span className="ms-menu__shortcut">
            {typeof item.shortcut === 'string' || Array.isArray(item.shortcut) ? (
              <Kbd size="sm" tone="neutral" keys={item.shortcut as string | readonly string[]} />
            ) : (
              (item.shortcut as ReactNode)
            )}
          </span>
        )}
      </>
    );

    const setItemRef = (node: HTMLElement | null) => {
      if (focusIndex >= 0) itemRefs.current[focusIndex] = node;
    };

    if (isLink) {
      return (
        <a
          key={row.rowKey}
          ref={setItemRef as Ref<HTMLAnchorElement>}
          href={item.href}
          target={item.target}
          rel={item.rel}
          role={ariaRole}
          tabIndex={-1}
          className={itemClass}
          aria-disabled={item.disabled || undefined}
          {...(selectionRole ? { 'aria-checked': !!item.checked } : {})}
          onKeyDown={(e) => onItemKeyDown(e, focusIndex)}
          onClick={(e) =>
            select(
              item,
              focusIndex,
              e as unknown as {
                defaultPrevented?: boolean;
                preventDefault: () => void;
              },
            )
          }
        >
          {innerContent}
        </a>
      );
    }

    return (
      <button
        key={row.rowKey}
        ref={setItemRef as Ref<HTMLButtonElement>}
        type="button"
        role={ariaRole}
        tabIndex={-1}
        disabled={item.disabled}
        className={itemClass}
        aria-disabled={item.disabled || undefined}
        {...(selectionRole ? { 'aria-checked': !!item.checked } : {})}
        onKeyDown={(e) => onItemKeyDown(e, focusIndex)}
        onClick={(e) =>
          select(
            item,
            focusIndex,
            e as unknown as {
              defaultPrevented?: boolean;
              preventDefault: () => void;
            },
          )
        }
      >
        {innerContent}
      </button>
    );
  };

  const { className: overlayClassName, style: overlayStyle, ...overlayRest } = overlayProps ?? {};

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 右键菜单由 contextmenu 事件触发(鼠标专属、无键盘等价物);键盘用户走 Menu / 应用菜单 */}
      <div
        {...rest}
        ref={ref}
        className={['ms-context-menu-area', classNames?.area].filter(Boolean).join(' ')}
        onContextMenu={composeEventHandlers(onContextMenu, handleContextMenu)}
      >
        {children}
      </div>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            {...overlayRest}
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className={[rootClassName, overlayClassName].filter(Boolean).join(' ')}
            style={
              {
                insetBlockStart: pos.y,
                insetInlineStart: pos.x,
                ...(overlayStyle as CSSProperties | undefined),
              } as CSSProperties
            }
          >
            {rows.map((row) => {
              if (row.kind === 'separator') {
                return (
                  <hr
                    key={row.rowKey}
                    className={['ms-menu__separator', classNames?.separator]
                      .filter(Boolean)
                      .join(' ')}
                  />
                );
              }
              if (row.kind === 'group-label') {
                return (
                  <div
                    key={row.rowKey}
                    role="presentation"
                    className={['ms-menu__group-label', classNames?.groupLabel]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {row.item.label}
                  </div>
                );
              }
              return renderActionRow(row);
            })}
          </div>,
          document.body,
        )}
    </>
  );
});
ContextMenu.displayName = 'ContextMenu';
