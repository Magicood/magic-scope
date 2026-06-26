import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';
import { Kbd } from '../Kbd/Kbd';
import {
  type FlatRow,
  firstFocusable,
  flattenItems,
  lastFocusable,
  type MenuItem,
  type MenuItemRole,
  type MenuItemType,
  nextFocusIndex,
  typeaheadMatch,
} from './logic';

export type { MenuItem, MenuItemRole, MenuItemType };

export type MenuTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** 菜单相对 trigger 的主轴方位。 */
export type MenuPlacement = 'bottom' | 'top' | 'left' | 'right';
/** 菜单在交叉轴上的对齐。 */
export type MenuAlign = 'start' | 'center' | 'end';

/** renderItem render-prop 拿到的上下文,便于自定义渲染时复用内部能力。 */
export interface MenuItemRenderContext {
  /** 当前项。 */
  item: MenuItem;
  /** 在「可聚焦序列」里的序号(分隔线/分组标题为 -1)。 */
  index: number;
  /** 触发选中(等价点击该项)。 */
  select: () => void;
  /** 是否禁用。 */
  disabled: boolean;
}

export interface MenuProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onSelect'> {
  /** 触发元素(通常是 Button)。点击展开菜单。 */
  trigger: ReactElement;
  /** 菜单项列表(支持 item / separator / group)。 */
  items: MenuItem[];
  /** 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与辉光。默认 primary。 */
  tone?: MenuTone;
  /** 主轴方位:菜单出现在 trigger 的哪一侧。默认 bottom。 */
  placement?: MenuPlacement;
  /** 交叉轴对齐。默认 start。 */
  align?: MenuAlign;
  /** 与 trigger 的间距(px)。默认 8。 */
  offset?: number;
  /** 受控开合状态。传入即受控,需配合 onOpenChange。 */
  open?: boolean;
  /** 非受控初始开合。默认 false。 */
  defaultOpen?: boolean;
  /** 开合变化回调(受控/非受控双通道都会触发)。 */
  onOpenChange?: (open: boolean) => void;
  /** 菜单级统一选中回调(任一项被选中都触发,便于集中埋点/分发)。 */
  onSelect?: (item: MenuItem, index: number) => void;
  /** Esc 关闭前回调,可 `preventDefault()` 拦截阻止关闭。 */
  onEscapeKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** 点击浮层外部关闭前回调,可 `preventDefault()` 拦截阻止关闭。 */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** 自定义渲染每一项(render-prop)。返回的元素会替换默认项的内部内容。 */
  renderItem?: (ctx: MenuItemRenderContext) => ReactNode;
  /** 外部类名(作用于浮层根)。 */
  className?: string;
  /** 关键子部件 className 定制。 */
  classNames?: {
    /** 浮层根 .ms-menu */
    root?: string;
    /** 菜单项 .ms-menu__item */
    item?: string;
    /** 分隔线 .ms-menu__separator */
    separator?: string;
    /** 分组标题 .ms-menu__group-label */
    groupLabel?: string;
  };
}

/** anchor-name 不在标准 CSSProperties 里,这里做最小扩展;position-anchor 现代 CSSProperties 已含。 */
interface AnchorStyle extends CSSProperties {
  anchorName?: string | undefined;
  [key: `--${string}`]: string | number | undefined;
}

/** placement × align → CSS position-area 关键字(支持锚定位时用)。 */
function positionAreaFor(placement: MenuPlacement, align: MenuAlign): string {
  if (placement === 'bottom' || placement === 'top') {
    const block = placement === 'bottom' ? 'block-end' : 'block-start';
    const inline =
      align === 'start' ? 'span-inline-end' : align === 'end' ? 'span-inline-start' : 'center';
    return `${block} ${inline}`;
  }
  const inline = placement === 'right' ? 'inline-end' : 'inline-start';
  const block =
    align === 'start' ? 'span-block-end' : align === 'end' ? 'span-block-start' : 'center';
  return `${inline} ${block}`;
}

/**
 * Menu —— 下拉菜单(旗舰深度组件)。自研、零依赖,用满平台原生能力:
 * - 浮层进 top-layer:Popover API(popover="auto",自带点外 / Esc 关闭与 light-dismiss);
 * - 定位:CSS Anchor Positioning(placement/align/offset → position-area + margin),
 *   `@supports not (anchor-name)` 降级为 fixed 居顶,保证不支持时仍可用;
 * - 键盘:↑↓ 移焦(跳过 disabled)、Home/End、Enter/Space 触发、typeahead 类型搜索、Esc 关闭。
 *
 * 深度能力:
 * - 项类型 item / separator / group(带标题),项支持 icon / shortcut(Kbd)/ checked(checkbox/radio)/ href 链接多态;
 * - tone 7 色调只读 6 槽位(不写死配色)+ 辉光;
 * - 受控 open / defaultOpen + onOpenChange 双通道;菜单级 onSelect、可拦截的 onEscapeKeyDown / onPointerDownOutside;
 * - trigger 全事件 + ref compose;...rest 透传到浮层根;组合式 API(Menu.Item / Separator / Group / Trigger)+ renderItem。
 *
 * 纯逻辑(拍平 / typeahead / 键位)在同目录 logic.ts(零 React 依赖,可平移 core)。
 * 样式见同目录 Menu.css,需引入 @magic-scope/react/styles.css。
 */
const MenuBase = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      trigger,
      items,
      tone = 'primary',
      placement = 'bottom',
      align = 'start',
      offset = 8,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onSelect,
      onEscapeKeyDown,
      onPointerDownOutside,
      renderItem,
      className,
      classNames,
      style,
      onToggle,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    // CSS 自定义标识符不能含冒号,useId 产物里把 ':' 换成 '-'。
    const safeId = reactId.replace(/:/g, '-');
    const anchorName = `--ms-menu-${safeId}`;
    const menuId = `ms-menu-${safeId}`;

    const popoverRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const itemRefs = useRef<Array<HTMLElement | null>>([]);
    // 受控/非受控:受控时以 prop 为准,否则用内部 state。
    const isControlled = openProp !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = isControlled ? openProp : uncontrolledOpen;
    // 受控关闭去抖:防原生 toggle 与命令式关闭双触发 onOpenChange。
    const closingRef = useRef(false);

    // typeahead 缓冲与计时器。
    const typeaheadRef = useRef<{ query: string; timer: number | null }>({
      query: '',
      timer: null,
    });

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

    // 统一改开合:非受控写 state,始终通知 onOpenChange(去重避免重复触发)。
    const setOpen = useCallback(
      (next: boolean) => {
        if (next === open) {
          return;
        }
        if (!isControlled) {
          setUncontrolledOpen(next);
        }
        onOpenChange?.(next);
      },
      [open, isControlled, onOpenChange],
    );

    // 拍平 items:得到渲染行 + 可聚焦序列。
    const { rows, focusable } = useMemo(() => flattenItems(items), [items]);

    // 同步 open → 原生 popover 显隐。
    useEffect(() => {
      const el = popoverRef.current;
      if (!el || typeof el.showPopover !== 'function') {
        return;
      }
      const isShown = el.matches(':popover-open');
      if (open && !isShown) {
        el.showPopover();
      } else if (!open && isShown) {
        el.hidePopover();
      }
    }, [open]);

    // 打开时焦点落到第一个可用项。
    useEffect(() => {
      if (!open) {
        return;
      }
      const first = firstFocusable(focusable);
      if (first >= 0) {
        requestAnimationFrame(() => itemRefs.current[first]?.focus());
      }
    }, [open, focusable]);

    // 外部 pointerdown:可拦截的「点外关闭」。原生 popover 已有 light-dismiss,
    // 这里只为暴露可 preventDefault 的回调;未拦截则交还原生行为。
    useEffect(() => {
      if (!open || !onPointerDownOutside) {
        return;
      }
      const onPointerDown = (e: PointerEvent) => {
        const el = popoverRef.current;
        const trig = triggerRef.current;
        const target = e.target as Node | null;
        if (el?.contains(target) || trig?.contains(target)) {
          return;
        }
        onPointerDownOutside(e);
      };
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [open, onPointerDownOutside]);

    const close = useCallback(
      (refocus: boolean) => {
        if (closingRef.current) {
          return;
        }
        closingRef.current = true;
        setOpen(false);
        if (refocus) {
          triggerRef.current?.focus();
        }
        // 下一帧解锁,避免同一关闭动作里重复触发。
        requestAnimationFrame(() => {
          closingRef.current = false;
        });
      },
      [setOpen],
    );

    const focusByIndex = useCallback((index: number) => {
      if (index >= 0) {
        itemRefs.current[index]?.focus();
      }
    }, []);

    const select = useCallback(
      (
        item: MenuItem,
        index: number,
        event?: { defaultPrevented?: boolean; preventDefault: () => void },
      ) => {
        if (item.disabled) {
          return;
        }
        // 项级 onClick 先跑,用户可 preventDefault 阻断后续(含 onSelect 与关闭)。
        if (event && item.onClick) {
          item.onClick(event);
          if (event.defaultPrevented) {
            return;
          }
        }
        item.onSelect?.();
        onSelect?.(item, index);
        // checkbox / radio 项保持菜单打开(便于连续切换);普通项 / 链接项关闭。
        const keepOpen = item.checked !== undefined && item.selectionRole !== undefined;
        if (!keepOpen) {
          close(true);
        }
      },
      [close, onSelect],
    );

    // typeahead:累积输入,匹配到则聚焦该项。
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
            if (item) {
              select(item, focusIndex, e);
            }
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
            // Tab 离开即关闭(不抢焦点)。
            setOpen(false);
            break;
          default:
            // 单字符可打印键 → typeahead。
            if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
              runTypeahead(e.key, focusIndex);
            }
            break;
        }
      },
      [focusable, focusByIndex, select, close, onEscapeKeyDown, setOpen, runTypeahead],
    );

    // —— trigger:注入 anchor-name 与 a11y 属性,并 compose 全部事件与 ref ——
    // 保留用户原有 props,仅:① onClick compose(先用户、未 preventDefault 再开合);
    // ② a11y / style 由内部值覆盖(浮层开合状态必须以我们为准);③ ref compose 到子元素自带 ref。
    const triggerProps = trigger.props as Record<string, unknown> & {
      style?: CSSProperties;
    };
    const triggerStyle: AnchorStyle = { ...triggerProps.style, anchorName };
    const childTriggerRef = (trigger as { ref?: Ref<unknown> }).ref;

    const renderedTrigger = cloneElement(trigger, {
      ...triggerProps,
      style: triggerStyle,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': open ? menuId : undefined,
      onClick: composeEventHandlers(
        triggerProps.onClick as ((e: { defaultPrevented?: boolean }) => void) | undefined,
        () => setOpen(!open),
      ),
      ref: composeRefs((node: HTMLElement | null) => {
        triggerRef.current = node;
      }, childTriggerRef),
    } as Record<string, unknown>);

    // —— 浮层定位 style ——
    const supportsArea = positionAreaFor(placement, align);
    const popoverStyle: AnchorStyle = {
      positionAnchor: anchorName,
      '--ms-menu-offset': `${offset}px`,
      '--ms-menu-area': supportsArea,
      ...(style as AnchorStyle | undefined),
    };

    const rootClassName = ['ms-menu', `ms-tone-${tone}`, className, classNames?.root]
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

      // renderItem render-prop:自定义渲染时仍由我们挂 ref/role/键盘以保留可达性。
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
        itemRefs.current[focusIndex] = node;
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

    return (
      <>
        {renderedTrigger}
        <div
          ref={setPopoverRef}
          id={menuId}
          popover="auto"
          role="menu"
          aria-orientation="vertical"
          data-placement={placement}
          data-align={align}
          className={rootClassName}
          style={popoverStyle}
          onToggle={composeEventHandlers(
            onToggle as ((e: { defaultPrevented?: boolean }) => void) | undefined,
            (e) => {
              // 原生 light-dismiss(点外 / Esc)→ 同步回开合状态。
              const next = (e as unknown as { newState?: string }).newState === 'open';
              setOpen(next);
            },
          )}
          {...rest}
        >
          {rows.map((row) => {
            if (row.kind === 'separator') {
              // <hr> 隐含 role=separator,语义正确且无需 aria-valuenow(非可调节分隔符)。
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
        </div>
      </>
    );
  },
);
MenuBase.displayName = 'Menu';

// —— 组合式 API:声明式占位组件,供 <Menu.Item> 等可读书写;主用法仍是 items 数组。

export interface MenuItemElementProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onSelect'> {
  /** 是否危险项。 */
  danger?: boolean;
  /** 前置图标。 */
  icon?: ReactNode;
  /** 快捷键提示。 */
  shortcut?: string | readonly string[] | ReactNode;
  /** asChild:渲染为子元素(如链接)。 */
  asChild?: boolean;
}

/** Menu.Item —— 组合式菜单项(独立使用时渲染为 role=menuitem 的按钮)。 */
const MenuItemElement = forwardRef<HTMLButtonElement, MenuItemElementProps>(
  ({ danger, icon, shortcut, asChild = false, className, children, ...props }, ref) => {
    const cls = ['ms-menu__item', danger && 'ms-menu__item--danger', className]
      .filter(Boolean)
      .join(' ');
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps({ ...props, className: cls, role: 'menuitem' }, child.props);
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }
    return (
      <button ref={ref} type="button" role="menuitem" className={cls} {...props}>
        {icon != null && (
          <span className="ms-menu__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ms-menu__label">{children}</span>
        {shortcut != null && (
          <span className="ms-menu__shortcut">
            {typeof shortcut === 'string' || Array.isArray(shortcut) ? (
              <Kbd size="sm" tone="neutral" keys={shortcut as string | readonly string[]} />
            ) : (
              (shortcut as ReactNode)
            )}
          </span>
        )}
      </button>
    );
  },
);
MenuItemElement.displayName = 'Menu.Item';

/** Menu.Separator —— 组合式分隔线(<hr> 隐含 role=separator,语义正确)。 */
const MenuSeparator = forwardRef<HTMLHRElement, ComponentPropsWithoutRef<'hr'>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={['ms-menu__separator', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
MenuSeparator.displayName = 'Menu.Separator';

export interface MenuGroupProps extends ComponentPropsWithoutRef<'div'> {
  /** 分组标题。 */
  label?: ReactNode;
}

/** Menu.Group —— 组合式分组(带标题)。 */
const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(
  ({ label, className, children, ...props }, ref) => (
    // biome-ignore lint/a11y/useSemanticElements: 菜单分组是 ARIA group(非表单 fieldset),role="group" 正确
    <div
      ref={ref}
      role="group"
      className={['ms-menu__group', className].filter(Boolean).join(' ')}
      {...props}
    >
      {label != null && (
        <div role="presentation" className="ms-menu__group-label">
          {label}
        </div>
      )}
      {children}
    </div>
  ),
);
MenuGroup.displayName = 'Menu.Group';

/** Menu.Trigger —— 语义占位:把外部 ref compose 到子元素(组合式书写的可读性糖)。 */
const MenuTrigger = forwardRef<HTMLElement, { children: ReactElement }>(({ children }, ref) => {
  const child = children;
  const childRef = (child as { ref?: Ref<unknown> }).ref;
  return cloneElement(child, {
    ref: composeRefs(ref as Ref<unknown>, childRef),
  } as Record<string, unknown>);
});
MenuTrigger.displayName = 'Menu.Trigger';

// 把组合式子组件挂到 Menu 上(命名空间 API),并让导出类型携带子组件(否则 Menu.Item 等类型不可见)。
type MenuComponent = typeof MenuBase & {
  Item: typeof MenuItemElement;
  Separator: typeof MenuSeparator;
  Group: typeof MenuGroup;
  Trigger: typeof MenuTrigger;
};

const MenuWithStatics = MenuBase as MenuComponent;
MenuWithStatics.Item = MenuItemElement;
MenuWithStatics.Separator = MenuSeparator;
MenuWithStatics.Group = MenuGroup;
MenuWithStatics.Trigger = MenuTrigger;

/** Menu —— 带命名空间子组件(Menu.Item / Separator / Group / Trigger)。 */
export const Menu = MenuWithStatics;

export { MenuGroup, MenuItemElement, MenuSeparator, MenuTrigger };
