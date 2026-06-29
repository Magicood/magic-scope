import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useId, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
/** 外观:control = 经典圆点;card = 可点描边卡片(选中染柔底 + 主色边 + 发光)。 */
export type RadioAppearance = 'control' | 'card';

/** 数据驱动入口的单个选项(与 children 二选一)。 */
export interface RadioOption {
  /** 选项值,组内唯一。 */
  value: string;
  /** 选项标签内容。 */
  label?: ReactNode;
  /** 仅禁用该项。 */
  disabled?: boolean;
}

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onSelect: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean | undefined;
  size: RadioSize;
  tone: RadioTone;
  appearance: RadioAppearance;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** 受控选中值。 */
  value?: string | undefined;
  /** 非受控初始选中值。 */
  defaultValue?: string | undefined;
  /**
   * 选中变化回调(旧的「只取 value」调用方完全兼容)。
   * @param value 被选中项的 value。
   * @param event 触发本次选中的原生 change 事件(来自被选 Radio 的 input)。
   */
  onValueChange?: ((value: string, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /**
   * 原生风格的 change 回调(透传到当前被选 Radio 的 input)。与 onValueChange 可同时使用。
   * @param event 当前被选 Radio 的 input 触发的原生 change 事件。
   */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** 同组 radio 的 name;省略时自动生成,保证「同名即单选」的原生语义。 */
  name?: string | undefined;
  /** 整组禁用。 */
  disabled?: boolean | undefined;
  /** 排布方向,同时映射到 aria-orientation。默认 vertical。 */
  orientation?: 'horizontal' | 'vertical' | undefined;
  /** 尺寸,透传给组内 Radio。默认 md。 */
  size?: RadioSize | undefined;
  /** 语义色调,经全库 tone resolver 派生 checked 染色与 glow。透传给组内 Radio。默认 primary。 */
  tone?: RadioTone | undefined;
  /** 外观:经典圆点 control / 可点描边卡片 card。透传给组内 Radio。默认 control。 */
  appearance?: RadioAppearance | undefined;
  /**
   * 数据驱动:用 options 数组渲染选项,与 children 二选一(同时传则 options 优先,children 追加在后)。
   * label 缺省回退到 value。
   */
  options?: RadioOption[] | undefined;
}

/**
 * RadioGroup —— 单选组容器(旗舰深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 渲染 role="radiogroup",用 context 把 name / 选中值 / 尺寸 / 禁用 / tone / appearance 下发给组内 Radio;
 * 支持受控(value)与非受控(defaultValue);options 数据驱动入口与 children 二选一。
 * 组内 Radio 基于原生 input[type=radio],同 name 自动获得方向键导航与 roving tabindex(无障碍开箱即用)。
 * 事件:onValueChange(value, event) 二参带原生事件;onChange 原生回调透传;...rest 摊到根 div(原生事件/data-*可挂)。
 * 样式见同目录 Radio.css,需引入 @magic-scope/react/styles.css。
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      onChange,
      name,
      disabled,
      orientation = 'vertical',
      size = 'md',
      tone = 'primary',
      appearance = 'control',
      options,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const autoName = useId();
    const [internal, setInternal] = useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internal;

    const onSelect = (next: string, event: ChangeEvent<HTMLInputElement>) => {
      if (controlledValue === undefined) {
        setInternal(next);
      }
      onValueChange?.(next, event);
      onChange?.(event);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
        className={[
          'ms-radio-group',
          `ms-radio-group--${orientation}`,
          appearance === 'card' && 'ms-radio-group--card',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <RadioGroupContext.Provider
          value={{ name: name ?? autoName, value, onSelect, disabled, size, tone, appearance }}
        >
          {options?.map((option) => (
            <Radio key={option.value} value={option.value} disabled={option.disabled}>
              {option.label ?? option.value}
            </Radio>
          ))}
          {children}
        </RadioGroupContext.Provider>
      </div>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

export interface RadioProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'size' | 'value'> {
  /** 该选项的值,在 RadioGroup 内唯一。 */
  value: string;
  /** 选项右侧的文字标签内容。 */
  children?: ReactNode;
  /** 尺寸;默认继承所在 RadioGroup,缺省 md。 */
  size?: RadioSize | undefined;
  /** 语义色调;默认继承所在 RadioGroup,缺省 primary。 */
  tone?: RadioTone | undefined;
  /** 外观;默认继承所在 RadioGroup,缺省 control。 */
  appearance?: RadioAppearance | undefined;
  /** 根 label 的额外类名(同 className,语义化别名)。 */
  labelClassName?: string | undefined;
  /** 视觉圆点控件的类名留口。 */
  controlClassName?: string | undefined;
}

/**
 * Radio —— 单选项,基于原生 input[type=radio]。通常置于 RadioGroup 内(从 context 取 name / 选中态 / 尺寸 / 禁用 / tone / appearance)。
 * 结构:label 包视觉隐藏的原生 input + 视觉圆点控件(checked 时染 tone 主色并以 ::after 显内点)+ 可选文字。
 * appearance=card 时整行渲染为可点描边卡片(选中柔底 + 主色边 + 发光),圆点仍在。
 * 完整覆盖 hover / focus-visible(发光环) / checked / disabled 状态与过渡;触控热区达标、尊重 reduced-motion 与 data-ms-motion=off。
 * 事件:...rest 摊到根 label(onMouseEnter/onClick/data-* 可挂);input 的 onChange 经 composeEventHandlers 合并(先用户、再内部选中),用户 preventDefault 可拦截。
 * 留口:labelClassName / controlClassName 暴露子部件。
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      value,
      children,
      className,
      labelClassName,
      controlClassName,
      size,
      tone,
      appearance,
      disabled,
      checked,
      name,
      onChange,
      // 仅作用于 input 的原生属性,从 ...rest 中拆出以免误摊到根 label;
      // 收集进 inputProps 再展开到 input(展开形式也绕开 a11y/noAutofocus 对字面量 autoFocus 的告警)。
      defaultChecked,
      onFocus,
      onBlur,
      id,
      required,
      autoFocus,
      form,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...rest
    },
    ref,
  ) => {
    const group = useContext(RadioGroupContext);
    const resolvedSize = size ?? group?.size ?? 'md';
    const resolvedTone = tone ?? group?.tone ?? 'primary';
    const resolvedAppearance = appearance ?? group?.appearance ?? 'control';
    const resolvedDisabled = disabled ?? group?.disabled;
    const resolvedChecked = group ? group.value === value : checked;

    const labelClasses = [
      'ms-radio',
      resolvedSize !== 'md' && `ms-radio--${resolvedSize}`,
      resolvedAppearance === 'card' && 'ms-radio--card',
      `ms-tone-${resolvedTone}`,
      className,
      labelClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const controlClasses = ['ms-radio__control', controlClassName].filter(Boolean).join(' ');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      group?.onSelect(value, event);
    };

    // input 专属属性集中展开,既保证落到原生 input 而非根 label,也绕开对字面量 autoFocus 的 a11y 告警
    const inputProps: ComponentPropsWithoutRef<'input'> = {
      defaultChecked,
      id,
      required,
      autoFocus,
      form,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      onFocus,
      onBlur,
    };

    return (
      // rest 已拆掉 input 专属表单属性,余下为事件 / data-* / aria-* / style 等通用属性,摊到根 label;
      // 类型上从 input props 桥接到 label props(运行时这些键对 label 合法)。
      <label className={labelClasses} {...(rest as ComponentPropsWithoutRef<'label'>)}>
        <input
          ref={ref}
          type="radio"
          className="ms-radio__input"
          {...inputProps}
          name={group?.name ?? name}
          value={value}
          checked={resolvedChecked}
          disabled={resolvedDisabled}
          // 先调用户的 onChange,未 preventDefault 再做内部选中(Radix 范式,绝不覆盖丢弃)
          onChange={composeEventHandlers(onChange, handleChange)}
        />
        <span className={controlClasses} aria-hidden="true" />
        {children != null && <span className="ms-radio__label">{children}</span>}
      </label>
    );
  },
);
Radio.displayName = 'Radio';
