import type { SegmentedSize, SegmentedTone } from '@magic-scope/react';
import { Segmented } from '@magic-scope/react';

const options = [
  { value: 'low', label: '低' },
  { value: 'mid', label: '中' },
  { value: 'high', label: '高' },
];

const sizes: SegmentedSize[] = ['sm', 'md', 'lg'];
const tones: SegmentedTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info'];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {sizes.map((size) => (
          <Segmented key={size} options={options} defaultValue="mid" size={size} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {tones.map((tone) => (
          <Segmented key={tone} options={options} defaultValue="high" tone={tone} size="sm" />
        ))}
      </div>
    </div>
  );
}
