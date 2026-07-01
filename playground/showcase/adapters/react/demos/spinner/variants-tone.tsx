import { Spinner } from '@magic-scope/react';

// 形态变体 variant × 语义色调 tone:ring 圆环 / dots 三点跳动 / bars 多条波动。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <Spinner variant="ring" tone="primary" />
      <Spinner variant="dots" tone="accent" />
      <Spinner variant="bars" tone="success" />
    </div>
  );
}
