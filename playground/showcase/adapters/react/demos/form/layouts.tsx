import { Form, Input, Select, useForm } from '@magic-scope/react';
import { useState } from 'react';

type Layout = 'vertical' | 'horizontal' | 'inline';

interface Values extends Record<string, unknown> {
  user: string;
  realm: string;
}

const REALMS = [
  { value: 'arcane', label: 'Arcane 奥术' },
  { value: 'frost', label: 'Frost 霜寒' },
  { value: 'ember', label: 'Ember 余烬' },
];

export default function Demo() {
  const [layout, setLayout] = useState<Layout>('horizontal');
  const form = useForm<Values>({ defaultValues: { user: '', realm: 'frost' } });

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)', inlineSize: 'min(480px, 100%)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)' }}>
        {(['vertical', 'horizontal', 'inline'] as Layout[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLayout(l)}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--ms-radius-2, 0.5rem)',
              border: '1px solid var(--ms-color-border, #ccc)',
              background:
                layout === l ? 'var(--ms-color-accent-soft, #eef)' : 'var(--ms-color-bg, #fff)',
              color: 'var(--ms-color-fg, #111)',
              cursor: 'pointer',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <Form form={form} layout={layout} labelWidth="6rem" labelAlign="end">
        <Form.Field name="user" label="账号">
          <Input placeholder="账号" />
        </Form.Field>
        <Form.Field name="realm" label="学派">
          <Select options={REALMS} aria-label="学派" />
        </Form.Field>
        <Form.Submit>查询</Form.Submit>
      </Form>
    </div>
  );
}
