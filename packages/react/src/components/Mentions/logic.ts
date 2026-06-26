/**
 * Mentions 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * @提及 的三件核心事都是纯计算,与具体 textarea / React 状态无关:
 * 1. detectMention —— 从「文本 + 光标位置」里反向找出光标所在的触发段(@query);
 * 2. filterOptions —— 按 query 过滤候选项(大小写不敏感、空 query 返回全部);
 * 3. computeInsertion —— 把 @query 段替换成选中项文本 + 分隔符,并算出替换后新光标位置。
 *
 * 组件只负责把它们接进 DOM(读 selectionStart、写 value、设光标)。
 */

/** 候选项的最小结构契约(逻辑层只关心这两个字段)。 */
export interface MentionOptionLike {
  value: string;
  label: string;
}

/** detectMention 的结果:是否命中触发段、命中的前缀、查询串、@ 起始下标。 */
export interface MentionMatch {
  /** 光标前是否存在一个有效的触发段(即下拉应当激活)。 */
  active: boolean;
  /** 命中的触发前缀(prefixes 里的某一个);未命中为空串。 */
  prefix: string;
  /** 前缀之后、光标之前的查询文本(不含前缀);未命中为空串。 */
  query: string;
  /** 触发前缀在原文中的起始下标(即 prefix 首字符位置);未命中为 -1。 */
  start: number;
}

/** 一个字符是否会中断 @提及 的查询段(空白即视为分词边界,提及内不允许空白)。 */
function isBreakChar(ch: string): boolean {
  return /\s/.test(ch);
}

/**
 * 从光标前反向扫描,找出「光标所在」的最近触发段 `@query`。
 *
 * 触发规则(对齐主流 @提及 体验):
 * - 从 caretPos 往左逐字符扫,遇到任一 `prefixes` 里的前缀即命中;
 * - 命中段内不允许出现空白(空白即认为提及已结束),遇空白则判定未命中;
 * - 前缀必须位于「行首 / 字符串首」或「前一字符是空白」——避免把 `foo@bar` 邮箱误判为提及;
 * - query 为前缀到光标之间的文本(可为空串,如刚敲下 `@` 时 query='' 也算 active,用于展示全部候选)。
 *
 * 纯函数:输入文本与光标位置,输出命中信息;不读 DOM、不依赖 React。
 *
 * @param text 当前完整文本。
 * @param caretPos 光标位置(textarea.selectionStart);会被夹取到 [0, text.length]。
 * @param prefixes 触发前缀集合(如 ['@'] 或 ['@','#']);按出现位置就近命中。
 */
export function detectMention(
  text: string,
  caretPos: number,
  prefixes: readonly string[],
): MentionMatch {
  const miss: MentionMatch = { active: false, prefix: '', query: '', start: -1 };
  if (prefixes.length === 0) {
    return miss;
  }
  const caret = Math.max(0, Math.min(caretPos, text.length));
  // 从光标前一个字符往左扫,遇空白即停(提及段内不含空白)。
  for (let i = caret - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === undefined) {
      break;
    }
    // 命中某个前缀:校验左边界(行首 / 串首 / 前一字符为空白),成立才算有效触发。
    const matchedPrefix = prefixes.find((p) => p.length > 0 && text.startsWith(p, i));
    if (matchedPrefix !== undefined) {
      const before = i > 0 ? text[i - 1] : undefined;
      const atBoundary = before === undefined || isBreakChar(before);
      if (!atBoundary) {
        // 前缀紧贴非空白(如邮箱 foo@bar):不是提及,且该前缀左侧也不会再有有效触发段,直接判负。
        return miss;
      }
      const query = text.slice(i + matchedPrefix.length, caret);
      // 查询段内若含空白则不是有效提及(理论上扫描已在空白处 break,这里兜底)。
      if (isBreakChar(query)) {
        return miss;
      }
      return { active: true, prefix: matchedPrefix, query, start: i };
    }
    if (isBreakChar(ch)) {
      // 在遇到前缀前先撞上空白:光标不在任何提及段内。
      return miss;
    }
  }
  return miss;
}

/**
 * 在候选列表里从 `from` 出发,按 `step` 方向循环找下一个「非 disabled」索引。
 *
 * - `step = 1` 向后、`step = -1` 向前;循环回绕(到尾接头 / 到头接尾)。
 * - 全部禁用(或空列表)时返回 -1,调用方据此「不动高亮」。
 * - 用于键盘 ↑↓ 跳过禁用候选,避免高亮停在不可选项上。
 *
 * 纯函数:只看 disabled 标记,不依赖 DOM / React。
 *
 * @param options 候选列表(只读 disabled 字段)。
 * @param from 起始索引(可越界,会被夹取参与回绕计算)。
 * @param step 方向:1 向后、-1 向前。
 */
export function nextEnabledIndex(
  options: readonly { disabled?: boolean }[],
  from: number,
  step: 1 | -1,
): number {
  const count = options.length;
  if (count === 0) {
    return -1;
  }
  // 把 from 夹进 [0, count) 作为回绕基准。
  const base = ((from % count) + count) % count;
  for (let n = 1; n <= count; n++) {
    const idx = (((base + step * n) % count) + count) % count;
    if (!options[idx]?.disabled) {
      return idx;
    }
  }
  return -1;
}

/**
 * 找出第一个「非 disabled」候选索引(从 0 起向后扫)。
 *
 * - 用于初始高亮 / clamp 落点:绝不裸落 0(首项可能禁用)。
 * - 全部禁用(或空列表)返回 -1。
 *
 * 纯函数。
 */
export function firstEnabledIndex(options: readonly { disabled?: boolean }[]): number {
  for (let i = 0; i < options.length; i++) {
    if (!options[i]?.disabled) {
      return i;
    }
  }
  return -1;
}

/** 默认过滤:大小写不敏感地匹配 label 或 value 包含 query。query 为空时返回全部。 */
export function filterOptions<T extends MentionOptionLike>(
  options: readonly T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return [...options];
  }
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  );
}

/** computeInsertion 的结果:替换后新文本与新光标位置。 */
export interface MentionInsertion {
  /** 把 @query 段替换成 insertText + split 后的完整新文本。 */
  nextText: string;
  /** 替换完成后建议的光标位置(落在插入文本 + 分隔符之后)。 */
  nextCaret: number;
}

/**
 * 把从 `start` 起、长度为 `prefixLen + query.length` 的触发段,替换成 `insertText + split`。
 *
 * - `start` 为前缀首字符下标(detectMention 给出的 start);
 * - 替换区间 = [start, start + 已输入提及段长度);其中已输入段长度由 prefixLen + query.length 确定;
 * - 替换文本 = insertText(通常调用方已自带前缀,如 '@张三')+ split 分隔符(默认空格);
 * - 新光标落在分隔符之后,便于继续输入。
 *
 * 纯函数:不读 DOM;调用方负责把 nextText 写回、把光标设到 nextCaret。
 *
 * @param text 当前完整文本。
 * @param start 触发段起始下标(前缀首字符,detectMention.start)。
 * @param query 已输入的查询文本(不含前缀;用于算出被替换段的长度)。
 * @param insertText 用来替换的文本(通常含前缀,如 '@张三')。
 * @param split 插入文本后追加的分隔符。默认空格 ' '。
 * @param prefixLen 触发前缀的长度(默认 1,对应单字符前缀 '@')。
 */
export function computeInsertion(
  text: string,
  start: number,
  query: string,
  insertText: string,
  split = ' ',
  prefixLen = 1,
): MentionInsertion {
  const safeStart = Math.max(0, Math.min(start, text.length));
  // 被替换段 = 前缀 + 已输入 query。
  const consumedEnd = Math.min(safeStart + prefixLen + query.length, text.length);
  const head = text.slice(0, safeStart);
  const tail = text.slice(consumedEnd);
  const inserted = `${insertText}${split}`;
  const nextText = `${head}${inserted}${tail}`;
  const nextCaret = safeStart + inserted.length;
  return { nextText, nextCaret };
}
