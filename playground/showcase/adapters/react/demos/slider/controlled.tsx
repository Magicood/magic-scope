import { Slider } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(360px, 80vw)' }}>
      <Slider
        value={value}
        onValueChange={setValue}
        showValue
        formatValue={(n) => `${n}%`}
        aria-label="音量"
      />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        受控值:外部 state 为 {value},拖动 / 方向键同步回写。
      </p>
    </div>
  );
}
