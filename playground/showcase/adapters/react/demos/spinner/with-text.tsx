import { Spinner } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
        <Spinner size="sm" label="正在施法" />
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>正在施法…</span>
      </span>
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          gap: '0.75rem',
          padding: '1.5rem',
          inlineSize: 'min(260px, 100%)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-border)',
        }}
      >
        <Spinner size="lg" label="召唤传送门" />
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>召唤传送门中…</span>
      </div>
    </div>
  );
}
