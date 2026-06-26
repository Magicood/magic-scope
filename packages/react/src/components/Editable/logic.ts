/**
 * Editable 纯逻辑层 —— 零 React 耦合,便于将来平移 core(vue / web component 共用)。
 * 行内编辑的「键盘语义判定 + 提交/取消的值流转」是纯函数;组件层只负责把它们接进状态 / 焦点 / DOM。
 */

/** 一次键盘动作对应的意图:提交 / 取消 / 无关(交还浏览器默认)。 */
export type EditableKeyIntent = 'submit' | 'cancel' | 'none';

/** 判定键盘意图所需的上下文(都是纯标量,无 DOM / 无 React)。 */
export interface EditableKeyContext {
  /** 按下的 key(event.key)。 */
  key: string;
  /** 是否按下 shift(多行下 Shift+Enter 用于换行,不提交)。 */
  shiftKey: boolean;
  /** 是否多行(textarea):多行下裸 Enter 默认换行,需配合 submitOnEnter 才提交。 */
  multiline: boolean;
  /** Enter 是否提交。单行默认 true;多行默认 false(裸 Enter 换行)。 */
  submitOnEnter: boolean;
}

/**
 * 按键盘上下文判定行内编辑的意图。
 * - Escape → 取消(还原)。
 * - Enter:
 *   - 多行 + Shift → 'none'(换行,交还默认)。
 *   - submitOnEnter 为 true → 提交。
 *   - 否则 'none'(多行裸 Enter 默认换行)。
 * - 其它键 → 'none'。
 * 纯函数,便于在 vue / core 复用同一套键盘语义。
 */
export function resolveKeyIntent(ctx: EditableKeyContext): EditableKeyIntent {
  if (ctx.key === 'Escape' || ctx.key === 'Esc') {
    return 'cancel';
  }
  if (ctx.key === 'Enter') {
    if (ctx.multiline && ctx.shiftKey) {
      return 'none';
    }
    return ctx.submitOnEnter ? 'submit' : 'none';
  }
  return 'none';
}

/** 提交结果:是否值发生变化 + 规整后的最终值(供组件决定是否触发 onChange)。 */
export interface CommitResult {
  /** 相对进入编辑前的初始值是否变化。 */
  changed: boolean;
  /** 规整后的提交值(经 maxLength 截断)。 */
  value: string;
}

/**
 * 计算「提交」的值流转:把草稿值按 maxLength 截断,并与进入编辑前的初始值比较是否变化。
 * 不碰 DOM / 状态,纯计算;组件据 changed 决定是否回调 onChange、据 value 落库。
 */
export function commitValue(
  draft: string,
  initial: string,
  maxLength?: number | undefined,
): CommitResult {
  const clamped =
    maxLength != null && maxLength >= 0 && draft.length > maxLength
      ? draft.slice(0, maxLength)
      : draft;
  return { changed: clamped !== initial, value: clamped };
}

/**
 * 展示态要显示的文本:有值显示值,空值回退占位符(供组件渲染占位样式判定 isEmpty)。
 * value 为 null / undefined / 空串都视为空。
 */
export function resolvePreviewText(
  value: string | null | undefined,
  placeholder: string,
): { text: string; isEmpty: boolean } {
  const text = value == null ? '' : value;
  if (text.length === 0) {
    return { text: placeholder, isEmpty: true };
  }
  return { text, isEmpty: false };
}

/** 展示态键盘:Enter / Space 进入编辑态(返回是否应进入)。 */
export function shouldEnterEditFromPreview(key: string): boolean {
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
}
