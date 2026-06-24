import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export interface ProgressProps extends ComponentPropsWithoutRef<'div'> {
  /** 进度值,0-100。确定态下设为 aria-valuenow 并驱动填充宽度;省略或 indeterminate 时为不确定态。 */
  value?: number;
  /** 不确定态:不知道具体进度,填充段左右往返流动。默认 false。 */
  indeterminate?: boolean;
}

/** 把 value 夹到 0-100,非法值回退到 0。 */
const clamp = (n: number): number => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0);

/**
 * Progress —— 进度条。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * role="progressbar",aria-valuemin=0 / aria-valuemax=100;确定态设 aria-valuenow 并按 value% 驱动填充宽度,
 * 不确定态(indeterminate 或缺省 value)让一段奥术发光填充左右往返流动。尊重 reduced-motion(放慢往返,保留语义)。
 * 样式见同目录 Progress.css,需引入 @magic-scope/react/styles.css。
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, indeterminate = false, className, style, ...props }, ref) => {
    const isIndeterminate = indeterminate || value === undefined;
    const clamped = isIndeterminate ? undefined : clamp(value as number);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className={['ms-progress', isIndeterminate && 'ms-progress--indeterminate', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div
          className="ms-progress__fill"
          style={isIndeterminate ? style : { ...style, inlineSize: `${clamped}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';
