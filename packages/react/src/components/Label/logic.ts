/**
 * Label 纯逻辑 —— 零 React 依赖,便于将来平移进 `packages/core`。
 * 只做「标记类型决议」与「class 名拼装」这类与框架无关的纯计算。
 */

/** 字段标记类型:无 / 必填 / 可选(required 与 optional 互斥,required 优先)。 */
export type LabelMark = 'none' | 'required' | 'optional';

/** Label 的语义色调(对齐全库 tone 槽位)。 */
export type LabelTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Label 尺寸(与表单控件三档对齐)。 */
export type LabelSize = 'sm' | 'md' | 'lg';

/**
 * 决议标记类型:required 与 optional 互斥,required 优先(二者同传时只认 required)。
 * 纯函数,无副作用。
 */
export const resolveMark = (required: boolean, optional: boolean): LabelMark => {
  if (required) return 'required';
  if (optional) return 'optional';
  return 'none';
};

/** 拼装 Label 根元素 class(过滤假值、去重拼接)。纯函数。 */
export const resolveLabelClasses = (input: {
  size: LabelSize;
  tone: LabelTone;
  mark: LabelMark;
  disabled: boolean;
  className?: string | undefined;
}): string => {
  const { size, tone, mark, disabled, className } = input;
  return [
    'ms-label',
    `ms-label--${size}`,
    `ms-tone-${tone}`,
    mark === 'required' && 'ms-label--required',
    mark === 'optional' && 'ms-label--optional',
    disabled && 'ms-label--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
};
