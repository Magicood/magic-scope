import type { ComponentPropsWithoutRef, CSSProperties, MouseEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { getScrollTop, scrollStep, shouldShow } from './logic';

export type BackTopTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type BackTopShape = 'circle' | 'square';

/** 滚动容器获取器:返回受监听 / 被滚动的目标(默认 window)。 */
export type BackTopTarget = () => HTMLElement | Window;

export interface BackTopProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  /** 滚动超过该高度(px)才淡入显示,否则淡出隐藏。默认 400。 */
  visibilityHeight?: number | undefined;
  /** 滚动容器获取器(()=>HTMLElement|Window)。默认 window。 */
  target?: BackTopTarget | undefined;
  /** 平滑回顶时长(ms)。减弱动效时忽略本值瞬时归顶。默认 450。 */
  duration?: number | undefined;
  /** 定位:距视口右侧距离(px)。默认 24。 */
  right?: number | undefined;
  /** 定位:距视口底部距离(px)。默认 24。 */
  bottom?: number | undefined;
  /** 形状:圆形 / 方形(圆角)。默认 circle。 */
  shape?: BackTopShape | undefined;
  /** 语义色调,经全库 tone resolver 派生配色与 glow。默认 primary。 */
  tone?: BackTopTone | undefined;
  /** 自定义内容(默认向上箭头符文)。 */
  children?: ReactNode | undefined;
  /** 图标/内容部件类名留口。 */
  iconClassName?: string | undefined;
}

/**
 * BackTop —— 回到顶部浮钮(固定定位)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 监听 target 滚动:scrollTop 超过 visibilityHeight 淡入显示、否则淡出并 aria-hidden + 不可聚焦;
 * 点击用 requestAnimationFrame 缓动(easeInOutCubic)滚到顶,减弱动效(prefers-reduced-motion /
 * data-ms-motion="off")时瞬时 scrollTo(0),并照常触发用户 onClick(composeEventHandlers 不覆盖)。
 * 接全库 tone resolver(只读槽位不写死配色)、尺寸随密度 data-ms-density 缩放、focus-visible 发光环。
 * a11y:默认 aria-label 取自 i18n 'backTop.label';隐藏时移出 tab 序并 aria-hidden。
 * 可抽取的缓动 / 滚动插值 / 可见性判定在同目录 logic.ts(零 React)。样式见同目录 BackTop.css。
 */
export const BackTop = forwardRef<HTMLButtonElement, BackTopProps>(
  (
    {
      visibilityHeight = 400,
      target,
      duration = 450,
      right = 24,
      bottom = 24,
      shape = 'circle',
      tone = 'primary',
      children,
      className,
      iconClassName,
      style,
      onClick,
      type = 'button',
      tabIndex: tabIndexProp,
      'aria-label': ariaLabelProp,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    const [visible, setVisible] = useState(false);
    const rafRef = useRef<number | null>(null);

    const resolveTarget = useCallback((): HTMLElement | Window | null => {
      if (typeof window === 'undefined') {
        return null;
      }
      return target ? target() : window;
    }, [target]);

    // 监听滚动 + 初始同步可见性;target / visibilityHeight 变化时解绑旧节点、重订阅新节点并首次 sync
    useEffect(() => {
      const node = resolveTarget();
      if (!node) {
        return;
      }
      const sync = () => {
        setVisible(shouldShow(getScrollTop(node), visibilityHeight));
      };
      sync();
      node.addEventListener('scroll', sync, { passive: true });
      return () => {
        node.removeEventListener('scroll', sync);
      };
    }, [resolveTarget, visibilityHeight]);

    // 卸载时取消在途动画帧
    useEffect(
      () => () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
      },
      [],
    );

    const prefersReducedMotion = useCallback((): boolean => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
      // data-ms-motion="off" 总闸:任意祖先标记即视为关闭动效
      return document.querySelector('[data-ms-motion="off"]') !== null;
    }, []);

    const scrollToTop = useCallback(
      (node: HTMLElement | Window) => {
        const setTop = (top: number) => {
          if (node instanceof HTMLElement) {
            node.scrollTop = top;
          } else {
            node.scrollTo(0, top);
          }
        };

        const start = getScrollTop(node);
        if (start <= 0) {
          return;
        }
        // 减弱动效 / 时长非正:瞬时归顶
        if (prefersReducedMotion() || duration <= 0) {
          setTop(0);
          return;
        }

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
        const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const tick = () => {
          const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
          const elapsed = now - startTime;
          const next = scrollStep(start, elapsed, duration);
          setTop(next);
          if (next > 0) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            rafRef.current = null;
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      },
      [duration, prefersReducedMotion],
    );

    // 用户 onClick 先跑(可 preventDefault 阻断回顶),未阻断再执行缓动滚动
    const handleClick = composeEventHandlers<MouseEvent<HTMLButtonElement>>(onClick, () => {
      const node = resolveTarget();
      if (node) {
        scrollToTop(node);
      }
    });

    const classes = ['ms-back-top', `ms-back-top--${shape}`, `ms-tone-${tone}`, className]
      .filter(Boolean)
      .join(' ');

    const iconClasses = ['ms-back-top__icon', iconClassName].filter(Boolean).join(' ');

    const mergedStyle: CSSProperties = {
      // 用 CSS 变量喂给样式层定位,样式可叠加 safe-area
      '--ms-back-top-right': `${right}px`,
      '--ms-back-top-bottom': `${bottom}px`,
      ...style,
    } as CSSProperties;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        style={mergedStyle}
        data-visible={visible || undefined}
        aria-hidden={visible ? undefined : true}
        aria-label={ariaLabelProp ?? t('backTop.label', undefined, '回到顶部')}
        onClick={handleClick}
        {...props}
        // 受控属性后置:隐藏时移出 tab 序、不可聚焦,且不被 {...props} 覆盖
        tabIndex={visible ? (tabIndexProp ?? 0) : -1}
      >
        <span className={iconClasses} aria-hidden="true">
          {children ?? <ArrowUpRune />}
        </span>
      </button>
    );
  },
);
BackTop.displayName = 'BackTop';

/** 默认向上箭头符文(纯装饰,SVG 跟随 currentColor)。 */
function ArrowUpRune() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
