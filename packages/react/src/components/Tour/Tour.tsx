import type { CSSProperties, ReactNode } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  clampStepIndex,
  placementForStep,
  type RectLike,
  resolveStep,
  spotlightRect,
  type TourPlacement,
  type TourTarget,
} from './logic';

export type { TourPlacement, TourTarget } from './logic';

export type TourTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** 单步定义。 */
export interface TourStep {
  /**
   * 高亮目标:CSS 选择器字符串,或返回元素的取值器 `() => Element | null`(惰性、跟随 DOM)。
   * 省略 / 解析为 null 时,该步无高亮、引导卡居中展示。
   */
  target?: TourTarget;
  /** 标题。 */
  title?: ReactNode;
  /** 描述正文。 */
  description?: ReactNode;
  /** 显式方位;省略则按目标在视口的位置自动推断(见 logic.placementForStep)。 */
  placement?: TourPlacement | undefined;
  /** 该步引导卡的整体替换内容(给完则忽略 title/description/默认底栏,完全自定义)。 */
  content?: ReactNode;
}

/** 各部件细粒度 className 槽位。 */
export interface TourClassNames {
  /** 遮罩根容器(覆盖全页)。 */
  root?: string | undefined;
  /** 镂空高亮框(spotlight)。 */
  spotlight?: string | undefined;
  /** 引导卡。 */
  card?: string | undefined;
  /** 卡片标题。 */
  title?: string | undefined;
  /** 卡片描述。 */
  description?: string | undefined;
  /** 卡片底栏。 */
  footer?: string | undefined;
  /** 步数指示文本。 */
  counter?: string | undefined;
}

export interface TourProps {
  /** 引导步集。 */
  steps: TourStep[];
  /** 是否打开(受控);省略则始终展示(配合非受控 current 用得少,一般会传)。 */
  open?: boolean;
  /** 受控当前步索引。传入即进入受控,需配合 onChange 推进。 */
  current?: number;
  /** 非受控初始步。默认 0。 */
  defaultCurrent?: number;
  /**
   * 步变化回调(上一步 / 下一步 / 程序化跳步)。
   * @param current 切换后的目标步索引(已夹取到合法区间)。
   */
  onChange?: (current: number) => void;
  /**
   * 关闭回调(Esc / 点击跳过 / 点击遮罩,据 maskClosable)。
   * @param info 关闭来源信息:reason 区分跳过 / Esc / 点遮罩 / 完成。
   */
  onClose?: (info: { reason: 'skip' | 'escape' | 'mask' | 'finish'; current: number }) => void;
  /**
   * 走完最后一步点「完成」回调。
   * @param current 完成时所处的步索引(通常为最后一步)。
   */
  onFinish?: (current: number) => void;
  /** 高亮洞相对目标的外扩量(像素)。默认 8。 */
  spotlightPadding?: number;
  /** 语义色调:经全库 tone resolver 派生卡片高亮 / focus 环 / 发光。默认 primary。 */
  tone?: TourTone;
  /** 点击遮罩(高亮洞之外)是否关闭。默认 false(引导一般要求显式跳过 / 完成)。 */
  maskClosable?: boolean;
  /** 按 Esc 是否关闭。默认 true。 */
  closeOnEscape?: boolean;
  /** 切步时是否把目标滚动进视口。默认 true。 */
  scrollIntoView?: boolean;
  /** 隐藏「跳过」。 */
  hideSkip?: boolean;
  /** 是否显示步数指示。默认 true。 */
  showCounter?: boolean;
  /** 自定义关闭(跳过 ×)图标。 */
  closeIcon?: ReactNode;
  /** 遮罩根附加 className。 */
  className?: string;
  /** 各部件细粒度 className 槽位。 */
  classNames?: TourClassNames;
  /** 透传到遮罩根的内联 style(与组件计算值合并,用户优先)。 */
  style?: CSSProperties;
  /** portal 挂载容器,默认 document.body。 */
  container?: Element | null;
}

/** 命令式句柄:供父组件程序化跳步 / 关闭。 */
export interface TourHandle {
  /** 跳到指定步(自动夹取合法区间)。 */
  goTo: (index: number) => void;
  /** 下一步(到末步再点会触发 finish)。 */
  next: () => void;
  /** 上一步。 */
  prev: () => void;
  /** 关闭引导。 */
  close: () => void;
}

const SkipGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** 把 DOMRect 收成纯 RectLike(只取定位需要的四个量)。 */
function toRectLike(rect: DOMRect): RectLike {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

/**
 * Tour —— 引导漫游(category: feedback)。自研、零依赖,把「新手引导 / 功能巡览」做厚:
 *
 * - 遮罩覆盖全页,在目标处**镂空高亮**(box-shadow spread 挖洞,高亮区可点透 / 高亮),
 *   目标动态位置用 rAF + resize/scroll 跟随,切步实时重算 spotlight 与卡片方位。
 * - 引导卡:title / description / 底栏(上一步 / 下一步 / 跳过 / 完成,文案走 i18n
 *   tour.prev/next/skip/finish + 步数 tour.stepOf);也支持整步 content 完全自定义。
 * - 受控(open + current + onChange)与非受控(defaultCurrent)双通道;onClose / onFinish 钩子。
 * - 切步把目标 scrollIntoView;键盘 Esc 关、← / → 切步;遮罩 role + 卡片 role=dialog + 焦点管理。
 * - tone 经全库 tone resolver 驱动卡片高亮 / focus 环 / 发光。reduced-motion 与 data-ms-motion=off 降级过渡。
 *
 * **诚实备注**:目标用 selector / 取值器惰性解析;其在 DOM 中的位置用 rAF 轮询 + resize/scroll
 * 监听跟随。剧烈布局抖动(频繁动画里的目标)下 spotlight 可能有一帧延迟,属性能取舍而非缺陷。
 *
 * 留口:classNames 细粒度槽位、container 自定义 portal 容器、ref 暴露 goTo/next/prev/close 命令式句柄。
 * 样式见同目录 Tour.css,需引入 @magic-scope/react/styles.css。
 */
export const Tour = forwardRef<TourHandle, TourProps>(
  (
    {
      steps,
      open,
      current,
      defaultCurrent = 0,
      onChange,
      onClose,
      onFinish,
      spotlightPadding = 8,
      tone = 'primary',
      maskClosable = false,
      closeOnEscape = true,
      scrollIntoView = true,
      hideSkip = false,
      showCounter = true,
      closeIcon,
      className,
      classNames,
      style,
      container,
    },
    ref,
  ) => {
    const t = useMessages();
    const rawId = useId();
    const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    const titleId = `ms-tour-title-${safeId}`;
    const descId = `ms-tour-desc-${safeId}`;

    const total = steps.length;
    const isOpenControlled = open !== undefined;
    // 非受控时缺省视为打开(无 open 即一直展示);受控以 open 为准。
    const isOpen = isOpenControlled ? open : total > 0;

    const isStepControlled = current !== undefined;
    const [internalStep, setInternalStep] = useState(() => clampStepIndex(defaultCurrent, total));
    const activeIndex = clampStepIndex(isStepControlled ? current : internalStep, total);
    const step = steps[activeIndex];

    const cardRef = useRef<HTMLDivElement | null>(null);
    // 上一个聚焦元素,关闭时归还焦点。
    const prevFocusRef = useRef<HTMLElement | null>(null);

    // —— 目标 rect 跟随:rAF 轮询 + resize/scroll 监听,实时重算 spotlight ——
    const [rect, setRect] = useState<RectLike | null>(null);
    const [viewport, setViewport] = useState<{ width: number; height: number }>({
      width: 0,
      height: 0,
    });

    const setStep = useCallback(
      (next: number) => {
        const clamped = clampStepIndex(next, total);
        if (!isStepControlled) {
          setInternalStep(clamped);
        }
        onChange?.(clamped);
      },
      [isStepControlled, onChange, total],
    );

    const requestClose = useCallback(
      (reason: 'skip' | 'escape' | 'mask' | 'finish') => {
        onClose?.({ reason, current: activeIndex });
      },
      [onClose, activeIndex],
    );

    const goNext = useCallback(() => {
      if (activeIndex >= total - 1) {
        onFinish?.(activeIndex);
        requestClose('finish');
        return;
      }
      setStep(activeIndex + 1);
    }, [activeIndex, total, onFinish, requestClose, setStep]);

    const goPrev = useCallback(() => {
      if (activeIndex <= 0) return;
      setStep(activeIndex - 1);
    }, [activeIndex, setStep]);

    // 命令式句柄。
    useImperativeHandle(
      ref,
      (): TourHandle => ({
        goTo: (index: number) => setStep(index),
        next: goNext,
        prev: goPrev,
        close: () => requestClose('skip'),
      }),
      [setStep, goNext, goPrev, requestClose],
    );

    // 目标解析 + rect 测量(惰性目标:每次测量重新 resolve,跟随 DOM 变化)。
    // 相等性短路:rAF 每帧调 measure,但目标静止时新对象与上一帧值相等,
    // 用函数式 updater 比较旧值——相等返回原引用,让 React bail-out,避免整个
    // Tour 子树(含 portal 引导卡 / spotlight)~60fps 持续空转重渲染。
    const measure = useCallback(() => {
      if (typeof window === 'undefined') return;
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      setViewport((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
      const el = step ? resolveStep(step.target) : null;
      const next = el ? toRectLike(el.getBoundingClientRect()) : null;
      setRect((prev) => {
        if (prev === next) return prev; // 同为 null
        if (prev === null || next === null) return next;
        if (
          prev.top === next.top &&
          prev.left === next.left &&
          prev.width === next.width &&
          prev.height === next.height
        ) {
          return prev; // 四个量都没变,保持原引用让 React bail
        }
        return next;
      });
    }, [step]);

    // 切步:滚动目标进视口,然后用 rAF 跟随测量,直到关闭 / 切步。
    useLayoutEffect(() => {
      if (!isOpen || typeof window === 'undefined') return;

      const el = step ? resolveStep(step.target) : null;
      if (el && scrollIntoView) {
        el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      }

      let raf = 0;
      const tick = () => {
        measure();
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);

      const onViewportChange = () => measure();
      window.addEventListener('resize', onViewportChange);
      window.addEventListener('scroll', onViewportChange, true);

      return () => {
        window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', onViewportChange);
        window.removeEventListener('scroll', onViewportChange, true);
      };
    }, [isOpen, step, scrollIntoView, measure]);

    // 打开时记住先前焦点并把焦点移进卡片;关闭时归还。
    useEffect(() => {
      if (!isOpen) return;
      if (typeof document !== 'undefined') {
        prevFocusRef.current = document.activeElement as HTMLElement | null;
      }
      // 等卡片挂载后聚焦。
      const raf =
        typeof window !== 'undefined'
          ? window.requestAnimationFrame(() => cardRef.current?.focus())
          : 0;
      return () => {
        if (typeof window !== 'undefined') window.cancelAnimationFrame(raf);
        // 归还焦点(仍连在文档上才还,避免抢焦点)。
        const prev = prevFocusRef.current;
        if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
          prev.focus();
        }
      };
    }, [isOpen]);

    // 键盘:Esc 关、← / → 切步。
    useEffect(() => {
      if (!isOpen || typeof document === 'undefined') return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (closeOnEscape) {
            event.preventDefault();
            requestClose('escape');
          }
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrev();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, closeOnEscape, requestClose, goNext, goPrev]);

    if (!isOpen || total === 0 || !step || typeof document === 'undefined') {
      return null;
    }

    const spot = rect
      ? spotlightRect(rect, spotlightPadding, viewport.width ? viewport : undefined)
      : null;
    const placement = placementForStep(step, rect, viewport);

    const isFirst = activeIndex === 0;
    const isLast = activeIndex === total - 1;

    const rootClassName = ['ms-tour', `ms-tour--${placement}`, `ms-tone-${tone}`, className]
      .filter(Boolean)
      .join(' ');

    // —— spotlight:用 box-shadow spread 把遮罩「挖洞」,洞内可点透 / 高亮目标 ——
    const spotStyle: CSSProperties | undefined = spot
      ? ({
          '--ms-tour-x': `${spot.left}px`,
          '--ms-tour-y': `${spot.top}px`,
          '--ms-tour-w': `${spot.width}px`,
          '--ms-tour-h': `${spot.height}px`,
        } as CSSProperties)
      : undefined;

    // 引导卡相对高亮洞定位(无目标则居中,由 --ms-tour--center 接管)。
    const cardAnchorStyle: CSSProperties | undefined = spot
      ? ({
          '--ms-tour-x': `${spot.left}px`,
          '--ms-tour-y': `${spot.top}px`,
          '--ms-tour-w': `${spot.width}px`,
          '--ms-tour-h': `${spot.height}px`,
        } as CSSProperties)
      : undefined;

    const counterText = t(
      'tour.stepOf',
      { current: activeIndex + 1, total },
      `第 ${activeIndex + 1} / ${total} 步`,
    );

    const overlay = (
      <div
        className={[rootClassName, classNames?.root].filter(Boolean).join(' ')}
        data-ms-placement={placement}
        style={{ ...cardAnchorStyle, ...style }}
      >
        {/* 镂空高亮层:有目标才渲染;box-shadow 铺满遮罩,洞内透出目标 */}
        {spot && (
          <div
            className={['ms-tour__spotlight', classNames?.spotlight].filter(Boolean).join(' ')}
            style={spotStyle}
            aria-hidden="true"
          />
        )}
        {/* 无目标时的整页遮罩(spotlight 不渲染,这里兜底铺暗背景) */}
        {!spot && <div className="ms-tour__backdrop" aria-hidden="true" />}

        <div
          ref={cardRef}
          className={['ms-tour__card', classNames?.card].filter(Boolean).join(' ')}
          role="dialog"
          aria-modal="true"
          aria-labelledby={step.title != null ? titleId : undefined}
          aria-describedby={step.description != null ? descId : undefined}
          // 卡片可聚焦:打开时把焦点移进来,键盘事件挂在 document(全局 Esc / 方向键)。
          tabIndex={-1}
        >
          {step.content != null ? (
            step.content
          ) : (
            <>
              {!hideSkip && (
                <button
                  type="button"
                  className={['ms-tour__skip-x', classNames?.footer].filter(Boolean).join(' ')}
                  aria-label={t('tour.skip', undefined, '跳过')}
                  onClick={() => requestClose('skip')}
                >
                  {closeIcon ?? <SkipGlyph />}
                </button>
              )}
              {step.title != null && (
                <div
                  id={titleId}
                  className={['ms-tour__title', classNames?.title].filter(Boolean).join(' ')}
                >
                  {step.title}
                </div>
              )}
              {step.description != null && (
                <div
                  id={descId}
                  className={['ms-tour__desc', classNames?.description].filter(Boolean).join(' ')}
                >
                  {step.description}
                </div>
              )}
              <div className={['ms-tour__footer', classNames?.footer].filter(Boolean).join(' ')}>
                {showCounter && (
                  <span
                    className={['ms-tour__counter', classNames?.counter].filter(Boolean).join(' ')}
                  >
                    {counterText}
                  </span>
                )}
                <div className="ms-tour__actions">
                  {!hideSkip && (
                    <button
                      type="button"
                      className="ms-tour__btn ms-tour__btn--ghost"
                      onClick={() => requestClose('skip')}
                    >
                      {t('tour.skip', undefined, '跳过')}
                    </button>
                  )}
                  {!isFirst && (
                    <button
                      type="button"
                      className="ms-tour__btn ms-tour__btn--ghost"
                      onClick={goPrev}
                    >
                      {t('tour.prev', undefined, '上一步')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="ms-tour__btn ms-tour__btn--primary"
                    onClick={goNext}
                  >
                    {isLast
                      ? t('tour.finish', undefined, '完成')
                      : t('tour.next', undefined, '下一步')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 点遮罩关闭(maskClosable):盖在最底层、避开高亮洞与卡片,捕获遮罩点击 */}
        {maskClosable && (
          <button
            type="button"
            className="ms-tour__mask-hit"
            aria-label={t('tour.skip', undefined, '跳过')}
            tabIndex={-1}
            onClick={composeEventHandlers<{ defaultPrevented?: boolean }>(undefined, () =>
              requestClose('mask'),
            )}
          />
        )}
      </div>
    );

    return createPortal(overlay, container ?? document.body);
  },
);
Tour.displayName = 'Tour';
