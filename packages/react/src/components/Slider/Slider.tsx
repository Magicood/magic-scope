import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ChangeEvent as ReactChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { forwardRef, useCallback, useId, useRef, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';
import { type SliderMark, snapToStep, valueToPercent } from './logic';

export type SliderSize = 'sm' | 'md' | 'lg';
export type SliderTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type SliderOrientation = 'horizontal' | 'vertical';

export type { SliderMark } from './logic';

export interface SliderProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'size'> {
  // 注:保留原生 onChange(可拿到原生事件对象,经 composeEventHandlers 与内部合并),
  // 数值语义另用 onValueChange / onChangeEnd。两者并存,互不覆盖。
  /** 受控值。 */
  value?: number;
  /** 非受控初始值。缺省取 min。 */
  defaultValue?: number;
  /**
   * 值变化回调(拖动 / 键盘,高频)。
   * @param value 变化后的当前数值。
   */
  onValueChange?: (value: number) => void;
  /**
   * 落定回调:松手 / 键盘抬起 / 失焦时,以最终值触发一次(对齐 Radix `onValueCommit`、MUI `onChangeCommitted`)。
   * 拖动中不触发,适合做「提交请求 / 写入 store」这类只关心终值的副作用。
   * @param value 本次交互落定后的最终数值。
   */
  onChangeEnd?: (value: number) => void;
  /**
   * `onChangeEnd` 的别名(对齐 Radix 命名),两者都会被调用。
   * @param value 本次交互落定后的最终数值。
   */
  onValueCommit?: (value: number) => void;
  /** 开始拖动 / 键盘交互(显气泡、抬 thumb 层级),无参数。 */
  onDragStart?: () => void;
  /** 结束拖动 / 键盘交互,无参数。 */
  onDragEnd?: () => void;
  /** 最小值。默认 0。 */
  min?: number;
  /** 最大值。默认 100。 */
  max?: number;
  /** 步长。默认 1。 */
  step?: number;
  /** 尺寸:轨道与滑块等比缩放(随密度)。默认 md。 */
  size?: SliderSize;
  /** 语义色调,经全库 tone resolver 派生配色(轨道填充 / 滑块 / 发光)。默认 primary。 */
  tone?: SliderTone;
  /** 朝向:水平 / 垂直。垂直时需给容器一个高度(--ms-slider-length 或外层 style)。默认 horizontal。 */
  orientation?: SliderOrientation;
  /** 刻度:沿轨道按值绝对定位 tick;有 label 时在其下/旁渲染文字。被填充覆盖的刻度高亮。 */
  marks?: SliderMark[];
  /** 拖动时在滑块上方显示跟随气泡(showValue 同款格式)。默认 false。 */
  showTooltip?: boolean;
  /** 是否在末尾渲染当前值(role=status 的 output)。默认 false。 */
  showValue?: boolean;
  /** 自定义值的展示(如加单位 / 百分号);用于 showValue 与 showTooltip。 */
  formatValue?: (value: number) => ReactNode;
}

/**
 * Slider —— 滑块(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 用原生 input[type=range] 白嫖可访问的 slider 语义(role=slider + aria-valuenow/min/max、键盘方向键 / Home / End);
 * appearance:none + 伪元素自绘轨道 / 填充 / 发光滑块。接全库统一 tone resolver(只读 6 槽位,不写死配色);
 * 支持受控/非受控、刻度 marks、拖动跟随气泡、水平/垂直朝向、sm/md/lg(随密度缩放),
 * 区分高频 onValueChange 与落定 onChangeEnd/onValueCommit、拖动边界 onDragStart/onDragEnd;
 * 触控热区达标、hover/focus-visible 发光、尊重 reduced-motion / motion=off / fx=off。样式见同目录 Slider.css。
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      onChangeEnd,
      onValueCommit,
      onDragStart,
      onDragEnd,
      min = 0,
      max = 100,
      step = 1,
      size = 'md',
      tone = 'primary',
      orientation = 'horizontal',
      marks,
      showTooltip = false,
      showValue = false,
      formatValue,
      disabled,
      className,
      style,
      id,
      // 这些事件先取出来,与内部处理器 compose 后再挂;避免末尾 ...rest 覆盖掉 compose。
      onChange: userOnChange,
      onPointerDown: userOnPointerDown,
      onPointerUp: userOnPointerUp,
      onPointerCancel: userOnPointerCancel,
      onKeyDown: userOnKeyDown,
      onKeyUp: userOnKeyUp,
      onBlur: userOnBlur,
      ...rest
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue ?? min);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internal;

    // 交互态:拖动 / 键盘交互中(显气泡、抬层级);最新值用 ref 留存供 commit 取终值。
    const [active, setActive] = useState(false);
    const latestValue = useRef(value);
    latestValue.current = value;
    const generatedId = useId();
    const tooltipId = id ?? generatedId;

    // 填充百分比(夹在 0–100),供轨道渐变 / 刻度 / 气泡定位用。
    const pct = valueToPercent(value, min, max);

    const format = useCallback(
      (v: number): ReactNode => (formatValue ? formatValue(v) : v),
      [formatValue],
    );

    // 落定:以最新值触发 onChangeEnd + onValueCommit(两个命名都派发,各取所需)。
    const commit = useCallback(() => {
      const v = latestValue.current;
      onChangeEnd?.(v);
      onValueCommit?.(v);
    }, [onChangeEnd, onValueCommit]);

    // 进入交互(pointerdown / keydown):置 active + onDragStart(去重,键盘连按不重复触发)。
    const beginInteraction = useCallback(() => {
      setActive((prev) => {
        if (!prev) onDragStart?.();
        return true;
      });
    }, [onDragStart]);

    // 结束交互(pointerup / keyup / blur):落定 + onDragEnd + 复位 active。
    const endInteraction = useCallback(() => {
      setActive((prev) => {
        if (prev) {
          commit();
          onDragEnd?.();
        }
        return false;
      });
    }, [commit, onDragEnd]);

    const handleChange = useCallback(
      (event: ReactChangeEvent<HTMLInputElement>) => {
        const next = event.target.valueAsNumber;
        latestValue.current = next;
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    const handlePointerDown = useCallback(
      (_event: ReactPointerEvent<HTMLInputElement>) => {
        if (disabled) return;
        beginInteraction();
      },
      [disabled, beginInteraction],
    );

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        // 仅方向键 / Home / End / PageUp/Down 才算开始交互,避免 Tab/Shift 等误触发气泡。
        if (
          event.key.startsWith('Arrow') ||
          event.key === 'Home' ||
          event.key === 'End' ||
          event.key === 'PageUp' ||
          event.key === 'PageDown'
        ) {
          beginInteraction();
        }
      },
      [disabled, beginInteraction],
    );

    const classes = [
      'ms-slider',
      // 水平为默认基座(不加修饰类,对齐 size=md 约定);仅垂直时加 ms-slider--vertical
      orientation !== 'horizontal' && `ms-slider--${orientation}`,
      size !== 'md' && `ms-slider--${size}`,
      `ms-tone-${tone}`,
      active && 'ms-slider--active',
      disabled && 'ms-slider--disabled',
      marks && marks.length > 0 && 'ms-slider--has-marks',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        className={classes}
        data-orientation={orientation}
        style={{ ...style, '--ms-slider-pct': `${pct}%` } as CSSProperties}
      >
        <span className="ms-slider__track-wrap">
          <input
            ref={ref}
            id={id}
            type="range"
            className="ms-slider__input"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-orientation={orientation}
            // 内部处理器统一 compose 用户处理器:先用户、未 preventDefault 再内部,绝不丢弃。
            // 注意:这些必须放在 {...rest} 之后,但用户事件已从 rest 解构出来,故 rest 不会覆盖它们。
            {...rest}
            onChange={composeEventHandlers(userOnChange, handleChange)}
            onPointerDown={composeEventHandlers(userOnPointerDown, handlePointerDown)}
            onPointerUp={composeEventHandlers(userOnPointerUp, endInteraction)}
            onPointerCancel={composeEventHandlers(userOnPointerCancel, endInteraction)}
            onKeyDown={composeEventHandlers(userOnKeyDown, handleKeyDown)}
            onKeyUp={composeEventHandlers(userOnKeyUp, endInteraction)}
            onBlur={composeEventHandlers(userOnBlur, endInteraction)}
          />
          {/* 刻度层:按值百分比绝对定位,被填充覆盖的高亮 */}
          {marks && marks.length > 0 && (
            <span className="ms-slider__marks" aria-hidden="true">
              {marks.map((mark) => {
                const markPct = valueToPercent(
                  // 命中对齐到步长,定位与原生取整一致
                  snapToStep(mark.value, min, max, step),
                  min,
                  max,
                );
                const isActive = mark.value <= value;
                return (
                  <span
                    key={mark.value}
                    className={['ms-slider__mark', isActive && 'ms-slider__mark--active']
                      .filter(Boolean)
                      .join(' ')}
                    style={{ '--ms-slider-mark-pct': `${markPct}%` } as CSSProperties}
                  >
                    <span className="ms-slider__mark-dot" />
                    {mark.label != null && (
                      <span className="ms-slider__mark-label">{mark.label as ReactNode}</span>
                    )}
                  </span>
                );
              })}
            </span>
          )}
          {/* 跟随气泡:仅 showTooltip;active 时可见,进出场受 motion 调制 */}
          {showTooltip && (
            <span
              className="ms-slider__tooltip"
              data-visible={active || undefined}
              id={`${tooltipId}-tooltip`}
              role="status"
              aria-hidden={active ? undefined : true}
            >
              {format(value)}
            </span>
          )}
        </span>
        {showValue && (
          <output className="ms-slider__value" htmlFor={id}>
            {format(value)}
          </output>
        )}
      </span>
    );
  },
);
Slider.displayName = 'Slider';
