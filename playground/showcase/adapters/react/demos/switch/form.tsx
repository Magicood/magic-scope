import { Switch } from '@magic-scope/react';
import { type FormEvent, useState } from 'react';

export default function Demo() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const on = data.get('newsletter') === 'on';
    setSubmitted(on ? '已订阅奥术周报 ✦' : '未订阅');
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'inline-grid', gap: '0.75rem', justifyItems: 'start' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
        <Switch name="newsletter" defaultChecked aria-label="订阅奥术周报" />
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>订阅奥术周报</span>
      </div>
      <button type="submit" style={{ font: 'inherit', cursor: 'pointer' }}>
        提交
      </button>
      {submitted !== null && (
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>提交结果:{submitted}</small>
      )}
    </form>
  );
}
