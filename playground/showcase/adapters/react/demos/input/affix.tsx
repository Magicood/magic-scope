import { Input } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(360px, 80vw)' }}>
      <Input prefix={<span aria-hidden="true">🔍</span>} placeholder="框内前置图标 prefix" />
      <Input
        suffix={<span style={{ color: 'var(--ms-color-fg-muted)' }}>.com</span>}
        placeholder="框内后置 suffix"
      />
      <Input addonBefore="https://" addonAfter=".com" placeholder="站点名" />
      <Input type="password" defaultValue="secret" placeholder="密码(点眼睛切换明文)" />
    </div>
  );
}
