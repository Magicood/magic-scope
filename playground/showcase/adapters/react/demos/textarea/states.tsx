import { Textarea } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(28rem, 100%)' }}>
      <Textarea rows={2} invalid defaultValue="咒语不完整,无法施放。" aria-label="invalid" />
      <Textarea rows={2} disabled defaultValue="封印中,无法编辑。" aria-label="disabled" />
    </div>
  );
}
