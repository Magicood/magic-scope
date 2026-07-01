import { CopyButton } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <code
        style={{
          padding: '0.3rem 0.6rem',
          borderRadius: 'var(--ms-radius-sm)',
          background: 'var(--ms-color-bg-subtle)',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        sk-magic-scope-0f3a…
      </code>
      <CopyButton value="sk-magic-scope-0f3a9c2b" withTooltip>
        复制
      </CopyButton>
    </div>
  );
}
