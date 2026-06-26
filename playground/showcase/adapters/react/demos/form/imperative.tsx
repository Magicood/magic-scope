import { Form, Input, useForm } from '@magic-scope/react';
import { useRef, useState } from 'react';

interface Values extends Record<string, unknown> {
  username: string;
  email: string;
}

const btnStyle = {
  padding: '0.3rem 0.7rem',
  borderRadius: 'var(--ms-radius-2, 0.5rem)',
  border: '1px solid var(--ms-color-border, #ccc)',
  background: 'var(--ms-color-bg, #fff)',
  color: 'var(--ms-color-fg, #111)',
  cursor: 'pointer',
} as const;

/**
 * useForm 命令式 API + 表单事件回显:formState 订阅整表 meta(isDirty/isValid/submitCount),
 * setValue/reset/trigger 命令式驱动;onSubmit / onInvalid 回调实时回显;
 * Form.ErrorSummary 汇总提交后错误,点条目聚焦对应字段。
 */
export default function Demo() {
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  const form = useForm<Values>({
    defaultValues: { username: '', email: '' },
    mode: 'onSubmit',
  });
  const { isDirty, isValid, submitCount } = form.formState;

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(460px, 100%)' }}
    >
      <Form
        form={form}
        onSubmit={(v) => push(`onSubmit(${JSON.stringify(v)})`)}
        onInvalid={(errs) => push(`onInvalid(${Object.keys(errs).length} 处错误)`)}
        style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)' }}
      >
        <Form.ErrorSummary />

        <Form.Field name="username" label="用户名" required rule={{ required: true, minLength: 3 }}>
          <Input placeholder="至少 3 个字符" />
        </Form.Field>
        <Form.Field name="email" label="邮箱" required rule={{ required: true, email: true }}>
          <Input placeholder="you@example.com" />
        </Form.Field>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-2, 0.5rem)' }}>
          <Form.Submit>提交</Form.Submit>
          <Form.Reset>重置</Form.Reset>
          <button
            type="button"
            style={btnStyle}
            onClick={() => form.setValue('username', `mage-${Math.floor(Math.random() * 99)}`)}
          >
            随机填用户名
          </button>
          <button type="button" style={btnStyle} onClick={() => form.trigger()}>
            手动校验
          </button>
        </div>
      </Form>

      <div style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        isDirty={String(isDirty)} · isValid={String(isValid)} · submitCount={submitCount}
      </div>
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
