/**
 * roving 焦点索引计算 —— 体检发现 Tabs/Menu/ContextMenu/Accordion 逐行重复的逻辑,合并为单一原语。
 * **「焦点算在哪」是纯逻辑(本函数,跳 disabled、可循环);「焦点移过去」(focus())由各框架薄壳执行。**
 * 这条切割线在全库一致,正是 core 与薄壳的天然分界。
 */
export interface RovingItem {
  disabled?: boolean;
}

export interface RovingFocus {
  /** 首个可用项索引;全 disabled 时 -1。 */
  first(): number;
  /** 末个可用项索引;全 disabled 时 -1。 */
  last(): number;
  /** 从 current 向后找下一个可用项(跳 disabled);loop 时末→首。 */
  next(current: number): number;
  /** 从 current 向前找上一个可用项;loop 时首→末。 */
  prev(current: number): number;
}

export function createRovingFocus(
  items: ReadonlyArray<RovingItem>,
  options: { loop?: boolean } = {},
): RovingFocus {
  const loop = options.loop ?? true;
  const n = items.length;
  const enabled = (i: number): boolean => i >= 0 && i < n && !items[i]?.disabled;

  const first = (): number => {
    for (let i = 0; i < n; i++) {
      if (enabled(i)) {
        return i;
      }
    }
    return -1;
  };
  const last = (): number => {
    for (let i = n - 1; i >= 0; i--) {
      if (enabled(i)) {
        return i;
      }
    }
    return -1;
  };

  const move = (current: number, dir: 1 | -1): number => {
    if (n === 0) {
      return -1;
    }
    let i = current;
    for (let count = 0; count < n; count++) {
      i += dir;
      if (i < 0) {
        if (!loop) {
          return enabled(current) ? current : first();
        }
        i = n - 1;
      } else if (i >= n) {
        if (!loop) {
          return enabled(current) ? current : last();
        }
        i = 0;
      }
      if (enabled(i)) {
        return i;
      }
    }
    return enabled(current) ? current : first();
  };

  return {
    first,
    last,
    next: (current) => move(current, 1),
    prev: (current) => move(current, -1),
  };
}
