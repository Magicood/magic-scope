import { Kbd } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
      <Kbd>⌘</Kbd>
      <span style={{ color: 'var(--ms-color-fg-muted)' }}>+</span>
      <Kbd>⇧</Kbd>
      <span style={{ color: 'var(--ms-color-fg-muted)' }}>+</span>
      <Kbd>P</Kbd>
    </div>
  );
}
