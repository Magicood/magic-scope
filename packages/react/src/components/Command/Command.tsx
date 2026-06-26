import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Dialog, type DialogProps } from '../Dialog/Dialog';
import {
  type CommandFilterMode,
  type CommandItemLike,
  edgeEnabledIndex,
  filterItems,
  type MatchRange,
  nextEnabledIndex,
  segmentLabel,
} from './logic';

export type { CommandFilterMode, MatchRange } from './logic';

export type CommandTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * 自定义过滤函数:给定项的匹配文本(label + keywords 已小写拼接)与当前 query(小写),
 * 返回是否命中。返回 undefined 走内置过滤(子串 / fuzzy)。
 * @param value 项的 value。
 * @param search 当前查询串(原样,未小写)。
 * @param keywords 项的 keywords(原样)。
 */
export type CommandFilterFn = (
  value: string,
  search: string,
  keywords?: readonly string[],
) => boolean;

/** 注册进根的单个 item 的运行时记录。 */
interface ItemRecord {
  value: string;
  label: string;
  keywords?: readonly string[] | undefined;
  disabled: boolean;
}

/** 根上下文:子部件读它拿状态与注册接口。 */
interface CommandContextValue {
  /** 基础 id,派生 input / list / option 的 id。 */
  baseId: string;
  /** 当前查询串(受控 / 非受控统一出口)。 */
  search: string;
  /** 改查询串(输入框调用)。 */
  setSearch: (next: string) => void;
  /** 当前高亮选中项的 value(键盘 / 悬停驱动)。 */
  activeValue: string | null;
  /** 设置高亮项 value(悬停时调用)。 */
  setActiveValue: (value: string | null) => void;
  /** 注册一个 item(挂载 / 更新时调用),返回注销函数。 */
  register: (record: ItemRecord) => () => void;
  /** 判断某项在当前 query 下是否可见。 */
  isVisible: (value: string) => boolean;
  /** 取某项 label 的高亮区间(随 query 变化)。 */
  rangesFor: (value: string) => MatchRange[];
  /** 触发某项选中(点击 / Enter)。 */
  select: (value: string) => void;
  /** 当前可见可选项数(供 Empty 判断是否显示空态)。 */
  visibleCount: number;
  /** option 的 id 前缀,拼 value 得到 aria-activedescendant 目标。 */
  optionId: (value: string) => string;
}

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommandContext(part: string): CommandContextValue {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error(`<Command.${part}> 必须用在 <Command> 内部`);
  }
  return ctx;
}

export interface CommandProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  /** 受控查询串。传入即受控,需配合 onValueChange。 */
  value?: string;
  /** 非受控初始查询串。默认空串。 */
  defaultValue?: string;
  /**
   * 查询串变化回调(受控 / 非受控双通道都会触发)。
   * @param value 变化后的查询串。
   */
  onValueChange?: (value: string) => void;
  /**
   * 任一项被选中时的统一回调(集中埋点 / 分发)。
   * @param value 被选中项的 value。
   */
  onSelect?: (value: string) => void;
  /** 语义色调,经全库 tone resolver 派生高亮 / 辉光配色。默认 primary。 */
  tone?: CommandTone;
  /** 过滤模式:substring(默认,连续子串)| fuzzy(允许跳字符)。 */
  filterMode?: CommandFilterMode;
  /** 是否禁用内置过滤(由外部数据源自行过滤,组件只渲染传入项)。默认 false。 */
  shouldFilter?: boolean;
  /** 自定义过滤判定(覆盖内置 substring / fuzzy)。返回 true 表示命中。 */
  filter?: CommandFilterFn;
  /** 是否循环导航(到端点回绕)。默认 true。 */
  loop?: boolean;
  /** 关键子部件 className 定制。 */
  classNames?: {
    /** 根 .ms-command */
    root?: string;
  };
  children?: ReactNode;
}

/**
 * Command —— 命令面板(⌘K)旗舰深度组件。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 组合式 API:Command(根,管 search + 高亮项状态,受控 value / onValueChange)+ Command.Input(搜索框)+
 * Command.List(可滚动列表)+ Command.Group(带标题分组)+ Command.Item(可选项,value/keywords/disabled/onSelect)+
 * Command.Empty(无结果)+ Command.Separator(分隔线)。另配 Command.Dialog(复用 Dialog 包成 ⌘K 模态,可监听 mod+k 打开)。
 *
 * 纯逻辑(过滤 + 高亮区间 + 分组拍平 + 键盘落点)在同目录 logic.ts(零 React 依赖,可平移 core)。
 * 键盘:↑↓ 移动(跳过禁用 / 组头)、Enter 选中、Home/End、输入即过滤;命中片段 <mark> 高亮。
 * a11y:input role=combobox aria-expanded aria-controls aria-activedescendant;list role=listbox;item role=option aria-selected。
 * 样式见同目录 Command.css,需引入 @magic-scope/react/styles.css。
 */
const CommandRoot = forwardRef<HTMLDivElement, CommandProps>(
  (
    {
      value: valueProp,
      defaultValue = '',
      onValueChange,
      onSelect,
      tone = 'primary',
      filterMode = 'substring',
      shouldFilter = true,
      filter,
      loop = true,
      classNames,
      className,
      onKeyDown,
      children,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    const baseId = `ms-command-${reactId.replace(/:/g, '-')}`;

    // 受控 / 非受控查询串。
    const isControlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const search = isControlled ? valueProp : uncontrolled;

    const setSearch = useCallback(
      (next: string) => {
        if (!isControlled) {
          setUncontrolled(next);
        }
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    // item 注册表:子项挂载时注册,卸载时注销。用对象 ref 存以避免渲染期写 state。
    const itemsRef = useRef<Map<string, ItemRecord>>(new Map());
    // 注册顺序(决定可见序列的相对顺序)。
    const orderRef = useRef<string[]>([]);
    // 注册 / 注销触发一次重算用的版本号(进 useMemo 依赖以在注册表变化时重算可见项)。
    const [registryTick, forceTick] = useState(0);
    const bump = useCallback(() => forceTick((n) => n + 1), []);

    const register = useCallback(
      (record: ItemRecord) => {
        itemsRef.current.set(record.value, record);
        if (!orderRef.current.includes(record.value)) {
          orderRef.current.push(record.value);
        }
        bump();
        return () => {
          itemsRef.current.delete(record.value);
          orderRef.current = orderRef.current.filter((v) => v !== record.value);
          bump();
        };
      },
      [bump],
    );

    const [activeValue, setActiveValue] = useState<string | null>(null);

    // —— 计算可见项 + 高亮区间(随 search / 注册表变化) ——
    // 把注册表按注册顺序整成数组,丢给 logic.filterItems。
    const { visibleValues, rangeMap } = useMemo(() => {
      // 读 registryTick 把它变成 memo 的真实依赖:注册 / 注销项时(itemsRef / orderRef 被 mutate)
      // tick 自增 → 触发重算可见序列(ref 本身的 mutate 不会被 React 感知)。
      void registryTick;
      const ordered: CommandItemLike[] = orderRef.current
        .map((v) => itemsRef.current.get(v))
        .filter((r): r is ItemRecord => r !== undefined)
        .map((r) => ({
          value: r.value,
          label: r.label,
          keywords: r.keywords,
          disabled: r.disabled,
        }));

      const ranges = new Map<string, MatchRange[]>();

      // shouldFilter=false:外部已过滤,全部可见、无高亮。
      if (!shouldFilter || search.trim() === '') {
        for (const it of ordered) {
          ranges.set(it.value, []);
        }
        return { visibleValues: ordered.map((it) => it.value), rangeMap: ranges };
      }

      // 自定义 filter:逐项判定,命中无高亮区间(由调用方决定语义)。
      if (filter) {
        const visible: string[] = [];
        for (const it of ordered) {
          if (filter(it.value, search, it.keywords)) {
            visible.push(it.value);
            ranges.set(it.value, []);
          }
        }
        return { visibleValues: visible, rangeMap: ranges };
      }

      // 内置过滤:substring / fuzzy + 高亮区间 + 排序。
      const results = filterItems(ordered, search, { fuzzy: filterMode === 'fuzzy' });
      for (const r of results) {
        ranges.set(r.item.value, r.ranges);
      }
      return { visibleValues: results.map((r) => r.item.value), rangeMap: ranges };
    }, [search, shouldFilter, filter, filterMode, registryTick]);

    // 可见且未禁用的项 value,按可见顺序 —— 键盘导航序列。
    const selectableValues = useMemo(
      () => visibleValues.filter((v) => !itemsRef.current.get(v)?.disabled),
      [visibleValues],
    );

    const isVisible = useCallback(
      (value: string) => visibleValues.includes(value),
      [visibleValues],
    );
    const rangesFor = useCallback((value: string) => rangeMap.get(value) ?? [], [rangeMap]);

    // query / 列表变化后,把高亮项纠正到第一个可选项(若当前项已不可见 / 不可选)。
    useEffect(() => {
      if (selectableValues.length === 0) {
        if (activeValue !== null) {
          setActiveValue(null);
        }
        return;
      }
      if (activeValue === null || !selectableValues.includes(activeValue)) {
        setActiveValue(selectableValues[0] ?? null);
      }
    }, [selectableValues, activeValue]);

    const select = useCallback(
      (value: string) => {
        const record = itemsRef.current.get(value);
        if (!record || record.disabled) {
          return;
        }
        onSelect?.(value);
      },
      [onSelect],
    );

    // —— 键盘:↑↓ 移动(跳过禁用 / 组头,序列已不含)、Home/End、Enter 选中 ——
    const moveActive = useCallback(
      (dir: 1 | -1, edge: boolean) => {
        const total = selectableValues.length;
        if (total === 0) {
          return;
        }
        const current = activeValue ? selectableValues.indexOf(activeValue) : -1;
        let nextIdx: number;
        if (edge) {
          nextIdx = edgeEnabledIndex(total, dir);
        } else if (!loop) {
          // 非循环:夹在端点。
          const raw = current < 0 ? (dir === 1 ? 0 : total - 1) : current + dir;
          nextIdx = Math.max(0, Math.min(total - 1, raw));
        } else {
          nextIdx = nextEnabledIndex(current, dir, total);
        }
        const nextValue = selectableValues[nextIdx];
        if (nextValue) {
          setActiveValue(nextValue);
        }
      },
      [selectableValues, activeValue, loop],
    );

    const handleKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            moveActive(1, false);
            break;
          case 'ArrowUp':
            e.preventDefault();
            moveActive(-1, false);
            break;
          case 'Home':
            e.preventDefault();
            moveActive(-1, true);
            break;
          case 'End':
            e.preventDefault();
            moveActive(1, true);
            break;
          case 'Enter':
            if (activeValue) {
              e.preventDefault();
              select(activeValue);
            }
            break;
          default:
            break;
        }
      },
      [moveActive, activeValue, select],
    );

    // value → 稳定序号:不同 value 永不碰撞(无损映射),避免有损转义把
    // "a/b" 与 "a.b" 撞成同一个 DOM id(进而 aria-activedescendant 指向错误 option)。
    const optionOrdinals = useRef(new Map<string, number>());
    const optionId = useCallback(
      (value: string) => {
        const map = optionOrdinals.current;
        let ordinal = map.get(value);
        if (ordinal === undefined) {
          ordinal = map.size;
          map.set(value, ordinal);
        }
        return `${baseId}-opt-${ordinal}`;
      },
      [baseId],
    );

    const ctx = useMemo<CommandContextValue>(
      () => ({
        baseId,
        search,
        setSearch,
        activeValue,
        setActiveValue,
        register,
        isVisible,
        rangesFor,
        select,
        visibleCount: selectableValues.length,
        optionId,
      }),
      [
        baseId,
        search,
        setSearch,
        activeValue,
        register,
        isVisible,
        rangesFor,
        select,
        selectableValues.length,
        optionId,
      ],
    );

    const rootClass = ['ms-command', `ms-tone-${tone}`, classNames?.root, className]
      .filter(Boolean)
      .join(' ');

    return (
      <CommandContext.Provider value={ctx}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: 命令面板根承接列表级键盘导航(↑↓/Enter/Home/End),内部控件(input/option)仍各自可达 */}
        <div
          ref={ref}
          className={rootClass}
          data-ms-command=""
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          {...rest}
        >
          {children}
        </div>
      </CommandContext.Provider>
    );
  },
);
CommandRoot.displayName = 'Command';

/* —— Command.Input —— */

export interface CommandInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'value'> {
  /** 前置图标(装饰性,aria-hidden)。 */
  icon?: ReactNode;
}

/**
 * Command.Input —— 搜索框。role=combobox,关联 listbox 与高亮项(aria-activedescendant)。
 * 占位文案默认取 i18n `select.search`(可用 placeholder 覆盖)。输入即驱动根过滤。
 */
export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ icon, className, placeholder, onChange, ...props }, ref) => {
    const ctx = useCommandContext('Input');
    const t = useMessages();
    return (
      <div className="ms-command__input-row">
        <span className="ms-command__input-icon" aria-hidden="true">
          {icon ?? <SearchGlyph />}
        </span>
        <input
          ref={ref}
          type="text"
          role="combobox"
          aria-expanded
          aria-controls={`${ctx.baseId}-list`}
          aria-activedescendant={ctx.activeValue ? ctx.optionId(ctx.activeValue) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={['ms-command__input', className].filter(Boolean).join(' ')}
          placeholder={placeholder ?? t('select.search', undefined, '搜索…')}
          value={ctx.search}
          onChange={composeEventHandlers(onChange, (e) => ctx.setSearch(e.target.value))}
          {...props}
        />
      </div>
    );
  },
);
CommandInput.displayName = 'Command.Input';

/* —— Command.List —— */

export interface CommandListProps extends ComponentPropsWithoutRef<'div'> {
  /** 无障碍标签(listbox 的可读名)。 */
  label?: string;
  children?: ReactNode;
}

/**
 * Command.List —— 可滚动结果列表容器。role=listbox,被 Input 的 aria-controls 关联。
 */
export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, label, children, ...props }, ref) => {
    const ctx = useCommandContext('List');
    return (
      <div
        ref={ref}
        id={`${ctx.baseId}-list`}
        role="listbox"
        aria-label={label}
        className={['ms-command__list', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandList.displayName = 'Command.List';

/* —— Command.Group —— */

export interface CommandGroupProps extends ComponentPropsWithoutRef<'div'> {
  /** 分组标题(组头,不可选)。 */
  heading?: ReactNode;
  children?: ReactNode;
}

/**
 * Command.Group —— 带标题的分组(role=group,标题为组头,不可选)。
 * 组内所有项都被过滤后,整组(含标题)自动隐藏。
 */
export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, className, children, ...props }, ref) => {
    const ctx = useCommandContext('Group');
    const headingId = useId();
    // 子项里只要有一个可见,整组就显示。用 ref 收集组内项 value。
    const groupValuesRef = useRef<Set<string>>(new Set());
    const groupCtx = useMemo<GroupContextValue>(
      () => ({
        register: (value: string) => {
          groupValuesRef.current.add(value);
          return () => groupValuesRef.current.delete(value);
        },
      }),
      [],
    );
    // 任一组内项可见 → 显示组。依赖根 search 变化重算。
    const anyVisible = [...groupValuesRef.current].some((v) => ctx.isVisible(v));
    const hidden = groupValuesRef.current.size > 0 && !anyVisible;

    // 整组被过滤时:用 hidden 隐藏容器、且不渲染组头与 group 角色,但 children 始终保持挂载
    // (Item 注册副作用不能因隐藏而卸载,否则清空搜索后项就丢了)。
    return (
      <GroupContext.Provider value={groupCtx}>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA group 容器,语义为分组,非表单 fieldset */}
        <div
          ref={ref}
          role="group"
          aria-labelledby={!hidden && heading != null ? headingId : undefined}
          className={['ms-command__group', className].filter(Boolean).join(' ')}
          hidden={hidden || undefined}
          {...props}
        >
          {!hidden && heading != null && (
            <div id={headingId} role="presentation" className="ms-command__group-heading">
              {heading}
            </div>
          )}
          {children}
        </div>
      </GroupContext.Provider>
    );
  },
);
CommandGroup.displayName = 'Command.Group';

/** 组上下文:让组内 Item 注册自身 value 到所属组(用于整组可见性判断)。 */
interface GroupContextValue {
  register: (value: string) => () => void;
}
const GroupContext = createContext<GroupContextValue | null>(null);

/* —— Command.Item —— */

export interface CommandItemProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  /** 唯一值。省略则取 label 文本(children 为字符串时)。 */
  value: string;
  /** 额外匹配关键词(命中算入过滤,不参与 label 高亮)。 */
  keywords?: readonly string[];
  /** 是否禁用(渲染但不可选、键盘跳过)。 */
  disabled?: boolean;
  /** 前置图标(装饰性)。 */
  icon?: ReactNode;
  /** 右侧附属内容(如快捷键 / 标签)。 */
  shortcut?: ReactNode;
  /**
   * 选中回调(点击 / Enter)。
   * @param value 本项的 value。
   */
  onSelect?: (value: string) => void;
  children?: ReactNode;
}

/**
 * Command.Item —— 可选项。role=option,命中高亮(<mark>)、aria-selected 跟随键盘高亮。
 * 用 children 字符串(或 keywords)参与过滤;命中片段自动 <mark> 包裹。
 */
export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  (
    {
      value,
      keywords,
      disabled = false,
      icon,
      shortcut,
      onSelect,
      className,
      children,
      onClick,
      onPointerMove,
      ...props
    },
    ref,
  ) => {
    const ctx = useCommandContext('Item');
    const group = useContext(GroupContext);

    // 取参与过滤 / 高亮的纯文本 label(children 为字符串时),否则退而用 value。
    const label = typeof children === 'string' ? children : value;

    // 注册到根(过滤 / 导航)与所属组(整组可见性)。
    useEffect(() => {
      const unreg = ctx.register({ value, label, keywords, disabled });
      return unreg;
    }, [ctx.register, value, label, keywords, disabled]);

    useEffect(() => {
      if (!group) {
        return;
      }
      return group.register(value);
    }, [group, value]);

    const visible = ctx.isVisible(value);
    const active = ctx.activeValue === value && !disabled;
    const ranges = ctx.rangesFor(value);

    if (!visible) {
      return null;
    }

    // 命中高亮:children 为字符串时按区间切片包 <mark>,否则原样渲染。
    const content =
      typeof children === 'string' && ranges.length > 0
        ? segmentLabel(children, ranges).map((seg, i) =>
            seg.match ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: 片段由确定性区间切分,顺序稳定
              <mark key={i} className="ms-command__highlight">
                {seg.text}
              </mark>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: 同上,纯展示片段无重排
              <span key={i}>{seg.text}</span>
            ),
          )
        : children;

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘选中由根 keydown(Enter)统一处理,这里只挂指针交互
      <div
        ref={ref}
        id={ctx.optionId(value)}
        role="option"
        // aria-activedescendant 模式:焦点留在 input,option 只需可作为活动后代被指向,故 tabIndex=-1。
        tabIndex={-1}
        aria-selected={active}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-active={active || undefined}
        className={['ms-command__item', className].filter(Boolean).join(' ')}
        onClick={composeEventHandlers(
          onClick as ((e: { defaultPrevented?: boolean }) => void) | undefined,
          () => {
            if (disabled) {
              return;
            }
            onSelect?.(value);
            ctx.select(value);
          },
        )}
        onPointerMove={composeEventHandlers(onPointerMove, () => {
          if (!disabled && ctx.activeValue !== value) {
            ctx.setActiveValue(value);
          }
        })}
        {...props}
      >
        {icon != null && (
          <span className="ms-command__item-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ms-command__item-label">{content}</span>
        {shortcut != null && <span className="ms-command__item-shortcut">{shortcut}</span>}
      </div>
    );
  },
);
CommandItem.displayName = 'Command.Item';

/* —— Command.Empty —— */

export interface CommandEmptyProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

/**
 * Command.Empty —— 无结果占位。仅当当前 query 下没有任何可见可选项时渲染。
 * 默认文案取 i18n `select.empty`。
 */
export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useCommandContext('Empty');
    const t = useMessages();
    if (ctx.visibleCount > 0) {
      return null;
    }
    return (
      <div
        ref={ref}
        role="presentation"
        className={['ms-command__empty', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children ?? t('select.empty', undefined, '无匹配项')}
      </div>
    );
  },
);
CommandEmpty.displayName = 'Command.Empty';

/* —— Command.Separator —— */

/** Command.Separator —— 列表分隔线(<hr> 隐含 role=separator)。 */
export const CommandSeparator = forwardRef<HTMLHRElement, ComponentPropsWithoutRef<'hr'>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={['ms-command__separator', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
CommandSeparator.displayName = 'Command.Separator';

/* —— Command.Dialog —— */

export interface CommandDialogProps extends CommandProps {
  /** 是否打开(受控)。 */
  open: boolean;
  /**
   * 开合变化回调(Esc / 点遮罩 / mod+k 切换)。
   * @param open 变化后的目标显隐:true 打开,false 关闭。
   */
  onOpenChange?: (open: boolean) => void;
  /** 监听 mod+k(⌘K / Ctrl+K)全局切换打开。默认 false(由调用方自行控制 open)。 */
  hotkey?: boolean;
  /** 透传给底层 Dialog 的属性(size / placement / classNames 等)。 */
  dialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'onOpenChange' | 'children'>;
}

/**
 * Command.Dialog —— 把 Command 包进 Dialog 的 ⌘K 模态:
 * 复用 Dialog 的原生 <dialog> + showModal(焦点陷阱 / Esc / top-layer)。
 * `hotkey` 开启后监听 mod+k 全局切换显隐(⌘K / Ctrl+K)。打开后自动聚焦搜索框。
 */
export const CommandDialog = forwardRef<HTMLDivElement, CommandDialogProps>(
  ({ open, onOpenChange, hotkey = false, dialogProps, children, ...commandProps }, ref) => {
    // mod+k 全局热键:切换开合。
    useEffect(() => {
      if (!hotkey) {
        return;
      }
      const onKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          onOpenChange?.(!open);
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [hotkey, open, onOpenChange]);

    const handleClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        hideCloseButton
        {...dialogProps}
        classNames={{ panel: 'ms-command__dialog-panel', ...dialogProps?.classNames }}
      >
        <CommandRoot ref={ref} className="ms-command--dialog" {...commandProps}>
          {children}
        </CommandRoot>
      </Dialog>
    );
  },
);
CommandDialog.displayName = 'Command.Dialog';

/* —— 装饰图标 —— */

const SearchGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
  </svg>
);

/* —— 命名空间挂载 —— */

type CommandComponent = typeof CommandRoot & {
  Input: typeof CommandInput;
  List: typeof CommandList;
  Group: typeof CommandGroup;
  Item: typeof CommandItem;
  Empty: typeof CommandEmpty;
  Separator: typeof CommandSeparator;
  Dialog: typeof CommandDialog;
};

const CommandWithParts = CommandRoot as CommandComponent;
CommandWithParts.Input = CommandInput;
CommandWithParts.List = CommandList;
CommandWithParts.Group = CommandGroup;
CommandWithParts.Item = CommandItem;
CommandWithParts.Empty = CommandEmpty;
CommandWithParts.Separator = CommandSeparator;
CommandWithParts.Dialog = CommandDialog;

/**
 * Command —— 命令面板根组件,带 .Input / .List / .Group / .Item / .Empty / .Separator / .Dialog 子部件。
 */
export const Command = CommandWithParts;
