import { NumberInput } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [qty, setQty] = useState<number | null>(1);
  return (
    <div style={{ display: 'grid', gap: '0.6rem', justifyItems: 'start' }}>
      <NumberInput
        value={qty ?? undefined}
        onValueChange={setQty}
        min={1}
        max={99}
        aria-label="购买数量"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        上报值:{qty === null ? 'null(已清空)' : qty}
      </small>
      <NumberInput defaultValue={7} disabled aria-label="禁用" />
    </div>
  );
}
