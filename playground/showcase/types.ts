/**
 * 参数旋钮(Control)契约 —— 框架无关,被 meta.controls 使用,驱动演示区的可交互面板。
 */

/** 下拉选择型旋钮(variant / size / tone 等枚举 prop)。 */
export interface SelectControl {
  type: 'select';
  /** 对应组件的 prop 名(render 用 values[prop] 取值)。 */
  prop: string;
  /** 旋钮显示标签。 */
  label: string;
  options: { value: string; label: string }[];
  default: string;
}

/** 开关型旋钮(disabled / invalid / 等布尔 prop)。 */
export interface BooleanControl {
  type: 'boolean';
  prop: string;
  label: string;
  default: boolean;
}

/** 文本输入型旋钮(label / placeholder / 文案等)。 */
export interface TextControl {
  type: 'text';
  prop: string;
  label: string;
  default: string;
  placeholder?: string;
}

/** 数值型旋钮(min / max / step / value 等)。 */
export interface NumberControl {
  type: 'number';
  prop: string;
  label: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
}

export type Control = SelectControl | BooleanControl | TextControl | NumberControl;

/** 主演示收到的实时旋钮值,键为 control.prop。 */
export type ControlValues = Record<string, string | number | boolean>;
