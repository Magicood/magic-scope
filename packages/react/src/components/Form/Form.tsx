import type { ComponentPropsWithoutRef, ElementType, FormEvent, ReactElement, Ref } from 'react';
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useMessages } from '../../i18n';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  createFormStore,
  type FieldPath,
  type FormMeta,
  type FormStore,
  getByPath,
  type PathValue,
  type Rule,
  type StandardSchemaV1,
  type ValidateMode,
} from './logic';

export type FormLayout = 'vertical' | 'horizontal' | 'inline';

/** 各部件细粒度 className(下发到所有 Field)。 */
export interface FormClassNames {
  form?: string;
  item?: string;
  label?: string;
  control?: string;
  error?: string;
  help?: string;
}

/** useForm 配置。 */
export interface UseFormConfig<T extends Record<string, unknown>> {
  /** 初始值(必填,作为 dirty 比较与 reset 基准)。 */
  defaultValues: T;
  /** 整表 Standard Schema(zod/valibot/arktype 等),与 rules 可叠加。 */
  schema?: StandardSchemaV1<T> | undefined;
  /** 字段级规则表(path → Rule),与 schema 可叠加,rules 优先。 */
  rules?: Partial<Record<FieldPath<T>, Rule>> | undefined;
  /** 首次校验时机。默认 onSubmit。 */
  mode?: ValidateMode | undefined;
  /** 出错后复验时机。默认 onChange。 */
  reValidateMode?: 'onChange' | 'onBlur' | undefined;
  /** 异步校验防抖毫秒(onChange 模式)。默认 250。 */
  delayError?: number | undefined;
}

/** 原生 input 非受控「快档」注册返回。 */
export interface RegisterReturn {
  name: string;
  defaultValue?: string | number | undefined;
  onChange: (event: FormEvent) => void;
  onBlur: () => void;
  ref: Ref<HTMLElement>;
}

/** useForm 返回的命令式 API(FieldPath 端到端类型安全)。 */
export interface FormApi<T extends Record<string, unknown>> {
  /** 底层 store(传给 <Form form={api}>)。 */
  store: FormStore<T>;
  /** 派生 meta(订阅式;isDirty/isValid/isValidating/isSubmitting/submitCount/errors)。 */
  formState: FormMeta;
  /** 取整表当前值(非订阅)。 */
  getValues(): T;
  /** 命令式设值(类型安全的 path)。 */
  setValue<P extends FieldPath<T>>(name: P, value: PathValue<T, P>): void;
  /** 命令式设错误。 */
  setError(name: FieldPath<T>, message: string): void;
  /** 清错误(不传清全部)。 */
  clearErrors(name?: FieldPath<T>): void;
  /** 触发某字段(或整表)校验。 */
  trigger(name?: FieldPath<T>): Promise<boolean>;
  /** 重置到默认值(或 next)。 */
  reset(next?: Partial<T>): void;
  /** 包出原生 form 的提交处理器:校验全过调 onValid,否则 onInvalid + 聚焦首错。 */
  handleSubmit(
    onValid: (values: T) => void | Promise<void>,
    onInvalid?: (errors: Record<string, { message: string }>) => void,
  ): (event?: FormEvent) => Promise<void>;
  /** 原生 input 非受控快档注册。 */
  register(name: FieldPath<T>): RegisterReturn;
}

interface FormContextValue {
  store: FormStore<Record<string, unknown>>;
  idBase: string;
  layout: FormLayout;
  labelWidth: string | number | undefined;
  labelAlign: 'start' | 'end';
  disabled: boolean;
  classNames: FormClassNames | undefined;
}

const FormContext = createContext<FormContextValue | null>(null);

/** 拿 Form 上下文(Field/Submit/Reset 内部用;缺 Provider 时 dev 抛错)。 */
export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('[magic-scope Form] useFormContext / Form 子部件必须在 <Form> 内使用。');
  }
  return ctx;
}

/**
 * 建表单 store + 命令式 API。store 只建一次(useRef);translate 经 ref 取活,locale 变更下次校验生效。
 * formState 经 useSyncExternalStore 订全表 meta 切片——只在 meta 变化时渲染、不因单字段 value 渲染。
 */
export function useForm<T extends Record<string, unknown>>(config: UseFormConfig<T>): FormApi<T> {
  const translate = useMessages();
  const translateRef = useRef(translate);
  translateRef.current = translate;

  const storeRef = useRef<FormStore<T> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFormStore<T>({
      defaultValues: config.defaultValues,
      mode: config.mode,
      reValidateMode: config.reValidateMode,
      rules: config.rules as Record<string, Rule> | undefined,
      schema: config.schema,
      delayError: config.delayError,
      translate: (k, v, f) => translateRef.current(k, v, f),
    });
  }
  const store = storeRef.current;

  useEffect(() => () => store.dispose(), [store]);

  const formState = useSyncExternalStore(store.subscribe, store.getFormMeta, store.getFormMeta);

  return useMemo<FormApi<T>>(
    () => ({
      store,
      formState,
      getValues: () => store.getState().values,
      setValue: (name, value) => store.setValue(name, value, { shouldValidate: false }),
      setError: (name, message) => store.setError(name, { type: 'manual', message }),
      clearErrors: (name) => {
        if (name) store.setError(name, null);
        else for (const p of Object.keys(store.getState().errors)) store.setError(p, null);
      },
      trigger: (name) => (name ? store.validatePath(name) : store.validateAll()),
      reset: (next) => store.reset(next),
      handleSubmit: (onValid, onInvalid) => async (event) => {
        event?.preventDefault?.();
        store.setSubmitting(true);
        store.bumpSubmitCount();
        try {
          const ok = await store.validateAll();
          if (ok) {
            await onValid(store.getState().values);
          } else {
            onInvalid?.(store.getState().errors);
            const first = store.firstErrorPath();
            if (first) store.getState().errors[first]?.ref?.focus();
          }
        } finally {
          // 即便校验器/onValid 抛错也复位;loading 贯穿整个异步提交
          store.setSubmitting(false);
        }
      },
      register: (name) => ({
        name,
        defaultValue: getByPath(store.getState().values, name) as string | number | undefined,
        onChange: (event: FormEvent) =>
          store.handleChange(name, (event.target as HTMLInputElement).value),
        onBlur: () => store.handleBlur(name),
        ref: (el: HTMLElement | null) => {
          if (el) store.registerField(name, { focus: () => el.focus() });
        },
      }),
    }),
    [store, formState],
  );
}

/** <Form> props。 */
export interface FormProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onInvalid'> {
  /** 由 useForm 建出的 api(必传,提供 store 与提交逻辑)。 */
  form: FormApi<T>;
  /**
   * 校验全过的提交回调。
   * @param values 通过校验的整表值(类型化;若挂 schema 则为其 Output)
   */
  onSubmit?: (values: T) => void | Promise<void>;
  /**
   * 校验未过的回调。
   * @param errors 各字段错误表(path → { message }),提交时聚焦首个错误字段
   */
  onInvalid?: (errors: Record<string, { message: string }>) => void;
  /** 布局:vertical(默认)/ horizontal / inline。 */
  layout?: FormLayout;
  /** horizontal 布局下 label 列宽(如 '8rem' / 120)。 */
  labelWidth?: string | number;
  /** label 对齐(horizontal 布局)。默认 start。 */
  labelAlign?: 'start' | 'end';
  /** 整表禁用(下发到各 Field 控件)。 */
  disabled?: boolean;
  /** 各部件细粒度 className(下发到所有 Field)。 */
  classNames?: FormClassNames;
  /** 多态根标签(默认 'form')。与 asChild 互斥。 */
  as?: ElementType;
  /** 渲染为子元素(Radix Slot;把 form 行为合并到子)。 */
  asChild?: boolean;
}

/**
 * Form —— 表单根(旗舰子系统入口)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 持 FormContext(store + 布局 + 禁用 + classNames),渲染原生 <form>,提交经 handleSubmit 校验全表;
 * layout 三档、整表 disabled 下发、多态 as / asChild。子部件 Form.Field / Submit / Reset / List /
 * ErrorSummary 经 index.ts 挂载。样式见 Form.css,需引入 @magic-scope/react/styles.css。
 */
// 实现内联进 forwardRef(让 biome 正确识别为组件,避免 useHookAtTopLevel 误报);泛型由导出 cast 还原。
const FormBase = forwardRef<HTMLFormElement, FormProps<Record<string, unknown>>>(
  (
    {
      form,
      onSubmit,
      onInvalid,
      layout = 'vertical',
      labelWidth,
      labelAlign = 'start',
      disabled = false,
      classNames,
      as,
      asChild = false,
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const idBase = useId();

    const ctxValue = useMemo<FormContextValue>(
      () => ({
        store: form.store as FormStore<Record<string, unknown>>,
        idBase,
        layout,
        labelWidth,
        labelAlign,
        disabled,
        classNames,
      }),
      [form.store, idBase, layout, labelWidth, labelAlign, disabled, classNames],
    );

    const handleNativeSubmit = useMemo(
      () => form.handleSubmit(onSubmit ?? (() => {}), onInvalid),
      [form, onSubmit, onInvalid],
    );

    const classes = ['ms-form', `ms-form--${layout}`, className, classNames?.form]
      .filter(Boolean)
      .join(' ');

    const mergedStyle =
      labelWidth != null
        ? {
            ...(style as Record<string, unknown> | undefined),
            '--ms-form-label-w': typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth,
          }
        : style;

    // asChild:把 form 行为合并到子元素(由子自带 form 标签)
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        { ...props, className: classes, onSubmit: handleNativeSubmit, style: mergedStyle },
        child.props,
      );
      return (
        <FormContext.Provider value={ctxValue}>
          {cloneElement(child, {
            ...merged,
            ref: composeRefs(ref as Ref<unknown>, childRef),
          } as Record<string, unknown>)}
        </FormContext.Provider>
      );
    }

    const Root = (as ?? 'form') as ElementType;

    return (
      <Root
        ref={ref}
        className={classes}
        onSubmit={handleNativeSubmit}
        data-ms-label-align={layout === 'horizontal' ? labelAlign : undefined}
        style={mergedStyle}
        {...props}
      >
        <FormContext.Provider value={ctxValue}>{children}</FormContext.Provider>
      </Root>
    );
  },
);

/** 泛型 cast:还原调用点的 <T> 类型(运行时无影响)。 */
export const Form = FormBase as unknown as (<T extends Record<string, unknown>>(
  props: FormProps<T> & { ref?: Ref<HTMLFormElement> },
) => ReactElement) & { displayName?: string };
Form.displayName = 'Form';
