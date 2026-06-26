import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createFormStore,
  type FieldPath,
  getByPath,
  type PathValue,
  type Rule,
  runBuiltinRules,
  type StandardSchemaV1,
  setByPath,
  shouldValidate,
  structuralEqual,
  type TranslateLike,
  validateField,
  validateForm,
} from './logic';

/** 测试用 translate:回显 key(+vars),便于断言引擎选了哪条文案、传了哪些插值。 */
const t: TranslateLike = (key, vars) => (vars ? `${key}:${JSON.stringify(vars)}` : key);

const tick = () => Promise.resolve();

describe('路径读写纯函数', () => {
  it('getByPath 读嵌套与数组', () => {
    const v = { user: { name: 'a' }, items: [{ id: 1 }, { id: 2 }] };
    expect(getByPath(v, 'user.name')).toBe('a');
    expect(getByPath(v, 'items.1.id')).toBe(2);
    expect(getByPath(v, 'user.missing')).toBeUndefined();
    expect(getByPath(v, 'x.y.z')).toBeUndefined();
  });

  it('setByPath 不可变写,原对象不动', () => {
    const v = { user: { name: 'a' }, items: [{ id: 1 }] };
    const next = setByPath(v, 'user.name', 'b');
    expect(next).not.toBe(v);
    expect((next as typeof v).user.name).toBe('b');
    expect(v.user.name).toBe('a'); // 原对象不变
    const next2 = setByPath(v, 'items.0.id', 9);
    expect((next2 as typeof v).items[0]?.id).toBe(9);
    expect(v.items[0]?.id).toBe(1);
  });

  it('setByPath 创建缺失的数组/对象中间层', () => {
    const next = setByPath({}, 'a.b.0.c', 1) as Record<string, unknown>;
    expect(getByPath(next, 'a.b.0.c')).toBe(1);
    expect(Array.isArray((next.a as { b: unknown }).b)).toBe(true);
  });

  it('structuralEqual 深比较', () => {
    expect(structuralEqual({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
    expect(structuralEqual({ a: [1, 2] }, { a: [1, 3] })).toBe(false);
    expect(structuralEqual([1], [1, 2])).toBe(false);
    expect(structuralEqual(null, null)).toBe(true);
    expect(structuralEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('structuralEqual 按值比较 Date(否则任意两 Date 误判相等 → 永不 dirty)', () => {
    expect(structuralEqual(new Date(1), new Date(1))).toBe(true);
    expect(structuralEqual(new Date(1), new Date(2))).toBe(false);
  });
});

describe('内建规则', () => {
  it('required 命中空值', () => {
    expect(runBuiltinRules('', { required: true }, t)?.type).toBe('required');
    expect(runBuiltinRules([], { required: true }, t)?.type).toBe('required');
    expect(runBuiltinRules('x', { required: true }, t)).toBeNull();
  });

  it('required 自定义文案', () => {
    expect(runBuiltinRules('', { required: '必须填' }, t)?.message).toBe('必须填');
  });

  it('required 对 false(未勾选 checkbox/switch)触发', () => {
    expect(runBuiltinRules(false, { required: true }, t)?.type).toBe('required');
    expect(runBuiltinRules(true, { required: true }, t)).toBeNull();
  });

  it('minLength 对空数组仍校验(「至少选 N 个」)', () => {
    expect(runBuiltinRules([], { minLength: 1 }, t)?.type).toBe('minLength');
    expect(runBuiltinRules(['a'], { minLength: 1 }, t)).toBeNull();
  });

  it('min/max 数值约束 + 插值', () => {
    expect(runBuiltinRules(5, { min: 10 }, t)?.message).toBe('form.min:{"min":10}');
    expect(runBuiltinRules(20, { max: 10 }, t)?.type).toBe('max');
    expect(runBuiltinRules(10, { min: 10, max: 10 }, t)).toBeNull();
  });

  it('minLength/maxLength', () => {
    expect(runBuiltinRules('ab', { minLength: 3 }, t)?.type).toBe('minLength');
    expect(runBuiltinRules('abcd', { maxLength: 3 }, t)?.type).toBe('maxLength');
  });

  it('pattern / email / url', () => {
    expect(runBuiltinRules('xx', { pattern: /^\d+$/ }, t)?.type).toBe('pattern');
    expect(runBuiltinRules('not-email', { email: true }, t)?.type).toBe('email');
    expect(runBuiltinRules('a@b.com', { email: true }, t)).toBeNull();
    expect(runBuiltinRules('nope', { url: true }, t)?.type).toBe('url');
    expect(runBuiltinRules('https://a.com', { url: true }, t)).toBeNull();
  });

  it('空值且非必填:跳过其余约束', () => {
    expect(runBuiltinRules('', { minLength: 3 }, t)).toBeNull();
  });
});

describe('validateField 短路与异步', () => {
  it('同步规则失败时不进入异步 validate(短路)', async () => {
    const asyncValidate = vi.fn(async () => true);
    const rule: Rule = { required: true, validate: asyncValidate };
    const err = await validateField({
      path: 'a',
      value: '',
      values: { a: '' },
      rule,
      translate: t,
    });
    expect(err?.type).toBe('required');
    expect(asyncValidate).not.toHaveBeenCalled();
  });

  it('自定义异步 validate 失败给文案', async () => {
    const rule: Rule<string> = { validate: async (v) => (v === 'ok' ? true : '不对') };
    const err = await validateField({
      path: 'a',
      value: 'bad',
      values: { a: 'bad' },
      rule,
      translate: t,
    });
    expect(err?.message).toBe('不对');
  });
});

describe('Standard Schema 互通', () => {
  const schema: StandardSchemaV1<{ a: string }> = {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (val) => {
        const v = val as { a?: string };
        if (!v.a) return { issues: [{ message: 'form.required', path: ['a'] }] };
        return { value: { a: v.a } };
      },
    },
  };

  it('validateForm 收集 schema issues 并归并到 path', async () => {
    const r = await validateForm({ values: { a: '' }, schema, translate: t });
    expect(r.ok).toBe(false);
    expect(r.errors.a?.type).toBe('schema');
    expect(r.errors.a?.message).toBe('form.required'); // message 即 key 经 translate
  });

  it('schema 通过时 ok', async () => {
    const r = await validateForm({ values: { a: 'x' }, schema, translate: t });
    expect(r.ok).toBe(true);
  });

  it('rules 命中的 path 不被 schema 覆盖', async () => {
    const r = await validateForm({
      values: { a: '' },
      rules: { a: { required: '自定义优先' } },
      schema,
      translate: t,
    });
    expect(r.errors.a?.message).toBe('自定义优先');
  });
});

describe('shouldValidate 时机', () => {
  it('submit 永远校验', () => {
    expect(shouldValidate('submit', 'onSubmit', 'onChange', false, false)).toBe(true);
  });
  it('onSubmit 模式打字不校验', () => {
    expect(shouldValidate('change', 'onSubmit', 'onChange', false, false)).toBe(false);
  });
  it('出错后按 reValidateMode 复验', () => {
    expect(shouldValidate('change', 'onSubmit', 'onChange', true, false)).toBe(true);
    expect(shouldValidate('change', 'onSubmit', 'onBlur', true, false)).toBe(false);
    expect(shouldValidate('blur', 'onSubmit', 'onBlur', true, false)).toBe(true);
  });
  it('onChange / onBlur / onTouched', () => {
    expect(shouldValidate('change', 'onChange', 'onChange', false, false)).toBe(true);
    expect(shouldValidate('blur', 'onBlur', 'onChange', false, false)).toBe(true);
    expect(shouldValidate('change', 'onTouched', 'onChange', false, true)).toBe(true);
  });
});

describe('createFormStore 切片订阅与状态', () => {
  it('path 切片订阅:改 a 只通知 a 的订阅者', () => {
    const store = createFormStore({ defaultValues: { a: '', b: '' }, translate: t });
    let aN = 0;
    let bN = 0;
    store.subscribePath('a', () => aN++);
    store.subscribePath('b', () => bN++);
    store.setValue('a', 'x');
    expect(aN).toBe(1);
    expect(bN).toBe(0);
  });

  it('getPathSnapshot 引用稳定,变更后才换新引用', () => {
    const store = createFormStore({ defaultValues: { a: '' }, translate: t });
    const s1 = store.getPathSnapshot('a');
    expect(store.getPathSnapshot('a')).toBe(s1);
    store.setValue('a', 'y');
    expect(store.getPathSnapshot('a')).not.toBe(s1);
  });

  it('dirty:改值置脏,改回默认清脏', () => {
    const store = createFormStore({ defaultValues: { a: 'init' }, translate: t });
    store.setValue('a', 'x');
    expect(store.getPathSnapshot('a').dirty).toBe(true);
    store.setValue('a', 'init');
    expect(store.getPathSnapshot('a').dirty).toBe(false);
  });

  it('handleBlur 打 touched', () => {
    const store = createFormStore({ defaultValues: { a: '' }, translate: t });
    store.handleBlur('a');
    expect(store.getPathSnapshot('a').touched).toBe(true);
  });

  it('firstErrorPath 按注册顺序返回首个错误', () => {
    const store = createFormStore({ defaultValues: { a: '', b: '' }, translate: t });
    store.registerField('a', undefined);
    store.registerField('b', undefined);
    store.setError('b', { type: 'x', message: 'm' });
    expect(store.firstErrorPath()).toBe('b');
  });

  it('validateAll 把 ref 回挂到 error 上供聚焦', async () => {
    const store = createFormStore({
      defaultValues: { a: '' },
      rules: { a: { required: true } },
      translate: t,
    });
    const focus = vi.fn();
    store.registerField('a', { focus }, () => ({ required: true }));
    const ok = await store.validateAll();
    expect(ok).toBe(false);
    store.getState().errors.a?.ref?.focus();
    expect(focus).toHaveBeenCalled();
  });

  it('reset 清空状态回默认', () => {
    const store = createFormStore({ defaultValues: { a: 'init' }, translate: t });
    store.setValue('a', 'x');
    store.setError('a', { type: 'x', message: 'm' });
    store.reset();
    expect(store.getPathSnapshot('a').value).toBe('init');
    expect(store.getState().errors.a).toBeUndefined();
    expect(store.getPathSnapshot('a').dirty).toBe(false);
  });
});

describe('异步校验竞态与防抖', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('竞态:旧请求被取消,只有最新结果写入', async () => {
    const store = createFormStore({ defaultValues: { a: '' }, translate: t });
    const resolvers: Array<(v: boolean | string) => void> = [];
    const rule: Rule = { validate: () => new Promise((res) => resolvers.push(res)) };
    store.registerField('a', undefined, () => rule);

    store.setValue('a', 'x1');
    const p1 = store.validatePath('a');
    store.setValue('a', 'x2');
    const p2 = store.validatePath('a'); // abort 上一个 + token++

    resolvers[0]?.('旧错误'); // 过期:应被丢弃
    resolvers[1]?.(true); // 最新:通过
    await Promise.all([p1, p2]);

    expect(store.getState().errors.a).toBeUndefined(); // 最新结果(通过)生效,旧错误未写入
  });

  it('防抖:onChange 模式连续输入只校验一次', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const rule: Rule = {
      validate: () => {
        calls++;
        return true;
      },
    };
    const store = createFormStore({
      defaultValues: { a: '' },
      mode: 'onChange',
      delayError: 250,
      translate: t,
    });
    store.registerField('a', undefined, () => rule);
    store.handleChange('a', '1');
    store.handleChange('a', '12');
    store.handleChange('a', '123');
    await vi.advanceTimersByTimeAsync(300);
    expect(calls).toBe(1);
  });

  it('validating 态在异步校验期间置位', async () => {
    const store = createFormStore({ defaultValues: { a: '' }, translate: t });
    let release: (v: boolean) => void = () => {};
    const rule: Rule = { validate: () => new Promise((res) => (release = res)) };
    store.registerField('a', undefined, () => rule);
    const p = store.validatePath('a');
    await tick();
    expect(store.getPathSnapshot('a').validating).toBe(true);
    release(true);
    await p;
    expect(store.getPathSnapshot('a').validating).toBe(false);
  });

  it('validateAll 清掉待发防抖定时器(提交后不被陈旧定时器追加覆盖)', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const store = createFormStore({ defaultValues: { a: 'x' }, mode: 'onChange', translate: t });
    store.registerField('a', undefined, () => ({
      validate: () => {
        calls++;
        return true;
      },
    }));
    store.handleChange('a', 'y'); // 排一个防抖 validate 定时器
    await store.validateAll(); // 跑一次 validate(calls=1)+ 清掉待发定时器
    await vi.advanceTimersByTimeAsync(300);
    expect(calls).toBe(1); // 待发定时器被清,未追加第二次
    vi.useRealTimers();
  });
});

describe('类型层(FieldPath / PathValue)', () => {
  it('嵌套与数组路径类型推断', () => {
    type V = { name: string; age: number; addr: { city: string }; tags: string[] };
    // 编译期断言:合法路径可赋值,值类型可反推
    const p1: FieldPath<V> = 'addr.city';
    const p2: FieldPath<V> = 'tags.0';
    const city: PathValue<V, 'addr.city'> = 'sh';
    const age: PathValue<V, 'age'> = 1;
    expect([p1, p2, city, age]).toEqual(['addr.city', 'tags.0', 'sh', 1]);
  });
});
