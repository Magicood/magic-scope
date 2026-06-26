import { Checkbox, Form, Input, Select, useForm } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

interface SignupValues extends Record<string, unknown> {
  name: string;
  realm: string;
  agree: boolean;
}

const REALMS = [
  { value: 'arcane', label: 'Arcane 奥术学派' },
  { value: 'frost', label: 'Frost 霜寒学派' },
  { value: 'ember', label: 'Ember 余烬学派' },
];

function Playground({ values }: { values: ControlValues }) {
  const layout = values.layout as 'vertical' | 'horizontal' | 'inline';
  const labelAlign = values.labelAlign as 'start' | 'end';
  const labelWidth = (values.labelWidth as string) || undefined;
  const disabled = values.disabled as boolean;

  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm<SignupValues>({
    defaultValues: { name: '', realm: 'frost', agree: false },
    mode: 'onBlur',
  });

  return (
    <Form
      form={form}
      layout={layout}
      labelAlign={labelAlign}
      labelWidth={labelWidth}
      disabled={disabled}
      onSubmit={(v) => setSubmitted(`${v.name || '(未填)'} · ${v.realm} · 同意=${v.agree}`)}
      style={{ inlineSize: 'min(440px, 100%)' }}
    >
      <Form.Field name="name" label="法师名号" required rule={{ required: true, minLength: 2 }}>
        <Input placeholder="至少 2 个字符" />
      </Form.Field>
      <Form.Field name="realm" label="所属学派">
        <Select options={REALMS} aria-label="所属学派" />
      </Form.Field>
      <Form.Field name="agree" rule={{ required: true }}>
        <Checkbox>我已阅读并接受《奥术契约》</Checkbox>
      </Form.Field>
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)' }}>
        <Form.Submit>提交注册</Form.Submit>
        <Form.Reset>重置</Form.Reset>
      </div>
      {submitted && (
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>提交成功:{submitted}</small>
      )}
    </Form>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/form/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/form/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'form',
  Playground,
  demos: buildDemos(comps, reactSources),
};
