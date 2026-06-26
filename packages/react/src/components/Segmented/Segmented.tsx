import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ForwardRefExoticComponent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from 'react';
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs } from '../../utils/compose';
import {
  indexOfValue,
  keyToAction,
  normalizeItems,
  resolveInitialIndex,
  type SegmentedOption,
  stepIndex,
} from './logic';

export type SegmentedSize = 'sm' | 'md' | 'lg';
export type SegmentedTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type SegmentedOrientation = 'horizontal' | 'vertical';
/** 无障碍语义:单选组(radiogroup/radio)或选项卡(tablist/tab)。 */
export type SegmentedRole = 'radiogroup' | 'tablist';

/** 对外复用选项类型(label 可为 ReactNode)。 */
export type { SegmentedOption };

/** 部件级 className 定制。 */
export interface SegmentedClassNames {
  /** 根容器(同 className,叠加)。 */
  root?: string;
  /** 滑块 indicator。 */
  indicator?: string;
  /** 单个段按钮。 */
  item?: string;
  /** 段内图标包裹。 */
  icon?: string;
  /** 段内文字 label。 */
  label?: string;
}

/** SSR 安全的同步布局副作用(服务端退化为 noop,避免 useLayoutEffect 警告)。 */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface SegmentedProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'role' | 'children'> {
  /** 选项:对象数组(label 可 ReactNode / icon / disabled),或纯值简写 ['a','b']。与 children 二选一。 */
  options?: ReadonlyArray<SegmentedOption | string | number> | undefined;
  /** 复合子节点用法:<Segmented.Item value="a">…</Segmented.Item>。与 options 二选一。 */
  children?: ReactNode;
  /** 当前选中值(受控)。 */
  value?: string | undefined;
  /** 默认选中值(非受控)。省略时默认首个可用项。 */
  defaultValue?: string | undefined;
  /**
   * 选中变化。
   * @param value 选中后的新值。
   * @param item 选中项对应的完整 SegmentedOption(含 label / icon / disabled 等)。
   */
  onChange?: (value: string, item: SegmentedOption) => void;
  /**
   * 选中变化(仅 value)双通道之一,便于受控简写。
   * @param value 选中后的新值。
   */
  onValueChange?: (value: string) => void;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: SegmentedSize;
  /** 语义色调,派生选中底色 / 发光。默认 primary。 */
  tone?: SegmentedTone;
  /** 朝向:横向或纵向堆叠。默认 horizontal。 */
  orientation?: SegmentedOrientation;
  /** 块级铺满容器、各段等分。 */
  block?: boolean;
  /** block 的别名(对齐 Button.fullWidth 命名习惯)。 */
  fullWidth?: boolean;
  /** 禁用整个控件。 */
  disabled?: boolean;
  /** 无障碍语义:单选组(默认)或选项卡。 */
  role?: SegmentedRole;
  /** 部件级 className。 */
  classNames?: SegmentedClassNames | undefined;
  /** 自定义渲染段内容(覆盖默认 icon+label 布局)。 */
  renderItem?: (item: SegmentedOption, state: { selected: boolean; index: number }) => ReactNode;
  /** 无可见 label 时的无障碍名称。 */
  'aria-label'?: string;
  /** 关联可见 label 的 id。 */
  'aria-labelledby'?: string;
}

interface SegmentedItemProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** 选项值(唯一)。 */
  value: string;
  /** 是否禁用该段。 */
  disabled?: boolean;
  /** 段前置图标。 */
  icon?: ReactNode;
  children?: ReactNode;
}

/**
 * Segmented.Item —— 复合子组件,仅作为 children 用法的数据载体(由 Segmented 收集 props,
 * 不自渲染 DOM)。这样既能享受 JSX 直觉式书写,又复用同一套受控 / 键盘 / indicator 逻辑。
 */
function SegmentedItemComponent(_props: SegmentedItemProps): null {
  return null;
}
SegmentedItemComponent.displayName = 'Segmented.Item';

/** 从复合 children 收集为 SegmentedOption[]。 */
function itemsFromChildren(children: ReactNode): SegmentedOption[] {
  const collected: SegmentedOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    const el = child as ReactElement<SegmentedItemProps>;
    const { value, disabled, icon, children: content } = el.props;
    if (value == null) {
      return;
    }
    // 复合用法以 children 作为段内容(label)。
    collected.push({ value, label: content, icon, disabled });
  });
  return collected;
}

/**
 * Segmented —— 分段控制器(旗舰深度组件)。紧凑的 tab / radio 替代,对标 AntD Segmented。
 * 自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 单个滑块 indicator 平滑跨段位移:测量选中段的 offset / 尺寸写进 CSS 变量,过渡受 motion 双降级。
 * 接全库 tone 槽位(选中底色 / 发光只读 --ms-c*,不写死配色);尺寸随密度缩放;
 * 数据入口:options 数组(对象 / 纯值简写)或复合 <Segmented.Item>;label 支持 ReactNode + icon。
 * 受控 value/defaultValue + onChange(value,item)/onValueChange 双通道;
 * 键盘 ArrowLeft/Right(纵向 Up/Down)/Home/End 导航(跳过禁用、环形)+ Enter/Space 选中,roving tabindex;
 * 无障碍:role=radiogroup/radio(默认)或 tablist/tab;留口:renderItem、classNames 部件定制、...rest 透传。
 * 样式见同目录 Segmented.css,需引入 @magic-scope/react/styles.css。
 */
const SegmentedRoot = forwardRef<HTMLDivElement, SegmentedProps>((props, ref) => {
  const {
    options,
    children,
    value,
    defaultValue,
    onChange,
    onValueChange,
    size = 'md',
    tone = 'primary',
    orientation = 'horizontal',
    block = false,
    fullWidth = false,
    disabled = false,
    role = 'radiogroup',
    classNames,
    renderItem,
    className,
    style,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  } = props;

  // i18n:无可见 label 时的无障碍名走字典 segmented.label(默认「分段选择」)。
  const t = useMessages();
  const reactId = useId();
  const baseId = `ms-segmented-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // 数据入口:options 优先,否则收集复合 children。
  const items = useMemo<SegmentedOption[]>(
    () => (options != null ? normalizeItems(options) : itemsFromChildren(children)),
    [options, children],
  );

  const isFull = block || fullWidth;
  const isTablist = role === 'tablist';

  // —— 选中值:受控 / 非受控 ——
  const isControlled = value !== undefined;
  const [valueInternal, setValueInternal] = useState<string | undefined>(
    () => defaultValue ?? items[resolveInitialIndex(items, defaultValue)]?.value,
  );
  const currentValue = isControlled ? value : valueInternal;
  const selectedIndex = indexOfValue(items, currentValue);

  // roving focus:当前可聚焦的段索引。默认落在选中段 / 首个可用段。
  const [focusIndex, setFocusIndex] = useState<number>(() =>
    resolveInitialIndex(items, currentValue),
  );

  // items / 选中变化时,把 focus 收敛到有效索引(避免删项后越界)。
  useEffect(() => {
    setFocusIndex((prev) => {
      if (prev >= 0 && prev < items.length && !items[prev]?.disabled) {
        return prev;
      }
      return resolveInitialIndex(items, currentValue);
    });
  }, [items, currentValue]);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // —— indicator 测量:量出选中段相对根的 offset / 尺寸,写进 CSS 变量,实现滑块平移 ——
  const [indicator, setIndicator] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    visible: boolean;
  }>({ x: 0, y: 0, w: 0, h: 0, visible: false });

  const measure = useCallback(() => {
    const root = rootRef.current;
    const el = itemRefs.current[selectedIndex];
    if (!root || !el || selectedIndex < 0) {
      setIndicator((p) => (p.visible ? { ...p, visible: false } : p));
      return;
    }
    // offsetLeft/Top 相对最近定位祖先(根设 position:relative),无需逐帧 getBoundingClientRect。
    setIndicator({
      x: el.offsetLeft,
      y: el.offsetTop,
      w: el.offsetWidth,
      h: el.offsetHeight,
      visible: true,
    });
  }, [selectedIndex]);

  // 同步测量:选中 / items / 尺寸 / 朝向变化后,在 paint 前定位滑块,避免首帧闪烁。
  useIsoLayoutEffect(() => {
    measure();
  }, [measure, size, orientation, isFull, items.length]);

  // 容器尺寸变化(响应式 / 字体加载 / 内容回流)重新测量。
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') {
      return;
    }
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    for (const el of itemRefs.current) {
      if (el) {
        ro.observe(el);
      }
    }
    return () => ro.disconnect();
  }, [measure]);

  const commit = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item || item.disabled || disabled) {
        return;
      }
      setFocusIndex(index);
      if (item.value === currentValue) {
        return;
      }
      if (!isControlled) {
        setValueInternal(item.value);
      }
      onChange?.(item.value, item);
      onValueChange?.(item.value);
    },
    [items, disabled, currentValue, isControlled, onChange, onValueChange],
  );

  const focusItemAt = useCallback((index: number) => {
    const el = itemRefs.current[index];
    el?.focus();
  }, []);

  // —— 键盘:方向键 roving + Home/End,Enter/Space 选中(纯语义在 logic) ——
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      const action = keyToAction(e.key, orientation);
      if (!action) {
        return;
      }
      e.preventDefault();
      if (action.type === 'select') {
        commit(focusIndex);
        return;
      }
      const from = focusIndex < 0 ? resolveInitialIndex(items, currentValue) : focusIndex;
      const next = stepIndex(items, from, action);
      if (next < 0 || next === from) {
        return;
      }
      setFocusIndex(next);
      focusItemAt(next);
      // radiogroup 语义:roving 即选中(WAI-ARIA radio 模式),tablist 仅移焦不自动激活。
      if (!isTablist) {
        commit(next);
      }
    },
    [disabled, orientation, focusIndex, items, currentValue, commit, focusItemAt, isTablist],
  );

  const rootClasses = [
    'ms-segmented',
    `ms-segmented--${size}`,
    `ms-tone-${tone}`,
    `ms-segmented--${orientation}`,
    isFull && 'ms-segmented--block',
    disabled && 'ms-segmented--disabled',
    classNames?.root,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const rootStyle: CSSProperties = {
    ...style,
    // indicator 位置 / 尺寸经 CSS 变量驱动,过渡由 CSS 负责(可被 motion 降级)。
    ['--ms-segmented-x' as string]: `${indicator.x}px`,
    ['--ms-segmented-y' as string]: `${indicator.y}px`,
    ['--ms-segmented-w' as string]: `${indicator.w}px`,
    ['--ms-segmented-h' as string]: `${indicator.h}px`,
  };

  // 无可见名时给 group 兜底无障碍名(避免读屏对 radiogroup/tablist 失名)。
  const resolvedAriaLabel =
    ariaLabel ?? (ariaLabelledby == null ? t('segmented.label') : undefined);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: 容器 role=radiogroup/tablist 即交互角色,onKeyDown 是 WAI-ARIA 要求的方向键导航,不是静态元素
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: biome 把 div 当 static 故误报;运行时 role=radiogroup/tablist 均支持 aria-label/aria-disabled/aria-orientation
    <div
      ref={composeRefs(ref, rootRef)}
      role={role}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledby}
      aria-disabled={disabled || undefined}
      aria-orientation={isTablist ? orientation : undefined}
      data-orientation={orientation}
      className={rootClasses}
      style={rootStyle}
      onKeyDown={composeEventHandlers(
        onKeyDown as (e: KeyboardEvent<HTMLDivElement>) => void,
        handleKeyDown,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        data-visible={indicator.visible ? '' : undefined}
        className={['ms-segmented__indicator', classNames?.indicator].filter(Boolean).join(' ')}
      />
      {items.map((item, index) => {
        const selected = index === selectedIndex;
        const itemDisabled = disabled || item.disabled === true;
        // roving tabindex:仅 focusIndex 段进 Tab 序;其余 -1,方向键内部移动。
        const tabIndex = index === focusIndex && !itemDisabled ? 0 : -1;
        const itemId = `${baseId}-item-${index}`;
        const content = item.label != null && item.label !== '' ? item.label : item.value;
        return (
          // biome-ignore lint/a11y/useAriaPropsSupportedByRole: biome 未跟踪运行时 role;role=radio 支持 aria-checked、role=tab 支持 aria-selected,本组件按 isTablist 互斥设置
          <button
            key={item.value}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            id={itemId}
            role={isTablist ? 'tab' : 'radio'}
            aria-checked={isTablist ? undefined : selected}
            aria-selected={isTablist ? selected : undefined}
            aria-disabled={itemDisabled || undefined}
            disabled={itemDisabled}
            tabIndex={tabIndex}
            data-value={item.value}
            data-selected={selected ? '' : undefined}
            className={[
              'ms-segmented__item',
              selected && 'ms-segmented__item--selected',
              itemDisabled && 'ms-segmented__item--disabled',
              classNames?.item,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => commit(index)}
            // 指针按下即接管 roving 焦点(避免 click 前先 focus 引发的额外渲染)。
            onFocus={() => {
              if (!itemDisabled) {
                setFocusIndex(index);
              }
            }}
          >
            {renderItem ? (
              renderItem(item, { selected, index })
            ) : (
              <span className="ms-segmented__inner">
                {item.icon != null && (
                  <span
                    className={['ms-segmented__icon', classNames?.icon].filter(Boolean).join(' ')}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}
                {content != null && content !== '' && (
                  <span
                    className={['ms-segmented__label', classNames?.label].filter(Boolean).join(' ')}
                  >
                    {content}
                  </span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
SegmentedRoot.displayName = 'Segmented';

interface SegmentedComponent
  extends ForwardRefExoticComponent<SegmentedProps & RefAttributes<HTMLDivElement>> {
  /** 复合子组件:<Segmented.Item value="…">内容</Segmented.Item>。 */
  Item: typeof SegmentedItemComponent;
}

/**
 * 对外的 Segmented:在 forwardRef 根上挂载复合子组件 Item,并把类型收敛为携带 .Item 的复合组件,
 * 让 <Segmented.Item> 既能运行也有类型。
 */
export const Segmented = Object.assign(SegmentedRoot, {
  Item: SegmentedItemComponent,
}) as SegmentedComponent;

/** 复合子组件别名(也可经 Segmented.Item 取用)。 */
export const SegmentedItem = SegmentedItemComponent;
export type { SegmentedItemProps };
