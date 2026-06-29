import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs } from '../../utils/compose';
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
import { placementToArea } from '../Popover/logic';
import {
  type DropdownItem,
  type DropdownPlacement,
  type DropdownSide,
  type DropdownTriggerAction,
  hasSubmenu,
  isOpenKey,
  normalizeDropdownPlacement,
  placementToAlign,
  placementToSide,
  submenuSide,
} from './logic';

export type { MenuItem } from '../Menu/logic';
export type { DropdownItem, DropdownPlacement, DropdownTriggerAction } from './logic';

export type DropdownTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 浮层 / 菜单各部件的细粒度 className 槽位。 */
export interface DropdownClassNames {
  /** 浮层根 .ms-dropdown(top-layer 元素)。 */
  root?: string | undefined;
  /** 菜单列表容器 .ms-dropdown__menu(role=menu)。 */
  menu?: string | undefined;
  /** 菜单项 .ms-dropdown__item。 */
  item?: string | undefined;
  /** 分隔线 .ms-dropdown__separator。 */
  separator?: string | undefined;
  /** 分组标题 .ms-dropdown__group-label。 */
  groupLabel?: string | undefined;
  /** 子菜单浮层 .ms-dropdown__submenu。 */
  submenu?: string | undefined;
  /** 指向箭头 .ms-dropdown__arrow。 */
  arrow?: string | undefined;
}

/** anchor-name / position-anchor 不在标准 CSSProperties,这里做最小扩展。 */
interface AnchorStyle extends CSSProperties {
  anchorName?: string | undefined;
  [key: `--${string}`]: string | number | undefined;
}

export interface DropdownProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect' | 'children'> {
  /**
   * 触发元素(单个 React 元素,通常是 Button)。会被注入
   * `aria-haspopup=menu` / `aria-expanded` / `aria-controls`,并按 triggerAction 合并交互事件与 ref。
   */
  trigger: ReactElement;
  /** 数据驱动的菜单项(item / separator / group + 一层 submenu)。与 children 二选一,优先 items。 */
  items?: DropdownItem[] | undefined;
  /** 复合用法:直接塞自定义菜单内容(如 <Menu.Item>)。仅在不传 items 时生效。 */
  children?: ReactNode;
  /** 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与辉光。默认 primary。 */
  tone?: DropdownTone;
  /** 菜单方位(12 向,与 Popover 对齐)。默认 bottom-start。 */
  placement?: DropdownPlacement;
  /** 触发方式:点击 / 悬停。默认 click。 */
  triggerAction?: DropdownTriggerAction;
  /** 与 trigger 的间距(px)。默认 6。 */
  offset?: number | undefined;
  /** 是否显示指向箭头。默认 false。 */
  arrow?: boolean;
  /**
   * 选中项后是否关闭菜单。默认 true。
   * 选中态项(任意 `checked !== undefined` 的项,无论是否显式给 `selectionRole`)始终保持打开便于连续切换——
   * 因为这类项会被渲染成 menuitemcheckbox / menuitemradio,口径与此一致。
   */
  closeOnSelect?: boolean;
  /**
   * 整体禁用:trigger 不可交互、菜单不展开。
   * 非受控用法下置为 true 会同步把内部开合态归零,「禁用→再启用」不会自动复现上次的打开态(需用户重新触发)。
   */
  disabled?: boolean;
  /** hover 触发时,移出关闭的延时(ms,留余量防误关)。默认 120。 */
  closeDelay?: number;
  /** 受控开合。传入即受控,需配合 onOpenChange。 */
  open?: boolean | undefined;
  /** 非受控初始开合。默认 false。 */
  defaultOpen?: boolean;
  /**
   * 开合变化回调(受控 / 非受控双通道都触发)。
   * @param open 变化后的开合状态:true=打开,false=关闭。
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * 菜单级统一选中回调(任一项被选中都触发,便于集中埋点 / 分发)。
   * @param item 被选中的菜单项数据。
   * @param index 该项在「可聚焦序列」里的序号(子菜单项为 -1)。
   */
  onSelect?: ((item: DropdownItem, index: number) => void) | undefined;
  /**
   * Esc 关闭前回调,可 `preventDefault()` 拦截阻止关闭。
   * @param event 触发关闭的 Esc 键盘事件,可 `preventDefault()` 拦截。
   */
  onEscapeKeyDown?: ((event: ReactKeyboardEvent<HTMLElement>) => void) | undefined;
  /** 浮层根附加 className。 */
  className?: string | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: DropdownClassNames | undefined;
}

/** 渲染菜单项内部内容(图标 / 选中勾 / 标签 / 快捷键 / 子菜单箭头)—— 与 Menu 视觉一致。 */
function renderItemInner(item: DropdownItem, selectionRole: MenuItemRole | undefined): ReactNode {
  return (
    <>
      {selectionRole && (
        <span className="ms-dropdown__check" aria-hidden="true">
          {item.checked ? (selectionRole === 'radio' ? '●' : '✓') : ''}
        </span>
      )}
      {item.icon != null && (
        <span className="ms-dropdown__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="ms-dropdown__label">{item.label}</span>
      {item.shortcut != null && (
        <span className="ms-dropdown__shortcut">
          {typeof item.shortcut === 'string' || Array.isArray(item.shortcut) ? (
            <Kbd size="sm" tone="neutral" keys={item.shortcut as string | readonly string[]} />
          ) : (
            (item.shortcut as ReactNode)
          )}
        </span>
      )}
      {hasSubmenu(item) && (
        <span className="ms-dropdown__submenu-arrow" aria-hidden="true">
          ›
        </span>
      )}
    </>
  );
}

/**
 * Dropdown —— 下拉菜单(navigation,便捷封装)。
 *
 * 在已落地的 Popover(浮层 top-layer / 锚定位 / tone / 箭头)与 Menu 的渲染契约
 * (flattenItems 拍平 / typeahead / 方向键)之上,做一层「trigger + 数据驱动菜单」的快捷壳:
 * - trigger 注入 `aria-haspopup=menu` / `aria-expanded` / `aria-controls`,
 *   click 切换 / hover 悬停展开;键盘 Enter·↓ 打开(↑ 当菜单在上方);
 * - 菜单 role=menu / 项 role=menuitem(menuitemcheckbox / menuitemradio 随 checked),roving tabindex,
 *   ↑↓ 移焦(跳过 disabled)、Home/End、typeahead、Esc 关闭并回焦 trigger;
 * - items 数据驱动(label/icon/onClick/disabled/danger/separator/group/checked/href + 一层 submenu)
 *   或 children 复合用法二选一;closeOnSelect 控制选后是否关。
 *
 * 浮层进 top-layer 用原生 Popover API(popover="auto",自带点外 / Esc light-dismiss);
 * 定位用 CSS Anchor Positioning(placement → position-area + offset),`@supports not (anchor-name)`
 * 降级 fixed 居顶。受控 open / defaultOpen + onOpenChange 双通道。
 *
 * 诚实备注:
 * - 子菜单 submenu 仅一层(hover / → 展开,← 收起),深层嵌套(子菜单再带子菜单)暂未实现,见文末 TODO。
 * - children 复合用法走原生 light-dismiss,不接管 roving/typeahead(自定义内容自负键盘可达)。
 *
 * 纯逻辑在同目录 logic.ts(零 React)。样式见同目录 Dropdown.css,需引入 @magic-scope/react/styles.css。
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      items,
      children,
      tone = 'primary',
      placement = 'bottom-start',
      triggerAction = 'click',
      offset = 6,
      arrow = false,
      closeOnSelect = true,
      disabled = false,
      closeDelay = 120,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onSelect,
      onEscapeKeyDown,
      className,
      classNames,
      style,
      onToggle,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const reactId = useId();
    const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, '');
    const anchorName = `--ms-dropdown-${safeId}`;
    const menuId = `ms-dropdown-${safeId}`;

    const resolvedPlacement = normalizeDropdownPlacement(placement);
    const side: DropdownSide = placementToSide(resolvedPlacement);
    const align = placementToAlign(resolvedPlacement);

    const popoverRef = useRef<HTMLDivElement | null>(null);
    const triggerElRef = useRef<HTMLElement | null>(null);
    const itemRefs = useRef<Array<HTMLElement | null>>([]);
    const typeaheadRef = useRef<{ query: string; timer: number | null }>({
      query: '',
      timer: null,
    });
    const hoverTimerRef = useRef<number | null>(null);

    // 受控 / 非受控开合。
    const isControlled = openProp !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = disabled ? false : isControlled ? !!openProp : uncontrolledOpen;
    const closingRef = useRef(false);

    // 当前展开的子菜单 focusIndex(-1 = 无)。
    const [openSubmenu, setOpenSubmenu] = useState(-1);

    const setOpen = useCallback(
      (next: boolean) => {
        if (disabled && next) {
          return;
        }
        if (next === open) {
          return;
        }
        if (!isControlled) {
          setUncontrolledOpen(next);
        }
        if (!next) {
          setOpenSubmenu(-1);
        }
        onOpenChange?.(next);
      },
      [disabled, open, isControlled, onOpenChange],
    );

    const setPopoverRef = useCallback(
      (node: HTMLDivElement | null) => {
        popoverRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [ref],
    );

    const clearHoverTimer = useCallback(() => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    }, []);

    // 拍平 items(children 复合用法不拍平,交原生)。
    const { rows, focusable } = useMemo(
      () => (items ? flattenItems(items) : { rows: [] as FlatRow[], focusable: [] as MenuItem[] }),
      [items],
    );

    // disabled 变 true:非受控内部态归零,避免「禁用→再启用」在用户没操作时自动复现上次打开态。
    // 派生 open 在 disabled 下被压成 false,但内部 uncontrolledOpen 仍可能为 true;不重置则 disabled
    // 回落 false 的瞬间 open 又变回 true、菜单自动弹出。受控用法由父级 open 决定,这里不插手。
    useEffect(() => {
      if (disabled && !isControlled) {
        setUncontrolledOpen(false);
        setOpenSubmenu(-1);
      }
    }, [disabled, isControlled]);

    // 同步 open → 原生 popover 显隐。
    useEffect(() => {
      const el = popoverRef.current;
      if (!el || typeof el.showPopover !== 'function') {
        return;
      }
      const isShown = el.matches(':popover-open');
      try {
        if (open && !isShown) {
          el.showPopover();
        } else if (!open && isShown) {
          el.hidePopover();
        }
      } catch {
        // 已显示 / 已隐藏 / 不支持:忽略,靠 React 状态最终一致。
      }
    }, [open]);

    const focusByIndex = useCallback((index: number) => {
      if (index >= 0) {
        itemRefs.current[index]?.focus();
      }
    }, []);

    // 打开时焦点落到第一个可用项(仅数据驱动用法)。
    useEffect(() => {
      if (!open || !items) {
        return;
      }
      const first = firstFocusable(focusable);
      if (first >= 0) {
        const raf = requestAnimationFrame(() => itemRefs.current[first]?.focus());
        return () => cancelAnimationFrame(raf);
      }
      return undefined;
    }, [open, items, focusable]);

    // 卸载清理 hover 计时器。
    useEffect(() => clearHoverTimer, [clearHoverTimer]);

    const close = useCallback(
      (refocus: boolean) => {
        if (closingRef.current) {
          return;
        }
        closingRef.current = true;
        setOpen(false);
        if (refocus) {
          triggerElRef.current?.focus();
        }
        requestAnimationFrame(() => {
          closingRef.current = false;
        });
      },
      [setOpen],
    );

    const select = useCallback(
      (
        item: DropdownItem,
        index: number,
        event?: { defaultPrevented?: boolean; preventDefault: () => void },
      ) => {
        if (item.disabled) {
          return;
        }
        // 带子菜单的项:不选中,改为展开 / 收起子菜单。
        if (hasSubmenu(item)) {
          setOpenSubmenu((cur) => (cur === index ? -1 : index));
          return;
        }
        // 项级 onClick 先跑,可 preventDefault 阻断后续。
        if (event && item.onClick) {
          item.onClick(event);
          if (event.defaultPrevented) {
            return;
          }
        }
        item.onSelect?.();
        onSelect?.(item, index);
        // checkbox / radio 项保持打开便于连续切换;否则按 closeOnSelect 决定。
        // 口径与渲染推导对齐:只要 checked !== undefined 即视为选中态项(渲染会推成
        // menuitemcheckbox/radio,selectionRole 缺省按 'checkbox')—— 不能再要求显式 selectionRole,
        // 否则「给了 checked 没给 selectionRole」会被当普通项关掉,与 docstring「始终保持打开」矛盾。
        const keepOpen = item.checked !== undefined;
        if (!keepOpen && closeOnSelect) {
          close(true);
        }
      },
      [onSelect, closeOnSelect, close],
    );

    // 子菜单项选中(独立处理:focusIndex 记 -1,不参与父级 roving)。
    const selectSub = useCallback(
      (sub: DropdownItem, event: { defaultPrevented?: boolean; preventDefault: () => void }) => {
        if (sub.disabled) {
          return;
        }
        sub.onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        sub.onSelect?.();
        onSelect?.(sub, -1);
        // 与父级 select 同口径:子项渲染按 `sub.checked !== undefined` 推成 menuitemcheckbox/radio,
        // 故 keepOpen 也只依赖 checked,缺 selectionRole 不再被当普通项一次切换就关闭整个菜单。
        const keepOpen = sub.checked !== undefined;
        if (!keepOpen && closeOnSelect) {
          close(true);
        }
      },
      [onSelect, closeOnSelect, close],
    );

    // typeahead:累积输入 → 聚焦匹配项。
    const runTypeahead = useCallback(
      (char: string, currentFocusIndex: number) => {
        const state = typeaheadRef.current;
        if (state.timer !== null) {
          window.clearTimeout(state.timer);
        }
        state.query += char;
        const matched = typeaheadMatch(focusable, state.query, currentFocusIndex);
        if (matched >= 0) {
          focusByIndex(matched);
        }
        state.timer = window.setTimeout(() => {
          state.query = '';
          state.timer = null;
        }, 500);
      },
      [focusable, focusByIndex],
    );

    const onItemKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLElement>, focusIndex: number, item: DropdownItem) => {
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
          case 'ArrowRight':
            if (hasSubmenu(item)) {
              e.preventDefault();
              setOpenSubmenu(focusIndex);
            }
            break;
          case 'ArrowLeft':
            if (openSubmenu === focusIndex) {
              e.preventDefault();
              setOpenSubmenu(-1);
            }
            break;
          case 'Enter':
          case ' ': {
            e.preventDefault();
            select(item, focusIndex, e);
            break;
          }
          case 'Escape': {
            onEscapeKeyDown?.(e);
            if (!e.defaultPrevented) {
              close(true);
            }
            break;
          }
          case 'Tab':
            // Tab 离开关闭。当前聚焦项就在即将隐藏的 popover(top-layer)内,原生 Tab 会在
            // 元素被同步隐藏的瞬间计算下一焦点,易落到 body / 文档开头。故先 preventDefault,
            // 把焦点显式还给 trigger(在普通 DOM 流里),再关闭——用户从 trigger 自然续 Tab,
            // 焦点不落空。Shift+Tab 同理回到 trigger,再自然回退。
            e.preventDefault();
            close(true);
            break;
          default:
            if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
              runTypeahead(e.key, focusIndex);
            }
            break;
        }
      },
      [focusable, focusByIndex, select, close, runTypeahead, openSubmenu, onEscapeKeyDown],
    );

    // —— trigger:注入 anchor / a11y + 交互事件 + ref compose ——
    const triggerProps = trigger.props as Record<string, unknown> & {
      style?: CSSProperties;
      onClick?: (e: { defaultPrevented?: boolean }) => void;
      onKeyDown?: (e: ReactKeyboardEvent<HTMLElement>) => void;
      onPointerEnter?: (e: ReactPointerEvent<HTMLElement>) => void;
      onPointerLeave?: (e: ReactPointerEvent<HTMLElement>) => void;
      'aria-disabled'?: boolean;
    };
    const childTriggerRef = (trigger as { ref?: Ref<unknown> }).ref;
    // 触发器 anchor-name:用户(child)style 先铺底,anchorName 放最后不被覆盖。
    // 经 cloneElement(triggerInjected) 注入,是 child style 的最终合并,锚定不会丢。
    const triggerStyle: AnchorStyle = { ...triggerProps.style, anchorName };

    const triggerInjected: Record<string, unknown> = {
      style: triggerStyle,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': open ? menuId : undefined,
      'aria-disabled': disabled || triggerProps['aria-disabled'] || undefined,
      ref: composeRefs(
        (node: HTMLElement | null) => {
          triggerElRef.current = node;
        },
        childTriggerRef as Ref<unknown>,
      ),
      onKeyDown: composeEventHandlers(
        triggerProps.onKeyDown,
        (e: ReactKeyboardEvent<HTMLElement>) => {
          if (disabled) {
            return;
          }
          if (!open && isOpenKey(e.key, side)) {
            e.preventDefault();
            setOpen(true);
          } else if (open && e.key === 'Escape') {
            e.preventDefault();
            close(true);
          }
        },
      ),
    };

    if (triggerAction === 'click') {
      triggerInjected.onClick = composeEventHandlers(triggerProps.onClick, () => {
        if (!disabled) {
          setOpen(!open);
        }
      });
    } else {
      // hover:指针进开、移出延时关;键盘聚焦同样开(可达性),Esc / Tab 走 onKeyDown。
      triggerInjected.onPointerEnter = composeEventHandlers(triggerProps.onPointerEnter, () => {
        if (disabled) {
          return;
        }
        clearHoverTimer();
        setOpen(true);
      });
      triggerInjected.onPointerLeave = composeEventHandlers(triggerProps.onPointerLeave, () => {
        clearHoverTimer();
        hoverTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
      });
    }

    const renderedTrigger = cloneElement(trigger, triggerInjected as Record<string, unknown>);

    // —— 浮层定位 style ——
    // 用户 style 先铺底,positionAnchor / 定位 CSS 变量放最后,确保锚定不被用户 style 覆盖
    // (否则 position-anchor 丢失 → 浮层退化到 top-layer 左上角)。style 已从 props 解构出、
    // 不在 ...rest 里,故面板上的 {...rest} 不会二次注入 style 把锚定盖掉。
    const popoverStyle: AnchorStyle = {
      ...(style as AnchorStyle | undefined),
      positionAnchor: anchorName,
      '--ms-dropdown-area': placementToArea(resolvedPlacement),
      '--ms-dropdown-offset': `${offset}px`,
    };

    const rootClass = [
      'ms-dropdown',
      `ms-dropdown--${side}`,
      `ms-tone-${tone}`,
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');
    const menuClass = ['ms-dropdown__menu', classNames?.menu].filter(Boolean).join(' ');

    // hover 模式:浮层自身也响应指针进出,形成 trigger ↔ 浮层 桥接不闪关。
    const panelHoverHandlers =
      triggerAction === 'hover'
        ? {
            onPointerEnter: () => clearHoverTimer(),
            onPointerLeave: () => {
              clearHoverTimer();
              hoverTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
            },
          }
        : undefined;

    // —— 渲染一个可聚焦项(button / 链接 / 子菜单入口) ——
    const renderActionRow = (row: FlatRow): ReactNode => {
      const item = row.item as DropdownItem;
      const focusIndex = row.focusIndex;
      const submenu = hasSubmenu(item);
      const isLink = typeof item.href === 'string' && !item.disabled && !submenu;
      const selectionRole: MenuItemRole | undefined =
        item.checked !== undefined ? (item.selectionRole ?? 'checkbox') : undefined;
      const ariaRole =
        selectionRole === 'radio'
          ? 'menuitemradio'
          : selectionRole === 'checkbox'
            ? 'menuitemcheckbox'
            : 'menuitem';

      const submenuOpen = submenu && openSubmenu === focusIndex;
      const itemClass = [
        'ms-dropdown__item',
        item.danger && 'ms-dropdown__item--danger',
        selectionRole && 'ms-dropdown__item--selectable',
        submenu && 'ms-dropdown__item--has-submenu',
        classNames?.item,
      ]
        .filter(Boolean)
        .join(' ');

      const setItemRef = (node: HTMLElement | null) => {
        itemRefs.current[focusIndex] = node;
      };
      const inner = renderItemInner(item, selectionRole);

      // 带子菜单的项:包一层定位容器,内部渲染二级 ms-dropdown__submenu(一层)。
      if (submenu) {
        return (
          <div
            key={row.rowKey}
            role="none"
            className="ms-dropdown__submenu-wrap"
            data-submenu-side={submenuSide(side)}
            {...(triggerAction === 'hover'
              ? {
                  onPointerEnter: () => setOpenSubmenu(focusIndex),
                  onPointerLeave: () => setOpenSubmenu((cur) => (cur === focusIndex ? -1 : cur)),
                }
              : {})}
          >
            <button
              ref={setItemRef as Ref<HTMLButtonElement>}
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-haspopup="menu"
              aria-expanded={submenuOpen}
              disabled={item.disabled}
              className={itemClass}
              aria-disabled={item.disabled || undefined}
              onKeyDown={(e) => onItemKeyDown(e, focusIndex, item)}
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
              {inner}
            </button>
            {submenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className={['ms-dropdown__submenu', classNames?.submenu].filter(Boolean).join(' ')}
              >
                {(item.submenu ?? []).map((sub, j) => {
                  const subRole: MenuItemRole | undefined =
                    sub.checked !== undefined ? (sub.selectionRole ?? 'checkbox') : undefined;
                  const subAriaRole =
                    subRole === 'radio'
                      ? 'menuitemradio'
                      : subRole === 'checkbox'
                        ? 'menuitemcheckbox'
                        : 'menuitem';
                  return (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: 子菜单项无稳定 id,一层静态列表用索引足够
                      key={`sub-${focusIndex}-${j}`}
                      type="button"
                      role={subAriaRole}
                      tabIndex={-1}
                      disabled={sub.disabled}
                      className={[
                        'ms-dropdown__item',
                        sub.danger && 'ms-dropdown__item--danger',
                        subRole && 'ms-dropdown__item--selectable',
                        classNames?.item,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-disabled={sub.disabled || undefined}
                      {...(subRole ? { 'aria-checked': !!sub.checked } : {})}
                      onClick={(e) =>
                        selectSub(
                          sub,
                          e as unknown as {
                            defaultPrevented?: boolean;
                            preventDefault: () => void;
                          },
                        )
                      }
                    >
                      {renderItemInner(sub, subRole)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

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
            onKeyDown={(e) => onItemKeyDown(e, focusIndex, item)}
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
            {inner}
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
          onKeyDown={(e) => onItemKeyDown(e, focusIndex, item)}
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
          {inner}
        </button>
      );
    };

    // —— 浮层内容:数据驱动 role=menu 列表;复合 children 原样塞入 —— //
    const menuInner = items ? (
      <div role="menu" aria-orientation="vertical" className={menuClass}>
        {rows.map((row) => {
          if (row.kind === 'separator') {
            // <hr> 隐含 role=separator,语义正确,无需额外包裹。
            return (
              <hr
                key={row.rowKey}
                className={['ms-dropdown__separator', classNames?.separator]
                  .filter(Boolean)
                  .join(' ')}
              />
            );
          }
          if (row.kind === 'group-label') {
            return (
              <div role="presentation" key={row.rowKey} className="ms-dropdown__group">
                <div
                  className={['ms-dropdown__group-label', classNames?.groupLabel]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {row.item.label}
                </div>
              </div>
            );
          }
          return renderActionRow(row);
        })}
        {rows.length === 0 && (
          <div role="presentation" className="ms-dropdown__empty">
            {t('select.empty')}
          </div>
        )}
      </div>
    ) : (
      <div role="menu" aria-orientation="vertical" className={menuClass}>
        {children}
      </div>
    );

    return (
      <>
        {renderedTrigger}
        <div
          ref={setPopoverRef}
          id={menuId}
          popover="auto"
          data-ms-side={side}
          data-ms-align={align}
          className={rootClass}
          style={popoverStyle}
          onToggle={composeEventHandlers(
            onToggle as ((e: { defaultPrevented?: boolean }) => void) | undefined,
            (e) => {
              // 原生 light-dismiss(点外 / Esc)→ 同步回开合状态。
              const next = (e as unknown as { newState?: string }).newState === 'open';
              setOpen(next);
            },
          )}
          {...panelHoverHandlers}
          {...rest}
        >
          <div className="ms-dropdown__panel">
            {menuInner}
            {arrow && (
              <span
                className={['ms-dropdown__arrow', classNames?.arrow].filter(Boolean).join(' ')}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </>
    );
  },
);
Dropdown.displayName = 'Dropdown';

/* TODO(submenu-deep): 子菜单当前仅一层(item.submenu)。深层嵌套(submenu 再带 submenu)需要
 * 递归渲染 + 每级独立的 roving/typeahead 焦点环 + 跨级方向键(← 回父级、→ 进子级)与
 * 多级浮层定位翻转,留待后续按 ARIA APG「menu with submenus」完整实现。 */
