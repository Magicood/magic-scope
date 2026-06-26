import { Spinner } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  );
}
