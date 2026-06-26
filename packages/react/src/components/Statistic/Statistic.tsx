import type { CSSProperties, ElementType, ReactNode } from 'react';
import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { easeOutCubic, formatStatistic, interpolate } from './logic';

export type StatisticSize = 'sm' | 'md' | 'lg';
export type StatisticTrend = 'up' | 'down';

/** 各子部件的类名留口(细粒度槽位),便于使用方精修单个区域而不破坏整体。 */
export interface StatisticClassNames {
  title?: string | undefined;
  value?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  trend?: string | undefined;
}

export interface StatisticProps {
  /** 主数值。number 走格式化(千分位 + 精度 + 拆段),数字串(如 "1234.5")也会被解析;非数字串原样透传。 */
  value: number | string;
  /** 标题 / 指标名(渲染在数值上方,fg-muted)。 */
  title?: ReactNode | undefined;
  /** 小数位。仅对数值生效;不传则保留原始位数。 */
  precision?: number | undefined;
  /** 数值前缀(如 ¥ / $),随数值基线对齐。 */
  prefix?: ReactNode | undefined;
  /** 数值后缀(如 % / 单位),随数值基线对齐。 */
  suffix?: ReactNode | undefined;
  /** 千分位分隔符。默认 ','。传空串关闭分组。 */
  groupSeparator?: string | undefined;
  /** 趋势:up 染 success + 上箭头,down 染 danger + 下箭头。不传则中性(沿用 fg)。 */
  trend?: StatisticTrend | undefined;
  /** 加载态:渲染 skeleton 占位(aria-busy),不显示真实数值。 */
  loading?: boolean | undefined;
  /** 尺寸(数值字号随密度 data-ms-density 缩放)。默认 md。 */
  size?: StatisticSize | undefined;
  /** 数值区类名留口(等价 classNames.value 的便捷别名)。 */
  valueClassName?: string | undefined;
  /**
   * 挂载时从 0 用 requestAnimationFrame 滚动到目标值(仅对数值有效)。
   * 尊重 prefers-reduced-motion 与 data-ms-motion=off:命中时直接显示终值,不滚动。
   */
  animateOnMount?: boolean | undefined;
  /** 滚动动画时长(ms)。默认 1000。 */
  animateDuration?: number | undefined;
  /** 子部件类名细粒度槽位。 */
  classNames?: StatisticClassNames | undefined;
  /** 多态根元素(默认 div)。 */
  as?: ElementType | undefined;
  /** 根元素额外类名。 */
  className?: string | undefined;
  /** 根元素内联样式。 */
  style?: CSSProperties | undefined;
  /** 无障碍名覆盖。不传则由 title + prefix/value/suffix 自动拼出。 */
  'aria-label'?: string | undefined;
  /** id 透传。 */
  id?: string | undefined;
  /** 其它 data-* 透传到根元素。 */
  [key: `data-${string}`]: unknown;
}

/** 趋势箭头(纯装饰,语义由 aria-label 与 trend 文案承载)。 */
const TrendArrow = ({ trend }: { trend: StatisticTrend }) => (
  <svg
    className="ms-statistic__trend-icon"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    {trend === 'up' ? (
      <path d="M8 3.5 13 9l-1.4 1.4L9 7.8V12.5H7V7.8L4.4 10.4 3 9z" fill="currentColor" />
    ) : (
      <path d="M8 12.5 3 7l1.4-1.4L7 8.2V3.5h2V8.2l2.6-2.6L13 7z" fill="currentColor" />
    )}
  </svg>
);

/** 判断当前是否应跳过滚动动画(系统 reduced-motion 或 data-ms-motion=off)。SSR / 无 matchMedia 时跳过。 */
function shouldReduceMotion(node: HTMLElement | null): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // data-ms-motion=off 总闸(就近祖先)
  const motionOff = node?.closest('[data-ms-motion="off"]') != null;
  return prefersReduced || motionOff;
}

/**
 * Statistic —— 数值统计展示(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 纯格式化(精度 + 千分位 + 拆 sign/integer/fraction)抽到同目录 logic.ts(零 React、可平移 core);
 * 支持 prefix/suffix、trend(up→success+上箭头 / down→danger+下箭头,经全库 tone resolver 染色)、
 * loading skeleton 占位、size × 密度缩放、animateOnMount(rAF 从 0 滚到终值,尊重 reduced-motion / data-ms-motion=off 时直接显示终值)、
 * as 多态根、classNames 子部件留口。a11y:数值容器给完整 aria-label;内容边界:超长 title/value 不撑破。
 * 样式见同目录 Statistic.css,需引入 @magic-scope/react/styles.css。
 */
export const Statistic = forwardRef<HTMLElement, StatisticProps>(
  (
    {
      value,
      title,
      precision,
      prefix,
      suffix,
      groupSeparator = ',',
      trend,
      loading = false,
      size = 'md',
      valueClassName,
      animateOnMount = false,
      animateDuration = 1000,
      classNames,
      as,
      className,
      style,
      'aria-label': ariaLabelProp,
      ...rest
    },
    ref,
  ) => {
    const Root = (as ?? 'div') as ElementType;

    // —— animateOnMount:仅对数值有效。从 0 用 rAF 滚到目标;reduced-motion / motion=off 直接落终值 ——
    const isNumeric = typeof value === 'number' && Number.isFinite(value);
    const rootRef = useRef<HTMLElement | null>(null);
    // 一次性「挂载入场」语义:挂载时把目标值与开关全部快照进一个 ref,
    // 后续 value / animateDuration / loading 等变化都不再重滚(见下方 effect,依赖数组空)。
    const mountConfigRef = useRef({
      animateOnMount,
      isNumeric,
      loading,
      animateDuration,
      target: isNumeric ? (value as number) : 0,
    });
    // 初始 null:首帧不强行画 0。是否从 0 起滚由挂载时的 useLayoutEffect(paint 前)决定,
    // 避免 reduced-motion 下「先画 0、paint 后再修正」的闪烁。
    const [animatedValue, setAnimatedValue] = useState<number | null>(null);

    // 把外部 ref 与内部 rootRef 合并(内部 rootRef 用于读 data-ms-motion 祖先)
    const setRoot = (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        ref.current = node;
      }
    };

    // 仅挂载一次(依赖数组空):入场语义一次性,挂载后 value / 时长变化不重滚 ——
    // 所需配置在挂载时已快照进 mountConfigRef,effect 体内只读 ref 与 setter,故 [] 即为穷尽依赖。
    useLayoutEffect(() => {
      const {
        animateOnMount: anim,
        isNumeric: numeric,
        loading: busy,
        animateDuration: dur,
        target,
      } = mountConfigRef.current;
      if (!anim || !numeric || busy) {
        return;
      }
      // 在 paint 前判定 reduced-motion:命中则保持 null(直接显示终值),不会闪 0。
      if (shouldReduceMotion(rootRef.current)) {
        return;
      }
      const duration = Math.max(0, dur);
      if (duration === 0) {
        return;
      }
      // 确认要滚动:paint 前置 0 作为起点(useLayoutEffect 保证用户不会看到中间的 null→0 修正)。
      setAnimatedValue(0);
      let raf = 0;
      let start = 0;
      const tick = (now: number) => {
        if (start === 0) {
          start = now;
        }
        const elapsed = now - start;
        const progress = elapsed / duration;
        if (progress >= 1) {
          setAnimatedValue(null); // 收尾用真实终值,避免浮点尾差
          return;
        }
        setAnimatedValue(interpolate(0, target, easeOutCubic(progress)));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);

    const displayedValue = animatedValue !== null ? animatedValue : value;
    const formatted = formatStatistic(displayedValue, { precision, groupSeparator });

    // —— 无障碍名:优先用方覆盖,否则由 title + 趋势 + prefix + 数值 + suffix 拼可读串 ——
    const prefixText =
      typeof prefix === 'string' || typeof prefix === 'number' ? String(prefix) : '';
    const suffixText =
      typeof suffix === 'string' || typeof suffix === 'number' ? String(suffix) : '';
    const titleText = typeof title === 'string' || typeof title === 'number' ? String(title) : '';
    const trendText = trend === 'up' ? '上升' : trend === 'down' ? '下降' : '';
    const numberPart = `${prefixText}${formatted.display}${suffixText}`.trim();
    const autoLabel = [titleText, trendText, numberPart].filter(Boolean).join(' ');
    const ariaLabel = ariaLabelProp ?? (autoLabel === '' ? undefined : autoLabel);

    // trend 经 tone resolver 染色:up→success / down→danger;无 trend 不加 tone 类(沿用中性 fg)
    const toneClass =
      trend === 'up' ? 'ms-tone-success' : trend === 'down' ? 'ms-tone-danger' : undefined;

    const rootClasses = [
      'ms-statistic',
      `ms-statistic--${size}`,
      trend && `ms-statistic--trend-${trend}`,
      loading && 'ms-statistic--loading',
      toneClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const valueClasses = ['ms-statistic__value', valueClassName, classNames?.value]
      .filter(Boolean)
      .join(' ');

    return (
      <Root
        ref={setRoot}
        className={rootClasses}
        style={style}
        aria-busy={loading || undefined}
        {...rest}
      >
        {title != null && (
          <div className={['ms-statistic__title', classNames?.title].filter(Boolean).join(' ')}>
            {title}
          </div>
        )}

        {loading ? (
          <div className="ms-statistic__skeleton" aria-hidden="true">
            <span className="ms-statistic__skeleton-bar" />
          </div>
        ) : (
          // role="img" + aria-label:把「趋势+前缀+数字+后缀」这一组装饰性分段(各自 aria-hidden)
          // 收敛成一个带完整可读名的整体,供屏幕阅读器一次读出「标题 趋势 ¥数值后缀」;非交互、无需可聚焦。
          <div className={valueClasses} role="img" aria-label={ariaLabel}>
            {trend != null && (
              <span
                className={['ms-statistic__trend', classNames?.trend].filter(Boolean).join(' ')}
                aria-hidden="true"
              >
                <TrendArrow trend={trend} />
              </span>
            )}
            {prefix != null && (
              <span
                className={['ms-statistic__prefix', classNames?.prefix].filter(Boolean).join(' ')}
                aria-hidden="true"
              >
                {prefix}
              </span>
            )}
            <span className="ms-statistic__number" aria-hidden="true">
              {formatted.numeric ? (
                <>
                  {formatted.sign && <span className="ms-statistic__sign">{formatted.sign}</span>}
                  <span className="ms-statistic__integer">{formatted.integer}</span>
                  {formatted.fraction !== '' && (
                    <span className="ms-statistic__fraction">
                      {formatted.decimalPoint}
                      {formatted.fraction}
                    </span>
                  )}
                </>
              ) : (
                formatted.display
              )}
            </span>
            {suffix != null && (
              <span
                className={['ms-statistic__suffix', classNames?.suffix].filter(Boolean).join(' ')}
                aria-hidden="true"
              >
                {suffix}
              </span>
            )}
          </div>
        )}
      </Root>
    );
  },
);
Statistic.displayName = 'Statistic';
