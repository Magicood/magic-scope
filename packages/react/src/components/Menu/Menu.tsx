import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';

export interface MenuItem {
  /** 菜单项文本。 */
  label: string;
  /** 选中回调。点击 / Enter 触发后菜单关闭。 */
  onSelect?: () => void;
  /** 是否禁用(不可聚焦、不触发)。 */
  disabled?: boolean;
  /** 是否危险项(用 danger 色)。 */
  danger?: boolean;
}

export interface MenuProps {
  /** 触发元素(通常是 Button)。点击展开菜单。 */
  trigger: ReactElement;
  /** 菜单项列表。 */
  items: MenuItem[];
  /** 外部类名(作用于浮层)。 */
  className?: string;
}

/** anchor-name / position-anchor 不在标准 CSSProperties 里,这里做最小扩展。 */
interface AnchorStyle extends CSSProperties {
  anchorName?: string;
  positionAnchor?: string;
}

/**
 * Menu —— 下拉菜单。自研、零依赖,用满平台原生能力:
 * - 浮层进 top-layer:Popover API(popover="auto",自带点外 / Esc 关闭与 light-dismiss)。
 * - 定位:CSS Anchor Positioning(trigger 设 anchor-name,浮层 position-anchor + position-area);
 *   `@supports not (anchor-name: --x)` 降级为普通 absolute 贴近 trigger,保证不支持时仍可用。
 * - 键盘:↑↓ 移动焦点(跳过 disabled)、Enter / Space 触发、Esc 关闭(交还原生 popover)。
 * 样式见同目录 Menu.css,需引入 @magic-scope/react/styles.css。
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(({ trigger, items, className }, ref) => {
  const reactId = useId();
  // CSS 自定义标识符不能含冒号,useId 产物里把 ':' 换成 '-'。
  const anchorName = `--ms-menu-${reactId.replace(/:/g, '-')}`;
  const menuId = `ms-menu-${reactId.replace(/:/g, '-')}`;

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);

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

  // 同步 React open 状态 → 原生 popover 显隐(showPopover / hidePopover)。
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

  // 打开时把焦点落到第一个可用项,便于键盘操作。
  useEffect(() => {
    if (!open) {
      return;
    }
    const first = items.findIndex((it) => !it.disabled);
    if (first >= 0) {
      // 等浮层进入 top-layer 后再聚焦。
      requestAnimationFrame(() => itemRefs.current[first]?.focus());
    }
  }, [open, items]);

  const firstEnabled = useCallback(() => items.findIndex((it) => !it.disabled), [items]);
  const lastEnabled = useCallback(() => {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (!items[i]?.disabled) {
        return i;
      }
    }
    return -1;
  }, [items]);

  // 从 from 起按 dir 找下一个可用项(到边界停在端点)。
  const moveFocus = useCallback(
    (from: number, dir: 1 | -1) => {
      let i = from;
      for (let step = 0; step < items.length; step += 1) {
        i += dir;
        if (i < 0 || i >= items.length) {
          return;
        }
        if (!items[i]?.disabled) {
          itemRefs.current[i]?.focus();
          return;
        }
      }
    },
    [items],
  );

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const select = useCallback(
    (item: MenuItem) => {
      if (item.disabled) {
        return;
      }
      item.onSelect?.();
      close(true);
    },
    [close],
  );

  const onItemKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(index, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(index, -1);
          break;
        case 'Home':
          e.preventDefault();
          itemRefs.current[firstEnabled()]?.focus();
          break;
        case 'End':
          e.preventDefault();
          itemRefs.current[lastEnabled()]?.focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          select(items[index] as MenuItem);
          break;
        case 'Escape':
          // 交给原生 popover 关闭后,焦点交还 trigger。
          close(true);
          break;
        case 'Tab':
          // Tab 离开即关闭(不抢焦点,让浏览器正常移焦)。
          setOpen(false);
          break;
        default:
          break;
      }
    },
    [moveFocus, firstEnabled, lastEnabled, select, items, close],
  );

  // 把 anchor-name 注入 trigger,并接管它的 onClick / ref。
  const triggerProps = trigger.props as {
    onClick?: (e: unknown) => void;
    style?: CSSProperties;
    ref?: unknown;
  };

  const renderedTrigger = cloneElement(trigger, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const r = triggerProps.ref;
      if (typeof r === 'function') {
        (r as (n: HTMLElement | null) => void)(node);
      } else if (r && typeof r === 'object') {
        (r as { current: HTMLElement | null }).current = node;
      }
    },
    style: { ...triggerProps.style, anchorName } as AnchorStyle,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (e: unknown) => {
      triggerProps.onClick?.(e);
      setOpen((v) => !v);
    },
  } as Record<string, unknown>);

  const popoverStyle: AnchorStyle = { positionAnchor: anchorName };

  return (
    <>
      {renderedTrigger}
      <div
        ref={setPopoverRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-orientation="vertical"
        className={['ms-menu', className].filter(Boolean).join(' ')}
        style={popoverStyle}
        onToggle={(e) => {
          // 原生 light-dismiss(点外 / Esc)→ 同步回 React 状态。
          const next = (e as unknown as { newState?: string }).newState === 'open';
          setOpen(next);
        }}
      >
        {items.map((item, index) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: items 为静态有序列表,index 即稳定标识
            key={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            disabled={item.disabled}
            className={['ms-menu__item', item.danger && 'ms-menu__item--danger']
              .filter(Boolean)
              .join(' ')}
            onClick={() => select(item)}
            onKeyDown={(e) => onItemKeyDown(e, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
});
Menu.displayName = 'Menu';
