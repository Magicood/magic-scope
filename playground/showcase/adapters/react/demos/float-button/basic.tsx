import { FloatButton } from '@magic-scope/react';

// 默认占位为加号符文;单钮 position:relative,可直接内联渲染(无需固定到视口角)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: 'var(--ms-space-4)', alignItems: 'center' }}>
      <FloatButton aria-label="新建" />
      <FloatButton tone="accent" aria-label="新建(accent)" />
      <FloatButton type="primary" aria-label="新建(主色实底)" />
    </div>
  );
}
