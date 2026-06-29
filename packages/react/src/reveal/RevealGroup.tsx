import type { CSSProperties, ElementType, ReactElement, ReactNode } from 'react';
import { Children, cloneElement, createElement, isValidElement } from 'react';
import type { RevealTrigger, RevealVariant } from './types';
import { useReveal } from './useReveal';

export interface RevealGroupProps {
  /** 下发给各子项的默认变体(子项可自带 data-ms-reveal 覆写),默认 'up'。 */
  variant?: RevealVariant | undefined;
  /** 错峰步长 → --ms-reveal-stagger,默认沿用 CSS 的 60ms。 */
  stagger?: number | string | undefined;
  /** 序号策略:forward 顺序 / reverse 倒序 / center 由中间向两端,默认 forward。 */
  order?: 'forward' | 'reverse' | 'center' | undefined;
  /** 触发模式(整组共用一次观察),默认 'view'。 */
  trigger?: Exclude<RevealTrigger, 'scrub'> | undefined;
  as?: ElementType | undefined;
  once?: boolean | undefined;
  amount?: number | undefined;
  margin?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode;
}

const orderIndex = (i: number, n: number, order: 'forward' | 'reverse' | 'center'): number =>
  order === 'reverse' ? n - 1 - i : order === 'center' ? Math.round(Math.abs(i - (n - 1) / 2)) : i;

/**
 * 错峰容器 —— 观察自身一次进视口,即给全组子项打 data-ms-inview;
 * 每个子项注入 --i,延迟由 CSS(--i * stagger * motion-scale)产生波浪,JS 不逐项调度 timer。
 */
export function RevealGroup(props: RevealGroupProps): ReactElement {
  const {
    variant = 'up',
    stagger,
    order = 'forward',
    trigger = 'view',
    as = 'div',
    once,
    amount,
    margin,
    className,
    style,
    children,
  } = props;

  const { ref, inView } = useReveal<HTMLElement>({ trigger, once, amount, margin });

  const items = Children.toArray(children).filter(isValidElement) as ReactElement<
    Record<string, unknown>
  >[];
  const n = items.length;

  const groupStyle = {
    ...(stagger != null
      ? { '--ms-reveal-stagger': typeof stagger === 'number' ? `${stagger}ms` : stagger }
      : {}),
    ...style,
  } as CSSProperties;

  const kids = items.map((child, i) => {
    const cp = child.props;
    const childStyle = {
      ...(cp.style as CSSProperties | undefined),
      '--i': orderIndex(i, n, order),
    } as CSSProperties;
    const next: Record<string, unknown> = { style: childStyle };
    if (cp['data-ms-reveal'] == null) next['data-ms-reveal'] = variant;
    if (inView) next['data-ms-inview'] = '';
    return cloneElement(child, { ...next, key: child.key ?? i });
  });

  return createElement(as, { ref, className, style: groupStyle }, kids);
}
