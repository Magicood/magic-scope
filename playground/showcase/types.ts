import type { ReactNode } from 'react';

/**
 * 展示站契约 —— 每个组件用一个 DocEntry 描述：说明文档 + 可交互参数旋钮 + 实时演示 + props 表。
 * 一个组件一个文件(showcase/components/<id>.tsx),默认导出 entry,registry 汇总。
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

/** render 收到的实时旋钮值,键为 control.prop。 */
export type ControlValues = Record<string, string | number | boolean>;

/** props 表的一行。 */
export interface PropDoc {
  name: string;
  /** TS 类型字符串,如 `'solid' | 'outline' | 'ghost'`。 */
  type: string;
  /** 默认值,无默认填 '—'。 */
  default?: string;
  description: string;
}

/** 附加静态示例(不受旋钮控制的固定场景)。 */
export interface DocExample {
  title: string;
  description?: string;
  node: ReactNode;
}

/** 一个组件的完整文档条目。 */
export interface DocEntry {
  /** kebab id,同时是路由 hash 与文件名,如 'button'。 */
  id: string;
  /** 展示名,如 'Button'。 */
  name: string;
  /** 所属分类 id(见 registry CATEGORIES)。 */
  category: string;
  /** 一句话简介(列表 + 页头副标题)。 */
  summary: string;
  /** 较完整的说明(何为 / 何时用),可换行,纯文本。 */
  description?: string;
  /** 可交互参数旋钮;空数组表示该组件无可调旋钮(仅展示)。 */
  controls: Control[];
  /** 依据实时旋钮值渲染主演示。有状态组件可在文件内定义局部组件并返回其元素。 */
  render: (values: ControlValues) => ReactNode;
  /** props / API 静态表,需与组件 TS 接口一致。 */
  props: PropDoc[];
  /** 可选:导入与最小用法代码片段。 */
  usage?: string;
  /** 可选:固定示例集。 */
  examples?: DocExample[];
}
