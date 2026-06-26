import type { ComponentPropsWithoutRef, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useId, useRef, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';
import {
  type AccordionType,
  computeFocusTarget,
  computeToggle,
  fromValueSet,
  setsEqual,
  toValueSet,
} from './logic';

export type AccordionTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 子部件类名插槽:细粒度定制每个内部元素。 */
export interface AccordionClassNames {
  /** 单项容器(<div>)。 */
  item?: string;
  /** 头部触发按钮(<button>)。 */
  trigger?: string;
  /** 展开指示图标外层(<span>)。 */
  icon?: string;
  /** 折叠面板内容区(<div>)。 */
  panel?: string;
}

export interface AccordionItem {
  /** 唯一标识,用于受控展开判定。 */
  value: string;
  /** 头部标题(button 内容)。 */
  title: ReactNode;
  /** 折叠面板内容。 */
  content: ReactNode;
  /** 是否禁用(不可展开、不可聚焦移动落点)。 */
  disabled?: boolean;
  /**
   * 自定义展开指示符(替换默认 ▸)。传入则替换该项的默认图标;展开时仍按 motion 档旋转。
   * 若要完全自绘(不旋转),可在内容里自行处理。
   */
  icon?: ReactNode;
  /** 该项头部被点击时触发(原始 MouseEvent 外抛;与全局 onTriggerClick 同时触发)。 */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface AccordionProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onKeyDown'> {
  /** single:同时只展开一项;multiple:可同时展开多项。默认 single。 */
  type?: AccordionType;
  /** 面板项列表。 */
  items: AccordionItem[];
  /**
   * 受控展开值。single 取 string,multiple 取 string[]。
   * 传入即受控(配合 onValueChange);不传走非受控(defaultValue)。
   */
  value?: string | string[];
  /** 初始展开值(非受控)。single 取 string,multiple 取 string[];宽松接受任一形态。 */
  defaultValue?: string | string[];
  /**
   * single 模式下是否允许全部收起(点已展开项可收起到无展开)。默认 true。
   * multiple 模式不受此项影响(各项始终可独立收起)。
   */
  collapsible?: boolean;
  /** 语义色调:根加 ms-tone-${tone},hover/open/focus 配色读 6 槽位。默认 primary。 */
  tone?: AccordionTone;
  /** 子部件类名插槽。 */
  classNames?: AccordionClassNames;
  /** 外部类名(作用于根容器)。 */
  className?: string;
  /** 展开值变化(受控/非受控双通道核心回调)。single 回 string、multiple 回 string[]。 */
  onValueChange?: (value: string | string[]) => void;
  /** 单项展开/收起瞬间(被切换项 value + 切换后是否展开)。 */
  onExpandedChange?: (value: string, open: boolean) => void;
  /** 任意头部被点击(被点项 value + 原始事件;在内部切换逻辑之前调用)。 */
  onTriggerClick?: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
  /** 头部键盘事件外抛/可拦截(在 ↑↓/Home/End 内部导航之前调用;preventDefault 可阻断内部导航)。 */
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * Accordion —— 手风琴(可折叠面板组,旗舰深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 深度:
 * - 受控(value + onValueChange)/ 非受控(defaultValue)双模式;single / multiple;single 可配 collapsible 全收。
 * - tone 色调系统:根 ms-tone-${tone},hover/open/focus 读 6 槽位(--ms-c / --ms-c-hover / --ms-c-glow…)。
 * - 留口:根 extends div 透传 ...rest(原生事件 / data-* / aria-*);classNames 细粒度类名插槽;AccordionItem.icon 可替换指示符。
 * - 事件:onValueChange / onExpandedChange / onTriggerClick / onKeyDown 全量语义回调,皆用 composeEventHandlers 不丢用户处理器。
 *
 * 可达性 / 动效:
 * - 展开用 grid-template-rows 0fr→1fr 过渡 + 内容淡入;收起过渡播完后再置 inert + hidden(双向动画完整、收起后不可聚焦)。
 * - 头部原生 <button> + aria-expanded / aria-controls;面板 role="region" + aria-labelledby。
 * - 键盘 ↑↓ 头部间移动(跳过 disabled)、Home/End 跳首尾;图标旋转随 data-ms-motion 档降级。
 * 样式见同目录 Accordion.css,需引入 @magic-scope/react/styles.css。
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = 'single',
      items,
      value: controlledValue,
      defaultValue,
      collapsible = true,
      tone = 'primary',
      classNames,
      className,
      onValueChange,
      onExpandedChange,
      onTriggerClick,
      onKeyDown: userOnKeyDown,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    // CSS / DOM id 不便含冒号,useId 产物里把 ':' 换成 '-'。
    const baseId = `ms-accordion-${reactId.replace(/:/g, '-')}`;
    const headerRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const isControlled = controlledValue !== undefined;
    const [uncontrolled, setUncontrolled] = useState<Set<string>>(() => toValueSet(defaultValue));
    const openValues = isControlled ? toValueSet(controlledValue) : uncontrolled;

    const toggle = useCallback(
      (itemValue: string) => {
        const next = computeToggle(openValues, itemValue, type, collapsible);
        // 集合无变化(如 single 不可收的唯一项再点)则不触发回调。
        if (setsEqual(next, openValues)) {
          return;
        }
        const nextOpen = next.has(itemValue);
        if (!isControlled) {
          setUncontrolled(next);
        }
        onExpandedChange?.(itemValue, nextOpen);
        onValueChange?.(fromValueSet(next, type));
      },
      [openValues, type, collapsible, isControlled, onExpandedChange, onValueChange],
    );

    // ↑↓ / Home / End 在可用头部间移动焦点(跳过 disabled);用户处理器先行,未 preventDefault 才走内部导航。
    const internalKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const focusable = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
        const target = computeFocusTarget(e.key, index, focusable);
        if (target < 0) {
          return;
        }
        e.preventDefault();
        headerRefs.current[target]?.focus();
      },
      [items],
    );

    const rootClassName = ['ms-accordion', `ms-tone-${tone}`, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={rootClassName} {...rest}>
        {items.map((item, index) => {
          const open = openValues.has(item.value);
          const headerId = `${baseId}-h-${index}`;
          const panelId = `${baseId}-p-${index}`;
          const itemClassName = [
            'ms-accordion__item',
            open && 'ms-accordion__item--open',
            item.disabled && 'ms-accordion__item--disabled',
            classNames?.item,
          ]
            .filter(Boolean)
            .join(' ');
          const triggerClassName = ['ms-accordion__trigger', classNames?.trigger]
            .filter(Boolean)
            .join(' ');
          const iconClassName = ['ms-accordion__icon', classNames?.icon].filter(Boolean).join(' ');
          const panelInnerClassName = ['ms-accordion__panel-inner', classNames?.panel]
            .filter(Boolean)
            .join(' ');

          const handleClick = composeEventHandlers(item.onClick, (e) => {
            onTriggerClick?.(item.value, e);
            if (!e.defaultPrevented) {
              toggle(item.value);
            }
          });
          const handleKeyDown = composeEventHandlers(userOnKeyDown, (e) =>
            internalKeyDown(e, index),
          );

          return (
            <div key={item.value} className={itemClassName}>
              <h3 className="ms-accordion__heading">
                <button
                  type="button"
                  id={headerId}
                  ref={(node) => {
                    headerRefs.current[index] = node;
                  }}
                  className={triggerClassName}
                  aria-expanded={open}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                >
                  <span className={iconClassName} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="ms-accordion__title">{item.title}</span>
                </button>
              </h3>
              <section
                id={panelId}
                aria-labelledby={headerId}
                className="ms-accordion__panel"
                data-state={open ? 'open' : 'closed'}
                // 收起项置 inert:不可聚焦、对 AT 隐藏;不改变布局,故可即时应用而不打断收起动画。
                // 可见性由 CSS visibility 延迟过渡接管(动画播完再隐藏),双向动画完整。
                inert={!open}
              >
                <div className={panelInnerClassName}>
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
