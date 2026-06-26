/**
 * Blockquote 纯逻辑层(零 React 依赖,可平移 core)。
 * 只做 class 名拼接与小工具,组件外可单测。
 */

export type BlockquoteTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type BlockquoteVariant = 'bordered' | 'filled' | 'card' | 'plain';
export type BlockquoteSize = 'sm' | 'md' | 'lg';
export type BlockquoteAccentSide = 'start' | 'end';
export type BlockquoteGlow = 'off' | 'soft' | 'strong';

/** 拼 class:过滤掉 false/undefined/'' 再用空格连接。 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export interface BlockquoteClassInput {
  variant: BlockquoteVariant;
  size: BlockquoteSize;
  tone: BlockquoteTone | undefined;
  accentSide: BlockquoteAccentSide;
  quoteMark: boolean;
  gradient: boolean;
  glow: BlockquoteGlow;
  hasIcon: boolean;
  hasCite: boolean;
}

/**
 * 计算根元素的 class 列表。
 * 魔法效果(gradient/glow)需要 tone 槽位(--ms-c / --ms-c-glow);
 * 未显式给 tone 时由调用方兜底 'primary'(见 resolveTone)。
 */
export const blockquoteClasses = (input: BlockquoteClassInput, className?: string): string =>
  cx(
    'ms-blockquote',
    `ms-blockquote--${input.variant}`,
    `ms-blockquote--${input.size}`,
    input.tone && `ms-tone-${input.tone}`,
    input.accentSide === 'end' && 'ms-blockquote--accent-end',
    input.quoteMark && 'ms-blockquote--quoted',
    input.gradient && 'ms-blockquote--gradient',
    input.glow !== 'off' && `ms-blockquote--glow-${input.glow}`,
    input.hasIcon && 'ms-blockquote--with-icon',
    input.hasCite && 'ms-blockquote--with-cite',
    className,
  );

/**
 * 魔法效果是否需要 tone 槽位:gradient 或 glow(非 off)都依赖 --ms-c / --ms-c-glow。
 * 强调条(bordered/filled/card)本身也读 --ms-c,但 plain 无可视色块——
 * 仅当真正需要槽位且用户未显式给 tone 时,才兜底注入 primary 槽。
 */
export const needsToneSlot = (gradient: boolean, glow: BlockquoteGlow): boolean =>
  gradient || glow !== 'off';

/**
 * 解析最终生效 tone:
 * - 用户显式给了 tone → 用之;
 * - 否则若为「有色块的变体」(非 plain)或需要魔法槽位 → 兜底 primary(保证 --ms-c 有值);
 * - plain 且无魔法 → undefined(不染色,纯文字)。
 */
export const resolveTone = (
  tone: BlockquoteTone | undefined,
  variant: BlockquoteVariant,
  gradient: boolean,
  glow: BlockquoteGlow,
): BlockquoteTone | undefined => {
  if (tone) return tone;
  if (variant !== 'plain') return 'primary';
  if (needsToneSlot(gradient, glow)) return 'primary';
  return undefined;
};
