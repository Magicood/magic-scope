import { Textarea } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(28rem, 100%)' }}>
      <Textarea size="sm" rows={2} placeholder="sm 小号" aria-label="sm" />
      <Textarea size="md" rows={3} placeholder="md 中号" aria-label="md" />
      <Textarea size="lg" rows={3} placeholder="lg 大号" aria-label="lg" />
    </div>
  );
}
