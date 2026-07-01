import { useCallback, useEffect, useRef, useState } from 'react';
import { observe } from './observer';
import type { RevealTrigger } from './types';

export interface UseRevealOptions {
  /** 触发模式,默认 'view'。'scrub' 交给 CSS,不观察(inView 恒 false)。 */
  trigger?: RevealTrigger | undefined;
  once?: boolean | undefined;
  amount?: number | undefined;
  margin?: string | undefined;
}

/**
 * 进场触发 hook —— 返回回调 ref 与 inView 布尔。
 * 把"进入视口"与具体动画解耦:既驱动 <Reveal>,也能门控 count-up / 图表描线等。
 */
export function useReveal<T extends HTMLElement = HTMLElement>(opts: UseRevealOptions = {}) {
  const { trigger = 'view', once = true, amount, margin } = opts;
  const [inView, setInView] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (!node) return;
      if (trigger === 'scrub') return; // CSS animation-timeline 接管,无需观察
      if (trigger === 'mount') {
        // 双 rAF:先让初态渲染一帧,再切终态,保证过渡可见(不直接跳终态)
        const r = requestAnimationFrame(() => requestAnimationFrame(() => setInView(true)));
        cleanupRef.current = () => cancelAnimationFrame(r);
        return;
      }
      cleanupRef.current = observe(node, setInView, { amount, margin, once });
    },
    [trigger, once, amount, margin],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return { ref, inView };
}

/** useReveal 的薄封装,语义化只取 inView 布尔的场景。 */
export function useInView<T extends HTMLElement = HTMLElement>(opts?: UseRevealOptions) {
  return useReveal<T>(opts);
}
