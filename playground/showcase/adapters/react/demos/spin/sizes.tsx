import { Spin } from '@magic-scope/react';

const SIZES = ['sm', 'md', 'lg'] as const;

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'grid', gap: '0.4rem', justifyItems: 'center' }}>
          <Spin size={size} tip={size}>
            <div
              style={{
                inlineSize: '120px',
                blockSize: '80px',
                borderRadius: 'var(--ms-radius-md, 0.5rem)',
                border: '1px solid var(--ms-color-border, #2a2a35)',
                background: 'var(--ms-color-bg-subtle, rgba(255,255,255,0.03))',
              }}
            />
          </Spin>
          <small style={{ color: 'var(--ms-color-fg-muted, #9a9aa6)' }}>size={size}</small>
        </div>
      ))}
    </div>
  );
}
