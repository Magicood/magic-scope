import { Textarea } from '@magic-scope/react';
import { useState } from 'react';

const MAX = 60;

export default function Demo() {
  const [value, setValue] = useState('在此写下你的咒文,字数将被实时统计。');
  const over = value.length > MAX;
  return (
    <div style={{ display: 'grid', gap: '0.4rem', inlineSize: 'min(28rem, 100%)' }}>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        invalid={over}
        aria-label="带字数统计的多行输入"
        placeholder="写点什么…"
      />
      <small
        style={{
          alignSelf: 'end',
          color: over ? 'var(--ms-color-danger)' : 'var(--ms-color-fg-muted)',
        }}
      >
        {value.length} / {MAX}
      </small>
    </div>
  );
}
