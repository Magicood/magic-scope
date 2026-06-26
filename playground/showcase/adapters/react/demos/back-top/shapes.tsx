import type { BackTopShape } from '@magic-scope/react';
import { BackTop } from '@magic-scope/react';
import { useRef } from 'react';

// 两种形状:circle 圆形(默认,radius-full)与 square 方形(radius-md 圆角)。
const shapes: { shape: BackTopShape; label: string }[] = [
  { shape: 'circle', label: 'circle 圆形' },
  { shape: 'square', label: 'square 方形' },
];

function ShapeBox({ shape, label }: { shape: BackTopShape; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
      <div
        ref={ref}
        style={{
          position: 'relative',
          transform: 'translateZ(0)',
          blockSize: '160px',
          overflow: 'auto',
          padding: 'var(--ms-space-3, 0.75rem)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <div style={{ blockSize: '500px' }} aria-hidden="true" />
        <BackTop
          target={() => ref.current ?? window}
          shape={shape}
          visibilityHeight={40}
          right={14}
          bottom={14}
        />
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {shapes.map(({ shape, label }) => (
        <ShapeBox key={shape} shape={shape} label={label} />
      ))}
    </div>
  );
}
