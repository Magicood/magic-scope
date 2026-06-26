import { Divider } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(28rem, 100%)', color: 'var(--ms-color-fg-muted)' }}>
      <p style={{ marginBlockStart: 0 }}>第一章·奥术启蒙。学徒在塔中点亮第一缕法力。</p>
      <Divider />
      <p style={{ marginBlockEnd: 0 }}>第二章·符文编织。咒语开始有了形状与重量。</p>
    </div>
  );
}
