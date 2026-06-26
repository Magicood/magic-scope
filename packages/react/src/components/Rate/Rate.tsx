import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';
import { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  clampRate,
  fillStateAt,
  type RateFillState,
  rateStep,
  resolveClickValue,
  starOrdinal,
  stepValue,
  valueFromPointer,
} from './logic';

export type RateSize = 'sm' | 'md' | 'lg';
export type RateTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** 部件级 className 定制。 */
export interface RateClassNames {
  /** 单颗星外层(可点区域)。 */
  item?: string;
  /** 星图标本体(满/空叠放)。 */
  star?: string;
  /** 评分文案 / 自定义渲染容器。 */
  text?: string;
}

/** 自定义渲染单颗星时的状态入参。 */
export interface RateCharacterRenderState {
  /** 0 基索引。 */
  index: number;
  /** 该星填充态(满/半/空,已计入 hover 预览)。 */
  state: RateFillState;
  /** 当前生效的展示值(hover 时为预览值,否则为评分值)。 */
  value: number;
}

export interface RateProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  /** 当前评分(受控)。0..count,allowHalf 时可为 .5 步进。 */
  value?: number | undefined;
  /** 默认评分(非受控)。 */
  defaultValue?: number | undefined;
  /** 评分变化回调(单参为最终评分值)。 */
  onChange?: (value: number) => void;
  /** 星数。默认 5。 */
  count?: number;
  /** 允许半星(指针落在星左半区取 .5,键盘步进 0.5)。 */
  allowHalf?: boolean;
  /** 再次点击当前评分时清零。默认 true。 */
  allowClear?: boolean;
  /** 自定义图标:ReactNode(所有星共用)或 (state) => ReactNode(逐星定制)。默认五角星。 */
  character?: ReactNode | ((state: RateCharacterRenderState) => ReactNode);
  /** 只读:展示评分但不可交互(仍可聚焦读屏)。 */
  readOnly?: boolean;
  /** 禁用:不可交互、降透明度、移出 Tab 序。 */
  disabled?: boolean;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: RateSize;
  /** 语义色调,派生填充色与发光。默认 warning(金色)。 */
  tone?: RateTone;
  /** 每颗星的提示文案(title + aria),长度应为 count。 */
  tooltips?: readonly string[] | undefined;
  /** 在星组右侧渲染评分文案;true 显示数值,或传 (value) => ReactNode 自定义。 */
  showText?: boolean | ((value: number) => ReactNode);
  /** 悬停预览值变化回调(移出为 -1)。 */
  onHoverChange?: (value: number) => void;
  /** 部件级 className。 */
  classNames?: RateClassNames | undefined;
  /** 无障碍名称(无可见 label 时建议提供)。 */
  'aria-label'?: string;
  /** 关联可见 label 的 id。 */
  'aria-labelledby'?: string;
  /** 附加根类名。 */
  className?: string;
}

/** 默认五角星(满 / 空 共用同一路径,空态走描边 + 低透明)。 */
const DefaultStar = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M12 2.2l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.27l-5.9 3.1 1.13-6.56L2.46 9.14l6.6-.96L12 2.2z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Rate —— 评分(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 接全库 tone 槽位(填充/发光只读 --ms-c*,默认 warning 金色,不写死配色);尺寸随密度 data-ms-density 缩放;
 * 受控 value / 非受控 defaultValue + onChange 双通道;半星(allowHalf,指针半区 + 键盘 0.5 步进)、
 * 再点清零(allowClear)、自定义图标(character 共用或逐星 render-prop)、只读 / 禁用、hover 预览高亮、
 * 每星 tooltip、评分文案(showText)、onHoverChange 语义回调;键盘 ←/→/↑/↓ 加减、Home/End 极值。
 *
 * 无障碍:根 role=slider + aria-valuemin/max/now/text,键盘可达;内部处理器一律 compose 用户传入的;
 * 留口:character / showText render-prop、classNames 部件定制、...rest 透传到根、forwardRef 到根。
 * 样式见同目录 Rate.css,需引入 @magic-scope/react/styles.css。
 */
export const Rate = forwardRef<HTMLDivElement, RateProps>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    count = 5,
    allowHalf = false,
    allowClear = true,
    character,
    readOnly = false,
    disabled = false,
    size = 'md',
    tone = 'warning',
    tooltips,
    showText = false,
    onHoverChange,
    classNames,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    onKeyDown,
    onMouseLeave,
    ...rest
  } = props;

  const reactId = useId();
  const groupId = `ms-rate-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // 受控 / 非受控评分值。
  const isControlled = valueProp !== undefined;
  const [valueInternal, setValueInternal] = useState<number>(() =>
    clampRate(defaultValue, count, allowHalf),
  );
  const rawValue = isControlled ? valueProp : valueInternal;
  const value = clampRate(rawValue, count, allowHalf);

  // hover 预览值(-1 = 无悬停)。
  const [hoverValue, setHoverValue] = useState(-1);
  const isHovering = hoverValue >= 0;
  // 展示值:悬停时用预览值,否则用评分值。
  const displayValue = isHovering ? hoverValue : value;

  const interactive = !readOnly && !disabled;
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setHover = useCallback(
    (next: number) => {
      setHoverValue((prev) => {
        if (prev === next) {
          return prev;
        }
        onHoverChange?.(next);
        return next;
      });
    },
    [onHoverChange],
  );

  const commit = useCallback(
    (next: number) => {
      const clamped = clampRate(next, count, allowHalf);
      // 仅在评分实际变化时下发 onChange(避免重复点同值 / 归零到本就为 0 的空触发)。
      if (clamped === value) {
        return;
      }
      if (!isControlled) {
        setValueInternal(clamped);
      }
      onChange?.(clamped);
    },
    [count, allowHalf, isControlled, onChange, value],
  );

  // 指针落在第 index 颗星的左半区?用 getBoundingClientRect 判定,失败回退非左半(整星)。
  const isLeftHalf = useCallback((index: number, clientX: number): boolean => {
    const el = itemRefs.current[index];
    if (!el) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) {
      return false;
    }
    return clientX - rect.left < rect.width / 2;
  }, []);

  const handleItemClick = useCallback(
    (index: number, clientX: number) => {
      if (!interactive) {
        return;
      }
      const left = allowHalf && isLeftHalf(index, clientX);
      const next = valueFromPointer(index, left, allowHalf);
      commit(resolveClickValue(value, next, allowClear));
    },
    [interactive, allowHalf, isLeftHalf, value, allowClear, commit],
  );

  const handleItemMove = useCallback(
    (index: number, clientX: number) => {
      if (!interactive) {
        return;
      }
      const left = allowHalf && isLeftHalf(index, clientX);
      setHover(valueFromPointer(index, left, allowHalf));
    },
    [interactive, allowHalf, isLeftHalf, setHover],
  );

  const handleMouseLeave = useCallback(() => {
    if (!interactive) {
      return;
    }
    setHover(-1);
  }, [interactive, setHover]);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!interactive) {
        return;
      }
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          commit(stepValue(value, 1, count, allowHalf));
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          commit(stepValue(value, -1, count, allowHalf));
          break;
        case 'Home':
          e.preventDefault();
          commit(0);
          break;
        case 'End':
          e.preventDefault();
          commit(count);
          break;
        default:
          break;
      }
    },
    [interactive, value, count, allowHalf, commit],
  );

  // 评分文案:showText 为函数则自定义,为 true 显示「value / count」。
  const textNode = useMemo<ReactNode>(() => {
    if (showText === false) {
      return null;
    }
    if (typeof showText === 'function') {
      return showText(value);
    }
    return `${value} / ${count}`;
  }, [showText, value, count]);

  // role=slider 的无障碍文案:有 tooltip 用当前整星对应 tooltip,否则用「count 分中 value 分」。
  // 注:i18n 字典尚无 rate.* key(本组件不改 messages.ts),先用中文字面量兜底,见交付 notes。
  const t = useMessages();
  const valueText = (() => {
    const idx = Math.ceil(value) - 1;
    const tip = idx >= 0 ? tooltips?.[idx] : undefined;
    if (tip) {
      return tip;
    }
    return t('rate.valueText', { count, value });
  })();

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel ?? (ariaLabelledby ? undefined : t('rate.label'))}
      aria-labelledby={ariaLabelledby}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      data-readonly={readOnly ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-half={allowHalf ? '' : undefined}
      className={[
        'ms-rate',
        `ms-rate--${size}`,
        `ms-tone-${tone}`,
        !interactive && 'ms-rate--static',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onKeyDown={composeEventHandlers(
        onKeyDown as ((e: ReactKeyboardEvent<HTMLDivElement>) => void) | undefined,
        handleKeyDown,
      )}
      onMouseLeave={composeEventHandlers(onMouseLeave, handleMouseLeave)}
      {...rest}
    >
      <span className="ms-rate__group" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => {
          const state = fillStateAt(index, displayValue, allowHalf);
          const ordinal = starOrdinal(index);
          const tip = tooltips?.[index];
          const charNode =
            typeof character === 'function'
              ? character({ index, state, value: displayValue })
              : (character ?? <DefaultStar />);

          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘交互在根 slider 统一处理(单值滑块模型);单颗星仅响应指针,星组 aria-hidden
            // biome-ignore lint/a11y/noStaticElementInteractions: 单颗星是滑块刻度的指针落点(半星精度需逐星 rect),无障碍语义全由根 role=slider 承载,星层 aria-hidden 不应另挂 role
            <div
              key={`${groupId}-${ordinal}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={['ms-rate__item', `ms-rate__item--${state}`, classNames?.item]
                .filter(Boolean)
                .join(' ')}
              data-state={state}
              title={tip}
              onClick={(e) => handleItemClick(index, e.clientX)}
              onMouseMove={(e) => handleItemMove(index, e.clientX)}
            >
              {/* 满/空两层叠放:满层按 fillState 用 clip 裁剪宽度(整星/半星/0),实现半星与平滑过渡 */}
              <span
                className={['ms-rate__star ms-rate__star--bg', classNames?.star]
                  .filter(Boolean)
                  .join(' ')}
              >
                {charNode}
              </span>
              <span
                className={['ms-rate__star ms-rate__star--fill', classNames?.star]
                  .filter(Boolean)
                  .join(' ')}
              >
                {charNode}
              </span>
            </div>
          );
        })}
      </span>
      {textNode != null && textNode !== false && (
        <span className={['ms-rate__text', classNames?.text].filter(Boolean).join(' ')}>
          {textNode}
        </span>
      )}
    </div>
  );
});
Rate.displayName = 'Rate';

/** 步进单位(导出便于消费方对齐键盘步进语义)。 */
export { rateStep };
