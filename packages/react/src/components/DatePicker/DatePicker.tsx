import type { ElementType, ReactNode } from 'react';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { useMessages } from '../../i18n';
import { Popover, type PopoverPlacement } from '../Popover';
import { Calendar } from './Calendar';
import { type DateRange, isDateDisabled, startOfDay, type WeekStart } from './logic';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** range 预设(如「最近 7 天」)。 */
export interface DatePreset {
  label: string;
  range: DateRange;
}

/** 各部件细粒度 className。 */
export interface DatePickerClassNames {
  root?: string;
  trigger?: string;
  panel?: string;
  footer?: string;
}

export interface DatePickerProps {
  /** single 选单日;range 选区间。默认 single。 */
  mode?: 'single' | 'range';
  /** 受控值(single)。null=已清空。 */
  value?: Date | null;
  /** 非受控初值(single)。 */
  defaultValue?: Date | null;
  /** single 变更回调。 */
  onChange?: (date: Date | null) => void;
  /** 受控值(range)。 */
  rangeValue?: DateRange;
  /** 非受控初值(range)。 */
  defaultRangeValue?: DateRange;
  /** range 变更回调。 */
  onRangeChange?: (range: DateRange) => void;
  /** 可选下限。 */
  min?: Date | null;
  /** 可选上限。 */
  max?: Date | null;
  /** 自定义禁用判定。 */
  disabledDate?: (date: Date) => boolean;
  /** 一周起始(0=周日 … 6=周六)。默认 1(周一)。 */
  weekStart?: WeekStart;
  /** BCP-47 locale(月名/周名/显示格式经 Intl 取)。 */
  locale?: string;
  /** 自定义显示格式(覆盖默认 Intl medium)。 */
  format?: (date: Date) => string;
  /** 占位文字(single)。 */
  placeholder?: string;
  /** range 预设(渲染在 footer)。 */
  presets?: DatePreset[];
  /** 可清除。默认 true。 */
  clearable?: boolean;
  /** 禁用。 */
  disabled?: boolean;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: DatePickerSize;
  /** 聚焦发光环色调;invalid 时强制 danger。默认 primary。 */
  tone?: DatePickerTone;
  /** 校验失败态:染 danger 发光环并设 aria-invalid(供 Form 集成)。 */
  invalid?: boolean;
  /** 受控浮层开合。 */
  open?: boolean;
  /** 浮层开合回调。 */
  onOpenChange?: (open: boolean) => void;
  /** 浮层方位。默认 bottom-start。 */
  placement?: PopoverPlacement;
  /** 「今天」基准(测试注入)。 */
  today?: Date;
  /** 触发器 id(供 Label htmlFor / Form 集成)。 */
  id?: string;
  /** 无障碍标签。 */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** 失焦回调(供 Form touched)。 */
  onBlur?: () => void;
  /** 各部件 className。 */
  classNames?: DatePickerClassNames;
  /** 根 className。 */
  className?: string;
  /** 多态根标签(默认 'div')。 */
  as?: ElementType;
}

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * DatePicker —— 日期选择器(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * single / range 双模、date/month/year 三视图日历(复用 Popover 浮层)、min/max/disabledDate、
 * 范围预设、可清除、键盘导航、Intl 本地化、tone 发光与 invalid 态(供 Form 集成)。
 * 日期数学全走同目录 logic.ts(可平移 core),日历面板见 Calendar.tsx。样式见 DatePicker.css。
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>((props, ref) => {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue = null,
    onChange,
    rangeValue: rangeProp,
    defaultRangeValue,
    onRangeChange,
    min,
    max,
    disabledDate,
    weekStart = 1,
    locale,
    format,
    placeholder,
    presets,
    clearable = true,
    disabled = false,
    size = 'md',
    tone = 'primary',
    invalid = false,
    open: openProp,
    onOpenChange,
    placement = 'bottom-start',
    today,
    id,
    onBlur,
    classNames,
    className,
    as,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    ...rest
  } = props;

  const t = useMessages();

  // 受控/非受控:value(single)
  const isValueControlled = valueProp !== undefined;
  const [valueInternal, setValueInternal] = useState<Date | null>(defaultValue);
  const value = isValueControlled ? (valueProp ?? null) : valueInternal;

  // range
  const isRangeControlled = rangeProp !== undefined;
  const [rangeInternal, setRangeInternal] = useState<DateRange>(defaultRangeValue ?? EMPTY_RANGE);
  const range = isRangeControlled ? (rangeProp ?? EMPTY_RANGE) : rangeInternal;

  // open
  const isOpenControlled = openProp !== undefined;
  const [openInternal, setOpenInternal] = useState(false);
  const open = isOpenControlled ? openProp : openInternal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setOpenInternal(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const formatDate = useCallback(
    (date: Date): string =>
      format ? format(date) : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date),
    [format, locale],
  );

  const handleSelect = (date: Date) => {
    const day = startOfDay(date);
    if (!isValueControlled) setValueInternal(day);
    onChange?.(day);
    setOpen(false);
  };

  const handleRange = (next: DateRange) => {
    if (!isRangeControlled) setRangeInternal(next);
    onRangeChange?.(next);
    setOpen(false);
  };

  const clear = () => {
    if (mode === 'range') {
      if (!isRangeControlled) setRangeInternal(EMPTY_RANGE);
      onRangeChange?.(EMPTY_RANGE);
    } else {
      if (!isValueControlled) setValueInternal(null);
      onChange?.(null);
    }
  };

  const hasValue = mode === 'range' ? !!(range.start || range.end) : value != null;

  const display: ReactNode = useMemo(() => {
    if (mode === 'range') {
      const s = range.start ? formatDate(range.start) : t('datePicker.rangeStart');
      const e = range.end ? formatDate(range.end) : t('datePicker.rangeEnd');
      const muted = !range.start && !range.end;
      return (
        <span className={muted ? 'ms-datepicker__placeholder' : undefined}>{`${s} → ${e}`}</span>
      );
    }
    if (value != null) return formatDate(value);
    return (
      <span className="ms-datepicker__placeholder">
        {placeholder ?? t('datePicker.placeholder')}
      </span>
    );
  }, [mode, range, value, formatDate, placeholder, t]);

  const resolvedTone = invalid ? 'danger' : tone;
  const rootClass = [
    'ms-datepicker',
    `ms-datepicker--${size}`,
    `ms-tone-${resolvedTone}`,
    invalid && 'ms-datepicker--invalid',
    disabled && 'ms-datepicker--disabled',
    className,
    classNames?.root,
  ]
    .filter(Boolean)
    .join(' ');

  const Root = (as ?? 'div') as ElementType;

  const trigger = (
    <button
      type="button"
      id={id}
      className={['ms-datepicker__trigger', classNames?.trigger].filter(Boolean).join(' ')}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      onBlur={onBlur}
    >
      <span className="ms-datepicker__value">{display}</span>
      <span className="ms-datepicker__icon" aria-hidden="true">
        📅
      </span>
    </button>
  );

  return (
    <Root ref={ref} className={rootClass} {...rest}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        triggerAction="click"
        placement={placement}
        trigger={trigger}
        tone={resolvedTone === 'danger' ? 'danger' : 'neutral'}
      >
        <div className={['ms-datepicker__panel', classNames?.panel].filter(Boolean).join(' ')}>
          {mode === 'range' && presets && presets.length > 0 && (
            <div className="ms-datepicker__presets">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="ms-datepicker__preset"
                  onClick={() => handleRange(p.range)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <Calendar
            mode={mode}
            value={value}
            rangeValue={range}
            onSelect={handleSelect}
            onRangeChange={handleRange}
            min={min}
            max={max}
            disabledDate={disabledDate}
            weekStart={weekStart}
            locale={locale}
            today={today}
            open={open}
          />
          <div className={['ms-datepicker__footer', classNames?.footer].filter(Boolean).join(' ')}>
            {mode === 'single' && (
              <button
                type="button"
                className="ms-datepicker__today"
                onClick={() => {
                  const now = startOfDay(today ?? new Date());
                  if (!isDateDisabled(now, { min, max, disabledDate })) handleSelect(now);
                }}
              >
                {t('datePicker.today')}
              </button>
            )}
            {clearable && hasValue && (
              <button type="button" className="ms-datepicker__clear-btn" onClick={clear}>
                {t('datePicker.clear')}
              </button>
            )}
          </div>
        </div>
      </Popover>
    </Root>
  );
});
DatePicker.displayName = 'DatePicker';
