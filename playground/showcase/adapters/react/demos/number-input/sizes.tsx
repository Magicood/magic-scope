import { NumberInput } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <NumberInput size="sm" defaultValue={3} aria-label="sm" />
      <NumberInput size="md" defaultValue={3} aria-label="md" />
      <NumberInput size="lg" defaultValue={3} aria-label="lg" />
    </div>
  );
}
