import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  defaultFilter,
  findEnabledIndex,
  indexOfValue,
  type SelectCloseReason,
  toggleValue,
  toValueArray,
} from './logic';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface SelectOption {
  /** 选项值。 */
  value: string;
  /** 选项显示文本。 */
  label: string;
  /** 是否禁用该选项。 */
  disabled?: boolean;
  /** 选项前置图标(ReactNode)。 */
  icon?: ReactNode;
  /** 选项副描述(label 下方弱化文本)。 */
  description?: ReactNode;
}

/** 关闭来源类型,供 onClose 区分处理。 */
export type { SelectCloseReason };

/** 部件级 className 定制。 */
export interface SelectClassNames {
  /** trigger 按钮。 */
  trigger?: string;
  /** 浮层 listbox 容器。 */
  list?: string;
  /** 单个 option。 */
  option?: string;
  /** 选中打勾标记。 */
  check?: string;
  /** trigger 上的箭头。 */
  arrow?: string;
}

export interface SelectProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange' | 'value' | 'prefix' | 'onSelect'> {
  /** 当前选中值(受控)。单选传 string;多选传 string[]。 */
  value?: string | string[] | undefined;
  /** 默认选中值(非受控)。 */
  defaultValue?: string | string[] | undefined;
  /**
   * 选中变化回调。
   * @param value 选中后的新值;单选为 string,多选为 string[]。
   * @param option 本次选中/切换涉及的完整 option;多选为被切换的那一项,清除时为 undefined。
   */
  onChange?: (value: string | string[], option?: SelectOption) => void;
  /** 选项列表。 */
  options: SelectOption[];
  /** 未选中时的占位文本。默认走 i18n select.placeholder。 */
  placeholder?: string;
  /** 尺寸。默认 md。 */
  size?: SelectSize;
  /** 语义色调,派生高亮/打勾/发光。默认 primary。 */
  tone?: SelectTone;
  /** 是否禁用整个选择器。 */
  disabled?: boolean;
  /** 加载态:listbox 显示加载文案、trigger 不可展开内容。 */
  loading?: boolean;
  /** 多选模式:trigger 显示 tag,select.removeTag/selected 文案。 */
  multiple?: boolean;
  /** 可搜索:listbox 顶部内联搜索框,按 query 过滤。 */
  searchable?: boolean;
  /** 有值时显示清除按钮(走 input.clear)。 */
  clearable?: boolean;
  /** trigger 前置内容(图标 / 文字)。 */
  prefix?: ReactNode;
  /** 自定义渲染 option 内容(覆盖默认 icon+label+description 布局)。 */
  renderOption?: (option: SelectOption, state: { active: boolean; selected: boolean }) => ReactNode;
  /** 自定义渲染 trigger 内已选值(单选)。 */
  renderValue?: (option: SelectOption) => ReactNode;
  /** 部件级 className。 */
  classNames?: SelectClassNames | undefined;

  /** 受控/非受控开合状态(受控时配 onOpenChange)。 */
  open?: boolean | undefined;
  /**
   * 开合变化回调(受控/非受控双通道)。
   * @param open 变化后的开合状态;true 为展开,false 为收起。
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 关闭时回调。
   * @param reason 关闭来源,区分 select/trigger/escape/tab/outside 等触发路径,便于按来源分别处理。
   */
  onClose?: (reason: SelectCloseReason) => void;
  /**
   * Esc 关闭可拦截:在回调里 preventDefault 阻断关闭。
   * @param event 触发关闭的键盘事件;调用 event.preventDefault() 可阻止本次 Esc 关闭。
   */
  onEscapeKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /**
   * 点外关闭可拦截:在回调里 preventDefault 阻断关闭。
   * @param event 点击浮层外部触发的原生 pointerdown 事件;调用 event.preventDefault() 可阻止本次点外关闭。
   */
  onPointerDownOutside?: (event: Event) => void;
  /**
   * listbox 高亮项变化(高亮即预览类联动)。
   * @param index 当前高亮项在可见选项中的索引;无高亮时为 -1。
   * @param option 当前高亮项对应的完整 option;无高亮(index 为 -1)时为 undefined。
   */
  onHighlightChange?: (index: number, option?: SelectOption) => void;
  /**
   * 拿到完整 option 的选中回调(选中即触发,多选每次切换都触发)。
   * @param option 本次被选中/切换的完整 option。
   */
  onSelect?: (option: SelectOption) => void;
  /** 清除回调(点击清除按钮、清空已选值时触发,无参数)。 */
  onClear?: () => void;
  /**
   * 搜索 query 变化回调。
   * @param query 搜索框当前的查询文本。
   */
  onSearch?: (query: string) => void;
  /** trigger 获焦(表单聚焦校验)。 */
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
  /** trigger 失焦(表单 onBlur 校验)。 */
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;

  /** trigger 的无障碍名称(无可见 label 时建议提供)。 */
  'aria-label'?: string;
  /** 关联可见 label 的 id。 */
  'aria-labelledby'?: string;
  /** 附加类名(根 trigger / group)。 */
  className?: string;
}

/**
 * Select —— 下拉选择(旗舰深度组件)。自研、零依赖,用满平台原生能力:
 * 浮层进 top-layer 用 Popover API(popover="auto" 自带点外/Esc 关闭),
 * 定位用 CSS Anchor Positioning(anchor-name + position-anchor + position-area),
 * 并以 @supports 降级为普通 absolute 贴近,保证不支持时仍可用。
 *
 * 接全库 tone 槽位(高亮/打勾/发光只读 --ms-c*,不写死配色);i18n 文案;
 * 生产特性:clearable / loading / 空态 / searchable(combobox 过滤)/ multiple(tag 多选);
 * 留口:prefix、renderOption/renderValue、option icon/description、classNames 部件定制、...rest 透传;
 * 事件:onOpenChange 受控双通道、onClose(reason)、onEscapeKeyDown/onPointerDownOutside 可拦截、
 * onHighlightChange、onSelect、onClear、onSearch、onFocus/onBlur,内部处理器一律 compose 用户的。
 * 键盘(↑↓/Enter/Space/Esc/Home/End/Tab)自实现;尺寸随密度缩放;完整 focus-visible 发光与 disabled。
 * 样式见 Select.css,需引入 @magic-scope/react/styles.css。
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    options,
    placeholder,
    size = 'md',
    tone = 'primary',
    disabled = false,
    loading = false,
    multiple = false,
    searchable = false,
    clearable = false,
    prefix,
    renderOption,
    renderValue,
    classNames,
    open: openProp,
    onOpenChange,
    onClose,
    onEscapeKeyDown,
    onPointerDownOutside,
    onHighlightChange,
    onSelect,
    onClear,
    onSearch,
    onFocus,
    onBlur,
    className,
    id,
    name,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    onClick,
    onKeyDown,
    style,
    ...rest
  } = props;

  const t = useMessages();
  const reactId = useId();
  // anchor-name 必须以 -- 开头,且每个实例唯一;useId 含冒号,清洗为合法标识符。
  const anchorName = `--ms-select-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const listboxId = `ms-select-list-${reactId}`;
  const triggerId = id ?? `ms-select-trigger-${reactId}`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  // 防止受控 open 关闭路径双触发(toggle 事件 + 显式 close)。
  const closingRef = useRef(false);

  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement, []);

  // —— 开合:受控(openProp)/非受控双通道 ——
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

  // —— 选中值:受控/非受控 ——
  const isValueControlled = value !== undefined;
  const [valueInternal, setValueInternal] = useState<string | string[] | undefined>(defaultValue);
  const currentValue = isValueControlled ? value : valueInternal;
  const selectedValues = useMemo(() => toValueArray(currentValue), [currentValue]);

  // —— 高亮项 ——
  const [activeIndex, setActiveIndex] = useState(-1);

  // —— 搜索 query(searchable) ——
  const [query, setQuery] = useState('');

  // 过滤后的可见选项(searchable 时按 query 过滤,否则全量)。
  const visibleOptions = useMemo(
    () => (searchable ? defaultFilter(options, query) : options),
    [searchable, options, query],
  );

  // 当前选中项(单选展示用):优先在可见列表里找(用于打开定位),否则回全量(搜索过滤掉时仍能显示已选 label)。
  const selectedIndex = indexOfValue(visibleOptions, selectedValues[0]);
  const selectedOption = useMemo<SelectOption | undefined>(() => {
    const inVisible = visibleOptions[selectedIndex];
    if (inVisible) {
      return inVisible;
    }
    const i = indexOfValue(options, selectedValues[0]);
    return i >= 0 ? options[i] : undefined;
  }, [visibleOptions, selectedIndex, options, selectedValues]);
  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((v) => options[indexOfValue(options, v)])
        .filter((o): o is SelectOption => o != null),
    [selectedValues, options],
  );

  const findEnabled = useCallback(
    (start: number, dir: 1 | -1) => findEnabledIndex(visibleOptions, start, dir),
    [visibleOptions],
  );

  // 高亮变化时通知 onHighlightChange(高亮预览联动)。
  const setActive = useCallback(
    (next: number) => {
      setActiveIndex(next);
      onHighlightChange?.(next, next >= 0 ? visibleOptions[next] : undefined);
    },
    [onHighlightChange, visibleOptions],
  );

  // 同步 Popover 显隐:open 变化时调用原生 show/hidePopover(带降级保护)。
  useEffect(() => {
    const el = listboxRef.current;
    if (!el) {
      return;
    }
    const supportsPopover = typeof el.showPopover === 'function' && el.hasAttribute('popover');
    if (open) {
      if (supportsPopover) {
        try {
          el.showPopover?.();
        } catch {
          // 已显示时重复调用会抛错,忽略。
        }
      }
    } else if (supportsPopover) {
      try {
        el.hidePopover?.();
      } catch {
        // 已隐藏时忽略。
      }
    }
  }, [open]);

  // 打开时把高亮定位到选中项(或首个可用项),焦点移入搜索框(searchable)或 listbox。
  // biome-ignore lint/correctness/useExhaustiveDependencies: 仅依赖 open 触发,内部读最新引用即可,加入会重复定位
  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    // 重新打开即解除关闭去抖窗口(去抖只防「同一次关闭」的 toggle+显式双触发,不应跨重开持续)。
    closingRef.current = false;
    const start = selectedIndex >= 0 ? selectedIndex : findEnabled(0, 1);
    setActiveIndex(start);
    const raf = requestAnimationFrame(() => {
      if (searchable) {
        searchRef.current?.focus();
      } else {
        listboxRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const requestClose = useCallback(
    (reason: SelectCloseReason, focusTrigger = true) => {
      if (closingRef.current) {
        return;
      }
      closingRef.current = true;
      setOpen(false);
      onClose?.(reason);
      if (focusTrigger) {
        triggerRef.current?.focus();
      }
      // 下一帧复位去抖标记。
      requestAnimationFrame(() => {
        closingRef.current = false;
      });
    },
    [setOpen, onClose],
  );

  const commit = useCallback(
    (index: number) => {
      const opt = visibleOptions[index];
      if (!opt || opt.disabled) {
        return;
      }
      onSelect?.(opt);
      if (multiple) {
        const next = toggleValue(selectedValues, opt.value);
        if (!isValueControlled) {
          setValueInternal(next);
        }
        onChange?.(next, opt);
        // 多选不关闭,保持展开继续选;searchable 时清空查询便于继续搜。
        if (searchable) {
          setQuery('');
          onSearch?.('');
        }
      } else {
        if (!isValueControlled) {
          setValueInternal(opt.value);
        }
        onChange?.(opt.value, opt);
        requestClose('select');
      }
    },
    [
      visibleOptions,
      onSelect,
      multiple,
      selectedValues,
      isValueControlled,
      onChange,
      searchable,
      onSearch,
      requestClose,
    ],
  );

  const removeValue = useCallback(
    (val: string) => {
      const next = selectedValues.filter((v) => v !== val);
      if (!isValueControlled) {
        setValueInternal(multiple ? next : undefined);
      }
      onChange?.(multiple ? next : '', undefined);
    },
    [selectedValues, isValueControlled, multiple, onChange],
  );

  const clearAll = useCallback(() => {
    if (!isValueControlled) {
      setValueInternal(multiple ? [] : undefined);
    }
    onChange?.(multiple ? [] : '', undefined);
    onClear?.();
    triggerRef.current?.focus();
  }, [isValueControlled, multiple, onChange, onClear]);

  // —— trigger 键盘:关闭态下 ↑↓/Enter/Space 打开 ——
  const triggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          setOpen(true);
          break;
        default:
          break;
      }
    },
    [disabled, setOpen],
  );

  const triggerClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (open) {
      requestClose('trigger', false);
    } else {
      setOpen(true);
    }
  }, [disabled, open, requestClose, setOpen]);

  // —— listbox 键盘:导航/选中/关闭 ——
  const onListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActive(findEnabled((activeIndex < 0 ? -1 : activeIndex) + 1, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActive(findEnabled((activeIndex < 0 ? visibleOptions.length : activeIndex) - 1, -1));
          break;
        case 'Home':
          e.preventDefault();
          setActive(findEnabled(0, 1));
          break;
        case 'End':
          e.preventDefault();
          setActive(findEnabled(visibleOptions.length - 1, -1));
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          // searchable 时空格属于输入,交给 input;其余键位仍可选中。
          if (e.key !== ' ' && e.key !== 'Spacebar') {
            e.preventDefault();
          } else if (!searchable) {
            e.preventDefault();
          } else {
            break;
          }
          if (activeIndex >= 0) {
            commit(activeIndex);
          }
          break;
        case 'Escape':
          onEscapeKeyDown?.(e);
          if (e.defaultPrevented) {
            break;
          }
          e.preventDefault();
          requestClose('escape');
          break;
        case 'Tab':
          // Tab 离开即关闭,保持原生 Tab 顺序(不抢焦点回 trigger)。
          requestClose('tab', false);
          break;
        default:
          break;
      }
    },
    [
      activeIndex,
      visibleOptions.length,
      findEnabled,
      setActive,
      commit,
      searchable,
      onEscapeKeyDown,
      requestClose,
    ],
  );

  // popover="auto" 点外/Esc 关闭会触发 toggle 事件,据此同步 React 状态。
  const onToggle = useCallback(
    (e: { newState?: string }) => {
      const nextOpen = e.newState === 'open';
      if (nextOpen === open) {
        return;
      }
      if (nextOpen) {
        setOpen(true);
      } else {
        // 浏览器原生关闭(点外/Esc),归类为 outside(Esc 已在 keydown 拦截过)。
        requestClose('outside', false);
      }
    },
    [open, setOpen, requestClose],
  );

  // 点外关闭可拦截:监听 listbox 的 toggle 前的 pointerdown(原生 light-dismiss 走 toggle,
  // 这里额外提供可拦截入口——在文档级监听一次,open 时挂、关时摘)。
  useEffect(() => {
    if (!open || !onPointerDownOutside) {
      return;
    }
    const handler = (event: PointerEvent) => {
      const list = listboxRef.current;
      const trigger = triggerRef.current;
      const target = event.target as Node | null;
      if (list?.contains(target) || trigger?.contains(target)) {
        return;
      }
      onPointerDownOutside(event);
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [open, onPointerDownOutside]);

  // 用户 style 与 anchorName 合并:anchorName 放最后,确保不被用户 style 覆盖
  // (否则浮层定位锚点丢失 → 弹层掉到 top-layer 左上角)。
  const triggerStyle: CSSProperties = { ...style, anchorName } as CSSProperties;
  const listStyle: CSSProperties = { positionAnchor: anchorName } as CSSProperties;

  const hasValue = selectedValues.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const resolvedPlaceholder = placeholder ?? t('select.placeholder', undefined, '请选择…');

  // trigger 内显示的值:多选 tag / 单选 renderValue 或 label / 占位。
  const triggerValueNode = (() => {
    if (multiple && selectedOptions.length > 0) {
      return (
        <span className="ms-select__tags">
          {selectedOptions.map((opt) => (
            <span key={opt.value} className="ms-select__tag">
              <span className="ms-select__tag-label">{opt.label}</span>
              {!disabled && (
                // span[role=button] 而非 <button>:本控件根是 <button>,HTML 禁止 button 嵌 button;
                // span[role=button] 不属于 HTML 交互内容元素类别,嵌套合法,语义由 role/aria-label 表达。
                // biome-ignore lint/a11y/useSemanticElements: 见上,不能用真实 button
                <span
                  className="ms-select__tag-remove"
                  role="button"
                  tabIndex={-1}
                  aria-label={t('select.removeTag', { label: opt.label }, `移除 ${opt.label}`)}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(opt.value);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      removeValue(opt.value);
                    }
                  }}
                >
                  <span aria-hidden="true">×</span>
                </span>
              )}
            </span>
          ))}
        </span>
      );
    }
    if (!multiple && selectedOption) {
      return (
        <span className="ms-select__value">
          {renderValue ? renderValue(selectedOption) : selectedOption.label}
        </span>
      );
    }
    return <span className="ms-select__value">{resolvedPlaceholder}</span>;
  })();

  const listClasses = ['ms-select__list', `ms-select__list--${size}`, classNames?.list]
    .filter(Boolean)
    .join(' ');

  const renderListBody = () => {
    if (loading) {
      return (
        <div className="ms-select__status" role="status">
          {t('select.loading', undefined, '加载中…')}
        </div>
      );
    }
    if (visibleOptions.length === 0) {
      return <div className="ms-select__status">{t('select.empty', undefined, '无匹配项')}</div>;
    }
    return visibleOptions.map((opt, index) => {
      const isSelected = selectedValues.includes(opt.value);
      const isActive = index === activeIndex;
      return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘交互在 listbox 容器统一处理(aria-activedescendant 模型);option 仅响应指针
        // biome-ignore lint/a11y/useFocusableInteractive: option 不进 Tab 序;焦点由 listbox 的 aria-activedescendant 表达(WAI-ARIA listbox 模式)
        <div
          key={opt.value}
          id={`${listboxId}-opt-${index}`}
          role="option"
          aria-selected={isSelected}
          aria-disabled={opt.disabled || undefined}
          data-active={isActive ? '' : undefined}
          className={[
            'ms-select__option',
            isSelected && 'ms-select__option--selected',
            opt.disabled && 'ms-select__option--disabled',
            classNames?.option,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => !opt.disabled && commit(index)}
          onPointerMove={() => !opt.disabled && setActive(index)}
        >
          {renderOption ? (
            renderOption(opt, { active: isActive, selected: isSelected })
          ) : (
            <>
              <span
                className={['ms-select__check', classNames?.check].filter(Boolean).join(' ')}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M3.5 8.5l3 3 6-6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {opt.icon != null && (
                <span className="ms-select__option-icon" aria-hidden="true">
                  {opt.icon}
                </span>
              )}
              <span className="ms-select__option-body">
                <span className="ms-select__label">{opt.label}</span>
                {opt.description != null && (
                  <span className="ms-select__description">{opt.description}</span>
                )}
              </span>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        name={name}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-busy={loading || undefined}
        aria-activedescendant={
          open && !searchable && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        disabled={disabled}
        data-placeholder={hasValue ? undefined : ''}
        data-multiple={multiple ? '' : undefined}
        className={[
          'ms-select',
          `ms-select--${size}`,
          `ms-tone-${tone}`,
          open && 'ms-select--open',
          multiple && 'ms-select--multiple',
          classNames?.trigger,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={triggerStyle}
        onClick={composeEventHandlers(onClick, triggerClick)}
        onKeyDown={composeEventHandlers(onKeyDown, triggerKeyDown)}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      >
        {prefix != null && (
          <span className="ms-select__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        {triggerValueNode}
        {showClear && (
          // span[role=button]:根是 <button>,HTML 禁止 button 嵌 button;用 role 表达清除钮语义
          // biome-ignore lint/a11y/useSemanticElements: 见上,不能用真实 button
          <span
            className="ms-select__clear"
            role="button"
            tabIndex={-1}
            aria-label={t('input.clear', undefined, '清除')}
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                clearAll();
              }
            }}
          >
            <span aria-hidden="true">×</span>
          </span>
        )}
        <span
          className={['ms-select__arrow', classNames?.arrow].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        ref={listboxRef}
        id={listboxId}
        popover="auto"
        role="listbox"
        aria-multiselectable={multiple || undefined}
        tabIndex={-1}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
        data-open={open ? '' : undefined}
        className={listClasses}
        style={listStyle}
        onKeyDown={onListKeyDown}
        onToggle={onToggle}
      >
        {searchable && (
          <div className="ms-select__search">
            <input
              ref={searchRef}
              type="text"
              className="ms-select__search-input"
              placeholder={t('select.search', undefined, '搜索…')}
              aria-label={t('select.search', undefined, '搜索…')}
              value={query}
              onChange={(e) => {
                const q = e.target.value;
                setQuery(q);
                onSearch?.(q);
                setActiveIndex(findEnabledIndex(defaultFilter(options, q), 0, 1));
              }}
              onKeyDown={(e) => {
                // 把导航/选中键位转交 listbox 处理,文本键位留给 input。
                if (
                  e.key === 'ArrowDown' ||
                  e.key === 'ArrowUp' ||
                  e.key === 'Home' ||
                  e.key === 'End' ||
                  e.key === 'Enter' ||
                  e.key === 'Escape'
                ) {
                  onListKeyDown(e as unknown as KeyboardEvent<HTMLDivElement>);
                }
              }}
            />
          </div>
        )}
        {renderListBody()}
      </div>
    </>
  );
});
Select.displayName = 'Select';
