/**
 * Accordion 纯逻辑层 —— 零 React 耦合,便于将来平移 core(vue / web component 共用)。
 * 只做:值集合归一、单/多模式切换计算、键盘焦点目标计算。组件层只负责把这些接进 React。
 */

export type AccordionType = 'single' | 'multiple';

/** 把受控/非受控传入的 value(string | string[] | 空)归一成展开值集合。 */
export function toValueSet(value?: string | string[] | null): Set<string> {
  if (value == null) {
    return new Set();
  }
  return new Set(Array.isArray(value) ? value : [value]);
}

/** 把内部集合按 type 序列化回对外 value 形态(single → string | ''；multiple → string[])。 */
export function fromValueSet(set: Set<string>, type: AccordionType): string | string[] {
  if (type === 'single') {
    const [first] = set;
    return first ?? '';
  }
  return Array.from(set);
}

/**
 * 计算「切换某一项」后的新集合(不直接 mutate 入参)。
 * - single:展开新项时清空其它;collapsible=false 时已展开项再点不收起(保证恒有一项展开)。
 * - multiple:各项独立开合;collapsible 不影响 multiple。
 */
export function computeToggle(
  prev: Set<string>,
  value: string,
  type: AccordionType,
  collapsible: boolean,
): Set<string> {
  const next = new Set(prev);
  const isOpen = next.has(value);
  if (isOpen) {
    // single + 不可全收:已展开的唯一项再点保持展开
    if (type === 'single' && !collapsible) {
      return next;
    }
    next.delete(value);
    return next;
  }
  if (type === 'single') {
    next.clear();
  }
  next.add(value);
  return next;
}

/** 两个集合内容是否相等(浅比较,用于受控同步去重)。 */
export function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const v of a) {
    if (!b.has(v)) {
      return false;
    }
  }
  return true;
}

export type FocusKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

/**
 * 计算键盘导航的目标 index(在可聚焦项之间循环;跳过 disabled)。
 * 返回 -1 表示该键不参与导航(调用方据此决定是否 preventDefault)。
 */
export function computeFocusTarget(
  key: string,
  currentIndex: number,
  focusableIndices: number[],
): number {
  if (focusableIndices.length === 0) {
    return -1;
  }
  const pos = focusableIndices.indexOf(currentIndex);
  const len = focusableIndices.length;
  switch (key) {
    case 'ArrowDown':
      return focusableIndices[(pos + 1) % len] ?? currentIndex;
    case 'ArrowUp':
      return focusableIndices[(pos - 1 + len) % len] ?? currentIndex;
    case 'Home':
      return focusableIndices[0] ?? currentIndex;
    case 'End':
      return focusableIndices[len - 1] ?? currentIndex;
    default:
      return -1;
  }
}
