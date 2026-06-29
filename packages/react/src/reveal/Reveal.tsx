import type { CSSProperties, ElementType, ReactElement, ReactNode, Ref } from 'react';
import { cloneElement, createElement, isValidElement, useEffect } from 'react';
import { composeRefs, mergeAsChildProps } from '../utils/compose';
import type { RevealTrigger, RevealVariant } from './types';
import { useReveal } from './useReveal';

const MASK = new Set<RevealVariant>(['mask-up', 'mask-down', 'mask-left', 'mask-right']);
const TEXT = new Set<RevealVariant>(['text-lines', 'text-words', 'text-chars']);

export interface RevealProps {
  /** 特效变体,默认 'up'。 */
  variant?: RevealVariant | undefined;
  /** 触发模式,默认 'view'(滚动进视口)。 */
  trigger?: RevealTrigger | undefined;
  /** 渲染标签,默认 'div'。 */
  as?: ElementType | undefined;
  /** 不加 DOM 层,把特效属性合并进唯一子元素(mask/text 变体不适用)。 */
  asChild?: boolean | undefined;
  /** 位移量 → 行内 --ms-reveal-distance(数字按 px)。 */
  distance?: number | string | undefined;
  /** 时长 → --ms-reveal-duration(数字按 ms;仍乘 motion-scale)。 */
  duration?: number | string | undefined;
  /** 延迟 → --ms-reveal-delay。 */
  delay?: number | string | undefined;
  /** 缓动 → --ms-reveal-ease。 */
  ease?: string | undefined;
  /** 错峰步长 → --ms-reveal-stagger(配合 text-* 内部单元)。 */
  stagger?: number | string | undefined;
  /** 命中一次即定格(默认 true);false 时进出反复。 */
  once?: boolean | undefined;
  /** IntersectionObserver threshold 0–1,默认 0.2。 */
  amount?: number | undefined;
  /** IntersectionObserver rootMargin。 */
  margin?: string | undefined;
  /** 进视口回调(挂 count-up / 描线等)。 */
  onReveal?: (() => void) | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode;
}

type Vars = Record<string, string | number>;
const len = (v?: number | string) => (v == null ? undefined : typeof v === 'number' ? `${v}px` : v);
const ms = (v?: number | string) => (v == null ? undefined : typeof v === 'number' ? `${v}ms` : v);

function buildVars(p: RevealProps): Vars {
  const v: Vars = {};
  const d = len(p.distance);
  if (d) v['--ms-reveal-distance'] = d;
  const du = ms(p.duration);
  if (du) v['--ms-reveal-duration'] = du;
  const de = ms(p.delay);
  if (de) v['--ms-reveal-delay'] = de;
  if (p.ease) v['--ms-reveal-ease'] = p.ease;
  const st = ms(p.stagger);
  if (st) v['--ms-reveal-stagger'] = st;
  return v;
}

type SegmenterCtor = new (
  locale?: string,
  opts?: { granularity: string },
) => { segment: (s: string) => Iterable<{ segment: string }> };

function splitText(text: string, variant: RevealVariant): string[] {
  if (variant === 'text-lines') return text.split('\n');
  const granularity = variant === 'text-chars' ? 'grapheme' : 'word';
  const seg = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (typeof seg === 'function') {
    const s = new seg(undefined, { granularity });
    return Array.from(s.segment(text), (x) => x.segment).filter((x) => x.length > 0);
  }
  return variant === 'text-chars' ? Array.from(text) : text.split(/(\s+)/).filter(Boolean);
}

/**
 * 进场 / 滚动特效包裹组件 —— 元素进入视口(或挂载 / 滚动驱动)时从初态过渡到自然态。
 * 受全局「动效 全/弱/关」+ prefers-reduced-motion 自动调制,无需自写降级。
 */
export function Reveal(props: RevealProps): ReactElement {
  const {
    variant = 'up',
    trigger = 'view',
    as = 'div',
    asChild = false,
    once,
    amount,
    margin,
    onReveal,
    className,
    style,
    children,
  } = props;

  const { ref, inView } = useReveal<HTMLElement>({ trigger, once, amount, margin });

  useEffect(() => {
    if (inView) onReveal?.();
  }, [inView, onReveal]);

  const active = trigger === 'scrub' ? false : inView;
  const mergedStyle = { ...buildVars(props), ...style } as CSSProperties;
  const base: Record<string, unknown> = {
    ref,
    className,
    style: mergedStyle,
    'data-ms-reveal': variant,
  };
  if (active) base['data-ms-inview'] = '';

  // mask-*:容器裁剪 + 内层位移
  if (MASK.has(variant)) {
    return createElement(as, base, createElement('span', { 'data-ms-reveal-inner': '' }, children));
  }

  // text-*:按行/词/字拆单元,各自 mask 揭示 + --i 错峰;aria-label 保原文
  if (TEXT.has(variant) && typeof children === 'string') {
    const cells = splitText(children, variant).map((u, i) =>
      createElement(
        'span',
        {
          key: i,
          'data-ms-reveal-line': '',
          'aria-hidden': 'true',
          style: { '--i': i } as CSSProperties,
          ...(active ? { 'data-ms-inview': '' } : {}),
        },
        createElement('span', { 'data-ms-reveal-inner': '' }, u === ' ' ? ' ' : u),
      ),
    );
    return createElement(as, { ...base, 'aria-label': children }, cells);
  }

  // asChild:合并到唯一子元素,零额外 DOM
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const merged = mergeAsChildProps(
      {
        'data-ms-reveal': variant,
        ...(active ? { 'data-ms-inview': '' } : {}),
        className,
        style: mergedStyle,
      },
      child.props as Record<string, unknown>,
    );
    const childRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;
    return cloneElement(child, { ...merged, ref: composeRefs(ref, childRef) } as Record<
      string,
      unknown
    >);
  }

  return createElement(as, base, children);
}
