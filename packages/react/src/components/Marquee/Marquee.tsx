import type { ComponentPropsWithoutRef, CSSProperties, PointerEvent, ReactNode } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { composeEventHandlers } from '../../utils/compose';
import {
  cycleDistance,
  isVerticalDirection,
  type MarqueeDirection,
  repeatCount,
  resolveDuration,
  shouldAnimate,
  shouldReverseAnimation,
  trackTranslatePercent,
} from './logic';

export type { MarqueeDirection };

/** 各部件细粒度 className 槽位(留口)。 */
export interface MarqueeClassNames {
  /** 根容器(裁切溢出、承载遮罩)。 */
  root?: string | undefined;
  /** 滚动轨道(承载所有克隆份,做 transform 动画)。 */
  track?: string | undefined;
  /** 单份内容包裹(第一份可读,其余 aria-hidden)。 */
  group?: string | undefined;
}

/** 根容器可透传的原生属性(排除会被内部接管 / 语义化的键)。 */
type MarqueeRootProps = Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

export interface MarqueeProps extends MarqueeRootProps {
  /** 滚动内容(原样克隆 N 份首尾相接实现无缝循环)。 */
  children: ReactNode;
  /**
   * 主轴方向。`left`/`right` 横向,`up`/`down` 纵向。默认 left。
   * 设 `up`/`down` 等价于开启 `vertical`(方向已隐含纵向)。
   */
  direction?: MarqueeDirection;
  /**
   * 滚动速度(像素/秒)。与 `duration` 二选一;两者都给时 `duration` 优先。
   * 需测得内容尺寸后才能换算成时长(挂载后用 ResizeObserver 探测),测得前回退默认时长。
   * 默认 50。
   */
  speed?: number | undefined;
  /**
   * 一圈(位移一份内容)的秒数。给了它就忽略 `speed`,直接用固定时长(与内容尺寸无关、最稳定)。
   * 默认不设(走 speed)。
   */
  duration?: number | undefined;
  /** 悬停时暂停滚动。默认 true。 */
  pauseOnHover?: boolean;
  /** 按下(点击)时暂停滚动,松开恢复。默认 false。 */
  pauseOnClick?: boolean;
  /** 克隆份之间的间距(任意 CSS 长度,如 '1rem' / '24px';数字按 px)。默认 '1rem'。 */
  gap?: string | number;
  /**
   * 克隆份数。不给则挂载后按容器/内容比自动算(至少 2 份,保证铺满 + 冗余)。
   * 显式给数字则固定该份数。
   */
  repeat?: number | undefined;
  /** 反向滚动(在 `direction` 基础上再翻转一次)。默认 false。 */
  reverse?: boolean;
  /** 两端淡出遮罩(主轴两端渐隐,暗示内容延续)。默认 false。 */
  gradient?: boolean;
  /** 淡出遮罩颜色。默认跟随 `--ms-color-bg`(容器背景)。 */
  gradientColor?: string;
  /** 淡出遮罩宽度(任意 CSS 长度;数字按 px)。默认 '15%'。 */
  gradientWidth?: string | number;
  /** 纵向滚动(等价于 `direction` 取 up/down;与纵向 `direction` 取或)。默认 false。 */
  vertical?: boolean;
  /** 整体无障碍标签(描述这条跑马灯的内容主题)。 */
  'aria-label'?: string;
  /** 细粒度 className 槽位(root / track / group)。 */
  classNames?: MarqueeClassNames;
  /** 根容器额外类名。 */
  className?: string;
}

/** 把数字尺寸规整为 CSS 长度(数字 → px;字符串原样)。 */
function toCssLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** 读取「动效是否被全局关停」:reduced-motion 媒体查询 或 祖先 data-ms-motion=off。 */
function readMotionOff(el: HTMLElement | null): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dataOff = el?.closest('[data-ms-motion="off"]') != null;
  return reduced || dataOff;
}

/**
 * Marquee —— 无限跑马灯(自研、零依赖)。children 沿主轴无缝无限滚动:
 * 内容克隆 N 份首尾相接,用 CSS @keyframes + transform 把整条 track 位移「一份」的距离后回卷,
 * 因克隆补位视觉连续(GPU 友好,只动 transform)。横/纵双向、四方向、speed(px/s)或 duration(固定圈秒)。
 * 悬停 / 按下可暂停;两端可加淡出遮罩;尺寸随 data-ms-density 上下文的间距 token。
 *
 * a11y:克隆份对 AT `aria-hidden`(只第一份可读),整体可 `aria-label`;不抢焦点(tabindex 不变)。
 * 动效降级:reduced-motion / data-ms-motion=off 下停止滚动,静态展示一份内容。
 *
 * 诚实备注:无缝循环依赖「整数份克隆 + 位移 -100/repeat% 取模动画」——
 * children 若含非纯展示的交互元素(按钮 / 链接),克隆份虽 aria-hidden 但视觉上仍可被鼠标点到,
 * 强交互内容请自行去重或用单份 + 你自己的滚动方案。样式见同目录 Marquee.css,需引入 @magic-scope/react/styles.css。
 */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      children,
      direction = 'left',
      speed = 50,
      duration,
      pauseOnHover = true,
      pauseOnClick = false,
      gap = '1rem',
      repeat,
      reverse = false,
      gradient = false,
      gradientColor,
      gradientWidth = '15%',
      vertical = false,
      classNames,
      className,
      style,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const groupRef = useRef<HTMLDivElement | null>(null);
    // 合并外部 ref 与内部 rootRef(内部要量尺寸 / 探测 motion)
    useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement, []);

    const isVertical = vertical || isVerticalDirection(direction);

    // —— 量测:容器主轴尺寸 + 单份内容主轴尺寸 + 份间距(gap)px ——
    //   contentSize 供自动份数;一圈真实位移 = contentSize + gapPx,供 speed→duration 换算。
    const [containerSize, setContainerSize] = useState(0);
    const [contentSize, setContentSize] = useState(0);
    const [gapSize, setGapSize] = useState(0);

    const measure = useCallback(() => {
      const root = rootRef.current;
      const group = groupRef.current;
      if (!root || !group) {
        return;
      }
      const cRect = root.getBoundingClientRect();
      const gRect = group.getBoundingClientRect();
      setContainerSize(isVertical ? cRect.height : cRect.width);
      setContentSize(isVertical ? gRect.height : gRect.width);
      // gap 现以 group 的尾随 margin 实现:读 computed margin(浏览器已解析成 px,单位无关)。
      if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
        const cs = window.getComputedStyle(group);
        const marginPx = Number.parseFloat(isVertical ? cs.marginBlockEnd : cs.marginInlineEnd);
        setGapSize(Number.isFinite(marginPx) ? marginPx : 0);
      }
    }, [isVertical]);

    useLayoutEffect(() => {
      measure();
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const ro = new ResizeObserver(() => measure());
      if (rootRef.current) {
        ro.observe(rootRef.current);
      }
      if (groupRef.current) {
        ro.observe(groupRef.current);
      }
      return () => ro.disconnect();
    }, [measure]);

    // —— 动效是否被全局关停(挂载后探测 + 订阅 reduced-motion 变化)——
    const [motionOff, setMotionOff] = useState(false);
    useEffect(() => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return;
      }
      const sync = () => setMotionOff(readMotionOff(rootRef.current));
      sync();
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }, []);

    // —— 按下暂停(pauseOnClick 用 JS 状态;hover 暂停纯 CSS :hover 实现,更省)——
    const [pressed, setPressed] = useState(false);

    // 自动份数:显式 repeat 优先;否则按容器/内容比算(至少 2)
    const resolvedRepeat =
      repeat != null && repeat > 0
        ? Math.max(1, Math.floor(repeat))
        : repeatCount(containerSize, contentSize, 2);

    // 一圈时长:duration 优先(固定);否则 speed→时长。
    // 一圈真实位移 = 单份 + 一个份间距(gap),用 cycleDistance 换算,保证非零 gap 下 px/s 仍准。
    const resolvedDuration =
      duration != null && duration > 0
        ? duration
        : resolveDuration(cycleDistance(contentSize, gapSize), speed);

    const reverseAnim = shouldReverseAnimation(direction, reverse);
    const animate = shouldAnimate({ motionOff, paused: pressed });
    const translatePct = trackTranslatePercent(resolvedRepeat);

    // 克隆份数组(第一份可读,其余 aria-hidden)
    const groups = Array.from({ length: resolvedRepeat }, (_, i) => i);

    const handlePointerDown = useCallback(
      (_e: PointerEvent<HTMLDivElement>) => {
        if (pauseOnClick) {
          setPressed(true);
        }
      },
      [pauseOnClick],
    );
    const clearPressed = useCallback(() => {
      if (pauseOnClick) {
        setPressed(false);
      }
    }, [pauseOnClick]);

    const rootClasses = [
      'ms-marquee',
      isVertical && 'ms-marquee--vertical',
      gradient && 'ms-marquee--gradient',
      pauseOnHover && 'ms-marquee--pause-hover',
      !animate && 'ms-marquee--paused',
      classNames?.root,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const rootStyle: CSSProperties = {
      // 给 CSS 的算式喂参数:位移百分比 / 时长 / 方向 / 间距 / 遮罩
      ['--ms-marquee-translate' as string]: `${translatePct}%`,
      ['--ms-marquee-duration' as string]: `${resolvedDuration}s`,
      ['--ms-marquee-direction' as string]: reverseAnim ? 'reverse' : 'normal',
      ['--ms-marquee-gap' as string]: toCssLength(gap),
      ['--ms-marquee-fade' as string]: toCssLength(gradientWidth),
      ...(gradientColor != null ? { ['--ms-marquee-fade-color' as string]: gradientColor } : null),
      ...style,
    };

    return (
      <div
        ref={rootRef}
        className={rootClasses}
        style={rootStyle}
        data-ms-direction={direction}
        onPointerEnter={onPointerEnter}
        onPointerLeave={composeEventHandlers(onPointerLeave, clearPressed)}
        onPointerDown={composeEventHandlers(onPointerDown, handlePointerDown)}
        onPointerUp={composeEventHandlers(onPointerUp, clearPressed)}
        onPointerCancel={composeEventHandlers(onPointerCancel, clearPressed)}
        {...props}
      >
        <div className={['ms-marquee__track', classNames?.track].filter(Boolean).join(' ')}>
          {groups.map((i) => (
            <div
              // 份索引是稳定的渲染身份(克隆份内容相同,index 即唯一键)
              key={i}
              ref={i === 0 ? groupRef : undefined}
              className={['ms-marquee__group', classNames?.group].filter(Boolean).join(' ')}
              aria-hidden={i === 0 ? undefined : true}
            >
              {children}
            </div>
          ))}
        </div>
      </div>
    );
  },
);
Marquee.displayName = 'Marquee';
