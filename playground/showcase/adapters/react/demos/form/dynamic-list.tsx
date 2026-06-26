import { Form, Input, useForm } from '@magic-scope/react';
import { useState } from 'react';

interface Values extends Record<string, unknown> {
  spells: string[];
}

const btnStyle = {
  padding: '0.25rem 0.6rem',
  borderRadius: 'var(--ms-radius-2, 0.5rem)',
  border: '1px solid var(--ms-color-border, #ccc)',
  background: 'var(--ms-color-bg, #fff)',
  color: 'var(--ms-color-fg, #111)',
  cursor: 'pointer',
} as const;

/**
 * Form.List 动态字段数组:每行持稳定 id(增删移动时 id 跟随,避免切片订阅与 DOM 错位),
 * 值仍存 store(唯一真相源)。每行字段路径形如 spells.0、spells.1。
 */
export default function Demo() {
  const [result, setResult] = useState<string | null>(null);
  const form = useForm<Values>({
    defaultValues: { spells: ['火球术', '冰霜新星'] },
  });

  return (
    <Form
      form={form}
      onSubmit={(v) => setResult(v.spells.filter(Boolean).join('、'))}
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(460px, 100%)' }}
    >
      <Form.List name="spells">
        {({ fields, append, remove, move }) => (
          <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.5rem)' }}>
            {fields.map((f, i) => (
              <div
                key={f.id}
                style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)', alignItems: 'start' }}
              >
                <div style={{ flex: 1, minInlineSize: 0 }}>
                  <Form.Field name={f.name} rule={{ required: true }}>
                    <Input placeholder={`法术 ${i + 1}`} style={{ inlineSize: '100%' }} />
                  </Form.Field>
                </div>
                <button
                  type="button"
                  style={btnStyle}
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  ↑
                </button>
                <button type="button" style={btnStyle} onClick={() => remove(i)}>
                  删除
                </button>
              </div>
            ))}
            <button type="button" style={btnStyle} onClick={() => append('')}>
              + 添加法术
            </button>
          </div>
        )}
      </Form.List>

      <Form.Submit>保存法术书</Form.Submit>
      {result && <small style={{ color: 'var(--ms-color-fg-muted)' }}>法术书:{result}</small>}
    </Form>
  );
}
