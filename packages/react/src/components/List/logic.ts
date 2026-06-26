/**
 * List 纯逻辑层 —— 零 React 依赖,可平移进 core / 给 vue·angular 薄壳复用。
 *
 * 这里只放「与渲染无关的派生计算」:variant → 根标签、marker 取值归类、
 * class 名拼装。组件层(List.tsx)只负责把这些结果接到 JSX。
 */

/** 列表语义形态:无序 / 有序 / 描述列表。决定根标签 ul / ol / dl。 */
export type ListVariant = 'unordered' | 'ordered' | 'description';

/** 间距档(随密度 --ms-density-scale 缩放)。 */
export type ListSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg';

/** 语义色调(复用全库 tone resolver 的 --ms-c;着色 ::marker 与标记图标)。 */
export type ListTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * 标记类型(list-style-type)。覆盖常用语义档:
 * - 无序:disc / circle / square / none
 * - 有序:decimal / 前导零 / 罗马(大小写)/ 拉丁字母(大小写)/ CJK 数字
 * 其它冷门取值(如 hiragana、georgian)走逃生舱:直接给 markerType 传任意字符串。
 */
export type ListMarkerType =
  | 'disc'
  | 'circle'
  | 'square'
  | 'none'
  | 'decimal'
  | 'decimal-leading-zero'
  | 'lower-roman'
  | 'upper-roman'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'cjk-decimal'
  | (string & {});

/** variant → 根标签。description=dl,ordered=ol,其余=ul。 */
export const rootTagForVariant = (variant: ListVariant): 'ul' | 'ol' | 'dl' => {
  if (variant === 'ordered') return 'ol';
  if (variant === 'description') return 'dl';
  return 'ul';
};

/** 各 variant 的默认 list-style-type(用户未显式给 markerType / icon 时兜底)。 */
export const defaultMarkerType = (variant: ListVariant): ListMarkerType => {
  if (variant === 'ordered') return 'decimal';
  if (variant === 'description') return 'none';
  return 'disc';
};

const isFalse = (v: string | false | null | undefined): v is false | null | undefined =>
  v === false || v == null || v === '';

/** 拼 class:过滤掉 falsy 段,空格连接。与 Text 的 cx 同语义,独立放逻辑层便于平移。 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter((p) => !isFalse(p)).join(' ');
