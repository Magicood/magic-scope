import { PinInput } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [masked, setMasked] = useState(true);
  const [pin, setPin] = useState('');
  return (
    <div style={{ display: 'grid', gap: '0.7rem', justifyItems: 'start' }}>
      <PinInput value={pin} onChange={setPin} mask={masked} aria-label="支付口令" />
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        <input type="checkbox" checked={masked} onChange={(e) => setMasked(e.target.checked)} />
        掩码显示(密码点)—— 适合支付 / 敏感口令
      </label>
      <small style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
        当前明文:{pin || '(空)'}
      </small>
    </div>
  );
}
