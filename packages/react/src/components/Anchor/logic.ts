/**
 * Anchor 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * scroll-spy 的核心「算哪个高亮」是纯函数:给定每个锚点目标相对滚动容器的 top(已由壳层读好 DOM),
 * 加上当前 scrollTop、命中边界 bounds、判定偏移 offsetTop,就能算出当前 active key。
 * DOM 读取(getBoundingClientRect / offsetTop 等副作用)留在 React 壳层,这里只做确定性计算,便于单测。
 */

/** 单个锚点目标的最小测量结果(壳层读 DOM 后喂进来)。 */
export interface AnchorLinkOffset {
  /** 锚点 key(全树唯一)。 */
  key: string;
  /** 目标元素顶边相对滚动容器内容顶部的距离(px),即「滚动到这个目标时的 scrollTop」。 */
  top: number;
}

/**
 * 把嵌套 items 拍平成 key 的前序序列 —— 供键盘 / 默认值 / 索引等按视觉顺序消费。
 * 仅依赖 `{ key, children? }` 结构,与渲染无关。
 */
export function flattenKeys<T extends { key: string; children?: readonly T[] | undefined }>(
  items: readonly T[],
): string[] {
  const out: string[] = [];
  const walk = (list: readonly T[]): void => {
    for (const it of list) {
      out.push(it.key);
      if (it.children && it.children.length > 0) {
        walk(it.children);
      }
    }
  };
  walk(items);
  return out;
}

/**
 * 解析当前应高亮的 active key。
 *
 * 判定线 = scrollTop + offsetTop + bounds(命中边界)。在判定线**之上(top 不大于判定线)**的锚点里,
 * 取最靠下的那个作为 active —— 即「刚滚过/正处于」的小节。都还没滚到任何锚点则返回最靠前的那个(若存在),
 * 这样页面顶部时第一项也会高亮,符合 scroll-spy 直觉;空表返回 null。
 *
 * 与 React / DOM 完全解耦:offsets 由壳层读好,顺序不要求(内部按 top 比较)。
 */
export function resolveActiveLink(
  offsets: readonly AnchorLinkOffset[],
  scrollTop: number,
  bounds = 5,
  offsetTop = 0,
): string | null {
  if (offsets.length === 0) {
    return null;
  }
  const line = scrollTop + offsetTop + bounds;

  let active: AnchorLinkOffset | null = null;
  // 判定线之上(含)取 top 最大者
  for (const o of offsets) {
    if (o.top <= line) {
      if (active === null || o.top > active.top) {
        active = o;
      }
    }
  }
  if (active !== null) {
    return active.key;
  }

  // 还没滚到任何锚点(都在判定线下方)→ 回退到最靠前(top 最小)的那个,保证顶部时首项高亮
  let first: AnchorLinkOffset | null = null;
  for (const o of offsets) {
    if (first === null || o.top < first.top) {
      first = o;
    }
  }
  return first ? first.key : null;
}

/** 从 `#section-1` 形式的 href 取出目标元素 id(去掉前导 #);非锚点 href 返回 null。 */
export function hrefToId(href: string | undefined): string | null {
  if (href?.[0] !== '#' || href.length < 2) {
    return null;
  }
  return href.slice(1);
}
