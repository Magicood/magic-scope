import type { KeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MenuItem } from '../Menu/Menu';

export type { MenuItem };

export interface ContextMenuProps {
  /** 菜单项列表(与 Menu 同结构)。 */
  items: MenuItem[];
  /** 响应右键的区域内容。 */
  children: ReactNode;
  /** 菜单浮层附加类名。 */
  className?: string;
}

/**
 * ContextMenu —— 右键菜单。自研、零依赖。右键(contextmenu)在包裹区域内弹出,定位在光标处
 * (越界自动夹回视口),portal 到 body;点选 / 点外 / Esc / 滚动关闭;↑↓ / Home / End / Enter 键盘可达。
 * 复用 .ms-menu__item 视觉。区别于点击锚定的 Menu。样式见同目录 ContextMenu.css。
 */
export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const close = useCallback(() => setOpen(false), []);

  // 打开后:夹回视口(一次性,夹住即不再变 → 不会循环)+ 聚焦首个可用项
  useEffect(() => {
    if (!open) return;
    const el = menuRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const pad = 8;
      const maxX = window.innerWidth - rect.width - pad;
      const maxY = window.innerHeight - rect.height - pad;
      setPos((p) => {
        const nx = Math.max(pad, Math.min(p.x, maxX));
        const ny = Math.max(pad, Math.min(p.y, maxY));
        return nx === p.x && ny === p.y ? p : { x: nx, y: ny };
      });
    }
    const first = items.findIndex((it) => !it.disabled);
    if (first >= 0) requestAnimationFrame(() => itemRefs.current[first]?.focus());
  }, [open, items]);

  // 点外 / Esc / 滚动关闭
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
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
  }, [open, close]);

  const moveFocus = useCallback(
    (from: number, dir: 1 | -1) => {
      let i = from;
      for (let step = 0; step < items.length; step += 1) {
        i += dir;
        if (i < 0 || i >= items.length) return;
        if (!items[i]?.disabled) {
          itemRefs.current[i]?.focus();
          return;
        }
      }
    },
    [items],
  );

  const select = useCallback(
    (item: MenuItem) => {
      if (item.disabled) return;
      item.onSelect?.();
      close();
    },
    [close],
  );

  const onItemKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
        itemRefs.current[items.findIndex((it) => !it.disabled)]?.focus();
        break;
      case 'End': {
        e.preventDefault();
        for (let i = items.length - 1; i >= 0; i -= 1) {
          if (!items[i]?.disabled) {
            itemRefs.current[i]?.focus();
            break;
          }
        }
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        select(items[index] as MenuItem);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 右键菜单由 contextmenu 事件触发(鼠标专属、无键盘等价物);键盘用户走 Menu / 应用菜单 */}
      <div
        className="ms-context-menu-area"
        onContextMenu={(e) => {
          e.preventDefault();
          setPos({ x: e.clientX, y: e.clientY });
          setOpen(true);
        }}
      >
        {children}
      </div>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className={['ms-context-menu', className].filter(Boolean).join(' ')}
            style={{ insetBlockStart: pos.y, insetInlineStart: pos.x }}
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
          </div>,
          document.body,
        )}
    </>
  );
}
ContextMenu.displayName = 'ContextMenu';
