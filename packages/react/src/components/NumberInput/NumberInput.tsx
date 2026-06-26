import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { clampValue, fixPrecision, isIntermediate, parseValue, stepValue, toText } from './logic';

export type NumberInputSize = 'sm' | 'md' | 'lg';
export type NumberInputTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 步进方向。 */
export type StepDirection = 'up' | 'down';

export interface NumberInputProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    'type' | 'value' | 'defaultValue' | 'size' | 'prefix'
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
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: NumberInputSize;
  /** 校验失败态:染 danger 边发光并设 aria-invalid。 */
  invalid?: boolean;
  /** 聚焦发光环色调;invalid 时强制 danger。默认 primary。 */
  tone?: NumberInputTone;
  /** 框内前置内容(图标 / 单位文字,如 ¥)。 */
  prefix?: ReactNode;
  /** 框内后置内容(单位文字,如 % / kg)。 */
  suffix?: ReactNode;
  /** 任一方向步进后回调(按钮或方向键),携带新值与方向。 */
  onStep?: (value: number, direction: StepDirection) => void;
  /** 向上步进后回调。 */
  onStepUp?: (value: number) => void;
  /** 向下步进后回调。 */
  onStepDown?: (value: number) => void;
  /** 回车回调:clamp 并提交后触发,携带提交值(可能为 null)。 */
  onPressEnter?: (value: number | null, event: React.KeyboardEvent<HTMLInputElement>) => void;
  /** 外层容器 className(组件根)。 */
  className?: string;
  /** 原生 input 自身 className。 */
  fieldClassName?: string;
  /** 两个步进按钮 className。 */
  stepClassName?: string;
}

/** 长按连续步进:首次延迟与重复间隔(ms)。 */
const LONG_PRESS_DELAY = 400;
const LONG_PRESS_INTERVAL = 80;

/**
 * NumberInput —— 数字步进输入(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 结构:− 按钮 + 原生 input[type=number](spinbutton 语义、方向键步进) + ＋ 按钮,整体一个描边控件。
 * 内部以「显示文本」管理,避免受控数字框打不出小数点 / 中间态的老问题;步进与失焦时夹取到 [min,max]。
 * tone 聚焦发光环(读 6 槽位,invalid→danger);prefix/suffix 框内单位;长按连续步进(加速);
 * onStep/onStepUp/onStepDown/onPressEnter 语义回调区分来源;尺寸随密度缩放;触控热区达标、尊重 reduced-motion。
 * 留口:...rest 透传根;fieldClassName/stepClassName 定制;onChange/onBlur/onFocus/onKeyDown 走 compose 不覆盖。
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
      invalid = false,
      tone = 'primary',
      prefix,
      suffix,
      onStep,
      onStepUp,
      onStepDown,
      onPressEnter,
      disabled,
      className,
      fieldClassName,
      stepClassName,
      onChange,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    const isControlled = controlledValue !== undefined;
    const [text, setText] = useState(() => toText(defaultValue ?? controlledValue));

    // 受控:外部 value 变化时同步显示文本;但当前文本解析后已等于 value 则不覆盖(保住「1.」之类中间态)
    useEffect(() => {
      if (!isControlled) return;
      setText((prev) => {
        const parsed = parseValue(prev);
        return parsed === controlledValue ? prev : toText(controlledValue);
      });
    }, [controlledValue, isControlled]);

    const current = parseValue(text);
    const atMin = current != null && current <= min;
    const atMax = current != null && current >= max;

    const commit = (next: string, emitValue: number | null) => {
      setText(next); // 受控也先回显,父级回灌 value 时由 effect 决定是否覆盖
      onValueChange?.(emitValue);
    };

    const handleInput = (raw: string) => {
      // 自由输入,不在打字途中夹取;可解析为数字才上报,纯中间态(''/'-'/'1.')不误报
      if (raw === '') {
        commit('', null);
        return;
      }
      if (isIntermediate(raw)) {
        setText(raw); // 中间态(如 "-"、"1."):仅回显,不上报
        return;
      }
      commit(raw, Number(raw));
    };

    const stepBy = (direction: StepDirection) => {
      const delta = direction === 'up' ? step : -step;
      const next = fixPrecision(stepValue(current, delta, min, max), step);
      commit(String(next), next);
      onStep?.(next, direction);
      if (direction === 'up') onStepUp?.(next);
      else onStepDown?.(next);
    };

    // —— 长按连续步进:首次延迟后按 interval 重复,松手/离开/禁用即停 ——
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // pointerdown 已处理过本次交互的标记:随后的 click 跳过,避免鼠标点击双触发(pointerdown + click)
    const pointerHandledRef = useRef(false);
    // 用 ref 持最新 stepBy,避免 setInterval 闭包捕获过期的 current
    const stepRef = useRef(stepBy);
    stepRef.current = stepBy;

    // 稳定引用(只操作 ref),供 cleanup effect 依赖
    const stopHold = useCallback(() => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);
    const startHold = (direction: StepDirection) => {
      stopHold();
      pointerHandledRef.current = true;
      stepRef.current(direction); // 立即走一步
      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          stepRef.current(direction);
        }, LONG_PRESS_INTERVAL);
      }, LONG_PRESS_DELAY);
    };
    // click 兜底:键盘(Enter/Space)激活按钮或纯 click 时走一步;pointerdown 已处理则跳过并复位
    const handleStepClick = (direction: StepDirection) => {
      if (pointerHandledRef.current) {
        pointerHandledRef.current = false;
        return;
      }
      stepBy(direction);
    };
    // 卸载兜底:清掉计时器
    useEffect(() => stopHold, [stopHold]);

    const handleBlur = () => {
      if (text === '') return;
      const n = parseValue(text);
      if (n == null) {
        commit('', null);
        return;
      }
      const c = fixPrecision(clampValue(n, min, max), step);
      commit(String(c), c);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        // 回车:clamp + 提交语义,透出提交后的值
        let emitted: number | null = null;
        if (text !== '') {
          const n = parseValue(text);
          if (n == null) {
            commit('', null);
          } else {
            const c = fixPrecision(clampValue(n, min, max), step);
            commit(String(c), c);
            emitted = c;
          }
        }
        onPressEnter?.(emitted, event);
      }
    };

    const tn = invalid ? 'danger' : tone;

    return (
      <div
        className={[
          'ms-number-input',
          `ms-number-input--${size}`,
          `ms-tone-${tn}`,
          invalid && 'ms-number-input--invalid',
          disabled && 'ms-number-input--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          type="button"
          className={['ms-number-input__step ms-number-input__step--dec', stepClassName]
            .filter(Boolean)
            .join(' ')}
          aria-label={t('numberInput.decrement', undefined, '减少')}
          tabIndex={-1}
          disabled={disabled || atMin}
          onPointerDown={(event) => {
            // 仅主键触发连续步进;阻止抢走 input 焦点
            if (event.button !== 0) return;
            event.preventDefault();
            startHold('down');
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          onClick={() => handleStepClick('down')}
        >
          <span aria-hidden="true">−</span>
        </button>
        {prefix != null && <span className="ms-number-input__prefix">{prefix}</span>}
        <input
          ref={ref}
          type="number"
          className={['ms-number-input__field', fieldClassName].filter(Boolean).join(' ')}
          inputMode="decimal"
          value={text}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          min={min === Number.NEGATIVE_INFINITY ? undefined : min}
          max={max === Number.POSITIVE_INFINITY ? undefined : max}
          step={step}
          onChange={composeEventHandlers(onChange, (event) => handleInput(event.target.value))}
          onBlur={composeEventHandlers(onBlur, handleBlur)}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          {...props}
        />
        {suffix != null && <span className="ms-number-input__suffix">{suffix}</span>}
        <button
          type="button"
          className={['ms-number-input__step ms-number-input__step--inc', stepClassName]
            .filter(Boolean)
            .join(' ')}
          aria-label={t('numberInput.increment', undefined, '增加')}
          tabIndex={-1}
          disabled={disabled || atMax}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            startHold('up');
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          onClick={() => handleStepClick('up')}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    );
  },
);
NumberInput.displayName = 'NumberInput';
