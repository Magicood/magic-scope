import type { ReactElement, ReactNode, Ref } from 'react';
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { composeEventHandlers, composeRefs } from '../../utils/compose';
import { Label } from '../Label';
import {
  type ControlKind,
  controlAdapters,
  type FieldBinding,
  genericFieldProps,
  resolveControlKind,
} from './adapters';
import { useFormContext } from './Form';
import type { FieldError, FieldRefHandle, Rule } from './logic';

const isDev = (): boolean => {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env;
  return env ? env.NODE_ENV !== 'production' : false;
};

const isEventHandlerKey = (key: string): boolean => /^on[A-Z]/.test(key);

/**
 * 合并适配器(store 拥有)props 与子元素(用户)props:
 * - on* 处理器:compose(用户先、适配器后,用户 preventDefault 可阻断 store 写入);
 * - className/style:拼接 / 合并;
 * - 其余(value/checked/aria/id 等 store 拥有的键):适配器**覆盖**(store 是值的真相源)。
 */
function mergeFieldProps(
  adapter: Record<string, unknown>,
  child: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...child };
  for (const key of Object.keys(adapter)) {
    const a = adapter[key];
    const c = child[key];
    if (isEventHandlerKey(key) && typeof a === 'function' && typeof c === 'function') {
      merged[key] = composeEventHandlers(
        c as (event: { defaultPrevented?: boolean }) => void,
        a as (event: { defaultPrevented?: boolean }) => void,
      );
    } else if (key === 'className') {
      merged[key] = [c, a].filter(Boolean).join(' ');
    } else if (key === 'style') {
      merged[key] = { ...(c as object | undefined), ...(a as object | undefined) };
    } else {
      merged[key] = a;
    }
  }
  return merged;
}

/** useField 返回的字段 API(供 render-prop 与内部用)。 */
export interface FieldApi {
  value: unknown;
  error: FieldError | undefined;
  touched: boolean;
  isDirty: boolean;
  isValidating: boolean;
  setValue: (value: unknown) => void;
  onBlur: () => void;
  fieldId: string;
  errorId: string;
  helpId: string;
}

/** render-prop 第一参:字段 API + 可直接铺到自定义控件的 fieldProps。 */
export interface FieldRenderProps extends FieldApi {
  /** 通用绑定(value/onChange(value)/onBlur/aria/id),铺到自定义控件即接通。 */
  fieldProps: Record<string, unknown>;
}

/** 字段渲染态(render-prop 第二参)。 */
export interface FieldState {
  error: FieldError | undefined;
  touched: boolean;
  isDirty: boolean;
  isValidating: boolean;
}

/**
 * 订阅单字段切片(useSyncExternalStore,只订自己 path)。返回字段 API。
 * 须在 <Form> 内使用。
 */
export function useField(name: string): FieldApi {
  const { store, idBase } = useFormContext();
  const subscribe = useCallback((fn: () => void) => store.subscribePath(name, fn), [store, name]);
  const getSnapshot = useCallback(() => store.getPathSnapshot(name), [store, name]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const fieldId = `${idBase}-${name}`;
  const setValue = useCallback((v: unknown) => store.handleChange(name, v), [store, name]);
  const onBlur = useCallback(() => store.handleBlur(name), [store, name]);

  return {
    value: snapshot.value,
    error: snapshot.error,
    touched: snapshot.touched,
    isDirty: snapshot.dirty,
    isValidating: snapshot.validating,
    setValue,
    onBlur,
    fieldId,
    errorId: `${fieldId}-error`,
    helpId: `${fieldId}-help`,
  };
}

/**
 * 订阅式读其它字段值(跨字段联动):谁调谁渲,隔离重渲范围。须在 <Form> 内。
 */
export function useWatch(name: string): unknown {
  const { store } = useFormContext();
  const subscribe = useCallback((fn: () => void) => store.subscribePath(name, fn), [store, name]);
  const getSnapshot = useCallback(() => store.getValue(name), [store, name]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** 各部件细粒度 className。 */
export interface FieldClassNames {
  item?: string;
  label?: string;
  control?: string;
  error?: string;
  help?: string;
}

export interface FieldProps {
  /** 字段路径(支持 a.b / items.0.x;类型安全的命令式 API 见 useForm 返回值)。 */
  name: string;
  /** 标签。 */
  label?: ReactNode;
  /** 字段级规则(与 Form/useForm 的 rules、schema 可叠加)。 */
  rule?: Rule;
  /** 是否必填(落 Label 标记 + aria-required;Standard Schema 无法跨厂商内省,故以显式为准)。 */
  required?: boolean;
  /** 帮助文字(控件下方,aria-describedby 关联)。 */
  help?: ReactNode;
  /** 显式指定控件适配器种类(异形 / 包了一层的控件用)。 */
  control?: ControlKind;
  /** 各部件细粒度 className。 */
  classNames?: FieldClassNames;
  /** 根项 className。 */
  className?: string;
  /**
   * 子节点:登记控件直接子(<Field><Input/></Field>,自动注入)
   * 或 render-prop(<Field>{(field, state) => …}</Field>,首选、对自定义控件最友好)。
   */
  children: ReactNode | ((field: FieldRenderProps, state: FieldState) => ReactNode);
}

/**
 * Form.Field —— 单字段容器(旗舰子部件)。渲染 Label + 控件槽 + 错误位 + help 位,
 * 连好 a11y(id / aria-describedby / aria-invalid / aria-required),按子控件 displayName 或显式
 * control 选适配器注入(value 由 store 接管、on* 与用户 compose)。校验失败态经 ms-tone-danger 发光、
 * 错误文案 role=alert 滑入。样式见 Form.css。
 */
export function Field({
  name,
  label,
  rule,
  required: requiredProp,
  help,
  control,
  classNames,
  className,
  children,
}: FieldProps): ReactElement {
  const ctx = useFormContext();
  const { store, disabled: formDisabled, classNames: formCns } = ctx;
  const field = useField(name);
  const { error, fieldId, errorId, helpId } = field;
  const invalid = !!error;
  // 必填单一真相:显式 required 优先,否则从 rule.required 派生(必填规则即显示必填标记)
  const required = requiredProp ?? !!rule?.required;

  // 注册字段:handle 与 getRule 经 ref 取活,注册只随 store/name 变化(不因 inline rule 抖动)
  const controlRef = useRef<HTMLElement | null>(null);
  const ruleRef = useRef<Rule | undefined>(rule);
  ruleRef.current = rule;
  useEffect(() => {
    const handle: FieldRefHandle = {
      focus: () => controlRef.current?.focus?.(),
      scrollIntoView: (o) => controlRef.current?.scrollIntoView?.(o),
    };
    return store.registerField(name, handle, () => ruleRef.current);
  }, [store, name]);

  const labelId = `${fieldId}-label`;
  const describedBy =
    [help != null ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const binding: FieldBinding = {
    value: field.value,
    onChange: field.setValue,
    onBlur: field.onBlur,
    invalid,
    required,
    disabled: formDisabled,
    id: fieldId,
    describedBy,
    // 无 label 时不下发 labelId,避免 aria-labelledby 指向不存在的元素
    labelId: label != null ? labelId : undefined,
  };

  let controlNode: ReactNode;
  if (typeof children === 'function') {
    controlNode = children(
      { ...field, fieldProps: genericFieldProps(binding) },
      { error, touched: field.touched, isDirty: field.isDirty, isValidating: field.isValidating },
    );
  } else if (isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const kind = resolveControlKind(child.type, control);
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    if (kind) {
      const childProps = child.props;
      if (isDev() && ('value' in childProps || 'checked' in childProps)) {
        console.warn(
          `[magic-scope Form] Field "${name}" 的子控件不应再传受控 value/checked,值由表单 store 接管(用 defaultValues 设初值)。`,
        );
      }
      const merged = mergeFieldProps(controlAdapters[kind](binding), childProps);
      controlNode = cloneElement(child, {
        ...merged,
        ref: composeRefs(controlRef as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    } else {
      if (isDev()) {
        console.warn(
          `[magic-scope Form] Field "${name}" 无法识别子控件类型,请用 render-prop <Field>{(field)=>…}</Field> 或显式 control 指定适配器。`,
        );
      }
      controlNode = child;
    }
  } else {
    controlNode = children;
  }

  const itemClass = [
    'ms-form__item',
    invalid && 'ms-form__item--invalid',
    field.isValidating && 'ms-form__item--validating',
    required && 'ms-form__item--required',
    className,
    formCns?.item,
    classNames?.item,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClass}>
      {label != null && (
        <Label
          htmlFor={fieldId}
          id={labelId}
          required={required}
          tone={invalid ? 'danger' : 'neutral'}
          className={['ms-form__label', formCns?.label, classNames?.label]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </Label>
      )}
      <div
        className={['ms-form__control', formCns?.control, classNames?.control]
          .filter(Boolean)
          .join(' ')}
      >
        {controlNode}
        {help != null && (
          <div
            id={helpId}
            className={['ms-form__help', formCns?.help, classNames?.help].filter(Boolean).join(' ')}
          >
            {help}
          </div>
        )}
        {error && (
          <div
            id={errorId}
            role="alert"
            className={['ms-form__error', formCns?.error, classNames?.error]
              .filter(Boolean)
              .join(' ')}
          >
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
Field.displayName = 'Form.Field';
