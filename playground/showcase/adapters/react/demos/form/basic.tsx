import { Form, Input, useForm } from '@magic-scope/react';
import { useState } from 'react';

interface Values extends Record<string, unknown> {
  name: string;
  email: string;
}

export default function Demo() {
  const [result, setResult] = useState<string | null>(null);
  const form = useForm<Values>({
    defaultValues: { name: '', email: '' },
  });

  return (
    <Form
      form={form}
      onSubmit={(v) => setResult(`${v.name} <${v.email}>`)}
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(420px, 100%)' }}
    >
      <Form.Field name="name" label="昵称">
        <Input placeholder="请输入昵称" />
      </Form.Field>
      <Form.Field name="email" label="邮箱" help="仅用于接收通知与回执。">
        <Input type="email" placeholder="you@example.com" />
      </Form.Field>
      <Form.Submit>提交</Form.Submit>
      {result && <small style={{ color: 'var(--ms-color-fg-muted)' }}>已提交:{result}</small>}
    </Form>
  );
}
