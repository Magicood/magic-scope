import { type ColorFormat, ColorPicker } from '@magic-scope/react';
import { useState } from 'react';

// 受控 format:固定三种输出格式之一,此时面板内的格式切换器自动隐藏,
// onChange 回吐的串即为对应格式(hex / rgb / hsl)。
const FORMATS: { format: ColorFormat; label: string }[] = [
  { format: 'hex', label: 'HEX 十六进制' },
  { format: 'rgb', label: 'RGB' },
  { format: 'hsl', label: 'HSL' },
];

export default function Demo() {
  const [out, setOut] = useState<Record<ColorFormat, string>>({
    hex: '#10b981',
    rgb: 'rgb(16, 185, 129)',
    hsl: 'hsl(160, 84%, 39%)',
  });
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {FORMATS.map(({ format, label }) => (
        <div key={format} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <ColorPicker
            format={format}
            value={out[format]}
            onChange={(v) => setOut((s) => ({ ...s, [format]: v }))}
            aria-label={label}
          />
          <span style={{ minInlineSize: '6rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <code style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
            {out[format]}
          </code>
        </div>
      ))}
    </div>
  );
}
