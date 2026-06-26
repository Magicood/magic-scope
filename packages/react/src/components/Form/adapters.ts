/**
 * 控件适配器表 —— 把表单 store 的统一字段绑定翻译成 10 个现有控件各自的真实 props。
 *
 * 这些控件的 value/onChange/checked 形态不统一(Checkbox 用 checked+onCheckedChange、
 * NumberInput 用 value:number+onValueChange、Slider 用 onValueChange+onChangeEnd、
 * Select 用 onChange(value,option) 且 ref→button、Rate/Segmented ref→div…),所以用**显式适配器表**
 * 而非 cloneElement 反射属性名——后者会对异形控件错位注入。未登记的控件走 render-prop 兜底(genericFieldProps)。
 *
 * DOM 副作用(ref 注册 / 读 DOM)集中在壳层(Field.tsx),本表只产出 props,保持可测、可平移。
 */
import type { ChangeEvent } from 'react';

/** 适配器覆盖的控件种类(与现有组件 displayName 对应)。 */
export type ControlKind =
  | 'input'
  | 'textarea'
  | 'numberInput'
  | 'checkbox'
  | 'checkboxGroup'
  | 'radioGroup'
  | 'switch'
  | 'slider'
  | 'rate'
  | 'segmented'
  | 'select';

/** store 喂给适配器的统一字段绑定(壳层据 path 切片快照构造)。 */
export interface FieldBinding {
  /** 当前值(store 真相)。 */
  value: unknown;
  /** 写值(走 store.handleChange:写 + 按时机校验)。 */
  onChange: (value: unknown) => void;
  /** 失焦(走 store.handleBlur:打 touched + 按时机校验)。 */
  onBlur: () => void;
  /** 是否校验失败态。 */
  invalid: boolean;
  /** 是否必填。 */
  required: boolean;
  /** 是否禁用(整表 disabled 下发)。 */
  disabled: boolean;
  /** 控件 id(与 Label htmlFor 关联)。 */
  id: string;
  /** aria-describedby(help + error 拼接,可能 undefined)。 */
  describedBy: string | undefined;
  /** Label 的 id(无 htmlFor 语义的控件用 aria-labelledby 指向)。 */
  labelId: string | undefined;
}

/** 一个适配器:把绑定翻成某控件的真实 props。 */
export type ControlAdapter = (binding: FieldBinding) => Record<string, unknown>;

const ariaInvalid = (b: FieldBinding): true | undefined => (b.invalid ? true : undefined);
const disabledOf = (b: FieldBinding): true | undefined => (b.disabled ? true : undefined);
const requiredOf = (b: FieldBinding): true | undefined => (b.required ? true : undefined);
const invalidMark = (b: FieldBinding): '' | undefined => (b.invalid ? '' : undefined);

/** 控件种类 → 适配器。 */
export const controlAdapters: Record<ControlKind, ControlAdapter> = {
  input: (b) => ({
    value: typeof b.value === 'string' || typeof b.value === 'number' ? b.value : '',
    onChange: (e: ChangeEvent<HTMLInputElement>) => b.onChange(e.target.value),
    onBlur: b.onBlur,
    invalid: b.invalid, // Input 自带 invalid→aria-invalid+danger 发光
    id: b.id,
    'aria-describedby': b.describedBy,
    'aria-required': requiredOf(b),
    disabled: disabledOf(b),
  }),
  textarea: (b) => ({
    value: typeof b.value === 'string' ? b.value : '',
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => b.onChange(e.target.value),
    onBlur: b.onBlur,
    invalid: b.invalid,
    id: b.id,
    'aria-describedby': b.describedBy,
    'aria-required': requiredOf(b),
    disabled: disabledOf(b),
  }),
  numberInput: (b) => ({
    value: typeof b.value === 'number' ? b.value : undefined,
    onValueChange: (n: number | null) => b.onChange(n),
    onBlur: b.onBlur,
    invalid: b.invalid,
    id: b.id,
    'aria-describedby': b.describedBy,
    'aria-required': requiredOf(b),
    disabled: disabledOf(b),
  }),
  checkbox: (b) => ({
    checked: !!b.value,
    onCheckedChange: (c: boolean) => b.onChange(c),
    // a11y(id/aria-*/onBlur)落到内部 input(经 Checkbox 的 inputProps 转发口),而非根 label;
    // 这样 <Label htmlFor={fieldId}> 指向可标注的 input,屏幕阅读器也能播报错误/帮助。
    inputProps: {
      id: b.id,
      'aria-invalid': ariaInvalid(b),
      'aria-describedby': b.describedBy,
      'aria-required': requiredOf(b),
      onBlur: b.onBlur,
    },
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  checkboxGroup: (b) => ({
    value: Array.isArray(b.value) ? b.value : [],
    onChange: (arr: string[]) => b.onChange(arr),
    'aria-invalid': ariaInvalid(b),
    'aria-describedby': b.describedBy,
    'aria-labelledby': b.labelId,
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  radioGroup: (b) => ({
    value: typeof b.value === 'string' ? b.value : '', // '' 保持受控(无选中态)
    onValueChange: (val: string) => b.onChange(val),
    onBlur: b.onBlur,
    'aria-invalid': ariaInvalid(b),
    'aria-describedby': b.describedBy,
    'aria-labelledby': b.labelId,
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  switch: (b) => ({
    checked: !!b.value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => b.onChange(e.target.checked),
    onBlur: b.onBlur,
    id: b.id,
    'aria-invalid': ariaInvalid(b),
    'aria-describedby': b.describedBy,
    'aria-required': requiredOf(b),
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  slider: (b) => ({
    value: typeof b.value === 'number' ? b.value : undefined,
    // 拖动高频写值;松手(onChangeEnd)才打 touched + 校验
    onValueChange: (n: number) => b.onChange(n),
    onChangeEnd: (_n: number) => b.onBlur(),
    'aria-invalid': ariaInvalid(b),
    'aria-describedby': b.describedBy,
    'aria-labelledby': b.labelId,
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  rate: (b) => ({
    value: typeof b.value === 'number' ? b.value : undefined,
    onChange: (n: number) => b.onChange(n),
    'aria-labelledby': b.labelId,
    'aria-describedby': b.describedBy,
    'aria-invalid': ariaInvalid(b),
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  segmented: (b) => ({
    value: typeof b.value === 'string' ? b.value : '', // '' 保持受控
    onValueChange: (val: string) => b.onChange(val),
    'aria-labelledby': b.labelId,
    'aria-describedby': b.describedBy,
    'aria-invalid': ariaInvalid(b),
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
  select: (b) => ({
    // '' / 已有数组兜底,保持受控(避免「无值↔有值」受控/非受控翻转)
    value: (b.value ?? '') as string | string[],
    onChange: (val: string | string[]) => b.onChange(val),
    onBlur: b.onBlur,
    id: b.id, // Select 认外部 id 透到 trigger,使 <Label htmlFor> 对齐
    'aria-labelledby': b.labelId,
    'aria-describedby': b.describedBy,
    'aria-invalid': ariaInvalid(b),
    'data-ms-invalid': invalidMark(b),
    disabled: disabledOf(b),
  }),
};

const DISPLAY_NAME_MAP: Record<string, ControlKind> = {
  Input: 'input',
  Textarea: 'textarea',
  NumberInput: 'numberInput',
  Checkbox: 'checkbox',
  CheckboxGroup: 'checkboxGroup',
  RadioGroup: 'radioGroup',
  Switch: 'switch',
  Slider: 'slider',
  Rate: 'rate',
  Segmented: 'segmented',
  Select: 'select',
};

/** 据子元素类型的 displayName(或显式 control)解析控件种类;未识别返回 undefined。 */
export function resolveControlKind(type: unknown, explicit?: ControlKind): ControlKind | undefined {
  if (explicit) return explicit;
  if (type && (typeof type === 'object' || typeof type === 'function')) {
    const named = type as { displayName?: string; name?: string };
    const name = named.displayName ?? named.name;
    if (name && name in DISPLAY_NAME_MAP) return DISPLAY_NAME_MAP[name];
  }
  return undefined;
}

/** render-prop / 未登记控件的通用绑定(用户自接到自定义控件)。 */
export function genericFieldProps(b: FieldBinding): Record<string, unknown> {
  return {
    value: b.value,
    onChange: b.onChange,
    onBlur: b.onBlur,
    id: b.id,
    'aria-invalid': ariaInvalid(b),
    'aria-describedby': b.describedBy,
    'aria-required': requiredOf(b),
    disabled: disabledOf(b),
  };
}
