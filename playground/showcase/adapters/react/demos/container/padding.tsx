import { Container } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const frame: CSSProperties = {
  border: '1px dashed var(--ms-color-border, #888)',
  borderRadius: 'var(--ms-radius-md, 8px)',
  background: 'var(--ms-color-bg-subtle, rgba(127,127,127,0.06))',
};

const inner: CSSProperties = {
  margin: 0,
  borderRadius: 'var(--ms-radius-sm, 4px)',
  background: 'var(--ms-color-accent-soft, rgba(99,102,241,0.16))',
  padding: '0.5rem',
  textAlign: 'center',
  color: 'var(--ms-color-fg-muted)',
};

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: '100%' }}>
      <Container size="sm" style={frame}>
        <p style={inner}>默认:不传 padding → 流式 clamp(随视口 1rem~2rem 平滑收放)</p>
      </Container>

      <Container size="sm" padding={8} paddingBlock={4} style={frame}>
        <p style={inner}>token 档:padding=8 水平、paddingBlock=4 垂直(随密度缩放)</p>
      </Container>

      <Container size="sm" padding={{ base: 2, md: 8 }} paddingBlock={2} style={frame}>
        <p style={inner}>断点对象:padding={'{ base: 2, md: 8 }'} — 窄屏紧凑、宽屏宽松</p>
      </Container>

      <Container size="sm" padding="2.5rem" style={frame}>
        <p style={inner}>自定义长度:padding="2.5rem"</p>
      </Container>
    </div>
  );
}
