import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { forwardRef, useState } from 'react';

export type SliderSize = 'sm' | 'md' | 'lg';

export interface SliderProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
  > {
  /** 受控值。 */
  value?: number;
  /** 非受控初始值。缺省取 min。 */
  defaultValue?: number;
  /** 值变化回调(拖动 / 键盘),入参为数值。 */
  onValueChange?: (value: number) => void;
  /** 最小值。默认 0。 */
  min?: number;
  /** 最大值。默认 100。 */
  max?: number;
  /** 步长。默认 1。 */
  step?: number;
  /** 尺寸:轨道与滑块等比缩放。默认 md。 */
  size?: SliderSize;
  /** 是否在末尾渲染当前值(role=status 的 output)。默认 false。 */
  showValue?: boolean;
  /** 自定义值的展示(如加单位 / 百分号);仅在 showValue 时生效。 */
  formatValue?: (value: number) => ReactNode;
}

/**
 * Slider —— 滑块,基于原生 input[type=range]。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 用原生 range 白嫖可访问的 slider 语义(role=slider + aria-valuenow/min/max、键盘方向键 / Home / End);
 * 以 appearance:none + 伪元素自绘轨道 / 填充 / 发光滑块。支持受控与非受控,sm/md/lg 三档,
 * 触控热区达标、hover/focus-visible 发光、尊重 reduced-motion。样式见同目录 Slider.css。
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      size = 'md',
      showValue = false,
      formatValue,
      disabled,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue ?? min);
    const value = controlledValue !== undefined ? controlledValue : internal;

    // 填充百分比(夹在 0–100),供轨道渐变与 Firefox progress 用
    const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

    return (
      <span
        className={['ms-slider', size !== 'md' && `ms-slider--${size}`, className]
          .filter(Boolean)
          .join(' ')}
        style={{ ...style, '--ms-slider-pct': `${pct}%` } as CSSProperties}
      >
        <input
          ref={ref}
          type="range"
          className="ms-slider__input"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            if (controlledValue === undefined) {
              setInternal(next);
            }
            onValueChange?.(next);
          }}
          {...props}
        />
        {showValue && (
          <output className="ms-slider__value">{formatValue ? formatValue(value) : value}</output>
        )}
      </span>
    );
  },
);
Slider.displayName = 'Slider';
