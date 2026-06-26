import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { forwardRef } from 'react';

export type ProgressTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressVariant = 'linear' | 'circular';

/** 子部件 className 精修槽位。线性:root/track/fill/buffer/label;环形复用同名语义。 */
export interface ProgressClassNames {
  /** 进度轨道(线性的底槽 / 环形的底环)。 */
  track?: string;
  /** 进度填充段(线性的进度条 / 环形的进度弧)。 */
  fill?: string;
  /** 缓冲段(仅线性)。 */
  buffer?: string;
  /** 数值 / label 文本容器。 */
  label?: string;
}

export interface ProgressProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'color'> {
  /** 进度值,0-100。确定态下设为 aria-valuenow 并驱动填充;省略或 indeterminate 时为不确定态。 */
  value?: number;
  /** 不确定态:不知道具体进度,填充段流动(线性往返 / 环形旋转)。默认 false。 */
  indeterminate?: boolean;
  /** 形态:线性进度条 / 环形进度。默认 linear。 */
  variant?: ProgressVariant;
  /** 语义色调,经全库 tone resolver 只读 6 槽位(不写死配色)。默认 primary。 */
  tone?: ProgressTone;
  /** 尺寸(随 data-ms-density 缩放):线性改条高、环形改直径与线宽。默认 md。 */
  size?: ProgressSize;
  /** 条纹填充(repeating-linear-gradient 斜纹)。 */
  striped?: boolean;
  /** 条纹流动动画(需 striped;受 data-ms-motion 与 prefers-reduced-motion 门控)。 */
  animated?: boolean;
  /**
   * 缓冲段:已加载但未播放/未完成的进度(0-100,如视频缓冲)。仅线性变体,绘制在 fill 之下、track 之上。
   * 兼容:小于当前 value 时视觉被 fill 覆盖,语义仍写入 aria-valuetext 由使用方自定义时另说。
   */
  buffer?: number;
  /** 显示进度百分比文本:线性显示在条旁(末尾),环形显示在环心。不确定态不显示。 */
  showValue?: boolean;
  /**
   * 自定义 label 槽位(ReactNode):覆盖 showValue 的纯百分比,可放任意内容。
   * 线性显示在条旁,环形显示在环心。传入即生效(无需 showValue)。
   */
  label?: ReactNode;
  /** 实例级发光强度:off 关闭装饰发光(覆盖全局 --ms-fx-glow);默认随全局。 */
  glow?: 'off';
  /** 子部件 className 精修(track / fill / buffer / label)。 */
  classNames?: ProgressClassNames;
}

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/** 把 value 夹到 0-100,非法值回退到 0。纯函数。 */
export const clampProgress = (n: number): number =>
  Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;

/** 圆周率常量与默认环形几何(供环形 stroke-dasharray 计算,纯函数无副作用)。 */
const TAU = Math.PI * 2;

/**
 * Progress —— 进度条(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 形态:linear 线性 / circular 环形(SVG stroke-dashoffset)。
 * 能力:tone 语义色(只读 6 槽位,不写死配色)、size 随密度缩放、striped+animated 条纹、
 * buffer 缓冲段、showValue/label 数值或自定义 ReactNode、确定态 + 不确定态流动。
 *
 * **留口**:`...rest` 透传所有原生属性与事件到根;`className`/`style` 给根、`classNames={{track,fill,buffer,label}}`
 * 精修子部件;`forwardRef` 到根。全部动效受 data-ms-motion 与 prefers-reduced-motion 调制(关闭即静止)。
 * 样式见同目录 Progress.css,需引入 @magic-scope/react/styles.css。
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value,
    indeterminate = false,
    variant = 'linear',
    tone = 'primary',
    size = 'md',
    striped = false,
    animated = false,
    buffer,
    showValue = false,
    label,
    glow,
    classNames,
    className,
    style,
    role = 'progressbar',
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const isIndeterminate = indeterminate || value === undefined;
  const clamped = isIndeterminate ? undefined : clampProgress(value as number);
  const clampedBuffer = buffer != null ? clampProgress(buffer) : undefined;

  // label 槽:显式 label 优先;否则 showValue 在确定态下渲染百分比
  const valueText = clamped != null ? `${Math.round(clamped)}%` : undefined;
  const labelNode: ReactNode =
    label != null ? label : showValue && valueText != null ? valueText : undefined;

  // 未显式给 aria-label 时给一个可读兜底(进度条无可见文字时的可达性)。
  // 待 i18n 字典补 'progress.label' key 后切到 useMessages();现用中文兜底(见 notes)。
  const resolvedAriaLabel = ariaLabel ?? (labelNode == null ? '进度' : undefined);

  const rootClasses = cx(
    'ms-progress',
    `ms-progress--${variant}`,
    `ms-progress--${size}`,
    `ms-tone-${tone}`,
    isIndeterminate && 'ms-progress--indeterminate',
    striped && 'ms-progress--striped',
    striped && animated && 'ms-progress--animated',
    glow === 'off' && 'ms-progress--glow-off',
    labelNode != null && 'ms-progress--has-label',
    className,
  );

  const a11y = {
    role,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': clamped,
    'aria-label': resolvedAriaLabel,
  } as const;

  if (variant === 'circular') {
    // 环形几何:viewBox 100×100,半径随线宽内缩,周长 = 2πr;进度 = dashoffset
    const stroke = size === 'sm' ? 8 : size === 'lg' ? 14 : 11;
    const r = (100 - stroke) / 2;
    const circumference = TAU * r;
    const dashOffset = clamped != null ? circumference * (1 - clamped / 100) : circumference * 0.25;

    const ringVars = {
      '--ms-progress-circ': `${circumference}`,
      '--ms-progress-stroke': `${stroke}`,
      '--ms-progress-r': `${r}`,
    } as CSSProperties;

    return (
      <div ref={ref} className={rootClasses} style={{ ...ringVars, ...style }} {...a11y} {...rest}>
        <svg
          className="ms-progress__svg"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className={cx('ms-progress__track', classNames?.track)}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className={cx('ms-progress__fill', classNames?.fill)}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isIndeterminate ? undefined : dashOffset}
          />
        </svg>
        {labelNode != null && (
          <span
            className={cx('ms-progress__label', 'ms-progress__label--center', classNames?.label)}
          >
            {labelNode}
          </span>
        )}
      </div>
    );
  }

  // 线性
  return (
    <div ref={ref} className={rootClasses} style={style} {...a11y} {...rest}>
      <div className={cx('ms-progress__track', classNames?.track)}>
        {clampedBuffer != null && !isIndeterminate && (
          <div
            className={cx('ms-progress__buffer', classNames?.buffer)}
            style={{ inlineSize: `${clampedBuffer}%` }}
          />
        )}
        <div
          className={cx('ms-progress__fill', classNames?.fill)}
          style={isIndeterminate ? undefined : { inlineSize: `${clamped}%` }}
        />
      </div>
      {labelNode != null && (
        <span className={cx('ms-progress__label', classNames?.label)}>{labelNode}</span>
      )}
    </div>
  );
});
Progress.displayName = 'Progress';
