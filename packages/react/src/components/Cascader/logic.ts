/**
 * Cascader 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 级联树的路径查找 / 取选项 / 叶子展开 / 路径显示串都是纯函数;
 * 组件只负责把它们接进状态 / DOM / 键盘语义。
 */

/** 级联选项的最小结构契约。children 缺省即为叶子节点。 */
export interface CascaderOption {
  /** 同层唯一的值;整条选中路径由各层 value 串成 `string[]`。 */
  value: string;
  /** 展示文案。 */
  label: string;
  /** 禁用:该节点不可选中,也不可作为路径中转(逻辑层只读此标记,是否拦截由消费方决定)。 */
  disabled?: boolean | undefined;
  /** 子选项;有则为非叶子节点(可继续展开下一列)。 */
  children?: CascaderOption[] | undefined;
}

/** 是否为叶子节点(无 children 或 children 为空)。 */
export function isLeaf(option: CascaderOption): boolean {
  return option.children === undefined || option.children.length === 0;
}

/**
 * 按 value 路径在树中逐层定位,返回沿途的选项数组(路径上的每个节点)。
 * 任一层匹配不到即返回已走到的前缀(可能比 `value.length` 短);空路径返回 `[]`。
 * `noUncheckedIndexedAccess` 安全(用 find,不用下标)。
 */
export function findPath(
  options: readonly CascaderOption[],
  value: readonly string[],
): CascaderOption[] {
  const path: CascaderOption[] = [];
  let level: readonly CascaderOption[] | undefined = options;
  for (const v of value) {
    if (!level) {
      break;
    }
    const found: CascaderOption | undefined = level.find((o) => o.value === v);
    if (!found) {
      break;
    }
    path.push(found);
    level = found.children;
  }
  return path;
}

/**
 * 取路径末端的选项;路径无法完整走通(中途断裂)或为空时返回 undefined。
 * 完整走通的判据:沿途节点数 === value 长度。
 */
export function getOptionByPath(
  options: readonly CascaderOption[],
  value: readonly string[],
): CascaderOption | undefined {
  if (value.length === 0) {
    return undefined;
  }
  const path = findPath(options, value);
  if (path.length !== value.length) {
    return undefined;
  }
  return path[path.length - 1];
}

/** 一条扁平化的叶子路径:value 串 + label 串 + 沿途选项(供搜索 / 列表渲染)。 */
export interface CascaderLeafPath {
  /** 整条路径的 value 序列。 */
  value: string[];
  /** 整条路径的 label 序列。 */
  labels: string[];
  /** 整条路径的选项序列。 */
  path: CascaderOption[];
}

/**
 * 深度优先展开出所有「叶子路径」(到不可再展开的节点为止),供搜索框平铺匹配。
 * 默认仅收叶子;`includeNonLeaf` 为 true 时,每个中间节点也各产出一条路径(changeOnSelect 搜索场景)。
 */
export function flattenLeafPaths(
  options: readonly CascaderOption[],
  includeNonLeaf = false,
): CascaderLeafPath[] {
  const result: CascaderLeafPath[] = [];
  const walk = (level: readonly CascaderOption[], prefix: CascaderOption[]): void => {
    for (const option of level) {
      const nextPrefix = [...prefix, option];
      const leaf = isLeaf(option);
      if (leaf || includeNonLeaf) {
        result.push({
          value: nextPrefix.map((o) => o.value),
          labels: nextPrefix.map((o) => o.label),
          path: nextPrefix,
        });
      }
      if (!leaf && option.children) {
        walk(option.children, nextPrefix);
      }
    }
  };
  walk(options, []);
  return result;
}

/**
 * 把一条选项路径渲染成显示串,如 `浙江 / 杭州 / 西湖`。
 * 入参既可是选项数组,也可是 label 数组;`separator` 默认 ` / `。
 */
export function pathLabel(path: ReadonlyArray<CascaderOption | string>, separator = ' / '): string {
  return path.map((item) => (typeof item === 'string' ? item : item.label)).join(separator);
}

/**
 * 列内从 `start`(含)起按 `dir`(+1/-1)找下一个可用(未禁用)项索引;环形遍历,全禁用 / 空返回 -1。
 * 与 Select 同款导航语义,便于跨框架复用。
 */
export function findEnabledIndex(
  options: readonly CascaderOption[],
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

/**
 * 给定已展开的 value 前缀,逐层取出要渲染的「列」(每列是一个选项数组)。
 * 第一列恒为根 options;之后每多走通一层、且该层节点有 children,就追加一列。
 * 断裂(某层 value 匹配不到 / 命中叶子)即停止,保证列与真实可展开层级一致。
 */
export function columnsForValue(
  options: readonly CascaderOption[],
  value: readonly string[],
): CascaderOption[][] {
  const columns: CascaderOption[][] = [[...options]];
  let level: readonly CascaderOption[] | undefined = options;
  for (const v of value) {
    if (!level) {
      break;
    }
    const found: CascaderOption | undefined = level.find((o) => o.value === v);
    const children: CascaderOption[] | undefined = found?.children;
    if (!children || children.length === 0) {
      break;
    }
    columns.push([...children]);
    level = children;
  }
  return columns;
}
