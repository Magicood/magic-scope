import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  edgeEnabledIndex,
  nextEnabledIndex,
  resolveNavIntent,
  type TabsOrientation,
} from './logic';

export type TabsVariant = 'underline' | 'pill';
export type TabsTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type TabsSize = 'sm' | 'md' | 'lg';
/** 增删标签动作类别(对标 AntD editable-card)。 */
export type TabsEditAction = 'add' | 'remove';

/** 渲染 renderTab 时透出的当前状态(纯数据,便于使用方做条件渲染)。 */
export interface TabState {
  /** 是否为当前选中项。 */
  selected: boolean;
  /** 是否禁用。 */
  disabled: boolean;
  /** 该项在 items 中的索引。 */
  index: number;
}

export interface TabItem {
  /** 唯一值,作为受控 / 非受控的标识。 */
  value: string;
  /** 标签显示内容。 */
  label: ReactNode;
  /** 选中时渲染到 tabpanel 的内容。省略则只切换标签。 */
  content?: ReactNode;
  /** 是否禁用(不可聚焦、不可选中)。 */
  disabled?: boolean;
  /** 标签前置图标(装饰性,aria-hidden)。 */
  icon?: ReactNode;
  /** 标签后置徽标(如未读数);ReactNode 自定。 */
  badge?: ReactNode;
  /** 该项可关闭:渲染关闭按钮,点击触发 onEdit(value, 'remove')。 */
  closable?: boolean;
  /** 自定义该项内层渲染(覆盖默认 icon/label/badge 布局),拿到状态自行组织。 */
  renderTab?: (item: TabItem, state: TabState) => ReactNode;
  /** 点击该 tab 时的处理器(与组件内部切换 compose,先你的、未 preventDefault 再切换)。 */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

/** 关键子部件类名集合,精准定制各层而不必覆盖整段。 */
export interface TabsClassNames {
  list?: string;
  tab?: string;
  panel?: string;
  indicator?: string;
}

export interface TabsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** 标签项列表。 */
  items: TabItem[];
  /** 受控选中值。传入则由外部托管,需配合 onChange。 */
  value?: string;
  /** 非受控初始选中值。缺省取第一个可用项。 */
  defaultValue?: string;
  /**
   * 选中变化回调。
   * @param value 新选中项的 value。
   */
  onChange?: (value: string) => void;
  /** 视觉变体:underline(下划线)| pill(实底胶囊),默认 underline。 */
  variant?: TabsVariant;
  /** 语义色调,经全库 tone resolver 派生配色(读 6 槽位)。默认 primary。 */
  tone?: TabsTone;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: TabsSize;
  /** 朝向:horizontal(横向)| vertical(竖排),默认 horizontal。竖排时方向键改 ↑/↓。 */
  orientation?: TabsOrientation;
  /** 渲染所有 panel(未选隐藏不卸载,保留滚动 / 表单态)。默认 false。 */
  keepMounted?: boolean;
  /**
   * 点击 tab 的瞬间副作用入口(点已选中 tab 时 onChange 不触发,但此处仍触发)。
   * 在内部切换之前调用;你可 event.preventDefault() 阻断切换。
   * @param value 被点击 tab 的 value。
   * @param event 该次点击的原始鼠标事件,可 `preventDefault()` 阻断内部切换。
   */
  onTabClick?: (value: string, event: MouseEvent<HTMLDivElement>) => void;
  /**
   * 增删标签回调(对标 editable-card)。
   * @param value remove 时为被关闭项的 value;add 时为空串 ''。
   * @param action 动作类别:'remove'=点关闭按钮,'add'=点新增按钮。
   */
  onEdit?: (value: string, action: TabsEditAction) => void;
  /** 是否在 tablist 末尾渲染「新增标签」按钮,点击触发 onEdit('', 'add')。默认 false。 */
  addable?: boolean;
  /** 新增按钮文案 / 内容(ReactNode);默认为「+」符号。 */
  addLabel?: ReactNode;
  /** 外部类名(作用于最外层容器)。 */
  className?: string;
  /** 关键子部件类名。 */
  classNames?: TabsClassNames;
}

/** 把 useId 产物(含冒号)净化为可用作 DOM id 的串。 */
const sanitizeId = (raw: string): string => raw.replace(/:/g, '-');

/**
 * Tabs —— 标签页(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * - 受控(value + onChange)/ 非受控(defaultValue)双模式。
 * - tone × 7 色调走全库 tone resolver(只读 --ms-c / --ms-on-c / --ms-c-glow 等 6 槽位)。
 * - variant:underline(滑块下划线)/ pill(实底胶囊);size sm/md/lg 随密度缩放。
 * - orientation:横向 / 竖排,竖排键盘改 ↑/↓,indicator 沿块向滑动。
 * - 平滑 indicator:单条滑块测当前 tab 的 offset/size 写 CSS 变量,跨 tab 平滑位移(可降级)。
 * - 可编辑:TabItem.closable + addable + onEdit(value, 'add' | 'remove')。
 * - 留口:根 spread ...rest 透传所有原生属性 / 事件;classNames 精准定制子层;
 *   TabItem.icon/badge/renderTab/onClick;keepMounted 保留未选 panel。
 * - ARIA:role="tablist" + roving tabIndex,aria-selected / aria-controls / aria-labelledby。
 * - 事件:onChange / onTabClick / onEdit / onKeyDown / onFocus / onBlur,内部处理器全用
 *   composeEventHandlers 与用户传入合并(先你的、未 preventDefault 再内部)。
 * 样式见同目录 Tabs.css,需引入 @magic-scope/react/styles.css。
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      value,
      defaultValue,
      onChange,
      variant = 'underline',
      tone = 'primary',
      size = 'md',
      orientation = 'horizontal',
      keepMounted = false,
      onTabClick,
      onEdit,
      addable = false,
      addLabel,
      className,
      classNames,
      onKeyDown: onKeyDownProp,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const reactId = useId();
    const baseId = `ms-tabs-${sanitizeId(reactId)}`;

    const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
    const listRef = useRef<HTMLDivElement | null>(null);
    // indicator 的 CSS 变量挂在这里(滑块跨 tab 平滑位移)。
    const indicatorVars = useRef<CSSProperties>({});
    const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});

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

    const selectedIndex = items.findIndex((it) => it.value === selected);

    // —— 平滑 indicator:测当前选中 tab 的位置 / 尺寸,写成 CSS 变量驱动滑块平移 ——
    const measureIndicator = useCallback(() => {
      const node = selectedIndex >= 0 ? tabRefs.current[selectedIndex] : null;
      const list = listRef.current;
      if (!node || !list) {
        // 无选中项时把滑块缩没,避免悬空残留。
        const hidden: CSSProperties = { '--ms-tabs-ind-size': '0px' } as CSSProperties;
        indicatorVars.current = hidden;
        setIndicatorStyle(hidden);
        return;
      }
      const next: CSSProperties =
        orientation === 'vertical'
          ? ({
              '--ms-tabs-ind-pos': `${node.offsetTop}px`,
              '--ms-tabs-ind-size': `${node.offsetHeight}px`,
            } as CSSProperties)
          : ({
              '--ms-tabs-ind-pos': `${node.offsetLeft}px`,
              '--ms-tabs-ind-size': `${node.offsetWidth}px`,
            } as CSSProperties);
      indicatorVars.current = next;
      setIndicatorStyle(next);
    }, [orientation, selectedIndex]);

    // 选中项 / 朝向变化后同步测量(layout 阶段,避免可见跳动)。
    useLayoutEffect(() => {
      measureIndicator();
    }, [measureIndicator]);

    // 容器尺寸 / 字体变化(响应式、字体加载)时重测,保持滑块贴合。
    useEffect(() => {
      const list = listRef.current;
      if (!list || typeof ResizeObserver === 'undefined') {
        return;
      }
      const ro = new ResizeObserver(() => measureIndicator());
      ro.observe(list);
      for (const node of tabRefs.current) {
        if (node) {
          ro.observe(node);
        }
      }
      return () => ro.disconnect();
    }, [measureIndicator]);

    const activate = useCallback(
      (index: number) => {
        const item = items[index];
        if (!item || item.disabled) {
          return;
        }
        select(item.value);
        const node = tabRefs.current[index];
        node?.focus();
        // tablist 溢出时让当前 tab 滚入可视区;jsdom / 老环境无该 API 时静默跳过。
        node?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      },
      [items, select],
    );

    // 内部方向键处理(用户的 onKeyDown 已先于此执行;此处只补导航语义)。
    const internalKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        // 仅当焦点在某个 tab 上时才接管键盘(tab 是 div role="tab",需手动键盘语义)。
        const focusedIndex = tabRefs.current.indexOf(e.target as HTMLDivElement | null);
        if (focusedIndex < 0) {
          return;
        }
        // Enter / Space:激活当前 tab(div 不像原生 button 自动把键盘转为 click)。
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(focusedIndex);
          return;
        }
        const intent = resolveNavIntent(e.key, orientation);
        if (!intent) {
          return;
        }
        e.preventDefault();
        if (intent.type === 'move') {
          activate(nextEnabledIndex(items, focusedIndex, intent.dir));
        } else {
          const edge = edgeEnabledIndex(items, intent.dir);
          if (edge >= 0) {
            activate(edge);
          }
        }
      },
      [activate, items, orientation],
    );

    const handleTabClick = useCallback(
      (item: TabItem, index: number, event: MouseEvent<HTMLDivElement>) => {
        if (item.disabled) {
          return;
        }
        // 点击瞬间副作用入口:点已选中 tab 时 onChange 不触发,这里仍触发。
        onTabClick?.(item.value, event);
        if (event.defaultPrevented) {
          return;
        }
        activate(index);
      },
      [activate, onTabClick],
    );

    const handleClose = useCallback(
      (item: TabItem, event: MouseEvent<HTMLButtonElement>) => {
        // 阻止冒泡到 tab 按钮,避免「关闭即选中」。
        event.stopPropagation();
        onEdit?.(item.value, 'remove');
      },
      [onEdit],
    );

    const handleAdd = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (event.defaultPrevented) {
          return;
        }
        onEdit?.('', 'add');
      },
      [onEdit],
    );

    const activeItem = items.find((it) => it.value === selected && !it.disabled);
    // 关闭按钮 aria-label:复用字典 tag.remove(中文「移除」),无 tab 专用 key。
    const closeLabel = t('tag.remove', undefined, '移除');

    const classes = [
      'ms-tabs',
      `ms-tabs--${variant}`,
      `ms-tabs--${size}`,
      `ms-tabs--${orientation}`,
      `ms-tone-${tone}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const renderPanel = (item: TabItem): ReactNode => {
      if (item.content === undefined) {
        return null;
      }
      const isSelected = item.value === selected;
      // keepMounted:未选 panel 也渲染,用 hidden + aria 隐藏(保留 DOM 与状态)。
      if (!isSelected && !keepMounted) {
        return null;
      }
      return (
        <div
          key={item.value}
          role="tabpanel"
          id={`${baseId}-panel-${item.value}`}
          aria-labelledby={`${baseId}-tab-${item.value}`}
          hidden={!isSelected}
          tabIndex={isSelected ? 0 : -1}
          className={['ms-tabs__panel', classNames?.panel].filter(Boolean).join(' ')}
        >
          {item.content}
        </div>
      );
    };

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: 容器级 onKeyDown 用于委托方向键导航到 tab 并 compose 用户 onKeyDown;实际可交互角色在内部 role="tab" 按钮上
      <div
        ref={ref}
        className={classes}
        onKeyDown={composeEventHandlers(onKeyDownProp, internalKeyDown)}
        onFocus={onFocusProp as ((e: FocusEvent<HTMLDivElement>) => void) | undefined}
        onBlur={onBlurProp as ((e: FocusEvent<HTMLDivElement>) => void) | undefined}
        {...rest}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-orientation={orientation}
          className={['ms-tabs__list', classNames?.list].filter(Boolean).join(' ')}
        >
          {/* 单条滑块 indicator:跨 tab 平滑位移(测 offset/size 写 CSS 变量驱动) */}
          <span
            aria-hidden="true"
            className={['ms-tabs__indicator', classNames?.indicator].filter(Boolean).join(' ')}
            style={indicatorStyle}
          />
          {items.map((item, index) => {
            const isSelected = item.value === selected;
            const tabId = `${baseId}-tab-${item.value}`;
            const panelId = `${baseId}-panel-${item.value}`;
            const state: TabState = {
              selected: isSelected,
              disabled: Boolean(item.disabled),
              index,
            };
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: tab 的键盘语义(Enter/Space 激活、方向键导航)由 tablist 根容器 onKeyDown 统一委托,不在每个 tab 上重复挂
              <div
                key={item.value}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                role="tab"
                id={tabId}
                aria-selected={isSelected}
                aria-controls={item.content !== undefined ? panelId : undefined}
                aria-disabled={item.disabled || undefined}
                // roving tabIndex:仅选中项进 Tab 序,其余靠方向键到达;禁用项不进焦。
                tabIndex={isSelected && !item.disabled ? 0 : -1}
                className={[
                  'ms-tabs__tab',
                  isSelected && 'ms-tabs__tab--selected',
                  item.disabled && 'ms-tabs__tab--disabled',
                  item.closable && 'ms-tabs__tab--closable',
                  classNames?.tab,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={composeEventHandlers(item.onClick, (e) => handleTabClick(item, index, e))}
              >
                {item.renderTab ? (
                  item.renderTab(item, state)
                ) : (
                  <>
                    {item.icon != null && (
                      <span className="ms-tabs__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="ms-tabs__label">{item.label}</span>
                    {item.badge != null && <span className="ms-tabs__badge">{item.badge}</span>}
                  </>
                )}
                {item.closable && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={closeLabel}
                    className="ms-tabs__close"
                    onClick={(e) => handleClose(item, e)}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      width="12"
                      height="12"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
          {addable && (
            <button
              type="button"
              className="ms-tabs__add"
              aria-label="新增标签"
              onClick={handleAdd}
            >
              {addLabel ?? (
                <svg
                  viewBox="0 0 14 14"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M7 2v10M2 7h10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {keepMounted ? items.map(renderPanel) : activeItem ? renderPanel(activeItem) : null}
      </div>
    );
  },
);
Tabs.displayName = 'Tabs';
