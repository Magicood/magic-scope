import type { SpinTone } from '@magic-scope/react';
import { Spin } from '@magic-scope/react';

const TONES: SpinTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {TONES.map((tone) => (
        <div key={tone} style={{ display: 'grid', gap: '0.4rem', justifyItems: 'center' }}>
          <Spin tone={tone}>
            <div
              style={{
                inlineSize: '96px',
                blockSize: '64px',
                borderRadius: 'var(--ms-radius-md, 0.5rem)',
                border: '1px solid var(--ms-color-border, #2a2a35)',
                background: 'var(--ms-color-bg-subtle, rgba(255,255,255,0.03))',
              }}
            />
          </Spin>
          <small style={{ color: 'var(--ms-color-fg-muted, #9a9aa6)' }}>{tone}</small>
        </div>
      ))}
    </div>
  );
}
