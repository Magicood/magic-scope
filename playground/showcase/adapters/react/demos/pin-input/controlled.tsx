import { PinInput } from '@magic-scope/react';
import { useState } from 'react';

const CORRECT = '246810';

export default function Demo() {
  const [code, setCode] = useState('');
  const filled = code.length === 6;
  const ok = filled && code === CORRECT;
  const bad = filled && code !== CORRECT;

  return (
    <div style={{ display: 'grid', gap: '0.7rem', justifyItems: 'start' }}>
      <PinInput value={code} onChange={setCode} invalid={bad} aria-label="受控验证码" />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setCode('123')}
          style={{
            padding: '0.35rem 0.7rem',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            border: '1px solid var(--ms-color-border, #ccc)',
            background: 'transparent',
            color: 'var(--ms-color-fg, inherit)',
            cursor: 'pointer',
          }}
        >
          填入半串(123)
        </button>
        <button
          type="button"
          onClick={() => setCode('')}
          style={{
            padding: '0.35rem 0.7rem',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            border: '1px solid var(--ms-color-border, #ccc)',
            background: 'transparent',
            color: 'var(--ms-color-fg, inherit)',
            cursor: 'pointer',
          }}
        >
          清空
        </button>
      </div>
      <small style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        {ok
          ? '✓ 验证通过(正确码 246810)'
          : bad
            ? '✗ 验证码错误,请重试'
            : `外部状态完全可控,当前:${code || '(空)'}`}
      </small>
    </div>
  );
}
