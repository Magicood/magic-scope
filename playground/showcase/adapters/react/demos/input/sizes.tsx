import { Input } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(320px, 80vw)' }}>
      <Input size="sm" placeholder="sm" />
      <Input size="md" placeholder="md" />
      <Input size="lg" placeholder="lg" />
    </div>
  );
}
