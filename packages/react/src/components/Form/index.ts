import { Field } from './Field';
import { Form as FormRoot } from './Form';
import { FormErrorSummary, FormList, Reset, Submit } from './Form.parts';

/** 复合组件类型:Form 根 + 挂载的子部件。 */
type FormComponent = typeof FormRoot & {
  /** 单字段容器(直接子自动注入 / render-prop)。 */
  Field: typeof Field;
  /** Field 的别名(对齐 antd Form.Item 直觉)。 */
  Item: typeof Field;
  /** 提交按钮(自动随 isSubmitting loading)。 */
  Submit: typeof Submit;
  /** 重置按钮。 */
  Reset: typeof Reset;
  /** 动态字段数组。 */
  List: typeof FormList;
  /** 提交后错误汇总。 */
  ErrorSummary: typeof FormErrorSummary;
};

/**
 * Form —— 表单子系统复合组件。`Form` 是根,`Form.Field` / `Form.Item` / `Form.Submit` /
 * `Form.Reset` / `Form.List` / `Form.ErrorSummary` 是子部件。配合 `useForm` 用。
 */
const Form = Object.assign(FormRoot, {
  Field,
  Item: Field,
  Submit,
  Reset,
  List: FormList,
  ErrorSummary: FormErrorSummary,
}) as FormComponent;

export type { ControlKind, FieldBinding } from './adapters';
export type { FieldApi, FieldClassNames, FieldProps, FieldRenderProps, FieldState } from './Field';
export { useField, useWatch } from './Field';

// —— 类型:hooks / 组件 ——
export type {
  FormApi,
  FormClassNames,
  FormLayout,
  FormProps,
  RegisterReturn,
  UseFormConfig,
} from './Form';
export { useForm, useFormContext } from './Form';
export type { FormErrorSummaryProps, FormListApi, FormListProps } from './Form.parts';
// —— 类型:引擎 / store(headless,可平移 core)——
export type {
  FieldError,
  FieldErrors,
  FieldPath,
  FieldRefHandle,
  FormMeta,
  FormStore,
  FormStoreState,
  InferValues,
  PathValue,
  Rule,
  RuleContext,
  StandardResult,
  StandardSchemaV1,
  ValidateMode,
  ValidateResult,
} from './logic';
export { Field, Form };
