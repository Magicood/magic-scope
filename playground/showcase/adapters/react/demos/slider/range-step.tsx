import { Slider } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(360px, 80vw)' }}>
      <Slider
        defaultValue={6}
        min={0}
        max={10}
        step={2}
        showValue
        formatValue={(n) => `${n} 级`}
        aria-label="法术等级"
      />
      <Slider
        defaultValue={50}
        showValue
        disabled
        formatValue={(n) => `${n}%`}
        aria-label="禁用滑块"
      />
    </div>
  );
}
