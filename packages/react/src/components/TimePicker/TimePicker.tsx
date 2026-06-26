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
  buildHourOptions,
  buildOptions,
  clampTime,
  findEnabledOptionIndex,
  format12Hour,
  formatTime,
  hourOptions24From12h,
  type Meridiem,
  normalizeValue,
  nowParts,
  pad2,
  type TimeParts,
  type TimeUnit,
  to12Hour,
  to24Hour,
  toDisabledSet,
} from './logic';

export type TimePickerSize = 'sm' | 'md' | 'lg';
export type TimePickerTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** 各部件细粒度 className 槽位(留口)。 */
export interface TimePickerClassNames {
  /** trigger 输入框(根)。 */
  trigger?: string | undefined;
  /** 浮层面板。 */
  panel?: string | undefined;
  /** 单个时/分/秒列(listbox)。 */
  column?: string | undefined;
  /** 列中的单个 option。 */
  option?: string | undefined;
  /** 底部操作栏。 */
  footer?: string | undefined;
}

/** TimePicker 暴露的命令式句柄(forwardRef 指向 trigger 输入框)。 */
export type TimePickerHandle = HTMLInputElement;

/** trigger 上要内部接管、不能直接透传的 input 属性。 */
type OmittedInputProps =
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'size'
  | 'type'
  | 'role'
  | 'readOnly'
  | 'prefix'
  | 'children';

export interface TimePickerProps
  extends Omit<ComponentPropsWithoutRef<'input'>, OmittedInputProps> {
  /** 当前值(受控):Date 或 "HH:mm:ss" / "HH:mm" 字符串。传入即受控。 */
  value?: Date | string | null | undefined;
  /** 默认值(非受控):Date 或字符串。 */
  defaultValue?: Date | string | null | undefined;
  /**
   * 值变化回调(选中某列、点「此刻」、清除时触发)。
   * @param value 新值的 "HH:mm:ss"(无秒模式为 "HH:mm")字符串;清除时为 null。
   * @param parts 新值的时分秒分量;清除时为 null。
   */
  onChange?: (value: string | null, parts: TimeParts | null) => void;
  /** 12 小时制:额外渲染 AM/PM 列,trigger 显示带子午线。默认 false(24 制)。 */
  use12Hours?: boolean;
  /** 是否显示秒列。默认 true。 */
  showSecond?: boolean;
  /** 自定义 trigger 显示格式:覆盖默认 formatTime。 */
  format?: ((parts: TimeParts) => string) | undefined;
  /** 小时步进(24 制对 0-23 取间隔)。默认 1。 */
  hourStep?: number;
  /** 分钟步进。默认 1。 */
  minuteStep?: number;
  /** 秒步进。默认 1。 */
  secondStep?: number;
  /** 禁用的小时(24 制值);数组或返回数组的函数。 */
  disabledHours?: number[] | (() => number[]) | undefined;
  /** 禁用的分钟;数组或返回数组的函数(可依当前小时动态返回)。 */
  disabledMinutes?: number[] | ((selectedHour: number | null) => number[]) | undefined;
  /** 禁用的秒;数组或返回数组的函数。 */
  disabledSeconds?:
    | number[]
    | ((selectedHour: number | null, selectedMinute: number | null) => number[])
    | undefined;
  /** 占位文本(未选中)。默认走 i18n timePicker.placeholder。 */
  placeholder?: string;
  /** 尺寸(随密度缩放)。默认 md。 */
  size?: TimePickerSize;
  /** 语义色调,派生高亮/发光(只读 --ms-c* 槽位)。默认 primary。 */
  tone?: TimePickerTone;
  /** 校验失败态:染 danger、设 aria-invalid(供 Form)。 */
  invalid?: boolean;
  /** 是否禁用整个选择器。 */
  disabled?: boolean;
  /** 有值时显示清除按钮(走 input.clear 文案)。 */
  clearable?: boolean;
  /** 是否显示底部「此刻 / 确定」操作栏。默认 true。 */
  footer?: boolean;
  /** 受控开合(配 onOpenChange);不传则非受控。 */
  open?: boolean | undefined;
  /**
   * 开合变化回调(受控/非受控双通道)。
   * @param open 变化后的开合状态:true 为展开,false 为收起。
   */
  onOpenChange?: (open: boolean) => void;
  /** trigger 前置内容(图标 / 文字)。 */
  prefix?: ReactNode;
  /**
   * trigger 获焦(供表单聚焦校验)。
   * @param event 原生聚焦事件。
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * trigger 失焦(供表单 blur 校验)。
   * @param event 原生失焦事件。
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** 根容器附加 className。 */
  className?: string;
  /** 各部件细粒度 className 槽位。 */
  classNames?: TimePickerClassNames | undefined;
}

/** 把 disabled prop(数组 / 函数)解析成具体数组。 */
function resolveDisabled<A extends unknown[]>(
  source: number[] | ((...args: A) => number[]) | undefined,
  ...args: A
): number[] {
  if (typeof source === 'function') {
    return source(...args);
  }
  return source ?? [];
}

interface ColumnSpec {
  unit: TimeUnit;
  /** 该列候选值(meridiem 列用 -1/+1 占位映射 AM/PM 时另行处理,不进此 spec)。 */
  values: number[];
  /** 当前选中值在 values 中的索引(-1 表示未命中)。 */
  selectedIndex: number;
  disabled: ReadonlySet<number>;
  labelOf: (v: number) => string;
}

/**
 * TimePicker —— 时间选择(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 形态:Input 式 trigger(显示格式化时间或占位)+ 浮层(复用与 Select 同款 Popover API + CSS Anchor
 * Positioning + 降级)包**可滚动的时/分/秒列**;每列是独立 listbox,option aria-selected,选中项高亮。
 * use12Hours 加 AM/PM 列;format / hourStep / minuteStep / secondStep / disabledHours·Minutes·Seconds;
 * 底部「此刻 / 确定」;clearable;size 随密度;invalid(供 Form);value(Date 或字符串)/ onChange;受控开合。
 *
 * a11y:每列 role=listbox + option role/aria-selected;键盘 ↑↓ 在列内选值、Enter 确认、Esc 关闭、
 * Tab 在列间走。尊重 prefers-reduced-motion 与 [data-ms-motion=off]。
 *
 * 留口:className + classNames(trigger/panel/column/option/footer)细粒度定制;prefix 前置;...rest 透传到
 * trigger input;内部接管的 onFocus/onBlur 用 composeEventHandlers 合并。forwardRef 指向 trigger input。
 * 样式见 TimePicker.css,需引入 @magic-scope/react/styles.css。
 */
export const TimePicker = forwardRef<TimePickerHandle, TimePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    use12Hours = false,
    showSecond = true,
    format,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    placeholder,
    size = 'md',
    tone = 'primary',
    invalid = false,
    disabled = false,
    clearable = false,
    footer = true,
    open: openProp,
    onOpenChange,
    prefix,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    className,
    classNames,
    id,
    name,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  } = props;

  const t = useMessages();
  const reactId = useId();
  const safeId = reactId.replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = `--ms-time-${safeId}`;
  const panelId = `ms-time-panel-${safeId}`;
  const triggerId = id ?? `ms-time-trigger-${safeId}`;

  const triggerRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef(false);

  useImperativeHandle(ref, () => triggerRef.current as HTMLInputElement, []);

  // —— 开合:受控 / 非受控 ——
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

  // —— 值:受控 / 非受控,内部统一用 TimeParts | null ——
  const isValueControlled = value !== undefined;
  const [internalParts, setInternalParts] = useState<TimeParts | null>(() =>
    normalizeValue(defaultValue ?? null),
  );
  const controlledParts = useMemo(
    () => (isValueControlled ? normalizeValue(value ?? null) : null),
    [isValueControlled, value],
  );
  const selectedParts = isValueControlled ? controlledParts : internalParts;

  // —— 各列选项(按 step) ——
  const hourValues = useMemo(() => buildHourOptions(use12Hours, hourStep), [use12Hours, hourStep]);
  const minuteValues = useMemo(() => buildOptions(59, minuteStep), [minuteStep]);
  const secondValues = useMemo(() => buildOptions(59, secondStep), [secondStep]);

  // clamp / 「此刻」/ 基线统一用的 24 制小时网格:
  // 12 制下必须从显示列(hourValues 是 1-12)反推回 24h 候选,保证 clamp 出来的小时
  // 其 hour12 一定能在显示列命中、有高亮;24 制下直接用 hourValues。
  const clampHourOptions = useMemo(
    () => (use12Hours ? hourOptions24From12h(hourValues) : hourValues),
    [use12Hours, hourValues],
  );

  // —— 禁用集合(随当前选中联动) ——
  const selectedHour = selectedParts?.h ?? null;
  const selectedMinute = selectedParts?.m ?? null;
  const disabledHoursSet = useMemo(
    () => toDisabledSet(resolveDisabled(disabledHours)),
    [disabledHours],
  );
  const disabledMinutesSet = useMemo(
    () => toDisabledSet(resolveDisabled(disabledMinutes, selectedHour)),
    [disabledMinutes, selectedHour],
  );
  const disabledSecondsSet = useMemo(
    () => toDisabledSet(resolveDisabled(disabledSeconds, selectedHour, selectedMinute)),
    [disabledSeconds, selectedHour, selectedMinute],
  );

  // 当前 12 制小时与子午线(use12Hours 才用到)。
  const meridiem: Meridiem = selectedParts != null && selectedParts.h >= 12 ? 'PM' : 'AM';

  // —— trigger 显示文本 ——
  const displayText = useMemo(() => {
    if (selectedParts == null) {
      return '';
    }
    if (format) {
      return format(selectedParts);
    }
    return use12Hours
      ? format12Hour(selectedParts, showSecond)
      : formatTime(selectedParts, showSecond);
  }, [selectedParts, format, use12Hours, showSecond]);

  const resolvedPlaceholder = placeholder ?? t('timePicker.placeholder', undefined, '请选择时间');

  // —— 提交一个新的 TimeParts(写状态 + 回调) ——
  const commitParts = useCallback(
    (next: TimeParts | null) => {
      if (!isValueControlled) {
        setInternalParts(next);
      }
      if (next == null) {
        onChange?.(null, null);
      } else {
        onChange?.(formatTime(next, showSecond), next);
      }
    },
    [isValueControlled, onChange, showSecond],
  );

  // clamp「此刻」到各列选项 + 禁用集合的公共配置(selectNow 与 baseParts 共用,保证基线对齐)。
  const clampOpts = useMemo(
    () => ({
      hourOptions: clampHourOptions,
      minuteOptions: minuteValues,
      secondOptions: secondValues,
      disabled: {
        hours: disabledHoursSet,
        minutes: disabledMinutesSet,
        seconds: disabledSecondsSet,
      },
    }),
    [
      clampHourOptions,
      minuteValues,
      secondValues,
      disabledHoursSet,
      disabledMinutesSet,
      disabledSecondsSet,
    ],
  );

  // 基线:没选过任何值时,改某一列要以「对齐后的此刻」为底,而非裸 nowParts()——
  // 否则未被改动的列(时/秒)可能落在不在选项里或被禁用的值上,可被提交出去。
  const baseParts = useCallback(
    (): TimeParts => selectedParts ?? clampTime(nowParts(), clampOpts),
    [selectedParts, clampOpts],
  );

  // —— 选中某列的某个值 ——
  const selectUnit = useCallback(
    (unit: TimeUnit, rawValue: number) => {
      const base = baseParts();
      let next: TimeParts;
      if (unit === 'hour') {
        // 12 制下 rawValue 是 1-12,需结合当前子午线合回 24 制。
        const h24 = use12Hours ? to24Hour(rawValue, meridiem) : rawValue;
        next = { ...base, h: h24 };
      } else if (unit === 'minute') {
        next = { ...base, m: rawValue };
      } else if (unit === 'second') {
        next = { ...base, s: rawValue };
      } else {
        // meridiem 列:rawValue 0 = AM,1 = PM。
        const nextMer: Meridiem = rawValue === 1 ? 'PM' : 'AM';
        const { hour12 } = to12Hour(base.h);
        next = { ...base, h: to24Hour(hour12, nextMer) };
      }
      commitParts(next);
    },
    [baseParts, use12Hours, meridiem, commitParts],
  );

  // —— 「此刻」/「确定」/「清除」 ——
  const selectNow = useCallback(() => {
    const now = clampTime(nowParts(), clampOpts);
    commitParts(now);
  }, [clampOpts, commitParts]);

  const requestClose = useCallback(
    (focusTrigger = true) => {
      if (closingRef.current) {
        return;
      }
      closingRef.current = true;
      setOpen(false);
      if (focusTrigger) {
        triggerRef.current?.focus();
      }
      requestAnimationFrame(() => {
        closingRef.current = false;
      });
    },
    [setOpen],
  );

  const confirm = useCallback(() => {
    // 没选过则确定即落「此刻」(对齐选项),否则保持当前。
    if (selectedParts == null) {
      selectNow();
    }
    requestClose();
  }, [selectedParts, selectNow, requestClose]);

  const clear = useCallback(() => {
    commitParts(null);
    triggerRef.current?.focus();
  }, [commitParts]);

  // —— 同步 Popover 显隐(带降级保护) ——
  useEffect(() => {
    const el = panelRef.current;
    if (!el) {
      return;
    }
    const supportsPopover = typeof el.showPopover === 'function' && el.hasAttribute('popover');
    if (!supportsPopover) {
      return;
    }
    try {
      if (open) {
        el.showPopover?.();
      } else {
        el.hidePopover?.();
      }
    } catch {
      // 已显示 / 已隐藏:忽略。
    }
  }, [open]);

  // 打开时把每列选中项滚动到视区中央(仅依赖 open;DOM 与 ref 都是最新引用)。
  useEffect(() => {
    if (!open) {
      return;
    }
    closingRef.current = false;
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      for (const sel of panel.querySelectorAll<HTMLElement>('[data-ms-time-selected]')) {
        const col = sel.closest<HTMLElement>('.ms-time-picker__column');
        if (col) {
          col.scrollTop = sel.offsetTop - col.clientHeight / 2 + sel.clientHeight / 2;
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // popover="auto" 的原生点外/Esc 关闭会发 toggle 事件,据此同步 React 状态。
  const onToggle = useCallback(
    (e: { newState?: string }) => {
      const nextOpen = e.newState === 'open';
      if (nextOpen === open) {
        return;
      }
      if (!nextOpen) {
        requestClose(false);
      }
    },
    [open, requestClose],
  );

  // —— 列内键盘:↑↓ 选上/下一个可用值,Enter 关闭,Esc 关闭 ——
  const onColumnKeyDown = useCallback(
    (unit: TimeUnit, values: number[], curIndex: number, dis: ReadonlySet<number>) =>
      (e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            const i = findEnabledOptionIndex(values, dis, (curIndex < 0 ? -1 : curIndex) + 1, 1);
            const v = values[i];
            if (i >= 0 && v !== undefined) {
              selectUnit(unit, v);
            }
            break;
          }
          case 'ArrowUp': {
            e.preventDefault();
            const start = (curIndex < 0 ? values.length : curIndex) - 1;
            const i = findEnabledOptionIndex(values, dis, start, -1);
            const v = values[i];
            if (i >= 0 && v !== undefined) {
              selectUnit(unit, v);
            }
            break;
          }
          case 'Home': {
            e.preventDefault();
            const i = findEnabledOptionIndex(values, dis, 0, 1);
            const v = values[i];
            if (i >= 0 && v !== undefined) {
              selectUnit(unit, v);
            }
            break;
          }
          case 'End': {
            e.preventDefault();
            const i = findEnabledOptionIndex(values, dis, values.length - 1, -1);
            const v = values[i];
            if (i >= 0 && v !== undefined) {
              selectUnit(unit, v);
            }
            break;
          }
          case 'Enter':
            e.preventDefault();
            requestClose();
            break;
          case 'Escape':
            e.preventDefault();
            requestClose();
            break;
          default:
            break;
        }
      },
    [selectUnit, requestClose],
  );

  // —— trigger 键盘:↓/Enter/Space 打开 ——
  const onTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        requestClose();
      }
    },
    [disabled, open, setOpen, requestClose],
  );

  const onTriggerClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (open) {
      requestClose(false);
    } else {
      setOpen(true);
    }
  }, [disabled, open, setOpen, requestClose]);

  // —— 构造各列 spec ——
  const columns = useMemo<ColumnSpec[]>(() => {
    const cols: ColumnSpec[] = [];
    // 小时列:12 制选项是 1-12,选中索引按当前 12 制小时定位。
    if (use12Hours) {
      const cur12 = selectedParts != null ? to12Hour(selectedParts.h).hour12 : -1;
      cols.push({
        unit: 'hour',
        values: hourValues,
        selectedIndex: hourValues.indexOf(cur12),
        // 12 制下禁用集合按 24 制小时,对每个 12 制候选换算后判定。
        disabled: new Set(
          hourValues.filter((h12) => disabledHoursSet.has(to24Hour(h12, meridiem))),
        ),
        labelOf: (v) => pad2(v),
      });
    } else {
      cols.push({
        unit: 'hour',
        values: hourValues,
        selectedIndex: selectedParts != null ? hourValues.indexOf(selectedParts.h) : -1,
        disabled: disabledHoursSet,
        labelOf: (v) => pad2(v),
      });
    }
    cols.push({
      unit: 'minute',
      values: minuteValues,
      selectedIndex: selectedParts != null ? minuteValues.indexOf(selectedParts.m) : -1,
      disabled: disabledMinutesSet,
      labelOf: (v) => pad2(v),
    });
    if (showSecond) {
      cols.push({
        unit: 'second',
        values: secondValues,
        selectedIndex: selectedParts != null ? secondValues.indexOf(selectedParts.s) : -1,
        disabled: disabledSecondsSet,
        labelOf: (v) => pad2(v),
      });
    }
    return cols;
  }, [
    use12Hours,
    selectedParts,
    hourValues,
    minuteValues,
    secondValues,
    showSecond,
    disabledHoursSet,
    disabledMinutesSet,
    disabledSecondsSet,
    meridiem,
  ]);

  const hasValue = selectedParts != null;
  const showClear = clearable && hasValue && !disabled;

  const tn = invalid ? 'danger' : tone;
  const triggerStyle = { anchorName } as CSSProperties;
  const panelStyle = { positionAnchor: anchorName } as CSSProperties;

  // 列 aria-label:i18n 字典暂只放了 now/confirm/placeholder 三键(本批预加),
  // 列名属"待补"键,先用本地中文兜底,不擅自改共享字典;日后字典补 timePicker.hour 等键时可平滑切换。
  const unitLabel: Record<TimeUnit, string> = {
    hour: '时',
    minute: '分',
    second: '秒',
    meridiem: '上午/下午',
  };

  const renderColumn = (col: ColumnSpec, colKey: string) => {
    const columnLabel = unitLabel[col.unit];
    return (
      <div
        key={colKey}
        role="listbox"
        aria-label={columnLabel}
        aria-orientation="vertical"
        tabIndex={disabled ? -1 : 0}
        data-ms-time-unit={col.unit}
        className={['ms-time-picker__column', classNames?.column].filter(Boolean).join(' ')}
        onKeyDown={onColumnKeyDown(col.unit, col.values, col.selectedIndex, col.disabled)}
      >
        {col.values.map((v, index) => {
          const isSelected = index === col.selectedIndex;
          const isDisabled = col.disabled.has(v);
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘交互在列容器统一处理(↑↓ 选值);option 仅响应指针点击
            // biome-ignore lint/a11y/useFocusableInteractive: option 不进 Tab 序;焦点落在列容器(listbox),WAI-ARIA 列表模式
            <div
              key={v}
              role="option"
              aria-selected={isSelected}
              aria-disabled={isDisabled || undefined}
              data-ms-time-selected={isSelected ? '' : undefined}
              className={[
                'ms-time-picker__option',
                isSelected && 'ms-time-picker__option--selected',
                isDisabled && 'ms-time-picker__option--disabled',
                classNames?.option,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => !isDisabled && selectUnit(col.unit, v)}
            >
              {col.labelOf(v)}
            </div>
          );
        })}
      </div>
    );
  };

  // 子午线列(AM/PM):单独渲染,值 0=AM,1=PM。
  const renderMeridiemColumn = () => {
    const items: { v: 0 | 1; label: Meridiem }[] = [
      { v: 0, label: 'AM' },
      { v: 1, label: 'PM' },
    ];
    const selectedV = meridiem === 'PM' ? 1 : 0;
    return (
      <div
        role="listbox"
        aria-label={unitLabel.meridiem}
        aria-orientation="vertical"
        tabIndex={disabled ? -1 : 0}
        data-ms-time-unit="meridiem"
        className={['ms-time-picker__column', classNames?.column].filter(Boolean).join(' ')}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            selectUnit('meridiem', selectedV === 1 ? 0 : 1);
          } else if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            requestClose();
          }
        }}
      >
        {items.map((it) => {
          const isSelected = hasValue && it.v === selectedV;
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: 同时分秒列,键盘在列容器统一处理
            // biome-ignore lint/a11y/useFocusableInteractive: option 不进 Tab 序;焦点落列容器(listbox)
            <div
              key={it.label}
              role="option"
              aria-selected={isSelected}
              data-ms-time-selected={isSelected ? '' : undefined}
              className={[
                'ms-time-picker__option',
                isSelected && 'ms-time-picker__option--selected',
                classNames?.option,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectUnit('meridiem', it.v)}
            >
              {it.label}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <span
      className={[
        'ms-time-picker',
        `ms-time-picker--${size}`,
        `ms-tone-${tn}`,
        open && 'ms-time-picker--open',
        disabled && 'ms-time-picker--disabled',
        invalid && 'ms-time-picker--invalid',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={triggerStyle}
    >
      {prefix != null && (
        <span className="ms-time-picker__prefix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        ref={triggerRef}
        id={triggerId}
        name={name}
        type="text"
        role="combobox"
        readOnly
        autoComplete="off"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        value={displayText}
        data-placeholder={hasValue ? undefined : ''}
        className={['ms-time-picker__input', classNames?.trigger].filter(Boolean).join(' ')}
        onClick={composeEventHandlers(onClick, onTriggerClick)}
        onKeyDown={composeEventHandlers(onKeyDown, onTriggerKeyDown)}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      />
      {showClear && (
        // biome-ignore lint/a11y/useSemanticElements: trigger 区是 input + 行内钮,用 role=button 的 span 表达清除语义,避免破坏 input 布局
        <span
          className="ms-time-picker__clear"
          role="button"
          tabIndex={-1}
          aria-label={t('input.clear', undefined, '清除')}
          onClick={(e) => {
            e.stopPropagation();
            clear();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              clear();
            }
          }}
        >
          <span aria-hidden="true">×</span>
        </span>
      )}
      <span className="ms-time-picker__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16" focusable="false" aria-hidden="true">
          <circle cx="8" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 5.5v3l2 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        data-open={open ? '' : undefined}
        className={['ms-time-picker__panel', classNames?.panel].filter(Boolean).join(' ')}
        style={panelStyle}
        onToggle={onToggle}
      >
        <div className="ms-time-picker__columns">
          {columns.map((col) => renderColumn(col, col.unit))}
          {use12Hours && renderMeridiemColumn()}
        </div>
        {footer && (
          <div className={['ms-time-picker__footer', classNames?.footer].filter(Boolean).join(' ')}>
            <button
              type="button"
              className="ms-time-picker__now"
              onClick={selectNow}
              disabled={disabled}
            >
              {t('timePicker.now', undefined, '此刻')}
            </button>
            <button
              type="button"
              className="ms-time-picker__confirm"
              onClick={confirm}
              disabled={disabled}
            >
              {t('timePicker.confirm', undefined, '确定')}
            </button>
          </div>
        )}
      </div>
    </span>
  );
});
TimePicker.displayName = 'TimePicker';
