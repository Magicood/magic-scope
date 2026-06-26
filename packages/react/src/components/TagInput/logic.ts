/**
 * TagInput 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 标签规整(trim)、重复判定、按分隔符切分(粘贴多标签)、能否新增(maxTags / 重复 / validate)
 * 都是纯函数;组件只负责把它们接进状态 / DOM / 事件。
 */

/** 规整一个候选标签:去首尾空白。空串(纯空白)规整后为 ''。 */
export function normalizeTag(raw: string): string {
  return raw.trim();
}

/**
 * 判定 `tag` 是否已存在于 `tags` 中。
 * `caseSensitive=false`(默认)时大小写不敏感比较(去重更贴合人类预期,如 React 与 react 视为同一标签)。
 */
export function isDuplicate(tags: readonly string[], tag: string, caseSensitive = false): boolean {
  if (caseSensitive) {
    return tags.includes(tag);
  }
  const lower = tag.toLowerCase();
  return tags.some((t) => t.toLowerCase() === lower);
}

/**
 * 按一组分隔符把字符串切成多个候选标签(粘贴 "a,b;c" 这类一次性多标签场景)。
 * 每个分隔符可为单字符或多字符串;切分后逐个 `normalizeTag` 并剔除空串。空分隔符表回退仅按整串规整。
 */
export function splitByDelimiters(input: string, delimiters: readonly string[]): string[] {
  const seps = delimiters.filter((d) => d.length > 0);
  if (seps.length === 0) {
    const single = normalizeTag(input);
    return single === '' ? [] : [single];
  }
  // 用占位符把所有分隔符统一成一个,再 split;先转义正则元字符。
  const pattern = seps.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(pattern);
  return input
    .split(re)
    .map(normalizeTag)
    .filter((t) => t !== '');
}

/** canAdd 的失败原因:供组件区分提示 / 是否清空输入。 */
export type AddRejectReason = 'empty' | 'max' | 'duplicate' | 'invalid';

/** canAdd 结果:`ok` 为真则可新增,否则 `reason` 给出被拒原因。 */
export type CanAddResult = { ok: true } | { ok: false; reason: AddRejectReason };

/** canAdd 的判定参数。 */
export interface CanAddOptions {
  /** 上限:已达 `maxTags` 则拒。undefined 表不限。 */
  maxTags?: number | undefined;
  /** 是否允许重复(默认 false:重复则拒)。 */
  allowDuplicates?: boolean | undefined;
  /** 去重是否大小写敏感(默认 false)。 */
  caseSensitive?: boolean | undefined;
  /** 业务校验:返回 false / 抛错均视为拒绝(invalid)。规整后的 tag 入参。 */
  validate?: ((tag: string) => boolean) | undefined;
}

/**
 * 判定规整后的 `tag` 能否加入 `tags`。纯函数,顺序:空 → 超限 → 重复 → 业务校验。
 * 不修改入参;真正的写入交给组件(便于受控 / 非受控复用同一判定)。
 */
export function canAdd(
  tags: readonly string[],
  tag: string,
  options: CanAddOptions = {},
): CanAddResult {
  const { maxTags, allowDuplicates = false, caseSensitive = false, validate } = options;
  if (tag === '') {
    return { ok: false, reason: 'empty' };
  }
  if (maxTags !== undefined && tags.length >= maxTags) {
    return { ok: false, reason: 'max' };
  }
  if (!allowDuplicates && isDuplicate(tags, tag, caseSensitive)) {
    return { ok: false, reason: 'duplicate' };
  }
  if (validate) {
    let passed = false;
    try {
      passed = validate(tag);
    } catch {
      passed = false;
    }
    if (!passed) {
      return { ok: false, reason: 'invalid' };
    }
  }
  return { ok: true };
}

/**
 * 把一批候选标签依次尝试加入,返回最终标签数组(受 maxTags / 去重 / validate 约束)。
 * 用于粘贴多标签 / 失焦提交:每次判定都基于「累积后的最新数组」(避免一批内自我重复 / 超限)。
 * 不修改入参。
 */
export function addMany(
  tags: readonly string[],
  candidates: readonly string[],
  options: CanAddOptions = {},
): string[] {
  const next = [...tags];
  for (const candidate of candidates) {
    const tag = normalizeTag(candidate);
    if (canAdd(next, tag, options).ok) {
      next.push(tag);
    }
  }
  return next;
}

/** 规整可能传进来的受控 / 非受控 value(容忍 undefined)为字符串数组拷贝。 */
export function toTagArray(value: readonly string[] | undefined): string[] {
  return value === undefined ? [] : [...value];
}
