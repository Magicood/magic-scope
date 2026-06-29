import type { ComponentPropsWithoutRef, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { Spinner } from '../Spinner';
import { shouldShow } from './logic';

export type SpinSize = 'sm' | 'md' | 'lg';
export type SpinTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** 细粒度 className 槽位:根容器 / 遮罩层 / 指示器盒 / 被遮内容盒 / 加载文字。 */
export interface SpinClassNames {
  /** 根容器(定位上下文)。 */
  root?: string;
  /** 半透明遮罩层(盖在内容之上)。 */
  overlay?: string;
  /** 居中的指示器 + tip 盒。 */
  indicator?: string;
  /** 被遮罩的内容包裹层(spinning 时降透明度/模糊 + 屏蔽交互)。 */
  content?: string;
  /** 加载提示文字 tip。 */
  tip?: string;
}

export interface SpinProps extends Omit<ComponentPropsWithoutRef<'div'>, 'className'> {
  /** 是否加载中(显示遮罩 + 指示器)。默认 true。 */
  spinning?: boolean;
  /** 加载提示文字(指示器下方)。也用于读屏播报(无 tip 时回退 i18n「加载中」)。 */
  tip?: ReactNode;
  /** 指示器尺寸。默认 md。 */
  size?: SpinSize;
  /**
   * 防闪烁延迟(毫秒):spinning 由 false→true 后,需持续超过 delay 才真正显示遮罩;
   * 期间若 spinning 又变回 false 则完全不闪。收起永远即时(delay 只拦「显」)。
   * 判定逻辑抽到 logic.ts 的纯函数 shouldShow,可单测。
   */
  delay?: number;
  /** 自定义指示器(ReactNode);给出时取代默认 Spinner 图标。 */
  indicator?: ReactNode;
  /** 语义色调(默认指示器读全库 tone 槽位 --ms-c / --ms-c-glow)。不传跟随上下文。 */
  tone?: SpinTone;
  /** 全屏遮罩:盖满视口(top-layer 之下、modal 之上的浮层);此时通常不传 children。 */
  fullscreen?: boolean;
  /** 被包裹内容;spinning 时盖遮罩但不卸载(保留布局)。无 children 时仅渲染独立指示器。 */
  children?: ReactNode;
  /** 根容器额外类名(等价于 classNames.root,二者都给则拼接)。 */
  wrapperClassName?: string;
  /** 细粒度槽位类名。 */
  classNames?: SpinClassNames;
}

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * useDelayedSpinning —— 把 spinning + delay 折叠成「此刻是否真的显示」。
 * spinning→true 时安排一个 delay 后的状态翻转;翻回 false 立即清掉定时器并收起(收起永远即时)。
 * 渲染期用 logic.ts 的 shouldShow 裁决,定时器仅负责在等够后触发一次重渲染。
 */
function useDelayedSpinning(spinning: boolean, delay: number): boolean {
  // 初始 elapsed=0(刚挂载、未等过):delay>0 时首帧/SSR 不显示遮罩,等定时器到点再翻真
  const [reached, setReached] = useState(() => shouldShow(spinning, delay, 0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    if (!spinning) {
      // 收起即时:无需等待
      setReached(false);
      return;
    }
    if (!Number.isFinite(delay) || delay <= 0) {
      setReached(true);
      return;
    }
    // 有正延迟:先按「未到」渲染,等够后翻真
    setReached(false);
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      setReached(true);
    }, delay);
    return () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [spinning, delay]);

  // 渲染裁决:delay<=0 不依赖定时器即真;有 delay 时 reached 充当「已过去 delay」信号
  return shouldShow(spinning, delay, reached ? delay : 0);
}

/**
 * Spin —— 加载遮罩(category: feedback)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 包裹任意 children;`spinning` 时在其上盖半透明遮罩 + 居中加载图标(默认复用 Spinner,可 `indicator`
 * 自定义),内容**不卸载**——保留布局、降不透明度并模糊、屏蔽交互(`aria-hidden` + `inert` + `pointer-events`)。
 * 短促加载可用 `delay` 防闪烁(纯判定见 logic.ts 的 shouldShow)。支持 `tip` 文字、`size`、`tone`、
 * 以及 `fullscreen` 全屏遮罩。无 children 时退化为行内/块级的独立指示器。
 *
 * **a11y**:遮罩层 `aria-busy=true` + `aria-live=polite` + `role=status`,加载时读屏播报 tip(或 i18n
 * 「加载中」);被遮内容 `aria-hidden` + `inert` 防止读屏与键盘穿透到不可见交互。
 * **留口**:`...rest` 透传到根;`wrapperClassName` 与 `classNames`(root/overlay/indicator/content/tip)
 * 细粒度定制;`forwardRef` 到根容器。**动效/发光**:默认指示器随 data-ms-motion 与 prefers-reduced-motion
 * 降速/静止、随 data-ms-fx 调制发光。样式见同目录 Spin.css,需引入 @magic-scope/react/styles.css。
 */
export const Spin = forwardRef<HTMLDivElement, SpinProps>(function Spin(
  {
    spinning = true,
    tip,
    size = 'md',
    delay = 0,
    indicator,
    tone,
    fullscreen = false,
    children,
    wrapperClassName,
    classNames,
    style,
    ...rest
  },
  ref,
) {
  const t = useMessages();
  const active = useDelayedSpinning(spinning, delay);
  const hasChildren = children != null && children !== false;

  // 读屏播报文案:优先 tip(纯文本时),否则 i18n「加载中」
  const busyLabel = typeof tip === 'string' && tip ? tip : t('spinner.label', undefined, '加载中');

  // 默认指示器复用 Spinner,但把它降为纯视觉(role=presentation + aria-hidden):
  // 加载语义统一由外层遮罩的 role=status / aria-live / aria-label 承载,避免读屏双重播报。
  const indicatorNode = (
    <span className={cx('ms-spin__indicator', classNames?.indicator)}>
      {indicator ?? (
        <Spinner
          size={size}
          {...(tone ? { tone } : {})}
          role="presentation"
          aria-hidden="true"
          aria-label={undefined}
        />
      )}
      {tip != null && tip !== false && (
        <span className={cx('ms-spin__tip', classNames?.tip)}>{tip}</span>
      )}
    </span>
  );

  // —— 全屏遮罩:盖满视口的独立浮层(不包裹内容) ——
  if (fullscreen) {
    const rootClass = cx(
      'ms-spin',
      'ms-spin--fullscreen',
      `ms-spin--${size}`,
      active && 'ms-spin--spinning',
      tone && `ms-tone-${tone}`,
      wrapperClassName,
      classNames?.root,
    );
    if (!active) {
      // 不显示时不渲染浮层,避免遮挡点击
      return null;
    }
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={busyLabel}
        className={rootClass}
        style={style}
        {...rest}
      >
        <div className={cx('ms-spin__overlay', classNames?.overlay)} aria-hidden="true">
          {indicatorNode}
        </div>
      </div>
    );
  }

  // —— 无 children:退化为独立指示器(行内/块级) ——
  if (!hasChildren) {
    const rootClass = cx(
      'ms-spin',
      'ms-spin--bare',
      `ms-spin--${size}`,
      active && 'ms-spin--spinning',
      tone && `ms-tone-${tone}`,
      wrapperClassName,
      classNames?.root,
    );
    if (!active) {
      // 独立模式不加载时什么也不渲染(占位交给调用方)
      return null;
    }
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={busyLabel}
        className={rootClass}
        style={style}
        {...rest}
      >
        {indicatorNode}
      </div>
    );
  }

  // —— 包裹模式:内容不卸载,遮罩盖其上 ——
  const rootClass = cx(
    'ms-spin',
    'ms-spin--wrap',
    `ms-spin--${size}`,
    active && 'ms-spin--spinning',
    tone && `ms-tone-${tone}`,
    wrapperClassName,
    classNames?.root,
  );

  // 条件 spread:仅 spinning 态注入 inert={true},非加载态完全不渲染该属性
  const inertProps: Pick<HTMLAttributes<HTMLDivElement>, 'inert'> = active ? { inert: true } : {};

  return (
    <div ref={ref} className={rootClass} style={style} aria-busy={active || undefined} {...rest}>
      {active && (
        <div
          role="status"
          aria-live="polite"
          aria-label={busyLabel}
          className={cx('ms-spin__overlay', classNames?.overlay)}
        >
          {indicatorNode}
        </div>
      )}
      <div
        className={cx('ms-spin__content', classNames?.content)}
        aria-hidden={active || undefined}
        // inert 在 spinning 时屏蔽内部一切交互/读屏穿透(现代浏览器原生支持;旧环境由 pointer-events 兜底)。
        // 条件 spread inert={true}:非 spinning 态完全不渲染该属性,规避旧 React 把 inert={false} 渲成 inert="false"。
        {...inertProps}
        style={active ? ({ pointerEvents: 'none' } as CSSProperties) : undefined}
      >
        {children}
      </div>
    </div>
  );
});
Spin.displayName = 'Spin';
