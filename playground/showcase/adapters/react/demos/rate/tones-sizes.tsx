import type { RateSize, RateTone } from '@magic-scope/react';
import { Rate } from '@magic-scope/react';

const tones: RateTone[] = ['warning', 'primary', 'accent', 'success', 'danger', 'info', 'neutral'];
const sizes: RateSize[] = ['sm', 'md', 'lg'];

const labelStyle = {
  inlineSize: '5.5rem',
  color: 'var(--ms-color-fg-muted)',
  fontSize: '0.85em',
} as const;

// 七种 tone 色调（派生填充与发光）× 三档 size；外加只读 / 禁用两种静态态。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {tones.map((tone) => (
          <div key={tone} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={labelStyle}>{tone}</span>
            <Rate defaultValue={4} tone={tone} readOnly aria-label={`${tone} 色调评分`} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {sizes.map((size) => (
          <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={labelStyle}>{size}</span>
            <Rate
              defaultValue={3.5}
              size={size}
              allowHalf
              readOnly
              aria-label={`${size} 尺寸评分`}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={labelStyle}>disabled</span>
        <Rate defaultValue={3} disabled aria-label="禁用评分" />
      </div>
    </div>
  );
}
