import { Switch } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Switch defaultChecked aria-label="默认开启" />
      <Switch aria-label="默认关闭" />
      <Switch defaultChecked disabled aria-label="禁用且开启" />
      <Switch disabled aria-label="禁用且关闭" />
    </div>
  );
}
