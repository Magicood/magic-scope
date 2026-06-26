import { Kbd } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Kbd size="sm">Esc</Kbd>
      <Kbd size="md">Esc</Kbd>
    </div>
  );
}
