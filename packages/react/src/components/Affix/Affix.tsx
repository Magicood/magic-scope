import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  type AffixContainerRect,
  type AffixMode,
  type AffixResult,
  computeAffix,
  getScrollTop,
} from './logic';

export type { AffixMode } from './logic';

/** 滚动容器获取器:返回受监听 / 被滚动的目标(默认 window)。 */
export type AffixTarget = () => HTMLElement | Window;

/** classNames 细粒度槽位:针对各子部件单独挂类名。 */
export interface AffixClassNames {
  /** 外层占位容器(渲染等尺寸 placeholder 防跳动)。 */
  root?: string | undefined;
  /** 真正被吸附、会被设为 position:fixed 的内容包裹层。 */
  content?: string | undefined;
}

export interface AffixProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> {
  /** 被吸附的内容(任意节点)。 */
  children?: ReactNode | undefined;
  /**
   * 距容器顶部多少 px 时吸顶(给了即启用吸顶,含 0)。
   * 与 offsetBottom 互斥,两者都给以 offsetTop 优先。默认未设(回退默认吸顶到 0)。
   */
  offsetTop?: number | undefined;
  /** 距容器底部多少 px 时吸底(仅在未给 offsetTop 时生效)。 */
  offsetBottom?: number | undefined;
  /** 滚动容器获取器(()=>HTMLElement|Window)。默认 window。 */
  getTarget?: AffixTarget | undefined;
  /**
   * 吸附态变化回调(由不吸→吸 / 吸→不吸时各触发一次)。
   * @param affixed 当前是否处于吸附态(true 表示已吸顶 / 吸底,false 表示回到文档流)。
   */
  onChange?: ((affixed: boolean) => void) | undefined;
  /** 子部件类名留口(细粒度槽位)。 */
  classNames?: AffixClassNames | undefined;
}

/** 命令式句柄:暴露重新测量,供外部在布局变化(如展开折叠)后主动刷新。 */
export interface AffixHandle {
  /** 重新读取几何并重算吸附态。 */
  measure: () => void;
}

const isWindow = (c: HTMLElement | Window): c is Window => 'document' in c;

/** 把容器(window 或元素)折算成相对视口的几何矩形,喂给纯函数 computeAffix。 */
function readContainerRect(target: HTMLElement | Window): AffixContainerRect {
  if (isWindow(target)) {
    const w = target.innerWidth ?? 0;
    const h = target.innerHeight ?? 0;
    return { top: 0, left: 0, width: w, height: h };
  }
  const r = target.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/**
 * Affix —— 滚动吸附(scroll affix)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 监听 getTarget(默认 window)的滚动 / resize:被吸内容相对容器顶距离 <= offsetTop 时 position:fixed 吸顶,
 * (或相对容器底距离 <= offsetBottom 时吸底);脱离文档流的同时渲染**等尺寸 placeholder** 防止布局跳动。
 * 「该不该吸、吸成什么样」抽到同目录 logic.ts 的纯函数 computeAffix(零 React,可单测、可平移 core),
 * 壳层只负责读 rect 的副作用、rAF 节流与状态。吸附态变化经 onChange(affixed) 回调。
 *
 * 留口:classNames 暴露 root / content 槽位、...rest 透传根 div 原生属性;ref 经 useImperativeHandle 暴露
 * measure() 供布局变化后主动重测。a11y:透明包裹,不引入 role / 不破坏内部语义。
 * 诚实备注:宽度跟随用 ResizeObserver(特性检测,缺失则退回仅 scroll/resize 时更新);
 * 几何计算不含动画,故不受 motion=off 影响(吸附是布局而非动效)。样式见同目录 Affix.css。
 */
export const Affix = forwardRef<AffixHandle, AffixProps>(
  (
    {
      children,
      offsetTop,
      offsetBottom,
      getTarget,
      onChange,
      classNames,
      className,
      style,
      ...rest
    },
    forwardedRef,
  ) => {
    // 外层占位容器(始终在文档流里,吸附时撑出等尺寸空洞);content 是被 fixed 的真正内容层。
    const rootRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [result, setResult] = useState<AffixResult>({
      affixed: false,
      mode: 'none',
      style: {},
    });
    // 占位尺寸:吸附时给外层 placeholder 用,锁住原内容所占空间。
    const [placeholder, setPlaceholder] = useState<{ width: number; height: number } | null>(null);
    // 上一次的 affixed,用于只在跨态时触发 onChange(避免每帧回调)。
    const prevAffixedRef = useRef(false);
    const rafRef = useRef<number | null>(null);

    const resolveTarget = useCallback((): HTMLElement | Window | null => {
      if (typeof window === 'undefined') {
        return null;
      }
      return getTarget ? getTarget() : window;
    }, [getTarget]);

    // 核心:读 DOM 几何 → 跑纯函数 → 落状态 + 跨态 onChange。占位层(root)始终在流里,
    // 用它的 rect 作为「内容本应所处」的几何来源,避免 content 被 fixed 后自反馈抖动。
    const measure = useCallback(() => {
      const target = resolveTarget();
      const root = rootRef.current;
      const content = contentRef.current;
      if (!target || !root || !content) {
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const containerRect = readContainerRect(target);

      const width = contentRect.width || rootRect.width;
      const height = contentRect.height || rootRect.height;

      const next = computeAffix({
        rect: {
          top: rootRect.top,
          left: rootRect.left,
          width,
          height,
        },
        containerRect,
        scrollTop: getScrollTop(target),
        offsetTop,
        offsetBottom,
      });

      setResult(next);
      setPlaceholder(next.affixed ? { width, height } : null);

      if (next.affixed !== prevAffixedRef.current) {
        prevAffixedRef.current = next.affixed;
        onChange?.(next.affixed);
      }
    }, [resolveTarget, offsetTop, offsetBottom, onChange]);

    // rAF 节流:高频 scroll/resize 合并到下一帧测一次。
    const scheduleMeasure = useCallback(() => {
      if (rafRef.current !== null) {
        return;
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    }, [measure]);

    // 订阅 target 的 scroll + window 的 resize;target / offset 变化时解绑重订阅并首次 sync。
    useEffect(() => {
      const target = resolveTarget();
      if (!target) {
        return;
      }
      measure();
      target.addEventListener('scroll', scheduleMeasure, { passive: true });
      // 容器非 window 时其滚动已由上行覆盖;视口尺寸变化统一监听 window.resize。
      const win = typeof window !== 'undefined' ? window : null;
      win?.addEventListener('resize', scheduleMeasure, { passive: true });
      return () => {
        target.removeEventListener('scroll', scheduleMeasure);
        win?.removeEventListener('resize', scheduleMeasure);
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [resolveTarget, scheduleMeasure, measure]);

    // 诚实备注:用 ResizeObserver(特性检测)在内容自身尺寸变化时更新宽度 / 重判吸附;
    // 缺失则降级为仅 scroll/resize 时更新(老环境内容动态改尺寸可能短暂错位)。
    useEffect(() => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const root = rootRef.current;
      const content = contentRef.current;
      if (!root && !content) {
        return;
      }
      const ro = new ResizeObserver(() => {
        scheduleMeasure();
      });
      if (root) {
        ro.observe(root);
      }
      if (content) {
        ro.observe(content);
      }
      return () => {
        ro.disconnect();
      };
    }, [scheduleMeasure]);

    // 暴露命令式 measure(),供外部在布局变化后主动重测。
    useImperativeHandle(forwardedRef, () => ({ measure }), [measure]);

    const rootClasses = ['ms-affix', classNames?.root, className].filter(Boolean).join(' ');
    const contentClasses = ['ms-affix__content', classNames?.content].filter(Boolean).join(' ');

    // 吸附时:外层根撑出等尺寸占位(min-* 锁住空间),content 用纯函数算出的内联 style 固定。
    const rootStyle: CSSProperties = {
      ...style,
      ...(placeholder ? { minWidth: placeholder.width, minHeight: placeholder.height } : null),
    };

    const contentStyle: CSSProperties | undefined = result.affixed
      ? {
          position: result.style.position,
          top: result.style.top,
          left: result.style.left,
          width: result.style.width,
        }
      : undefined;

    return (
      <div
        ref={rootRef}
        className={rootClasses}
        style={rootStyle}
        data-affixed={result.affixed || undefined}
        data-mode={resolveDataMode(result.affixed, result.mode)}
        {...rest}
      >
        <div ref={contentRef} className={contentClasses} style={contentStyle}>
          {children}
        </div>
      </div>
    );
  },
);
Affix.displayName = 'Affix';

/** data-mode 仅在吸附时输出 'top' / 'bottom',未吸为 undefined(不渲染属性)。 */
function resolveDataMode(affixed: boolean, mode: AffixMode): 'top' | 'bottom' | undefined {
  if (!affixed || mode === 'none') {
    return undefined;
  }
  return mode;
}
