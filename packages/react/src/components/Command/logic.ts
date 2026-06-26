/**
 * Command 命令面板纯逻辑层 —— 零 React 依赖,可平移进 packages/core。
 *
 * 负责三件纯计算:
 * 1. `filterItems`:按查询串过滤候选项(子串 / 模糊两种策略),并算出命中字符的高亮区间;
 * 2. `groupAndFlatten`:把「带分组的项树」拍平成可渲染的扁平行(组头不可选,不计入可选序列);
 * 3. `nextEnabledIndex` / `edgeEnabledIndex`:键盘移动时在可选行里跳过禁用项 / 组头,取下一个落点。
 *
 * 组件壳只负责把这些结果接到 DOM / 焦点 / aria 上,不在壳里写任何过滤 / 导航算法。
 */

/** 命中区间(左闭右开):`[start, end)` 表示 label 上一段应高亮的连续字符。 */
export interface MatchRange {
  /** 起始下标(含)。 */
  start: number;
  /** 结束下标(不含)。 */
  end: number;
}

/** 过滤策略:substring=连续子串(默认),fuzzy=允许跳字符的模糊匹配。 */
export type CommandFilterMode = 'substring' | 'fuzzy';

/** 过滤选项。 */
export interface FilterOptions {
  /** 是否启用模糊匹配(允许字符不连续)。默认 false(子串)。 */
  fuzzy?: boolean | undefined;
}

/**
 * 候选项的最小结构契约(逻辑层只关心这几个字段)。
 * `keywords` 是除 label 外参与匹配的别名(如命令的同义词),命中只高亮 label。
 */
export interface CommandItemLike {
  /** 唯一值,作为受控 / 非受控的标识与去重键。 */
  value: string;
  /** 参与匹配的主文本(同时用于高亮)。 */
  label: string;
  /** 额外匹配关键词(命中算入过滤,但不参与 label 高亮)。 */
  keywords?: readonly string[] | undefined;
  /** 是否禁用(渲染但不可选、键盘跳过)。 */
  disabled?: boolean | undefined;
}

/** 一条过滤结果:命中的项 + label 上的高亮区间 + 排序分(越小越靠前)。 */
export interface FilterResult<T extends CommandItemLike> {
  /** 命中的原始项。 */
  item: T;
  /** label 上的高亮区间(已合并相邻、按 start 升序);query 为空时为空数组。 */
  ranges: MatchRange[];
  /** 排序分:越小越靠前(子串命中靠前、起点靠前优先)。 */
  score: number;
}

/**
 * 在 `text` 里找 `query`(均已小写)的连续子串命中区间。找不到返回 null。
 * 返回单段 `[idx, idx+query.length)`。
 */
function substringRange(text: string, query: string): MatchRange | null {
  const idx = text.indexOf(query);
  if (idx < 0) {
    return null;
  }
  return { start: idx, end: idx + query.length };
}

/**
 * 在 `text` 里做模糊匹配(按 `query` 字符顺序贪心地跳字符匹配),返回命中字符的区间集合。
 * 找不到返回 null。区间已合并相邻(连续命中并成一段)。
 */
function fuzzyRanges(text: string, query: string): MatchRange[] | null {
  const ranges: MatchRange[] = [];
  let ti = 0;
  for (let qi = 0; qi < query.length; qi += 1) {
    const qc = query[qi];
    let found = -1;
    for (; ti < text.length; ti += 1) {
      if (text[ti] === qc) {
        found = ti;
        ti += 1;
        break;
      }
    }
    if (found < 0) {
      return null;
    }
    const last = ranges[ranges.length - 1];
    if (last && last.end === found) {
      last.end = found + 1;
    } else {
      ranges.push({ start: found, end: found + 1 });
    }
  }
  return ranges;
}

/** 区间集合的「连续命中最大长度」—— 用于模糊匹配排序(越连续越像精确命中,越靠前)。 */
function maxRunLength(ranges: readonly MatchRange[]): number {
  let max = 0;
  for (const r of ranges) {
    const len = r.end - r.start;
    if (len > max) {
      max = len;
    }
  }
  return max;
}

/**
 * 过滤候选项 + 计算高亮区间。
 *
 * - query 去首尾空白后为空 → 原样返回全部项(无高亮区间),保持原顺序;
 * - 匹配大小写不敏感;先在 `label` 上匹配并记录区间,label 不中再看 `keywords`(命中算过滤、不高亮);
 * - `fuzzy=false`(默认):连续子串;`fuzzy=true`:允许跳字符;
 * - 结果按 score 升序稳定排序(score 相等保持原始相对顺序)。
 *
 * 纯函数,不改入参。
 */
export function filterItems<T extends CommandItemLike>(
  items: readonly T[],
  query: string,
  options: FilterOptions = {},
): FilterResult<T>[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return items.map((item) => ({ item, ranges: [], score: 0 }));
  }
  const fuzzy = options.fuzzy === true;
  const out: Array<FilterResult<T> & { order: number }> = [];

  items.forEach((item, order) => {
    const label = item.label.toLowerCase();
    let ranges: MatchRange[] | null = null;
    let score = Number.POSITIVE_INFINITY;

    if (fuzzy) {
      const r = fuzzyRanges(label, q);
      if (r) {
        ranges = r;
        // 起点越靠前、连续命中越长 → 分越小越靠前。
        const start = r[0]?.start ?? 0;
        score = start * 100 - maxRunLength(r);
      }
    } else {
      const r = substringRange(label, q);
      if (r) {
        ranges = [r];
        score = r.start;
      }
    }

    // label 没命中 → 退而在 keywords 上判是否命中(命中纳入结果,但不产出 label 高亮)。
    if (ranges === null && item.keywords) {
      for (const kw of item.keywords) {
        const k = kw.toLowerCase();
        const hit = fuzzy ? fuzzyRanges(k, q) !== null : k.includes(q);
        if (hit) {
          ranges = [];
          // keyword 命中排在 label 命中之后(给个较大的基准分)。
          score = 10_000;
          break;
        }
      }
    }

    if (ranges !== null) {
      out.push({ item, ranges, score, order });
    }
  });

  // 稳定排序:score 升序,score 相等按原始顺序。
  out.sort((a, b) => (a.score === b.score ? a.order - b.order : a.score - b.score));
  return out.map(({ item, ranges, score }) => ({ item, ranges, score }));
}

/**
 * 把一段 label 按高亮区间切成「命中 / 未命中」交替的片段,供 UI 包 <mark>。
 * 区间需已按 start 升序、互不重叠(filterItems 的产物满足)。纯函数,便于直接测。
 */
export interface LabelSegment {
  /** 片段文本。 */
  text: string;
  /** 是否为命中高亮片段。 */
  match: boolean;
}

export function segmentLabel(label: string, ranges: readonly MatchRange[]): LabelSegment[] {
  if (ranges.length === 0) {
    return label === '' ? [] : [{ text: label, match: false }];
  }
  const segments: LabelSegment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    // start 夹到 cursor:重叠 / 乱序区间不会回退去重复吐已消费字符。
    const start = Math.max(cursor, Math.min(r.start, label.length));
    const end = Math.max(start, Math.min(r.end, label.length));
    if (start > cursor) {
      segments.push({ text: label.slice(cursor, start), match: false });
    }
    if (end > start) {
      segments.push({ text: label.slice(start, end), match: true });
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < label.length) {
    segments.push({ text: label.slice(cursor), match: false });
  }
  return segments;
}

/* —— 分组拍平 —— */

/** 分组输入:一个带可选标题的命令分组。 */
export interface CommandGroupLike<T extends CommandItemLike> {
  /** 分组标识(可选,用于 key)。 */
  id?: string | undefined;
  /** 分组标题(组头,不可选)。省略则不渲染组头。 */
  heading?: string | undefined;
  /** 分组内的项。 */
  items: readonly T[];
}

/** 拍平后的一行:组头 或 可选项。 */
export type FlatRow<T extends CommandItemLike> =
  | {
      kind: 'heading';
      /** 组头文本。 */
      heading: string;
      /** 所属分组下标。 */
      groupIndex: number;
      /** 稳定 key 片段。 */
      rowKey: string;
    }
  | {
      kind: 'item';
      /** 该行的项。 */
      item: T;
      /** label 高亮区间(由调用方在过滤后回填;拍平阶段为空)。 */
      ranges: MatchRange[];
      /** 在「可选序列」里的序号(disabled 项为 -1)。 */
      selectableIndex: number;
      /** 所属分组下标。 */
      groupIndex: number;
      /** 稳定 key 片段。 */
      rowKey: string;
    };

/** 拍平结果。 */
export interface FlattenResult<T extends CommandItemLike> {
  /** 全部渲染行(含组头)。 */
  rows: Array<FlatRow<T>>;
  /** 仅可选项(按 selectableIndex 顺序),供键盘导航用;disabled 项不在内。 */
  selectable: T[];
}

/**
 * 把「带分组的项」拍平成渲染行 + 可选序列。
 * - 每个分组先产出一行 heading(若有标题),再依次展开其 items;
 * - 空分组(items 为空)不产出组头;
 * - disabled 项仍渲染但 selectableIndex=-1,且不计入 selectable;
 * - 组头永远不可选。
 * 纯函数,不改入参。
 */
export function groupAndFlatten<T extends CommandItemLike>(
  groups: ReadonlyArray<CommandGroupLike<T>>,
): FlattenResult<T> {
  const rows: Array<FlatRow<T>> = [];
  const selectable: T[] = [];
  let cursor = 0;

  groups.forEach((group, groupIndex) => {
    if (group.items.length === 0) {
      return;
    }
    if (group.heading != null && group.heading !== '') {
      rows.push({
        kind: 'heading',
        heading: group.heading,
        groupIndex,
        rowKey: `h-${group.id ?? groupIndex}`,
      });
    }
    group.items.forEach((item, i) => {
      if (item.disabled) {
        rows.push({
          kind: 'item',
          item,
          ranges: [],
          selectableIndex: -1,
          groupIndex,
          rowKey: `i-${group.id ?? groupIndex}-${item.value}-${i}`,
        });
        return;
      }
      rows.push({
        kind: 'item',
        item,
        ranges: [],
        selectableIndex: cursor,
        groupIndex,
        rowKey: `i-${group.id ?? groupIndex}-${item.value}-${i}`,
      });
      selectable.push(item);
      cursor += 1;
    });
  });

  return { rows, selectable };
}

/* —— 键盘导航(在 selectable 序列上;序列已不含 disabled / 组头) —— */

/**
 * 从 `from` 起按 `dir`(+1/-1)在可选序列里找下一个落点索引;环形回绕。
 * 与 Tabs/Menu 的同名语义一致:序列已只含可选项,这里只做循环夹取。
 * 空序列返回 -1;`from` 为 -1 时从一端进入(dir=1 → 0,dir=-1 → 末位)。
 */
export function nextEnabledIndex(from: number, dir: 1 | -1, total: number): number {
  if (total <= 0) {
    return -1;
  }
  if (from < 0) {
    return dir === 1 ? 0 : total - 1;
  }
  // + total 保证取模前非负(JS 负数取模会得负)。
  return (from + dir + total) % total;
}

/** 首个(dir=-1)/ 末个(dir=1)可选项索引;空序列返回 -1。 */
export function edgeEnabledIndex(total: number, dir: 1 | -1): number {
  if (total <= 0) {
    return -1;
  }
  return dir === 1 ? total - 1 : 0;
}
