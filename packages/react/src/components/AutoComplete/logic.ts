/**
 * AutoComplete 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 自由文本补全:候选项过滤、可用项导航都是纯函数;组件只负责把它们接进状态/DOM。
 *
 * 与 Select 的区别:AutoComplete 的「值就是输入串」,选项只是补全建议;
 * 过滤维度只看用户输入文本(inputValue),不掺额外受控查询态。
 */

/**
 * 候选项的最小结构契约(逻辑层只关心这三个字段)。
 * `label` 为 `unknown`:组件层允许富文本 label(ReactNode),但纯逻辑只在它是字符串时拿来过滤,
 * 这样既兼容富 label 又保持过滤层零框架依赖、可平移 core。
 */
export interface AutoCompleteOptionLike {
  /** 选中后填入输入框的值。 */
  value: string;
  /** 显示文本;仅当为字符串时参与过滤,否则按 value 过滤。 */
  label?: unknown;
  /** 是否禁用该候选项(不可高亮 / 选中)。 */
  disabled?: boolean | undefined;
}

/** 取候选项的过滤文本:label 为字符串时用 label,否则回退 value。 */
export function optionText<T extends AutoCompleteOptionLike>(option: T): string {
  return typeof option.label === 'string' ? option.label : option.value;
}

/**
 * 默认过滤:大小写不敏感的子串匹配 —— label(或回退 value)或 value 包含输入串即命中。
 * 输入为空(去空白后)时返回全部候选,便于「聚焦即展开全量建议」。
 */
export function defaultFilter<T extends AutoCompleteOptionLike>(
  options: readonly T[],
  inputValue: string,
): T[] {
  const q = inputValue.trim().toLowerCase();
  if (q === '') {
    return [...options];
  }
  return options.filter(
    (o) => optionText(o).toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  );
}

/**
 * 过滤候选项的统一入口:
 * - `filterOption === false`:关闭内置过滤(透传全部),交由外部受控(远程搜索);
 * - 传入自定义谓词:逐项调用 `(inputValue, option) => boolean` 决定保留;
 * - 缺省(undefined):走 {@link defaultFilter} 子串匹配。
 * 纯函数,不改原数组,便于在 vue/core 复用同一过滤语义。
 */
export function filterOptions<T extends AutoCompleteOptionLike>(
  options: readonly T[],
  inputValue: string,
  filterOption?: false | ((inputValue: string, option: T) => boolean) | undefined,
): T[] {
  if (filterOption === false) {
    return [...options];
  }
  if (typeof filterOption === 'function') {
    return options.filter((o) => filterOption(inputValue, o));
  }
  return defaultFilter(options, inputValue);
}

/**
 * 从 `start`(含)起按 `dir`(+1/-1)找下一个可用(未禁用)项的索引;环形遍历,全禁用/空表返回 -1。
 * 与具体 React 状态无关,便于将来在 vue/core 复用同一导航语义。
 */
export function findEnabledIndex<T extends AutoCompleteOptionLike>(
  options: readonly T[],
  start: number,
  dir: 1 | -1,
): number {
  const n = options.length;
  if (n === 0) {
    return -1;
  }
  let i = start;
  for (let step = 0; step < n; step++) {
    if (i < 0) {
      i = n - 1;
    } else if (i >= n) {
      i = 0;
    }
    if (!options[i]?.disabled) {
      return i;
    }
    i += dir;
  }
  return -1;
}
