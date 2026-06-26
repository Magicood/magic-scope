/**
 * Form 纯逻辑(零 React、零 i18n import)—— 校验引擎 + 字段 store 的框架无关内核。
 *
 * 这一层是 headless-core-ready 的:类型(FieldPath/PathValue/Rule/FieldError)、纯函数
 * (getByPath/setByPath/structuralEqual/shouldValidate/runSchema/collectIssues)、校验引擎
 * (validateField/validateForm)与订阅式 store(createFormStore,基于本仓库 @magic-scope/core 的
 * createStore 思路扩成「细粒度 path 切片订阅」)全部不依赖 React。文案经注入的 translate 取(不 import i18n
 * 运行时,仅 type-only 借 MessageKey),idBase / ref / focus 等 DOM 副作用由各框架薄壳注入。
 *
 * 「算焦点 = 纯逻辑(进 core)/ 移焦点 = DOM 副作用(留壳)」—— 这刀切在本文件与 Form.tsx/Field.tsx 之间。
 *
 * 校验双轨且可叠加:per-field rules(零依赖、可 i18n)叠加 Standard Schema v1
 * (zod≥3.24 / valibot / arktype 经 `~standard.validate`,核心零运行时依赖)。
 */
import type { MessageKey } from '../../i18n';

/* ─────────────────────────── 类型:路径 ─────────────────────────── */

/** 嵌套点路径联合:对象取 key、其值仍是对象则递归拼 `a.b`,数组用 `${number}` 索引。 */
export type FieldPath<T> =
  T extends ReadonlyArray<infer E>
    ? `${number}` | `${number}.${FieldPath<E>}`
    : T extends object
      ? {
          [K in keyof T & string]: NonNullable<T[K]> extends object
            ? K | `${K}.${FieldPath<NonNullable<T[K]>>}`
            : K;
        }[keyof T & string]
      : never;

/** 反查某路径的叶子值类型(约束控件 value);无法解析时退化为 unknown。 */
export type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<NonNullable<T[K]>, R>
    : T extends ReadonlyArray<infer E>
      ? PathValue<E, R>
      : unknown
  : P extends keyof T
    ? T[P]
    : T extends ReadonlyArray<infer E>
      ? E
      : unknown;

/* ─────────────────────────── 类型:错误 / 规则 ─────────────────────────── */

/** 命令式聚焦句柄(DOM 副作用,由壳层注册,core 只持引用、不调 DOM)。 */
export interface FieldRefHandle {
  focus(): void;
  scrollIntoView?(opts?: ScrollIntoViewOptions): void;
}

/** 一条字段错误:type 标来源(required/pattern/validate/schema…),message 已是终文案。 */
export interface FieldError {
  type: string;
  message: string;
  ref?: FieldRefHandle;
}

/** 全表错误的类型化视图(键是 FieldPath)。store 内部以 Record<string,FieldError> 持有。 */
export type FieldErrors<T = Record<string, unknown>> = {
  [P in FieldPath<T>]?: FieldError;
};

/** 自定义校验返回:true/undefined=通过,false=失败(用默认文案),string=失败(用该文案)。 */
export type ValidateResult = boolean | string | undefined;

/** 自定义校验上下文:可读整表值做跨字段联动,signal 用于异步取消。 */
export interface RuleContext<T> {
  values: T;
  path: string;
  signal?: AbortSignal | undefined;
}

/** 数值/长度约束:可只给阈值(用默认文案),或给 { value, message } 自定义文案。 */
export type Constraint = number | { value: number; message: string };
/** 正则约束。 */
export type PatternConstraint = RegExp | { value: RegExp; message: string };
/** 布尔约束:true 启用(默认文案),或给字符串作自定义文案。 */
export type FlagConstraint = boolean | string;

/** 单字段规则。内建项零依赖、可 i18n;validate 支持同步/异步自定义。 */
export interface Rule<V = unknown, T = Record<string, unknown>> {
  required?: FlagConstraint;
  min?: Constraint;
  max?: Constraint;
  minLength?: Constraint;
  maxLength?: Constraint;
  pattern?: PatternConstraint;
  email?: FlagConstraint;
  url?: FlagConstraint;
  validate?: (value: V, ctx: RuleContext<T>) => ValidateResult | Promise<ValidateResult>;
}

/* ─────────────────────────── 类型:Standard Schema v1 ─────────────────────────── */

/** Standard Schema v1 契约(只依赖此 shape,不 import zod;zod/valibot/arktype 原生实现它)。 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output };
  };
}

/** Standard Schema 校验结果:成功带 value,失败带 issues。 */
export type StandardResult<O> =
  | { readonly value: O; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardIssue> };

/** Standard Schema 单条问题:message + 指向字段的 path(段可为 key 或 { key })。 */
export interface StandardIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
}

/** 从 schema 反推 Output 类型(供 useForm 推断 FormValues)。 */
export type InferValues<S extends StandardSchemaV1> =
  S extends StandardSchemaV1<unknown, infer O> ? O : never;

/* ─────────────────────────── 类型:校验时机 / store ─────────────────────────── */

/** 文案解析器形态(壳层注入 i18n 的 translate,core 不持字典)。 */
export type TranslateLike = (
  key: MessageKey,
  vars?: Record<string, string | number>,
  fallback?: string,
) => string;

/** 首次校验时机 + 复验时机的取值。 */
export type ValidateMode = 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';

/** 一次整表校验的结果。 */
export interface ValidationResult {
  errors: Record<string, FieldError>;
  ok: boolean;
}

/** store 暴露的整表状态(errors/touched/dirty/validating 内部以 string 键持有)。 */
export interface FormStoreState<T> {
  values: T;
  errors: Record<string, FieldError>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  validating: Record<string, boolean>;
  isSubmitting: boolean;
  submitCount: number;
}

/** 全表派生 meta(供 Form 根 / Submit / ErrorSummary 订阅;引用稳定,仅 meta 变化时换新)。 */
export interface FormMeta {
  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;
  isSubmitting: boolean;
  submitCount: number;
  errors: Record<string, FieldError>;
}

/** 单 path 的切片快照(useSyncExternalStore 的 getSnapshot,引用稳定)。 */
export interface PathSnapshot {
  value: unknown;
  error: FieldError | undefined;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

/** 设值选项。 */
export interface SetValueOptions {
  shouldValidate?: boolean;
  shouldTouch?: boolean;
}

/**
 * 框架无关表单 store:全表 meta 订阅(getState/subscribe)+ 细粒度 path 切片订阅 + 命令式动作。
 * getState/subscribe 与 @magic-scope/core 的 `Store<S>` 结构同形——createFormStore 的返回值结构上
 * 即满足 core 的 Store;将来 core 化时把这两行换成 `extends Store<FormStoreState<T>>` 即可,零破坏。
 * React 壳用 useSyncExternalStore 订 getState(meta)与 subscribePath(单字段)。
 */
export interface FormStore<T> {
  /** 取全表状态(core Store 接口)。 */
  getState(): FormStoreState<T>;
  /** 订阅全表 meta 变化(core Store 接口)。 */
  subscribe(listener: () => void): () => void;
  /** 取派生 meta(引用稳定的 getSnapshot,供 useSyncExternalStore)。 */
  getFormMeta(): FormMeta;
  getValue(path: string): unknown;
  getPathSnapshot(path: string): PathSnapshot;
  setValue(path: string, value: unknown, opts?: SetValueOptions): void;
  /** 字段变更:写值 + 按 mode/reValidateMode 决定是否(防抖)校验。时机逻辑内聚于 store。 */
  handleChange(path: string, value: unknown): void;
  /** 字段失焦:打 touched + 按时机决定是否立即校验。 */
  handleBlur(path: string): void;
  setError(path: string, error: FieldError | null): void;
  setTouched(path: string, touched: boolean): void;
  setSubmitting(submitting: boolean): void;
  registerField(
    path: string,
    ref: FieldRefHandle | undefined,
    getRule?: () => Rule | undefined,
  ): () => void;
  validatePath(path: string): Promise<boolean>;
  scheduleValidate(path: string): void;
  validateAll(): Promise<boolean>;
  firstErrorPath(): string | undefined;
  reset(next?: Partial<T>): void;
  subscribePath(path: string, fn: () => void): () => void;
  bumpSubmitCount(): void;
  dispose(): void;
}

/* ─────────────────────────── 纯函数:路径读写 ─────────────────────────── */

const INDEX_RE = /^\d+$/;

/** 按点路径读嵌套值;路径不存在返回 undefined。纯函数。 */
export function getByPath(values: unknown, path: string): unknown {
  if (!path) return values;
  let cur: unknown = values;
  for (const part of path.split('.')) {
    if (cur == null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function cloneWith(node: unknown, key: string, value: unknown): unknown {
  if (Array.isArray(node) || (node == null && INDEX_RE.test(key))) {
    const arr = Array.isArray(node) ? node.slice() : [];
    arr[Number(key)] = value;
    return arr;
  }
  return { ...(typeof node === 'object' && node !== null ? node : {}), [key]: value };
}

function setRec(node: unknown, parts: string[], i: number, value: unknown): unknown {
  const key = parts[i] as string;
  if (i === parts.length - 1) return cloneWith(node, key, value);
  const child = node == null ? undefined : (node as Record<string, unknown>)[key];
  const nextIsIndex = INDEX_RE.test(parts[i + 1] as string);
  const base = child != null ? child : nextIsIndex ? [] : {};
  return cloneWith(node, key, setRec(base, parts, i + 1, value));
}

/** 不可变按点路径写嵌套值(返回新对象,原对象不动)。纯函数。 */
export function setByPath<T>(values: T, path: string, value: unknown): T {
  if (!path) return value as T;
  return setRec(values, path.split('.'), 0, value) as T;
}

/** 结构相等(用于 dirty 比较):深比对象/数组/基本值。纯函数。 */
export function structuralEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  // Date 等内置对象无自有可枚举键,按值比较(否则任意两个 Date 会被误判相等 → 永不 dirty)
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr !== bArr) return false;
  if (aArr && bArr) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => structuralEqual(v, b[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao);
  const bk = Object.keys(bo);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => k in bo && structuralEqual(ao[k], bo[k]));
}

/* ─────────────────────────── 纯函数:校验时机 / schema ─────────────────────────── */

/**
 * 是否应在某事件下校验(纯逻辑,壳层据返回触发)。
 * mode 决定首次时机;出错后(hasError)按 reValidateMode 复验。对齐 react-hook-form 直觉。
 */
export function shouldValidate(
  event: 'change' | 'blur' | 'submit',
  mode: ValidateMode,
  reValidateMode: 'onChange' | 'onBlur',
  hasError: boolean,
  touched: boolean,
): boolean {
  if (event === 'submit') return true;
  if (hasError) return reValidateMode === 'onChange' ? true : event === 'blur';
  if (mode === 'all') return true;
  if (mode === 'onChange') return event === 'change';
  if (mode === 'onBlur') return event === 'blur';
  if (mode === 'onTouched') return touched || event === 'blur';
  return false; // onSubmit:提交前不校验
}

/** 跑 Standard Schema 校验(可能同步可能 Promise,原样透出)。 */
export function runSchema<S extends StandardSchemaV1>(
  schema: S,
  values: unknown,
): StandardResult<InferValues<S>> | Promise<StandardResult<InferValues<S>>> {
  return schema['~standard'].validate(values) as
    | StandardResult<InferValues<S>>
    | Promise<StandardResult<InferValues<S>>>;
}

/** 把 schema 的 path 段数组拍平成点串(段可为 PropertyKey 或 { key })。 */
function issuePathToString(path: StandardIssue['path']): string {
  if (!path || path.length === 0) return '';
  return path
    .map((seg) => (typeof seg === 'object' && seg !== null ? String(seg.key) : String(seg)))
    .join('.');
}

/**
 * 把 Standard Schema issues 按 path 归并成 { path: FieldError }。
 * message 若是已登记的 MessageKey 则经 translate 覆盖(用户在 schema 里写 key 即可 i18n),否则原样透出。
 */
export function collectIssues(
  issues: ReadonlyArray<StandardIssue>,
  translate: TranslateLike,
): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {};
  for (const issue of issues) {
    const path = issuePathToString(issue.path);
    if (path in errors) continue; // 每 path 取首条
    const message = translate(issue.message as MessageKey, undefined, issue.message);
    errors[path] = { type: 'schema', message };
  }
  return errors;
}

/**
 * 从 schema 推断某字段是否必填。Standard Schema v1 无跨厂商的字段级 optionality 内省,
 * 通用实现无法可靠判定(且内省具体厂商会耦合 zod,违背零依赖)。故对通用 schema 返回 undefined,
 * 必填以显式 required / rule.required 为准。保留签名供将来 core 增强。
 */
export function inferRequired(
  _schema: StandardSchemaV1 | undefined,
  _path: string,
): boolean | undefined {
  return undefined;
}

/* ─────────────────────────── 纯函数:内建规则 ─────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function constraintOf(c: Constraint): { value: number; message?: string } {
  return typeof c === 'number' ? { value: c } : { value: c.value, message: c.message };
}

function patternOf(c: PatternConstraint): { value: RegExp; message?: string } {
  return c instanceof RegExp ? { value: c } : { value: c.value, message: c.message };
}

/** 跑内建同步规则,命中即返回 FieldError(短路),全过返回 null。纯函数(文案经 translate)。 */
export function runBuiltinRules<V, T>(
  value: unknown,
  rule: Rule<V, T>,
  translate: TranslateLike,
): FieldError | null {
  if (rule.required) {
    // false(未勾选 checkbox/switch)也算「未填」,必须能触发 required
    if (isEmpty(value) || value === false) {
      const msg = typeof rule.required === 'string' ? rule.required : translate('form.required');
      return { type: 'required', message: msg };
    }
  }
  // 空值且非必填:跳过其余约束(交给 required 决定);但空数组遇 minLength(「至少选 N 个」)仍需校验
  if (isEmpty(value) && !(Array.isArray(value) && rule.minLength !== undefined)) return null;

  if (rule.min !== undefined && typeof value === 'number') {
    const { value: m, message } = constraintOf(rule.min);
    if (value < m) return { type: 'min', message: message ?? translate('form.min', { min: m }) };
  }
  if (rule.max !== undefined && typeof value === 'number') {
    const { value: m, message } = constraintOf(rule.max);
    if (value > m) return { type: 'max', message: message ?? translate('form.max', { max: m }) };
  }
  if (rule.minLength !== undefined) {
    const len = typeof value === 'string' || Array.isArray(value) ? value.length : 0;
    const { value: m, message } = constraintOf(rule.minLength);
    if (len < m)
      return { type: 'minLength', message: message ?? translate('form.minLength', { min: m }) };
  }
  if (rule.maxLength !== undefined) {
    const len = typeof value === 'string' || Array.isArray(value) ? value.length : 0;
    const { value: m, message } = constraintOf(rule.maxLength);
    if (len > m)
      return { type: 'maxLength', message: message ?? translate('form.maxLength', { max: m }) };
  }
  if (rule.pattern !== undefined) {
    const { value: re, message } = patternOf(rule.pattern);
    if (!re.test(String(value)))
      return { type: 'pattern', message: message ?? translate('form.pattern') };
  }
  if (rule.email) {
    if (!EMAIL_RE.test(String(value))) {
      const msg = typeof rule.email === 'string' ? rule.email : translate('form.email');
      return { type: 'email', message: msg };
    }
  }
  if (rule.url) {
    let ok = true;
    try {
      new URL(String(value));
    } catch {
      ok = false;
    }
    if (!ok) {
      const msg = typeof rule.url === 'string' ? rule.url : translate('form.url');
      return { type: 'url', message: msg };
    }
  }
  return null;
}

function normalizeValidateResult(res: ValidateResult, translate: TranslateLike): FieldError | null {
  if (res === true || res === undefined) return null;
  if (res === false) return { type: 'validate', message: translate('form.required') };
  return { type: 'validate', message: res };
}

/* ─────────────────────────── 校验引擎:单字段 / 整表 ─────────────────────────── */

export interface ValidateFieldArgs<T, V> {
  path: string;
  value: V;
  values: T;
  rule?: Rule<V, T> | undefined;
  schema?: StandardSchemaV1<T> | undefined;
  translate: TranslateLike;
  signal?: AbortSignal | undefined;
}

/**
 * 校验单字段:先内建同步规则(短路省异步)→ 自定义 validate(可异步)→ 整表 schema 取该 path。
 * 返回 FieldError 或 null。竞态/取消由调用方(store)经 signal + token 处理。
 */
export async function validateField<T, V>(
  args: ValidateFieldArgs<T, V>,
): Promise<FieldError | null> {
  const { path, value, values, rule, schema, translate, signal } = args;
  if (rule) {
    const builtin = runBuiltinRules(value, rule, translate);
    if (builtin) return builtin;
    if (rule.validate) {
      const res = await rule.validate(value, { values, path, signal });
      if (signal?.aborted) return null;
      const err = normalizeValidateResult(res, translate);
      if (err) return err;
    }
  }
  if (schema) {
    const result = await runSchema(schema, values);
    if (signal?.aborted) return null;
    if ('issues' in result && result.issues) {
      const errs = collectIssues(result.issues, translate);
      const hit = errs[path];
      if (hit) return hit;
    }
  }
  return null;
}

export interface ValidateFormArgs<T> {
  values: T;
  rules?: Record<string, Rule> | undefined;
  schema?: StandardSchemaV1<T> | undefined;
  translate: TranslateLike;
  signal?: AbortSignal | undefined;
}

/**
 * 整表校验:逐字段跑 rules(先,快、可 i18n)+ 整表跑 schema(后,结构化),issues 按 path 归并。
 * rules 命中的 path 不被 schema 覆盖(rules 优先、更可控)。
 */
export async function validateForm<T extends Record<string, unknown>>(
  args: ValidateFormArgs<T>,
): Promise<ValidationResult> {
  const { values, rules, schema, translate, signal } = args;
  const errors: Record<string, FieldError> = {};

  if (rules) {
    await Promise.all(
      Object.entries(rules).map(async ([path, rule]) => {
        const err = await validateField({
          path,
          value: getByPath(values, path),
          values,
          rule,
          translate,
          signal,
        });
        if (err) errors[path] = err;
      }),
    );
  }

  if (schema && !signal?.aborted) {
    const result = await runSchema(schema, values);
    if (!signal?.aborted && 'issues' in result && result.issues) {
      const schemaErrors = collectIssues(result.issues, translate);
      for (const [path, err] of Object.entries(schemaErrors)) {
        if (!errors[path]) errors[path] = err; // rules 已报的 path 不覆盖
      }
    }
  }

  return { errors, ok: Object.keys(errors).length === 0 };
}

/* ─────────────────────────── 订阅式 store ─────────────────────────── */

export interface CreateFormStoreConfig<T> {
  defaultValues: T;
  mode?: ValidateMode | undefined;
  reValidateMode?: 'onChange' | 'onBlur' | undefined;
  rules?: Record<string, Rule> | undefined;
  schema?: StandardSchemaV1<T> | undefined;
  translate: TranslateLike;
  delayError?: number | undefined;
}

interface FieldRegistration {
  ref?: FieldRefHandle | undefined;
  getRule?: (() => Rule | undefined) | undefined;
}

/**
 * 建表单 store。values 是唯一真相源;path 切片订阅让单字段输入只通知该字段、不扩散到根。
 * 异步校验自带 AbortController 竞态取消 + trailing debounce;计时器/控制器纯 JS 持有,dispose 清干净。
 */
export function createFormStore<T extends Record<string, unknown>>(
  config: CreateFormStoreConfig<T>,
): FormStore<T> {
  const { defaultValues, translate, schema } = config;
  const mode: ValidateMode = config.mode ?? 'onSubmit';
  const reValidateMode = config.reValidateMode ?? 'onChange';
  const delayError = config.delayError ?? 250;

  let state: FormStoreState<T> = {
    values: defaultValues,
    errors: {},
    touched: {},
    dirty: {},
    validating: {},
    isSubmitting: false,
    submitCount: 0,
  };

  const globalListeners = new Set<() => void>();
  const pathListeners = new Map<string, Set<() => void>>();
  const snapshotCache = new Map<string, { version: number; snapshot: PathSnapshot }>();
  const pathVersions = new Map<string, number>();
  const registry = new Map<string, FieldRegistration>();
  const fieldOrder: string[] = [];
  const controllers = new Map<string, AbortController>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const tokens = new Map<string, number>();

  let metaCache: FormMeta | undefined;
  const notifyGlobal = () => {
    metaCache = undefined; // meta 变化:作废缓存,下次 getFormMeta 重建新引用
    for (const fn of globalListeners) fn();
  };
  const bumpPath = (path: string) => {
    pathVersions.set(path, (pathVersions.get(path) ?? 0) + 1);
    const set = pathListeners.get(path);
    if (set) for (const fn of set) fn();
  };

  const collectRules = (): Record<string, Rule> => {
    const merged: Record<string, Rule> = { ...(config.rules ?? {}) };
    for (const [path, reg] of registry) {
      const r = reg.getRule?.();
      if (r) merged[path] = r;
    }
    return merged;
  };

  const store: FormStore<T> = {
    getState: () => state,
    subscribe(listener) {
      globalListeners.add(listener);
      return () => {
        globalListeners.delete(listener);
      };
    },
    getFormMeta() {
      if (!metaCache) {
        metaCache = {
          isDirty: Object.keys(state.dirty).length > 0,
          isValid: Object.keys(state.errors).length === 0,
          isValidating: Object.keys(state.validating).length > 0,
          isSubmitting: state.isSubmitting,
          submitCount: state.submitCount,
          errors: state.errors,
        };
      }
      return metaCache;
    },
    subscribePath(path, fn) {
      let set = pathListeners.get(path);
      if (!set) {
        set = new Set();
        pathListeners.set(path, set);
      }
      set.add(fn);
      return () => {
        set?.delete(fn);
      };
    },
    getValue: (path) => getByPath(state.values, path),
    getPathSnapshot(path) {
      const version = pathVersions.get(path) ?? 0;
      const cached = snapshotCache.get(path);
      if (cached && cached.version === version) return cached.snapshot;
      const snapshot: PathSnapshot = {
        value: getByPath(state.values, path),
        error: state.errors[path],
        touched: !!state.touched[path],
        dirty: !!state.dirty[path],
        validating: !!state.validating[path],
      };
      snapshotCache.set(path, { version, snapshot });
      return snapshot;
    },
    setValue(path, value, opts) {
      const nextValues = setByPath(state.values, path, value);
      const wasDirty = !!state.dirty[path];
      const isDirty = !structuralEqual(value, getByPath(defaultValues, path));
      const dirty = { ...state.dirty };
      if (isDirty) dirty[path] = true;
      else delete dirty[path];
      const touched = opts?.shouldTouch ? { ...state.touched, [path]: true } : state.touched;
      state = { ...state, values: nextValues, dirty, touched };
      bumpPath(path);
      if (wasDirty !== isDirty || opts?.shouldTouch) notifyGlobal();
      if (opts?.shouldValidate) this.scheduleValidate(path);
    },
    handleChange(path, value) {
      const hasError = !!state.errors[path];
      const touched = !!state.touched[path];
      this.setValue(path, value);
      if (shouldValidate('change', mode, reValidateMode, hasError, touched)) {
        this.scheduleValidate(path);
      }
    },
    handleBlur(path) {
      const hasError = !!state.errors[path];
      this.setTouched(path, true);
      if (shouldValidate('blur', mode, reValidateMode, hasError, true)) {
        void this.validatePath(path);
      }
    },
    setError(path, error) {
      const errors = { ...state.errors };
      if (error) errors[path] = error;
      else delete errors[path];
      state = { ...state, errors };
      bumpPath(path);
      notifyGlobal();
    },
    setTouched(path, isTouched) {
      if (!!state.touched[path] === isTouched) return;
      const touched = { ...state.touched };
      if (isTouched) touched[path] = true;
      else delete touched[path];
      state = { ...state, touched };
      bumpPath(path);
      notifyGlobal();
    },
    setSubmitting(submitting) {
      if (state.isSubmitting === submitting) return;
      state = { ...state, isSubmitting: submitting };
      notifyGlobal();
    },
    bumpSubmitCount() {
      state = { ...state, submitCount: state.submitCount + 1 };
      notifyGlobal();
    },
    registerField(path, ref, getRule) {
      registry.set(path, { ref, getRule });
      if (!fieldOrder.includes(path)) fieldOrder.push(path);
      return () => {
        registry.delete(path);
        const i = fieldOrder.indexOf(path);
        if (i >= 0) fieldOrder.splice(i, 1);
      };
    },
    async validatePath(path) {
      controllers.get(path)?.abort();
      const controller = new AbortController();
      controllers.set(path, controller);
      const token = (tokens.get(path) ?? 0) + 1;
      tokens.set(path, token);

      const rule = registry.get(path)?.getRule?.() ?? config.rules?.[path];
      const hasAsync = !!(rule?.validate || schema);
      if (hasAsync) {
        state = { ...state, validating: { ...state.validating, [path]: true } };
        bumpPath(path);
        notifyGlobal();
      }

      const error = await validateField({
        path,
        value: getByPath(state.values, path),
        values: state.values,
        rule,
        schema,
        translate,
        signal: controller.signal,
      });

      if (controller.signal.aborted || tokens.get(path) !== token) return false; // 过期结果丢弃

      if (state.validating[path]) {
        const validating = { ...state.validating };
        delete validating[path];
        state = { ...state, validating };
      }
      this.setError(path, error);
      return error === null;
    },
    scheduleValidate(path) {
      const existing = timers.get(path);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        timers.delete(path);
        void this.validatePath(path);
      }, delayError);
      timers.set(path, timer);
    },
    async validateAll() {
      // 提交即停所有待发的单字段防抖校验,避免陈旧定时器在整表校验后触发、覆盖结果
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      for (const c of controllers.values()) c.abort();
      controllers.clear();
      const result = await validateForm({
        values: state.values,
        rules: collectRules(),
        schema,
        translate,
      });
      // 把 ref 回挂到对应 error 上(供 firstErrorPath 聚焦)
      for (const [path, err] of Object.entries(result.errors)) {
        const ref = registry.get(path)?.ref;
        if (ref) err.ref = ref;
      }
      const validating = {};
      state = { ...state, errors: result.errors, validating };
      for (const path of new Set([...fieldOrder, ...Object.keys(result.errors)])) bumpPath(path);
      notifyGlobal();
      return result.ok;
    },
    firstErrorPath() {
      for (const path of fieldOrder) if (state.errors[path]) return path;
      const keys = Object.keys(state.errors);
      return keys[0];
    },
    reset(next) {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      for (const c of controllers.values()) c.abort();
      controllers.clear();
      const values = next ? ({ ...defaultValues, ...next } as T) : defaultValues;
      state = {
        values,
        errors: {},
        touched: {},
        dirty: {},
        validating: {},
        isSubmitting: false,
        submitCount: 0,
      };
      snapshotCache.clear();
      for (const path of pathListeners.keys()) bumpPath(path);
      notifyGlobal();
    },
    dispose() {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      for (const c of controllers.values()) c.abort();
      controllers.clear();
      globalListeners.clear();
      pathListeners.clear();
      snapshotCache.clear();
    },
  };

  return store;
}
