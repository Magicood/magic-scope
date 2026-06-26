import { Form, Input, useForm, useWatch } from '@magic-scope/react';

interface Values extends Record<string, unknown> {
  password: string;
  confirm: string;
}

/** 实时回显某字段值:useWatch 订阅单 path,谁调谁渲、隔离重渲范围。 */
function StrengthHint() {
  const pwd = useWatch('password') as string;
  const len = pwd?.length ?? 0;
  const level = len >= 10 ? '强' : len >= 6 ? '中' : len > 0 ? '弱' : '—';
  return (
    <small style={{ color: 'var(--ms-color-fg-muted)' }}>
      当前长度 {len} · 强度 {level}
    </small>
  );
}

/**
 * 跨字段联动校验:validate 的第二参 ctx.values 可读整表当前值,
 * 据此让「确认密码」与「密码」比对,任一方改动都按时机复验。
 */
export default function Demo() {
  const form = useForm<Values>({
    defaultValues: { password: '', confirm: '' },
    mode: 'onTouched',
  });

  return (
    <Form
      form={form}
      onSubmit={() => alert('两次密码一致,提交成功!')}
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(420px, 100%)' }}
    >
      <Form.Field name="password" label="密码" required rule={{ required: true, minLength: 6 }}>
        <Input type="password" placeholder="至少 6 位" />
      </Form.Field>
      <StrengthHint />

      <Form.Field
        name="confirm"
        label="确认密码"
        required
        rule={{
          required: true,
          validate: (v, ctx) =>
            v === (ctx.values as Values).password ? true : '两次输入的密码不一致',
        }}
      >
        <Input type="password" placeholder="再次输入密码" />
      </Form.Field>

      <Form.Submit>提交</Form.Submit>
    </Form>
  );
}
