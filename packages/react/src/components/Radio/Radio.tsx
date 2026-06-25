import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useId, useState } from 'react';

export type RadioSize = 'sm' | 'md' | 'lg';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onSelect: (value: string) => void;
  disabled: boolean | undefined;
  size: RadioSize;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** 受控选中值。 */
  value?: string;
  /** 非受控初始选中值。 */
  defaultValue?: string;
  /** 选中变化回调,入参为被选中项的 value。 */
  onValueChange?: (value: string) => void;
  /** 同组 radio 的 name;省略时自动生成,保证「同名即单选」的原生语义。 */
  name?: string;
  /** 整组禁用。 */
  disabled?: boolean;
  /** 排布方向,同时映射到 aria-orientation。默认 vertical。 */
  orientation?: 'horizontal' | 'vertical';
  /** 尺寸,透传给组内 Radio。默认 md。 */
  size?: RadioSize;
}

/**
 * RadioGroup —— 单选组容器。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 渲染 role="radiogroup",用 context 把 name / 选中值 / 尺寸 / 禁用下发给组内 Radio;
 * 支持受控(value)与非受控(defaultValue)。组内 Radio 基于原生 input[type=radio],
 * 同 name 自动获得方向键导航与 roving tabindex(无障碍开箱即用)。
 * 样式见同目录 Radio.css,需引入 @magic-scope/react/styles.css。
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      name,
      disabled,
      orientation = 'vertical',
      size = 'md',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const autoName = useId();
    const [internal, setInternal] = useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internal;

    const onSelect = (next: string) => {
      if (controlledValue === undefined) {
        setInternal(next);
      }
      onValueChange?.(next);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
        className={['ms-radio-group', `ms-radio-group--${orientation}`, className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <RadioGroupContext.Provider
          value={{ name: name ?? autoName, value, onSelect, disabled, size }}
        >
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
  size?: RadioSize;
}

/**
 * Radio —— 单选项,基于原生 input[type=radio]。通常置于 RadioGroup 内(从 context 取 name / 选中态 / 尺寸 / 禁用)。
 * 结构:label 包视觉隐藏的原生 input + 视觉圆点控件(checked 时染主色并以 ::after 显内点)+ 可选文字。
 * 完整覆盖 hover / focus-visible(发光环) / checked / disabled 状态与过渡;触控热区达标、尊重 reduced-motion。
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ value, children, className, size, disabled, checked, name, onChange, ...props }, ref) => {
    const group = useContext(RadioGroupContext);
    const resolvedSize = size ?? group?.size ?? 'md';
    const resolvedDisabled = disabled ?? group?.disabled;
    const resolvedChecked = group ? group.value === value : checked;

    return (
      <label
        className={['ms-radio', resolvedSize !== 'md' && `ms-radio--${resolvedSize}`, className]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={ref}
          type="radio"
          className="ms-radio__input"
          {...props}
          name={group?.name ?? name}
          value={value}
          checked={resolvedChecked}
          disabled={resolvedDisabled}
          onChange={(event) => {
            group?.onSelect(value);
            onChange?.(event);
          }}
        />
        <span className="ms-radio__control" aria-hidden="true" />
        {children != null && <span className="ms-radio__label">{children}</span>}
      </label>
    );
  },
);
Radio.displayName = 'Radio';
