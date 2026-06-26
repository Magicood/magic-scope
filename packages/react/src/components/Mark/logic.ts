/**
 * Mark 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * 把「在一段纯文本里按 search 找命中片段」拆成纯函数:
 * 给定原文与一个或多个搜索词,切成有序的「命中 / 未命中」段数组,
 * 组件层只负责把命中段包进 <mark>。匹配规则(大小写 / 整词 / 多词 / 重叠 / 正则字符)全在这里,
 * 可独立单测、也可被其它框架壳复用。
 */

/** 一段切片:text 为原文子串,matched 表示是否命中 search。 */
export interface MarkSegment {
  /** 原文子串(保留原始大小写,绝不改写)。 */
  text: string;
  /** 是否命中搜索词。 */
  matched: boolean;
}

/** 切分选项。 */
export interface SplitOptions {
  /** 区分大小写(默认 false:不区分)。 */
  caseSensitive?: boolean | undefined;
  /** 整词匹配:命中片段两侧须为非单词字符 / 边界(默认 false)。 */
  wholeWord?: boolean | undefined;
}

/** 转义正则元字符,使搜索词按字面量匹配(避免用户输入的 . * ( ) 等被当成正则)。 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 把 search 规整为去重后的非空词数组(字符串包成单元素;数组逐个清洗)。 */
function normalizeSearch(search: string | string[]): string[] {
  const list = Array.isArray(search) ? search : [search];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    if (typeof raw !== 'string' || raw.length === 0) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  return out;
}

interface Range {
  start: number;
  end: number;
}

/**
 * 把 text 按 search 切成有序段数组。
 *
 * 规则:
 * - 空 search(空串 / 空数组 / 全空词)→ 整段未命中返回 [{ text, matched:false }](text 非空时);
 * - 多词:各词独立全局匹配,命中区间做并集后合并相邻 / 重叠区间(重叠不重复包裹);
 * - caseSensitive:默认不区分大小写;
 * - wholeWord:命中两侧须为单词边界(\b 语义),用于「整词高亮」;
 * - 搜索词中的正则元字符按字面量处理(已转义)。
 *
 * 返回段拼起来严格等于原 text(无丢字 / 无改写),空 text 返回 []。
 */
export function splitByMatches(
  text: string,
  search: string | string[],
  options: SplitOptions = {},
): MarkSegment[] {
  if (typeof text !== 'string' || text.length === 0) {
    return [];
  }

  const words = normalizeSearch(search);
  if (words.length === 0) {
    return [{ text, matched: false }];
  }

  const { caseSensitive = false, wholeWord = false } = options;
  const flags = caseSensitive ? 'g' : 'gi';
  const boundary = wholeWord ? '\\b' : '';

  // 1) 逐词独立全局匹配收集命中区间。
  //    必须按词分别匹配(而非 a|b 合成一条正则):JS 正则交替是「左侧优先 + lastIndex 单调推进」,
  //    用一条 (foo|oba) 会在 pos0 命中 foo 后从 pos3 续扫,永远漏掉 pos2 起的 oba。
  //    逐词匹配再做区间并集,才能正确处理「重叠 / 互相包含」的多词命中。
  const ranges: Range[] = [];
  for (const word of words) {
    let regex: RegExp;
    try {
      regex = new RegExp(`${boundary}${escapeRegExp(word)}${boundary}`, flags);
    } catch {
      // 理论上已转义不会抛;该词跳过,绝不让组件崩。
      continue;
    }
    for (let m = regex.exec(text); m !== null; m = regex.exec(text)) {
      const start = m.index;
      const end = start + m[0].length;
      if (end === start) {
        // 零宽匹配(理论上不会出现,因 word 非空)防死循环
        regex.lastIndex += 1;
        continue;
      }
      ranges.push({ start, end });
    }
  }

  if (ranges.length === 0) {
    return [{ text, matched: false }];
  }

  // 2) 按起点排序 + 合并重叠 / 相邻区间(处理多词重叠:如 "foobar" 搜 ["foo","oba"] )
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Range[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      if (r.end > last.end) last.end = r.end;
    } else {
      merged.push({ start: r.start, end: r.end });
    }
  }

  // 3) 沿区间把原文切成「未命中 / 命中」交替段(保留原始大小写)
  const segments: MarkSegment[] = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), matched: false });
    }
    segments.push({ text: text.slice(start, end), matched: true });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), matched: false });
  }

  return segments;
}
