import type { ComponentPropsWithoutRef, CSSProperties, PointerEvent, ReactNode } from 'react';
import { Children, forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { dragToStep, nextIndex, prevIndex, resolveGoTo, shouldAutoplay } from './logic';

export type CarouselEffect = 'slide' | 'fade';
export type CarouselTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 各部件细粒度 className 槽位(留口)。 */
export interface CarouselClassNames {
  /** 根容器(role=region)。 */
  root?: string | undefined;
  /** 滑轨(承载所有 slide 的轨道,slide 效果下做 transform 位移)。 */
  track?: string | undefined;
  /** 单张 slide 包裹。 */
  slide?: string | undefined;
  /** 上一张 / 下一张箭头按钮(两个共用)。 */
  arrow?: string | undefined;
  /** 指示点容器。 */
  dots?: string | undefined;
  /** 单个指示点按钮。 */
  dot?: string | undefined;
}

/** 自动播放配置:`true` 用默认间隔;对象可细调 interval / pauseOnHover。 */
export type CarouselAutoplay = boolean | { interval?: number; pauseOnHover?: boolean };

/** 根容器可透传的原生属性(根是 <div role="region">,排除会被内部接管的键)。 */
type CarouselRootProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'className' | 'children' | 'onChange'
>;

export interface CarouselProps extends CarouselRootProps {
  /** 每个 child 即一屏 slide。 */
  children: ReactNode;
  /** 切换效果:横向 / 纵向滑动 slide,或淡入淡出 fade。默认 slide。 */
  effect?: CarouselEffect;
  /** 是否环绕循环(到末尾再下一张回首张)。默认 true。 */
  loop?: boolean;
  /** 纵向轮播(slide 效果下沿 Y 轴位移;箭头 / 拖拽改纵向)。默认 false。 */
  vertical?: boolean;
  /**
   * 自动播放。`true` 用默认 5000ms;对象可设 `{ interval, pauseOnHover }`。默认关闭。
   * reduced-motion / data-ms-motion=off 下强制不自动播放。
   */
  autoplay?: CarouselAutoplay;
  /** 显示可点击的指示点。默认 true。 */
  dots?: boolean;
  /** 显示上一张 / 下一张箭头。默认 true。 */
  arrows?: boolean;
  /** 指针拖拽切换(超过阈值翻页)。默认 true。 */
  draggable?: boolean;
  /** 拖拽翻页的位移阈值(像素)。默认 50。 */
  dragThreshold?: number;
  /** 语义色调,经全库 tone resolver 驱动箭头 / 活动指示点的发光与配色。默认 primary。 */
  tone?: CarouselTone;
  /** 受控:当前活动 slide 索引。传入即进入受控模式。 */
  activeIndex?: number;
  /** 非受控初始索引。默认 0。 */
  defaultIndex?: number;
  /**
   * 活动索引变化回调(受控 / 非受控均触发)。
   * @param index 变化后的目标 slide 索引(0 起)。
   */
  onChange?: (index: number) => void;
  /** 根容器 className。 */
  className?: string;
  /** 各部件细粒度 className 槽位。 */
  classNames?: CarouselClassNames;
}

const DEFAULT_INTERVAL = 5000;

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
 * Carousel —— 轮播(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 能力:slide(横/纵)/ fade 双效果、loop 环绕、autoplay(间隔 + pauseOnHover)、可点指示点、
 * prev/next 箭头、指针拖拽切换、受控 activeIndex/onChange 与非受控双通道、命令式 goTo 经 ref 暴露。
 * 纯算法(索引推进 / 环绕 / 夹取 / 是否自动播放 / 拖拽判定)抽进 logic.ts(零 React,单测覆盖)。
 *
 * v1 实现说明(诚实备注):**不做首尾克隆的「无限滚动」**,而是 index 取模环绕 + 单条 track 的 transform 位移;
 * 到末张再「下一张」会快速回卷到首张(无跨边界的连续滑动错觉)。需要无缝无限滚动可在 v2 引入克隆策略。
 *
 * a11y:根 role=region + aria-roledescription=carousel;非活动 slide 设 aria-hidden 且不可 Tab 进入;
 * 箭头按钮 aria-label 走 carousel.previous / carousel.next;指示点为 <button> + carousel.goToSlide aria-label
 * 并对活动点设 aria-current。reduced-motion / data-ms-motion=off:停 autoplay + 关切换过渡(CSS 侧降级)。
 *
 * 留口:className + classNames(root/track/slide/arrow/dots/dot)细粒度定制;...rest 透传原生属性 / 事件到根;
 * 内部接管的根 onPointerEnter/Leave/Down 等用 composeEventHandlers 合并(先用户、未 preventDefault 再做内部)。
 * 样式见同目录 Carousel.css,需引入 @magic-scope/react/styles.css。
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      effect = 'slide',
      loop = true,
      vertical = false,
      autoplay = false,
      dots = true,
      arrows = true,
      draggable = true,
      dragThreshold = 50,
      tone = 'primary',
      activeIndex,
      defaultIndex = 0,
      onChange,
      className,
      classNames,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const rawId = useId();
    const baseId = `ms-carousel-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const slides = Children.toArray(children);
    const count = slides.length;

    const isControlled = activeIndex !== undefined;
    const [internalIndex, setInternalIndex] = useState(() =>
      resolveGoTo(defaultIndex, Math.max(count, 1), loop),
    );
    // 受控值也夹进合法范围,避免越界 transform。
    const current = isControlled
      ? resolveGoTo(activeIndex, Math.max(count, 1), loop)
      : internalIndex;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [ref],
    );

    // —— 自动播放配置归一化 ——
    const autoplayOn = autoplay !== false && autoplay != null;
    const interval =
      typeof autoplay === 'object' && autoplay.interval != null
        ? autoplay.interval
        : DEFAULT_INTERVAL;
    const pauseOnHover = typeof autoplay === 'object' ? autoplay.pauseOnHover !== false : true;

    const [paused, setPaused] = useState(false);
    const [motionOff, setMotionOff] = useState(false);

    // motionOff 需读 DOM / matchMedia,挂载后探测并订阅 reduced-motion 变化。
    useEffect(() => {
      const update = () => setMotionOff(readMotionOff(rootRef.current));
      update();
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return;
      }
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }, []);

    const goTo = useCallback(
      (index: number) => {
        const next = resolveGoTo(index, Math.max(count, 1), loop);
        if (!isControlled) {
          setInternalIndex(next);
        }
        onChange?.(next);
      },
      [count, loop, isControlled, onChange],
    );

    const goNext = useCallback(
      () => goTo(nextIndex(current, count, loop)),
      [goTo, current, count, loop],
    );
    const goPrev = useCallback(
      () => goTo(prevIndex(current, count, loop)),
      [goTo, current, count, loop],
    );

    // 命令式 goTo 经 ref 暴露(在挂载的 DOM 节点上挂一个不可枚举的方法,供外部 ref.goTo(i))。
    useEffect(() => {
      const node = rootRef.current;
      if (!node) {
        return;
      }
      (node as HTMLDivElement & { goTo?: (i: number) => void }).goTo = goTo;
      return () => {
        delete (node as HTMLDivElement & { goTo?: (i: number) => void }).goTo;
      };
    }, [goTo]);

    // —— autoplay 定时器:由 shouldAutoplay 纯函数决定要不要跑 ——
    const playing = shouldAutoplay({ autoplay: autoplayOn, interval, count, paused, motionOff });
    // 用 ref 持有最新 goNext,避免 current 变化频繁重建定时器导致节奏抖动。
    const goNextRef = useRef(goNext);
    useEffect(() => {
      goNextRef.current = goNext;
    }, [goNext]);
    useEffect(() => {
      if (!playing) {
        return;
      }
      const id = setInterval(() => goNextRef.current(), interval);
      return () => clearInterval(id);
    }, [playing, interval]);

    // —— 指针拖拽切换 ——
    const dragStart = useRef<{ x: number; y: number } | null>(null);
    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      if (!draggable || count < 2) {
        return;
      }
      dragStart.current = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
      const start = dragStart.current;
      dragStart.current = null;
      if (!start) {
        return;
      }
      const delta = vertical ? event.clientY - start.y : event.clientX - start.x;
      const step = dragToStep(delta, dragThreshold);
      if (step === -1) {
        goPrev();
      } else if (step === 1) {
        goNext();
      }
    };
    const handlePointerCancel = () => {
      dragStart.current = null;
    };

    // hover 暂停:仅在开启 pauseOnHover 时挂。
    const handlePointerEnter = () => {
      if (autoplayOn && pauseOnHover) {
        setPaused(true);
      }
    };
    const handlePointerLeave = () => {
      if (autoplayOn && pauseOnHover) {
        setPaused(false);
      }
    };

    const rootClassName = [
      'ms-carousel',
      `ms-carousel--${effect}`,
      vertical && 'ms-carousel--vertical',
      `ms-tone-${tone}`,
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    const offsetPct = -current * 100;

    return (
      // biome-ignore lint/a11y/useSemanticElements: role=region + aria-roledescription=carousel 是轮播的标准 ARIA 模式,无对应原生元素
      <div
        {...rest}
        ref={setRootRef}
        role="region"
        aria-roledescription="carousel"
        data-ms-effect={effect}
        data-ms-orientation={vertical ? 'vertical' : 'horizontal'}
        className={rootClassName}
        onPointerEnter={composeEventHandlers(onPointerEnter, handlePointerEnter)}
        onPointerLeave={composeEventHandlers(onPointerLeave, handlePointerLeave)}
        onPointerDown={composeEventHandlers(onPointerDown, handlePointerDown)}
        onPointerUp={composeEventHandlers(onPointerUp, handlePointerUp)}
        onPointerCancel={composeEventHandlers(onPointerCancel, handlePointerCancel)}
      >
        <div className={['ms-carousel__viewport', classNames?.track].filter(Boolean).join(' ')}>
          <div
            className="ms-carousel__track"
            style={
              effect === 'slide'
                ? ({
                    '--ms-carousel-offset': `${offsetPct}%`,
                  } as CSSProperties)
                : undefined
            }
          >
            {slides.map((slide, i) => {
              const active = i === current;
              return (
                // biome-ignore lint/a11y/useSemanticElements: role=group + aria-roledescription=slide 是 WAI-ARIA 轮播 slide 的标准模式,fieldset 语义不符
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: slide 顺序固定且无业务 id,索引即稳定身份
                  key={i}
                  id={`${baseId}-slide-${i}`}
                  className={['ms-carousel__slide', classNames?.slide].filter(Boolean).join(' ')}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} / ${count}`}
                  aria-hidden={active ? undefined : true}
                  data-active={active ? '' : undefined}
                  {...(active ? {} : { inert: true })}
                >
                  {slide}
                </div>
              );
            })}
          </div>
        </div>

        {arrows && count > 1 && (
          <>
            <button
              type="button"
              className={['ms-carousel__arrow', 'ms-carousel__arrow--prev', classNames?.arrow]
                .filter(Boolean)
                .join(' ')}
              aria-label={t('carousel.previous', undefined, '上一张')}
              aria-controls={`${baseId}-slide-${current}`}
              onClick={goPrev}
              disabled={!loop && current === 0}
            >
              <span className="ms-carousel__arrow-icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={['ms-carousel__arrow', 'ms-carousel__arrow--next', classNames?.arrow]
                .filter(Boolean)
                .join(' ')}
              aria-label={t('carousel.next', undefined, '下一张')}
              aria-controls={`${baseId}-slide-${current}`}
              onClick={goNext}
              disabled={!loop && current === count - 1}
            >
              <span className="ms-carousel__arrow-icon" aria-hidden="true" />
            </button>
          </>
        )}

        {dots && count > 1 && (
          // biome-ignore lint/a11y/useSemanticElements: 指示点是控件分组(非表单),role=group 是正确的 ARIA
          <div
            className={['ms-carousel__dots', classNames?.dots].filter(Boolean).join(' ')}
            role="group"
          >
            {slides.map((_, i) => {
              const active = i === current;
              return (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: 指示点与 slide 一一对应,索引即稳定身份
                  key={i}
                  type="button"
                  className={[
                    'ms-carousel__dot',
                    active && 'ms-carousel__dot--active',
                    classNames?.dot,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={t('carousel.goToSlide', { index: i + 1 }, `跳到第 ${i + 1} 张`)}
                  aria-current={active ? 'true' : undefined}
                  aria-controls={`${baseId}-slide-${i}`}
                  onClick={() => goTo(i)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
Carousel.displayName = 'Carousel';
