import { Slider } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(360px, 80vw)' }}>
      <Slider defaultValue={30} size="sm" aria-label="sm" />
      <Slider defaultValue={50} size="md" aria-label="md" />
      <Slider defaultValue={70} size="lg" aria-label="lg" />
    </div>
  );
}
