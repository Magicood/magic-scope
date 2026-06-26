import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { composeEventHandlers, composeRefs } from '../../utils/compose';
import { computeThumb, isOverflowing, scrollPosFromThumb, scrollValueNow } from './logic';

/** 滚动条显隐策略。 */
export type ScrollAreaType = 'auto' | 'always' | 'hover' | 'scroll';

/** 可滚动方向。 */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/** 细粒度槽位类名,便于外部精确定制各部位。 */
export interface ScrollAreaClassNames {
  /** 最外层定位容器。 */
  root?: string;
  /** 原生滚动视口(overflow:auto 真正滚的那层)。 */
  viewport?: string;
  /** 滚动条轨道(纵 / 横各一条,叠在内容上、不占布局)。 */
  scrollbar?: string;
  /** 滚动条滑块。 */
  thumb?: string;
}

export interface ScrollAreaProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * 滚动条显隐策略:
   * - `auto`:仅当内容溢出时常驻(默认);
   * - `always`:永远显示(即便不溢出也占位提示);
   * - `hover`:悬停滚动区时才显示;
   * - `scroll`:滚动时显示,停止后经 `scrollHideDelay` 淡出。
   */
  type?: ScrollAreaType;
  /** `type="scroll"` 时停止滚动到隐藏的延时(毫秒)。默认 600。 */
  scrollHideDelay?: number;
  /** 可滚动方向:纵 / 横 / 双向。默认 vertical。 */
  orientation?: ScrollAreaOrientation;
  /** 视口内的滚动内容。 */
  children?: ReactNode;
  /** 细粒度槽位类名。 */
  classNames?: ScrollAreaClassNames | undefined;
}

type Axis = 'vertical' | 'horizontal';

interface AxisState {
  /** 该轴是否溢出(需要滚动条)。 */
  overflow: boolean;
  /** thumb 像素长度。 */
  thumbSize: number;
  /** thumb 起点偏移(像素)。 */
  thumbPos: number;
  /** aria-valuenow(0..100)。 */
  valueNow: number;
}

const EMPTY_AXIS: AxisState = { overflow: false, thumbSize: 0, thumbPos: 0, valueNow: 0 };

/** 该 orientation 下需要渲染哪些轴。 */
function axesFor(orientation: ScrollAreaOrientation): Axis[] {
  if (orientation === 'both') return ['vertical', 'horizontal'];
  return [orientation];
}

/**
 * ScrollArea —— 自定义滚动区(Radix 风,自研零依赖)。
 * 视口用原生 `overflow:auto` 保留无障碍键盘滚动与惯性,隐藏原生滚动条后自绘 track+thumb 叠在内容上,
 * 不占据布局宽度;thumb 几何与原生 `scrollTop/scrollHeight` 实时同步(scroll + ResizeObserver 驱动),
 * 可拖拽 thumb 反向滚动内容。按 `type` 决定显隐(auto/always/hover/scroll)。
 * 消费 @magic-scope/tokens 的 --ms-* 变量;尺寸随 data-ms-density;尊重 prefers-reduced-motion 与
 * data-ms-motion='off'(thumb 淡入淡出降级为即时)。样式见同目录 ScrollArea.css,需引入
 * @magic-scope/react/styles.css。
 *
 * 诚实备注:隐藏原生滚动条依赖 `scrollbar-width:none`(Firefox/新版)与 `::-webkit-scrollbar`(WebKit/旧 Chromium)。
 * 极个别老内核两者皆不支持时原生滚动条会与自绘条并存,但功能不受影响。
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      type = 'auto',
      scrollHideDelay = 600,
      orientation = 'vertical',
      children,
      className,
      classNames,
      onPointerEnter,
      onPointerLeave,
      style,
      ...props
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    // 唯一视口 id:供每条滚动条 aria-controls 关联,避免多实例 id 撞车。
    const viewportId = useId();

    const axes = useMemo(() => axesFor(orientation), [orientation]);
    const hasVertical = axes.includes('vertical');
    const hasHorizontal = axes.includes('horizontal');

    const [vertical, setVertical] = useState<AxisState>(EMPTY_AXIS);
    const [horizontal, setHorizontal] = useState<AxisState>(EMPTY_AXIS);
    // type="scroll" / hover 的可见性闸门。
    const [scrolling, setScrolling] = useState(false);
    const [hovered, setHovered] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // —— 测量:由原生几何算两轴 thumb,写回状态 —— //
    const measure = useCallback(() => {
      const el = viewportRef.current;
      if (!el) return;
      if (hasVertical) {
        const vh = el.clientHeight;
        const ch = el.scrollHeight;
        const over = isOverflowing(vh, ch);
        const { thumbSize, thumbPos } = computeThumb(vh, ch, el.scrollTop);
        setVertical({
          overflow: over,
          thumbSize,
          thumbPos,
          valueNow: scrollValueNow(vh, ch, el.scrollTop),
        });
      }
      if (hasHorizontal) {
        const vw = el.clientWidth;
        const cw = el.scrollWidth;
        const over = isOverflowing(vw, cw);
        const { thumbSize, thumbPos } = computeThumb(vw, cw, el.scrollLeft);
        setHorizontal({
          overflow: over,
          thumbSize,
          thumbPos,
          valueNow: scrollValueNow(vw, cw, el.scrollLeft),
        });
      }
    }, [hasVertical, hasHorizontal]);

    // 首测 + 内容/视口尺寸变化跟随(ResizeObserver;不支持则退化到 window resize + 首测)。
    useLayoutEffect(() => {
      const el = viewportRef.current;
      if (!el) return;
      measure();
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        // 观测内容尺寸:首个子节点(视口内容容器)变化也要重算。
        const content = el.firstElementChild;
        if (content) ro.observe(content);
        return () => ro.disconnect();
      }
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }, [measure]);

    useEffect(
      () => () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
      },
      [],
    );

    // —— 原生 scroll:重算 thumb + 驱动 scroll 型显隐 —— //
    const handleScroll = useCallback(() => {
      measure();
      if (type === 'scroll') {
        setScrolling(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setScrolling(false), scrollHideDelay);
      }
    }, [measure, type, scrollHideDelay]);

    // —— 拖拽 thumb:pointer 捕获,按位移反算 scrollTop/scrollLeft —— //
    const dragRef = useRef<{
      axis: Axis;
      startClient: number;
      startThumbPos: number;
      thumbSize: number;
    } | null>(null);

    const onThumbPointerDown = useCallback(
      (axis: Axis) => (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        const el = viewportRef.current;
        if (!el) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const state = axis === 'vertical' ? vertical : horizontal;
        dragRef.current = {
          axis,
          startClient: axis === 'vertical' ? event.clientY : event.clientX,
          startThumbPos: state.thumbPos,
          thumbSize: state.thumbSize,
        };
      },
      [vertical, horizontal],
    );

    const onThumbPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const el = viewportRef.current;
      if (!drag || !el) return;
      const client = drag.axis === 'vertical' ? event.clientY : event.clientX;
      const nextThumbPos = drag.startThumbPos + (client - drag.startClient);
      if (drag.axis === 'vertical') {
        el.scrollTop = scrollPosFromThumb(
          el.clientHeight,
          el.scrollHeight,
          nextThumbPos,
          drag.thumbSize,
        );
      } else {
        el.scrollLeft = scrollPosFromThumb(
          el.clientWidth,
          el.scrollWidth,
          nextThumbPos,
          drag.thumbSize,
        );
      }
    }, []);

    const onThumbPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      dragRef.current = null;
    }, []);

    // —— 单轴滚动条的可见性:按 type 闸门(溢出与否、hover、scroll 节流) —— //
    const isVisible = (state: AxisState): boolean => {
      switch (type) {
        case 'always':
          return true;
        case 'hover':
          return state.overflow && hovered;
        case 'scroll':
          return state.overflow && scrolling;
        default:
          return state.overflow;
      }
    };

    const rootClasses = [
      'ms-scroll-area',
      `ms-scroll-area--${type}`,
      `ms-scroll-area--${orientation}`,
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    const viewportClasses = ['ms-scroll-area__viewport', classNames?.viewport]
      .filter(Boolean)
      .join(' ');

    const renderScrollbar = (axis: Axis, state: AxisState): ReactNode => {
      const visible = isVisible(state);
      const isV = axis === 'vertical';
      const thumbStyle: CSSProperties = isV
        ? { height: `${state.thumbSize}px`, transform: `translate3d(0, ${state.thumbPos}px, 0)` }
        : { width: `${state.thumbSize}px`, transform: `translate3d(${state.thumbPos}px, 0, 0)` };
      return (
        // biome-ignore lint/a11y/useFocusableInteractive: 滚动条仅指针操作;键盘滚动由原生视口承担(视口本身可聚焦/键盘可达),给它加进 tab 序会多出一个冗余且令人困惑的停靠点(Radix 同此约定:scrollbar 不入 tab 序)
        <div
          role="scrollbar"
          aria-orientation={isV ? 'vertical' : 'horizontal'}
          aria-controls={viewportId}
          aria-valuenow={state.valueNow}
          aria-valuemin={0}
          aria-valuemax={100}
          data-state={visible ? 'visible' : 'hidden'}
          className={[
            'ms-scroll-area__scrollbar',
            `ms-scroll-area__scrollbar--${axis}`,
            classNames?.scrollbar,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={['ms-scroll-area__thumb', classNames?.thumb].filter(Boolean).join(' ')}
            style={thumbStyle}
            onPointerDown={onThumbPointerDown(axis)}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            onPointerCancel={onThumbPointerUp}
          />
        </div>
      );
    };

    return (
      <div
        ref={composeRefs(ref, rootRef)}
        className={rootClasses}
        data-orientation={orientation}
        onPointerEnter={composeEventHandlers(onPointerEnter, () => setHovered(true))}
        onPointerLeave={composeEventHandlers(onPointerLeave, () => setHovered(false))}
        {...(style ? { style } : {})}
        {...props}
      >
        <div ref={viewportRef} id={viewportId} className={viewportClasses} onScroll={handleScroll}>
          <div className="ms-scroll-area__content">{children}</div>
        </div>
        {hasVertical && renderScrollbar('vertical', vertical)}
        {hasHorizontal && renderScrollbar('horizontal', horizontal)}
      </div>
    );
  },
);
ScrollArea.displayName = 'ScrollArea';
