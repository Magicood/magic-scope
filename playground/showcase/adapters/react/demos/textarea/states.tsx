import { Textarea } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(28rem, 100%)' }}>
      <Textarea rows={2} invalid defaultValue="内容不完整,无法提交。" aria-label="invalid" />
      <Textarea rows={2} disabled defaultValue="只读内容,当前不可编辑。" aria-label="disabled" />
    </div>
  );
}
