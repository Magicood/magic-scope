import { NumberInput } from '@magic-scope/react';
import { useState } from 'react';

// invalid 校验失败态:强制染 danger 边发光并设 aria-invalid,
// tone 此时被忽略(invalid 优先级高于 tone)。这里随输入实时校验:
// 库存须为 1~10 的整数,越界即标红。
export default function Demo() {
  const [stock, setStock] = useState<number | null>(15);
  const invalid = stock == null || stock < 1 || stock > 10;
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(260px, 90vw)' }}>
      <NumberInput
        value={stock ?? undefined}
        onValueChange={setStock}
        step={1}
        invalid={invalid}
        tone="success"
        suffix="件"
        aria-label="库存"
        aria-describedby="number-input-invalid-hint"
      />
      <small
        id="number-input-invalid-hint"
        style={{ color: invalid ? 'var(--ms-color-danger)' : 'var(--ms-color-fg-muted)' }}
      >
        {invalid ? '库存须为 1~10 的整数' : '校验通过(invalid 优先级高于 tone)'}
      </small>
    </div>
  );
}
