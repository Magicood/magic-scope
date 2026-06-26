/**
 * PinInput 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 字符过滤(按 type)、串↔定长格数组互转都是纯函数;组件只负责把它们接进状态/DOM/键盘。
 */

/** 允许的字符集:numeric 仅 0-9;alphanumeric 收 0-9 与大小写字母。 */
export type PinInputType = 'numeric' | 'alphanumeric';

const NUMERIC_RE = /[0-9]/g;
const ALPHANUMERIC_RE = /[0-9a-zA-Z]/g;

/**
 * 按 `type` 过滤掉所有非法字符,返回只剩合法字符的串(顺序不变)。
 * 用于:单格输入合法性判定、粘贴整串清洗。空串安全返回空串。
 */
export function sanitize(raw: string, type: PinInputType): string {
  if (raw === '') {
    return '';
  }
  const re = type === 'numeric' ? NUMERIC_RE : ALPHANUMERIC_RE;
  const matched = raw.match(re);
  return matched ? matched.join('') : '';
}

/**
 * 把受控/非受控传入的 value 串切成定长 `length` 的「每格一字符」数组:
 * 不足右侧补空串,超长截断。`length <= 0` 返回空数组。
 * `noUncheckedIndexedAccess` 安全:消费方拿到的每项都是 string(可能为 '')。
 */
export function splitValue(value: string, length: number): string[] {
  if (length <= 0) {
    return [];
  }
  const cells: string[] = new Array<string>(length).fill('');
  const upper = Math.min(value.length, length);
  for (let i = 0; i < upper; i++) {
    cells[i] = value.charAt(i);
  }
  return cells;
}

/** 把每格字符数组拼回完整串(空格保留为空,不补位)。纯函数。 */
export function joinValue(cells: readonly string[]): string {
  return cells.join('');
}

/**
 * 空格哨兵:把定长 cells 序列化成**保留空位**的内部串时,用它占位空格。
 * 选 NUL(U+0000)是因为它既不在 numeric/alphanumeric 合法集里(`sanitize` 会自然剔除),
 * 也不会出现在用户输入/粘贴中,可安全地与真实字符区分。
 */
export const EMPTY_CELL = '\u0000';

/**
 * 把定长 cells 数组序列化为**保留每格位置**的内部串:空格 → 哨兵。
 * 与 `splitCells` 互逆。区别于 `joinValue`:绝不折叠空位、不左挤。
 */
export function joinCells(cells: readonly string[]): string {
  return cells.map((c) => (c === '' ? EMPTY_CELL : c)).join('');
}

/**
 * 把保留位置的内部串反序列化回定长 `length` 的 cells 数组:哨兵 → 空格。
 * 不足右侧补空,超长截断;与 `joinCells` 互逆。
 */
export function splitCells(internal: string, length: number): string[] {
  if (length <= 0) {
    return [];
  }
  const cells: string[] = new Array<string>(length).fill('');
  const upper = Math.min(internal.length, length);
  for (let i = 0; i < upper; i++) {
    const ch = internal.charAt(i);
    cells[i] = ch === EMPTY_CELL ? '' : ch;
  }
  return cells;
}

/** 把定长 cells 数组压成紧凑串(丢弃空位),用于对外 onChange / onComplete。纯函数。 */
export function compactCells(cells: readonly string[]): string {
  return cells.filter((c) => c !== '').join('');
}

/**
 * 判断某格是否已填满全部 `length` 位(用于触发 onComplete)。
 * 要求每格都非空且总长度等于 length。
 */
export function isComplete(value: string, length: number): boolean {
  return length > 0 && value.length >= length;
}
