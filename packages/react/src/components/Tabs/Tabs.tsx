import type { KeyboardEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useId, useRef, useState } from 'react';

export interface TabItem {
  /** 唯一值,作为受控 / 非受控的标识。 */
  value: string;
  /** 标签显示内容。 */
  label: ReactNode;
  /** 选中时渲染到 tabpanel 的内容。省略则只切换标签。 */
  content?: ReactNode;
  /** 是否禁用(不可聚焦、不可选中)。 */
  disabled?: boolean;
}

export interface TabsProps {
  /** 标签项列表。 */
  items: TabItem[];
  /** 受控选中值。传入则由外部托管,需配合 onChange。 */
  value?: string;
  /** 非受控初始选中值。缺省取第一个可用项。 */
  defaultValue?: string;
  /** 选中变化回调,参数为新选中项的 value。 */
  onChange?: (value: string) => void;
  /** 视觉变体:underline(下划线)| pill(实底胶囊),默认 underline。 */
  variant?: 'underline' | 'pill';
  /** 外部类名(作用于最外层容器)。 */
  className?: string;
}

/**
 * Tabs —— 标签页。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * - 受控(value + onChange)/ 非受控(defaultValue)双模式。
 * - ARIA:role="tablist" 容器,每个 role="tab" 标注 aria-selected / aria-controls,
 *   对应 role="tabpanel" 反向 aria-labelledby;采用 roving tabIndex(仅选中项进 Tab 序)。
 * - 键盘:← → 在可用 tab 间移动并切换(循环,跳过 disabled),Home / End 跳首尾。
 * - underline 变体选中项下方主色条 + 发光;pill 变体选中项 primary 实底。
 * 样式见同目录 Tabs.css,需引入 @magic-scope/react/styles.css。
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ items, value, defaultValue, onChange, variant = 'underline', className }, ref) => {
    const reactId = useId();
    // useId 产物含冒号,做 DOM id 前先净化。
    const baseId = `ms-tabs-${reactId.replace(/:/g, '-')}`;

    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const firstEnabled = items.find((it) => !it.disabled)?.value;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(
      defaultValue ?? firstEnabled,
    );
    const isControlled = value !== undefined;
    const selected = isControlled ? value : uncontrolled;

    const select = useCallback(
      (next: string) => {
        if (!isControlled) {
          setUncontrolled(next);
        }
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    // 从 from 起按 dir 找下一个可用项(循环,跳过 disabled),返回其索引。
    const nextEnabled = useCallback(
      (from: number, dir: 1 | -1) => {
        const n = items.length;
        for (let step = 1; step <= n; step += 1) {
          const i = (from + dir * step + n * step) % n;
          if (!items[i]?.disabled) {
            return i;
          }
        }
        return from;
      },
      [items],
    );

    const edgeEnabled = useCallback(
      (dir: 1 | -1) => {
        if (dir === 1) {
          for (let i = items.length - 1; i >= 0; i -= 1) {
            if (!items[i]?.disabled) {
              return i;
            }
          }
        } else {
          for (let i = 0; i < items.length; i += 1) {
            if (!items[i]?.disabled) {
              return i;
            }
          }
        }
        return -1;
      },
      [items],
    );

    const activate = useCallback(
      (index: number) => {
        const item = items[index];
        if (!item || item.disabled) {
          return;
        }
        select(item.value);
        tabRefs.current[index]?.focus();
      },
      [items, select],
    );

    const onTabKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            activate(nextEnabled(index, 1));
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            activate(nextEnabled(index, -1));
            break;
          case 'Home':
            e.preventDefault();
            activate(edgeEnabled(-1));
            break;
          case 'End':
            e.preventDefault();
            activate(edgeEnabled(1));
            break;
          default:
            break;
        }
      },
      [activate, nextEnabled, edgeEnabled],
    );

    const activeItem = items.find((it) => it.value === selected && !it.disabled);

    return (
      <div
        ref={ref}
        className={['ms-tabs', `ms-tabs--${variant}`, className].filter(Boolean).join(' ')}
      >
        <div role="tablist" className="ms-tabs__list">
          {items.map((item, index) => {
            const isSelected = item.value === selected;
            const tabId = `${baseId}-tab-${item.value}`;
            const panelId = `${baseId}-panel-${item.value}`;
            return (
              <button
                key={item.value}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isSelected}
                aria-controls={panelId}
                aria-disabled={item.disabled || undefined}
                // roving tabIndex:仅选中项进 Tab 序,其余靠方向键到达。
                tabIndex={isSelected && !item.disabled ? 0 : -1}
                disabled={item.disabled}
                className={['ms-tabs__tab', isSelected && 'ms-tabs__tab--selected']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => activate(index)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
              >
                <span className="ms-tabs__label">{item.label}</span>
              </button>
            );
          })}
        </div>
        {activeItem && activeItem.content !== undefined ? (
          <div
            role="tabpanel"
            id={`${baseId}-panel-${activeItem.value}`}
            aria-labelledby={`${baseId}-tab-${activeItem.value}`}
            tabIndex={0}
            className="ms-tabs__panel"
          >
            {activeItem.content}
          </div>
        ) : null}
      </div>
    );
  },
);
Tabs.displayName = 'Tabs';
