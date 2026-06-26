import { Alert } from '@magic-scope/react';

export default function Demo() {
  return (
    <Alert
      variant="danger"
      id="ritual-alert"
      aria-live="assertive"
      style={{ maxInlineSize: 'min(32rem, 100%)' }}
    >
      <strong style={{ display: 'block', marginBlockEnd: '0.4rem' }}>仪式校验未通过</strong>
      <ul style={{ margin: 0, paddingInlineStart: '1.1rem', display: 'grid', gap: '0.2rem' }}>
        <li>符文阵列第 3 环缺失锚点</li>
        <li>法力通道存在反向涌流</li>
        <li>守护结界尚未激活</li>
      </ul>
    </Alert>
  );
}
