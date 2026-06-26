/**
 * Avatar 纯逻辑层 —— 零 React 依赖,可平移进 packages/core。
 *
 * 这里放与渲染无关的确定性计算:首字母提取、name → tone 的稳定哈希映射。
 * 同名输入永远得到同一结果(确定性),这样同一用户在不同位置的占位色一致。
 */

/** Avatar 占位可用的色调集合(与全库 tone 槽位对齐)。 */
export type AvatarTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * name → 确定性 tone 的候选池。不含 neutral / danger:
 * 占位色是「装饰性身份色」,danger 语义太强(易误读为告警),neutral 太灰(失去辨识度)。
 */
export const AVATAR_COLOR_POOL: readonly AvatarTone[] = [
  'primary',
  'accent',
  'success',
  'warning',
  'info',
] as const;

/**
 * 取 name 的首字母作占位:按空白切词,取首尾两词首字母,大写,最多 2 字。
 * 单词时取该词首字母;空串返回空串。纯函数。
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase().slice(0, 2);
}

/**
 * 对字符串做轻量稳定哈希(djb2 变体)。纯函数、确定性、跨运行一致。
 * 仅用于把 name 稳定散列到色板,不用于安全场景。
 */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    // hash * 33 + charCode,保持 32 位无符号,避免溢出成负
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * name → 确定性 tone:对 name 哈希后取模映射到色板。
 * 同名稳定同色;空 name 回退池首项。纯函数。
 */
export function toneFromName(name: string | undefined): AvatarTone {
  const pool = AVATAR_COLOR_POOL;
  if (!name || pool.length === 0) return pool[0] ?? 'primary';
  const index = hashString(name) % pool.length;
  return pool[index] ?? pool[0] ?? 'primary';
}
