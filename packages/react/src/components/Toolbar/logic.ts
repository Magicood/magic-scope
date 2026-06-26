/**
 * Toolbar 纯逻辑 —— 零 React 依赖,可平移进 core / 其它框架壳。
 * 这里只放「方向键 → 导航意图」「在 DOM 焦点项数组里求下一个落点」「ToggleGroup 单/多选值合并」
 * 三类纯函数;DOM 查询、副作用、渲染都留给框架壳。
 */

export type ToolbarOrientation = 'horizontal' | 'vertical';

/** 方向键解析出的导航意图(与具体键值 / 朝向解耦,便于复用同一套语义)。 */
export type ToolbarNavIntent = { type: 'move'; dir: 1 | -1 } | { type: 'edge'; dir: 1 | -1 } | null;

/**
 * 把按键映射为 Toolbar 的导航意图,随朝向切换主轴:
 * - horizontal:← / → 在项间移动;
 * - vertical:↑ / ↓ 在项间移动;
 * - Home / End 两朝向通用,跳首 / 尾。
 * 返回 null 表示不拦截(交回浏览器默认,如 Tab 仍走自然 Tab 序)。
 */
export function resolveToolbarIntent(
  key: string,
  orientation: ToolbarOrientation,
): ToolbarNavIntent {
  const horizontal = orientation === 'horizontal';
  switch (key) {
    case 'ArrowRight':
      return horizontal ? { type: 'move', dir: 1 } : null;
    case 'ArrowLeft':
      return horizontal ? { type: 'move', dir: -1 } : null;
    case 'ArrowDown':
      return horizontal ? null : { type: 'move', dir: 1 };
    case 'ArrowUp':
      return horizontal ? null : { type: 'move', dir: -1 };
    case 'Home':
      return { type: 'edge', dir: -1 };
    case 'End':
      return { type: 'edge', dir: 1 };
    default:
      return null;
  }
}

/**
 * 在「按 DOM 顺序排好的可聚焦项」数组里,从 `from` 起按 `dir` 求下一个落点索引(环形)。
 * Toolbar 在 keydown 时实时从根查询 enabled 项(已排除 disabled),故此处不再判 disabled。
 * 空数组返回 -1;`from` 越界时按方向从边界进入。
 */
export function stepIndex(count: number, from: number, dir: 1 | -1): number {
  if (count <= 0) {
    return -1;
  }
  // + count 保证取模前为非负(JS 负数取模会得负)。
  return (((from + dir) % count) + count) % count;
}

/** 求首个(dir=-1)/ 末个(dir=1)索引;空数组返回 -1。 */
export function edgeIndex(count: number, dir: 1 | -1): number {
  if (count <= 0) {
    return -1;
  }
  return dir === 1 ? count - 1 : 0;
}

/** ToggleGroup 的选中模式:单选(类 radiogroup)或多选。 */
export type ToggleGroupType = 'single' | 'multiple';

/**
 * 计算点击某个 toggle 项后 ToggleGroup 的新值集合(纯函数,不触发副作用)。
 *
 * - single:点未选中项 → 选中它(返回单元素);点已选中项 → 若 `allowDeselect` 为真则清空,否则维持。
 * - multiple:点项即在集合里增删(toggle)。
 *
 * 入参 / 出参都用「值数组」表达,single 模式也用数组(0 或 1 个),让两种模式同构、易在壳层归一。
 */
export function toggleValue(
  type: ToggleGroupType,
  current: readonly string[],
  value: string,
  allowDeselect: boolean,
): string[] {
  if (type === 'single') {
    const isOn = current.length === 1 && current[0] === value;
    if (isOn) {
      return allowDeselect ? [] : [value];
    }
    return [value];
  }
  // multiple:在集合中翻转
  if (current.includes(value)) {
    return current.filter((v) => v !== value);
  }
  return [...current, value];
}

/** 把受控 value(单选给 string、多选给 string[]、可空)归一成内部统一的数组表示。 */
export function normalizeToggleValue(
  type: ToggleGroupType,
  value: string | string[] | null | undefined,
): string[] {
  if (value == null) {
    return [];
  }
  if (type === 'single') {
    return typeof value === 'string' ? [value] : value.slice(0, 1);
  }
  return typeof value === 'string' ? [value] : [...value];
}

/** 把内部数组表示还原成对外回调的形态(single → string | null,multiple → string[])。 */
export function denormalizeToggleValue(
  type: ToggleGroupType,
  values: readonly string[],
): string | string[] | null {
  if (type === 'single') {
    return values.length > 0 ? (values[0] as string) : null;
  }
  return [...values];
}
