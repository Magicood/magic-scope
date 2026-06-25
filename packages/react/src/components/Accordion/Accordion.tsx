import type { KeyboardEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useId, useRef, useState } from 'react';

export interface AccordionItem {
  /** 唯一标识,用于受控展开判定。 */
  value: string;
  /** 头部标题(button 内容)。 */
  title: ReactNode;
  /** 折叠面板内容。 */
  content: ReactNode;
  /** 是否禁用(不可展开、不可聚焦移动落点)。 */
  disabled?: boolean;
}

export interface AccordionProps {
  /** single:同时只展开一项;multiple:可同时展开多项。默认 single。 */
  type?: 'single' | 'multiple';
  /** 面板项列表。 */
  items: AccordionItem[];
  /** 初始展开值。single 取 string,multiple 取 string[];宽松接受任一形态。 */
  defaultValue?: string | string[];
  /** 外部类名(作用于根容器)。 */
  className?: string;
}

/** 把 defaultValue 归一成初始展开集合。 */
function toSet(defaultValue?: string | string[]): Set<string> {
  if (defaultValue == null) {
    return new Set();
  }
  return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
}

/**
 * Accordion —— 手风琴(可折叠面板组)。自研、零依赖,消费 @magic-scope/tokens 的 CSS 变量。
 * - 展开/收起用 grid-template-rows: 0fr → 1fr 过渡,现代且平滑(无需测量高度)。
 * - 头部为原生 <button>,带 aria-expanded / aria-controls;内容区 role="region" + aria-labelledby。
 * - 键盘:Enter / Space 由原生 button 触发切换;↑↓ 在头部间移动焦点(跳过 disabled),Home / End 跳首尾。
 * - 展开图标 ▸ 旋转 90deg,旋转量乘 motion-scale;聚焦发光环可见;reduced-motion 由全局开关处理。
 * 样式见同目录 Accordion.css,需引入 @magic-scope/react/styles.css。
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = 'single', items, defaultValue, className }, ref) => {
    const reactId = useId();
    // CSS / DOM id 不便含冒号,useId 产物里把 ':' 换成 '-'。
    const baseId = `ms-accordion-${reactId.replace(/:/g, '-')}`;
    const headerRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [openValues, setOpenValues] = useState<Set<string>>(() => toSet(defaultValue));

    const toggle = useCallback(
      (value: string) => {
        setOpenValues((prev) => {
          const next = new Set(prev);
          if (next.has(value)) {
            next.delete(value);
          } else {
            if (type === 'single') {
              next.clear();
            }
            next.add(value);
          }
          return next;
        });
      },
      [type],
    );

    // ↑↓ / Home / End 在可用头部间移动焦点(跳过 disabled)。
    const onHeaderKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const focusable = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
        if (focusable.length === 0) {
          return;
        }
        const pos = focusable.indexOf(index);
        let target = -1;
        if (e.key === 'ArrowDown') {
          target = focusable[(pos + 1) % focusable.length] ?? index;
        } else if (e.key === 'ArrowUp') {
          target = focusable[(pos - 1 + focusable.length) % focusable.length] ?? index;
        } else if (e.key === 'Home') {
          target = focusable[0] ?? index;
        } else if (e.key === 'End') {
          target = focusable[focusable.length - 1] ?? index;
        } else {
          return;
        }
        e.preventDefault();
        headerRefs.current[target]?.focus();
      },
      [items],
    );

    return (
      <div ref={ref} className={['ms-accordion', className].filter(Boolean).join(' ')}>
        {items.map((item, index) => {
          const open = openValues.has(item.value);
          const headerId = `${baseId}-h-${index}`;
          const panelId = `${baseId}-p-${index}`;
          const itemClassName = [
            'ms-accordion__item',
            open && 'ms-accordion__item--open',
            item.disabled && 'ms-accordion__item--disabled',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={item.value} className={itemClassName}>
              <h3 className="ms-accordion__heading">
                <button
                  type="button"
                  id={headerId}
                  ref={(node) => {
                    headerRefs.current[index] = node;
                  }}
                  className="ms-accordion__trigger"
                  aria-expanded={open}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  onClick={() => toggle(item.value)}
                  onKeyDown={(e) => onHeaderKeyDown(e, index)}
                >
                  <span className="ms-accordion__icon" aria-hidden="true" />
                  <span className="ms-accordion__title">{item.title}</span>
                </button>
              </h3>
              <section
                id={panelId}
                aria-labelledby={headerId}
                className="ms-accordion__panel"
                hidden={!open}
              >
                <div className="ms-accordion__panel-inner">
                  <div className="ms-accordion__content">{item.content}</div>
                </div>
              </section>
            </div>
          );
        })}
      </div>
    );
  },
);
Accordion.displayName = 'Accordion';
