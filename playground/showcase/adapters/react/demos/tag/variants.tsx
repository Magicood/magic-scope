import type { TagTone, TagVariant } from '@magic-scope/react';
import { Tag } from '@magic-scope/react';

const TONES: TagTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];
const VARIANTS: { value: TagVariant; label: string }[] = [
  { value: 'soft', label: '柔色底 soft' },
  { value: 'solid', label: '实底 solid' },
  { value: 'outline', label: '描边 outline' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {VARIANTS.map(({ value, label }) => (
        <div key={value} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.75rem' }}>{label}</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TONES.map((tone) => (
              <Tag key={tone} tone={tone} variant={value}>
                {tone}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
