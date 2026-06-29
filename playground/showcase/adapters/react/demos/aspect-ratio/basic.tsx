import { AspectRatio } from '@magic-scope/react';

const RATIOS: { ratio: string; label: string }[] = [
  { ratio: '16 / 9', label: '16 / 9' },
  { ratio: '4 / 3', label: '4 / 3' },
  { ratio: '1', label: '1 / 1' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-4)' }}>
      {RATIOS.map(({ ratio, label }) => (
        <div key={label} style={{ inlineSize: 'min(220px, 100%)' }}>
          <AspectRatio ratio={ratio} rounded="md">
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80"
              alt="办公空间封面图"
              style={{ inlineSize: '100%', blockSize: '100%' }}
            />
          </AspectRatio>
          <p
            style={{
              margin: 'var(--ms-space-2) 0 0',
              textAlign: 'center',
              color: 'var(--ms-color-fg-muted)',
              fontSize: '0.85rem',
            }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
