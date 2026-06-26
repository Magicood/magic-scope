import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
} from 'react';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { type AutoCompleteOptionLike, filterOptions, findEnabledIndex } from './logic';

export type AutoCompleteSize = 'sm' | 'md' | 'lg';
export type AutoCompleteTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** 单个候选项。`value` 即选中后填入输入框的文本;`label` 缺省时回退 value 展示。 */
export interface AutoCompleteOption {
  /** 候选值;选中后填入输入框,也是组件「值」的来源。 */
  value: string;
  /** 显示文本(缺省回退 value)。 */
  label?: ReactNode;
  /** 是否禁用该候选项(不可高亮 / 选中)。 */
  disabled?: boolean | undefined;
}

/** 候选项分组:一组带可选标题的候选。 */
export interface AutoCompleteOptionGroup {
  /** 分组标题(列表内分隔展示)。 */
  label?: ReactNode;
  /** 该组下的候选项。 */
  options: AutoCompleteOption[];
}

/** options 既可平铺,也可分组传入。 */
export type AutoCompleteOptions = Array<AutoCompleteOption | AutoCompleteOptionGroup>;

/** 部件级 className 定制(细粒度槽位)。 */
export interface AutoCompleteClassNames {
  /** 外层根容器。 */
  root?: string | undefined;
  /** 输入框包裹(带边框/发光的控件外壳)。 */
  control?: string | undefined;
  /** 原生 input。 */
  input?: string | undefined;
  /** 浮层 listbox 容器。 */
  list?: string | undefined;
  /** 分组容器。 */
  group?: string | undefined;
  /** 分组标题。 */
  groupLabel?: string | undefined;
  /** 单个 option。 */
  option?: string | undefined;
  /** 清除按钮。 */
  clear?: string | undefined;
}

/** 区分一项是分组还是普通候选项。 */
function isGroup(
  item: AutoCompleteOption | AutoCompleteOptionGroup,
): item is AutoCompleteOptionGroup {
  return Array.isArray((item as AutoCompleteOptionGroup).options);
}

/** 把（可能分组的）options 摊平成有序候选数组,同时记录每项的分组下标用于渲染分隔。 */
interface FlatEntry {
  option: AutoCompleteOption;
  /** 所属分组索引;未分组为 -1。 */
  groupIndex: number;
}
function flatten(options: AutoCompleteOptions): { flat: FlatEntry[]; grouped: boolean } {
  let grouped = false;
  const flat: FlatEntry[] = [];
  for (let g = 0; g < options.length; g++) {
    const item = options[g];
    if (item === undefined) {
      continue;
    }
    if (isGroup(item)) {
      grouped = true;
      for (const option of item.options) {
        flat.push({ option, groupIndex: g });
      }
    } else {
      flat.push({ option: item, groupIndex: -1 });
    }
  }
  return { flat, grouped };
}

export interface AutoCompleteProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'prefix' | 'list'
  > {
  /** 当前输入值(受控,自由文本)。 */
  value?: string | undefined;
  /** 默认输入值(非受控)。 */
  defaultValue?: string | undefined;
  /**
   * 输入值变化回调(受控/非受控均触发)。值就是输入串。
   * @param value 输入框变化后的最新文本。
   */
  onChange?: (value: string) => void;
  /** 候选项(平铺或分组)。 */
  options?: AutoCompleteOptions;
  /**
   * 过滤候选:`false` 关闭内置过滤(配 onSearch 做受控远程搜索);
   * 传谓词 `(inputValue, option) => boolean` 自定义命中;缺省走子串大小写不敏感匹配。
   */
  filterOption?: false | ((inputValue: string, option: AutoCompleteOption) => boolean) | undefined;
  /**
   * 选中某个候选项回调(点选 / Enter 选中高亮项)。选中后输入框填入该 value。
   * @param value 被选中候选项的 value(已填入输入框)。
   * @param option 被选中的完整候选项。
   */
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  /**
   * 输入回调(每次键入触发,异步加载时在此发起请求,配 `loading` 展示加载态)。
   * @param value 输入框当前文本。
   */
  onSearch?: (value: string) => void;
  /** 加载态:列表显示加载文案(走 i18n select.loading),input 标记 aria-busy。 */
  loading?: boolean;
  /** 有值时显示清除按钮(走 i18n input.clear)。 */
  allowClear?: boolean;
  /** 点击清除回调(无参数)。 */
  onClear?: () => void;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: AutoCompleteSize;
  /** 语义色调,派生高亮/发光(只读 tone 槽位)。invalid 时强制 danger。默认 primary。 */
  tone?: AutoCompleteTone;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 校验失败态(供 Form):染 danger 发光环并设 aria-invalid。 */
  invalid?: boolean;
  /** 自定义渲染 option 内容(覆盖默认 label 文本)。 */
  renderOption?: (option: AutoCompleteOption, state: { active: boolean }) => ReactNode;
  /** 输入框前置内容(图标 / 文字)。 */
  prefix?: ReactNode;
  /**
   * 受控/非受控开合状态(受控时配 onOpenChange)。
   */
  open?: boolean | undefined;
  /**
   * 开合变化回调(受控/非受控双通道)。
   * @param open 变化后的开合状态;true 为展开,false 为收起。
   */
  onOpenChange?: (open: boolean) => void;
  /** 部件级 className(细粒度槽位)。 */
  classNames?: AutoCompleteClassNames | undefined;
  /** 外层根容器附加 className。 */
  className?: string | undefined;
  /** input 获焦(表单聚焦校验)。 */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** input 失焦(表单 onBlur 校验)。 */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

/**
 * AutoComplete —— 自动完成(category: forms)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 自由文本输入 + 下拉补全建议:与 Select 的区别是「值就是输入串」,候选项只是补全提示,
 * 不强制从中选取。输入即开下拉,键盘 ↑↓ 高亮 / Enter 选中填入 / Esc 关闭;选中后输入框填该候选 value。
 *
 * 浮层进 top-layer 用原生 Popover API(popover="auto" 自带点外/Esc 关闭),
 * 定位用 CSS Anchor Positioning(anchor-name + position-anchor + position-area),@supports 降级。
 *
 * 生产特性:options 平铺/分组、filterOption(false 关内置过滤配 onSearch 远程搜)、loading 加载态、
 * 空态、allowClear、disabled、size、invalid(供 Form)、tone 槽位、密度缩放、motion/fx 一键降级;
 * 留口:prefix、renderOption、classNames 部件定制、...rest 透传、composeEventHandlers 合并用户处理器。
 * a11y:input role=combobox aria-autocomplete=list aria-expanded;listbox/option aria-selected。
 * 受控(value+onChange / open+onOpenChange)与非受控双通道。样式见 AutoComplete.css。
 */
export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    options = [],
    filterOption,
    onSelect,
    onSearch,
    loading = false,
    allowClear = false,
    onClear,
    size = 'md',
    tone = 'primary',
    disabled = false,
    invalid = false,
    renderOption,
    prefix,
    open: openProp,
    onOpenChange,
    classNames,
    className,
    onFocus,
    onBlur,
    onKeyDown,
    id,
    name,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  } = props;

  const t = useMessages();
  const reactId = useId();
  // anchor-name 必须以 -- 开头且每实例唯一;useId 含冒号,清洗为合法标识符。
  const safeId = reactId.replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = `--ms-autocomplete-${safeId}`;
  const listboxId = `ms-autocomplete-list-${safeId}`;
  const inputId = id ?? `ms-autocomplete-input-${safeId}`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  // 合并外部 ref 与内部 inputRef(清除聚焦、点外判定需要真实 DOM)。
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as { current: HTMLInputElement | null }).current = node;
      }
    },
    [ref],
  );

  // —— 输入值:受控/非受控 ——
  const isValueControlled = value !== undefined;
  const [valueInternal, setValueInternal] = useState(defaultValue ?? '');
  const currentValue = isValueControlled ? value : valueInternal;

  // —— 开合:受控/非受控双通道 ——
  const isOpenControlled = openProp !== undefined;
  const [openInternal, setOpenInternal] = useState(false);
  const open = isOpenControlled ? openProp : openInternal;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setOpenInternal(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  // —— 高亮项(在可见候选中的索引) ——
  const [activeIndex, setActiveIndex] = useState(-1);

  // 摊平 options + 过滤为可见候选。
  const { flat, grouped } = useMemo(() => flatten(options), [options]);
  const allOptions = useMemo(() => flat.map((e) => e.option), [flat]);

  const visibleOptions = useMemo(
    () => filterOptions(allOptions, currentValue, filterOption),
    [allOptions, currentValue, filterOption],
  );

  // 可见候选 → 分组渲染结构(保留分组标题;过滤后空组不渲染)。
  const visibleGroups = useMemo(() => {
    if (!grouped) {
      return null;
    }
    const visibleSet = new Set(visibleOptions);
    const result: Array<{ groupIndex: number; label: ReactNode; options: AutoCompleteOption[] }> =
      [];
    const byGroup = new Map<number, AutoCompleteOption[]>();
    for (const entry of flat) {
      if (!visibleSet.has(entry.option)) {
        continue;
      }
      const bucket = byGroup.get(entry.groupIndex) ?? [];
      bucket.push(entry.option);
      byGroup.set(entry.groupIndex, bucket);
    }
    for (let g = 0; g < options.length; g++) {
      const opts = byGroup.get(g);
      if (!opts || opts.length === 0) {
        continue;
      }
      const item = options[g];
      const label = item && isGroup(item) ? item.label : undefined;
      result.push({ groupIndex: g, label, options: opts });
    }
    return result;
  }, [grouped, visibleOptions, flat, options]);

  const findEnabled = useCallback(
    (start: number, dir: 1 | -1) => findEnabledIndex(visibleOptions, start, dir),
    [visibleOptions],
  );

  // 同步 Popover 显隐(带降级保护)。
  useEffect(() => {
    const el = listboxRef.current;
    if (!el) {
      return;
    }
    const supportsPopover = typeof el.showPopover === 'function' && el.hasAttribute('popover');
    if (!supportsPopover) {
      return;
    }
    const shouldOpen = open && visibleOptions.length >= 0;
    try {
      if (shouldOpen) {
        el.showPopover();
      } else {
        el.hidePopover();
      }
    } catch {
      // 已显示 / 已隐藏:忽略,靠 data-open 与 React 状态最终一致。
    }
  }, [open, visibleOptions.length]);

  // 关闭时复位高亮。
  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
    }
  }, [open]);

  // 可见候选收窄后钳制高亮:受控 value / options 变短致 activeIndex 越界时复位,
  // 避免 aria-activedescendant 指向已不存在的 option id(SR 被告知却无高亮)。
  useEffect(() => {
    if (activeIndex >= visibleOptions.length) {
      setActiveIndex(-1);
    }
  }, [activeIndex, visibleOptions.length]);

  // 设置输入值(受控同步 + 触发 onChange)。
  const setValue = useCallback(
    (next: string) => {
      if (!isValueControlled) {
        setValueInternal(next);
      }
      onChange?.(next);
    },
    [isValueControlled, onChange],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValue(next);
      onSearch?.(next);
      // 输入即开:有内容时展开建议;高亮复位到首个可用项。
      setOpen(true);
      setActiveIndex(-1);
    },
    [setValue, onSearch, setOpen],
  );

  // 选中某候选项:填入 value、回调、关闭。
  const commit = useCallback(
    (index: number) => {
      const opt = visibleOptions[index];
      if (!opt || opt.disabled) {
        return;
      }
      setValue(opt.value);
      onSelect?.(opt.value, opt);
      setOpen(false);
      setActiveIndex(-1);
    },
    [visibleOptions, setValue, onSelect, setOpen],
  );

  const clear = useCallback(() => {
    setValue('');
    onClear?.();
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [setValue, onClear]);

  // —— input 键盘:导航 / 选中 / 开合 ——
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!open) {
            setOpen(true);
            setActiveIndex(findEnabled(0, 1));
          } else {
            setActiveIndex(findEnabled((activeIndex < 0 ? -1 : activeIndex) + 1, 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!open) {
            setOpen(true);
            setActiveIndex(findEnabled(visibleOptions.length - 1, -1));
          } else {
            setActiveIndex(
              findEnabled((activeIndex < 0 ? visibleOptions.length : activeIndex) - 1, -1),
            );
          }
          break;
        case 'Enter':
          // 有高亮项才拦截默认提交并选中;否则放行(允许表单提交自由文本)。
          if (open && activeIndex >= 0) {
            e.preventDefault();
            commit(activeIndex);
          }
          break;
        case 'Escape':
          if (open) {
            e.preventDefault();
            setOpen(false);
            setActiveIndex(-1);
          }
          break;
        default:
          break;
      }
    },
    [disabled, open, activeIndex, visibleOptions.length, findEnabled, setOpen, commit],
  );

  // popover="auto" 原生点外/Esc 关闭触发 toggle,据此同步 React 状态。
  const handleToggle = useCallback(
    (e: { newState?: string }) => {
      const nextOpen = e.newState === 'open';
      if (nextOpen === open) {
        return;
      }
      // 受控且父级坚持 open=true:原生 light-dismiss 把浮层关了,但 setOpen 只回调
      // onOpenChange,若父不收下则 open 仍为 true、显隐 effect 依赖未变不重跑 → React
      // 认为展开而原生已关,持久失配。主动 showPopover() 把浮层拉回,先于状态保证一致。
      if (isOpenControlled && !nextOpen && openProp === true) {
        const el = listboxRef.current;
        if (el && typeof el.showPopover === 'function' && !el.matches(':popover-open')) {
          try {
            el.showPopover();
          } catch {
            // 已显示:忽略。
          }
        }
        return;
      }
      setOpen(nextOpen);
    },
    [open, setOpen, isOpenControlled, openProp],
  );

  const hasValue = currentValue.length > 0;
  const showClear = allowClear && hasValue && !disabled;
  const effectiveTone = invalid ? 'danger' : tone;

  const inputStyle: CSSProperties = { anchorName } as CSSProperties;
  const listStyle: CSSProperties = { positionAnchor: anchorName } as CSSProperties;

  // 渲染单个 option(index 为它在 visibleOptions 中的全局序号)。
  const renderOptionNode = (opt: AutoCompleteOption, index: number) => {
    const isActive = index === activeIndex;
    return (
      // biome-ignore lint/a11y/useFocusableInteractive: option 不进 Tab 序;焦点由 input 的 aria-activedescendant 表达(WAI-ARIA combobox 模式)
      <div
        key={`${opt.value}-${index}`}
        id={`${listboxId}-opt-${index}`}
        role="option"
        aria-selected={isActive}
        aria-disabled={opt.disabled || undefined}
        data-active={isActive ? '' : undefined}
        className={[
          'ms-autocomplete__option',
          opt.disabled && 'ms-autocomplete__option--disabled',
          classNames?.option,
        ]
          .filter(Boolean)
          .join(' ')}
        // 用 pointerdown 而非 click:避免点击 option 时 input 先 blur 导致浮层在 click 前已关。
        onPointerDown={(e) => {
          e.preventDefault();
          if (!opt.disabled) {
            commit(index);
          }
        }}
        onPointerMove={() => !opt.disabled && setActiveIndex(index)}
      >
        {renderOption ? (
          renderOption(opt, { active: isActive })
        ) : (
          <span className="ms-autocomplete__label">{opt.label ?? opt.value}</span>
        )}
      </div>
    );
  };

  // 列表主体:加载 / 空态 / 候选(平铺或分组)。
  const renderListBody = () => {
    if (loading) {
      return (
        <div className="ms-autocomplete__status" role="status">
          {t('select.loading', undefined, '加载中…')}
        </div>
      );
    }
    if (visibleOptions.length === 0) {
      return (
        <div className="ms-autocomplete__status">{t('select.empty', undefined, '无匹配项')}</div>
      );
    }
    if (visibleGroups) {
      // 分组渲染:用全局索引映射保证键盘高亮与 commit 一致。
      let cursor = 0;
      return visibleGroups.map((grp) => {
        const groupId = `${listboxId}-grp-${grp.groupIndex}`;
        const body = (
          // biome-ignore lint/a11y/useSemanticElements: listbox 内的候选分组语义是 ARIA role="group"(WAI-ARIA combobox/listbox 模式),不是表单 fieldset
          <div
            key={grp.groupIndex}
            role="group"
            aria-labelledby={grp.label != null ? groupId : undefined}
            className={['ms-autocomplete__group', classNames?.group].filter(Boolean).join(' ')}
          >
            {grp.label != null && (
              <div
                id={groupId}
                className={['ms-autocomplete__group-label', classNames?.groupLabel]
                  .filter(Boolean)
                  .join(' ')}
              >
                {grp.label}
              </div>
            )}
            {grp.options.map((opt) => renderOptionNode(opt, cursor++))}
          </div>
        );
        return body;
      });
    }
    return visibleOptions.map((opt, index) => renderOptionNode(opt, index));
  };

  // 仅当高亮项确实落在可见候选范围内才输出 activedescendant,杜绝悬空指向。
  const activeDescId =
    open && activeIndex >= 0 && activeIndex < visibleOptions.length
      ? `${listboxId}-opt-${activeIndex}`
      : undefined;

  return (
    <div
      className={[
        'ms-autocomplete',
        `ms-autocomplete--${size}`,
        `ms-tone-${effectiveTone}`,
        open && 'ms-autocomplete--open',
        disabled && 'ms-autocomplete--disabled',
        invalid && 'ms-autocomplete--invalid',
        classNames?.root,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={['ms-autocomplete__control', classNames?.control].filter(Boolean).join(' ')}
        style={inputStyle}
      >
        {prefix != null && (
          <span className="ms-autocomplete__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={setInputRef}
          id={inputId}
          name={name}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeDescId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={invalid || undefined}
          aria-busy={loading || undefined}
          disabled={disabled}
          className={['ms-autocomplete__input', classNames?.input].filter(Boolean).join(' ')}
          // 始终由 currentValue 驱动(受控用外部 value,非受控用内部 state):
          // 选中/清除需把值写回输入框,真·uncontrolled DOM 无法同步,故内部统一走受控。
          value={currentValue}
          onChange={handleInputChange}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          onFocus={composeEventHandlers(onFocus, () => {
            // 聚焦即开:有候选可补全时展开。
            if (!disabled) {
              setOpen(true);
            }
          })}
          onBlur={onBlur}
          {...rest}
        />
        {showClear && (
          // 用 pointerdown 避免 input blur 抢先;role=button 表达清除钮语义。
          // biome-ignore lint/a11y/useSemanticElements: 控件外壳已含 input,这里用 span[role=button] 避免嵌套语义混乱;键盘可达由 input 流程覆盖
          <span
            className={['ms-autocomplete__clear', classNames?.clear].filter(Boolean).join(' ')}
            role="button"
            tabIndex={-1}
            aria-label={t('input.clear', undefined, '清除')}
            onPointerDown={(e) => {
              e.preventDefault();
              clear();
            }}
          >
            <span aria-hidden="true">×</span>
          </span>
        )}
      </div>

      <div
        ref={listboxRef}
        id={listboxId}
        popover="auto"
        role="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-open={open ? '' : undefined}
        className={['ms-autocomplete__list', `ms-autocomplete__list--${size}`, classNames?.list]
          .filter(Boolean)
          .join(' ')}
        style={listStyle}
        onToggle={handleToggle}
      >
        {renderListBody()}
      </div>
    </div>
  );
});
AutoComplete.displayName = 'AutoComplete';

export type { AutoCompleteOptionLike };
