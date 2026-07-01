import { Toggle, type ToggleVariant } from '@magic-scope/react';

// 四种变体:按下态各自点亮 tone 实底 / 柔底 / 描边 / 幽灵。
const variants: [ToggleVariant, string][] = [
  ['solid', '实底'],
  ['soft', '柔底'],
  ['outline', '描边'],
  ['ghost', '幽灵'],
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {variants.map(([variant, label]) => (
        <Toggle key={variant} variant={variant} defaultPressed aria-label={label}>
          {label}
        </Toggle>
      ))}
    </div>
  );
}
