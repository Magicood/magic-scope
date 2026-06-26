import { NumberInput } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>评分 · 限定 [0, 5] · 步长 0.5</span>
        <NumberInput defaultValue={4.5} min={0} max={5} step={0.5} aria-label="评分" />
      </div>
      <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>已到下界 · 「−」自动禁用</span>
        <NumberInput defaultValue={0} min={0} max={5} step={1} aria-label="到达下界" />
      </div>
    </div>
  );
}
