import { PinInput } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [code, setCode] = useState('');
  return (
    <div style={{ display: 'grid', gap: '0.6rem', justifyItems: 'start' }}>
      <PinInput value={code} onChange={setCode} aria-label="验证码" />
      <small style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        已输入 {code.length} / 6 位 —— 合法字符自动跳格,Backspace 回退,粘贴整串自动分填。
      </small>
    </div>
  );
}
