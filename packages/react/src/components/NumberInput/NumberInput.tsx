import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useEffect, useState } from 'react';

export type NumberInputSize = 'sm' | 'md' | 'lg';

export interface NumberInputProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
  > {
  /** 受控值。 */
  value?: number;
  /** 非受控初始值。 */
  defaultValue?: number;
  /** 值变化回调:有效数字时传 number,清空时传 null。 */
  onValueChange?: (value: number | null) => void;
  /** 最小值。默认 -Infinity(不限)。 */
  min?: number;
  /** 最大值。默认 Infinity(不限)。 */
  max?: number;
  /** 步进步长(步进按钮与方向键)。默认 1。 */
  step?: number;
  /** 尺寸。默认 md。 */
  size?: NumberInputSize;
}

const toText = (n: number | null | undefined) => (n == null ? '' : String(n));

/**
 * NumberInput —— 数字步进输入。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 结构:− 按钮 + 原生 input[type=number](spinbutton 语义、方向键步进) + ＋ 按钮,整体一个描边控件。
 * 内部以「显示文本」管理,避免受控数字框打不出小数点 / 中间态的老问题;步进与失焦时夹取到 [min,max]。
 * 支持受控与非受控、min/max/step、sm/md/lg;触控热区达标、hover/focus 发光、尊重 reduced-motion。
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      min = Number.NEGATIVE_INFINITY,
      max = Number.POSITIVE_INFINITY,
      step = 1,
      size = 'md',
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined;
    const [text, setText] = useState(() => toText(defaultValue ?? controlledValue));

    // 受控:外部 value 变化时同步显示文本;但当前文本解析后已等于 value 则不覆盖(保住「1.」之类中间态)
    useEffect(() => {
      if (!isControlled) return;
      setText((prev) => {
        const parsed = prev === '' ? null : Number(prev);
        return parsed === controlledValue ? prev : toText(controlledValue);
      });
    }, [controlledValue, isControlled]);

    const clamp = (n: number) => Math.min(max, Math.max(min, n));

    const current = text === '' ? null : Number(text);
    const atMin = current != null && !Number.isNaN(current) && current <= min;
    const atMax = current != null && !Number.isNaN(current) && current >= max;

    const commit = (next: string, emitValue: number | null) => {
      if (!isControlled) setText(next);
      else setText(next); // 受控也先回显,父级回灌 value 时由 effect 决定是否覆盖
      onValueChange?.(emitValue);
    };

    const handleInput = (raw: string) => {
      // 自由输入,不在打字途中夹取;可解析为数字才上报,纯中间态(''/'-'/'1.')不误报
      if (raw === '') {
        commit('', null);
        return;
      }
      const n = Number(raw);
      if (Number.isNaN(n)) {
        // 中间态(如 "-"、"1."):仅回显,不上报
        if (!isControlled) setText(raw);
        else setText(raw);
        return;
      }
      commit(raw, n);
    };

    const stepBy = (delta: number) => {
      const base = current != null && !Number.isNaN(current) ? current : 0;
      const next = clamp(base + delta);
      commit(String(next), next);
    };

    const handleBlur = () => {
      if (text === '') return;
      const n = Number(text);
      if (Number.isNaN(n)) {
        commit('', null);
        return;
      }
      const c = clamp(n);
      commit(String(c), c);
    };

    return (
      <div
        className={[
          'ms-number-input',
          size !== 'md' && `ms-number-input--${size}`,
          disabled && 'ms-number-input--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          type="button"
          className="ms-number-input__step ms-number-input__step--dec"
          aria-label="减少"
          tabIndex={-1}
          disabled={disabled || atMin}
          onClick={() => stepBy(-step)}
        >
          <span aria-hidden="true">−</span>
        </button>
        <input
          ref={ref}
          type="number"
          className="ms-number-input__field"
          inputMode="decimal"
          value={text}
          disabled={disabled}
          min={min === Number.NEGATIVE_INFINITY ? undefined : min}
          max={max === Number.POSITIVE_INFINITY ? undefined : max}
          step={step}
          onChange={(event) => handleInput(event.target.value)}
          onBlur={handleBlur}
          {...props}
        />
        <button
          type="button"
          className="ms-number-input__step ms-number-input__step--inc"
          aria-label="增加"
          tabIndex={-1}
          disabled={disabled || atMax}
          onClick={() => stepBy(step)}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    );
  },
);
NumberInput.displayName = 'NumberInput';
