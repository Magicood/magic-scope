import { Skeleton } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.875rem',
        alignItems: 'center',
        inlineSize: '18rem',
        padding: '1rem',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-surface-raised)',
      }}
    >
      <Skeleton variant="circle" style={{ inlineSize: '3rem', blockSize: '3rem', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <Skeleton variant="text" style={{ inlineSize: '70%' }} />
        <Skeleton variant="text" style={{ inlineSize: '90%' }} />
        <Skeleton variant="text" style={{ inlineSize: '50%' }} />
      </div>
    </div>
  );
}
