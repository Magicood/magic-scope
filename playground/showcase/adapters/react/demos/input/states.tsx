import { Input } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(320px, 80vw)' }}>
      <Input invalid defaultValue="格式有误" />
      <Input disabled placeholder="禁用" />
    </div>
  );
}
