import { Container } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const frame: CSSProperties = {
  border: '1px dashed var(--ms-color-border, #888)',
  borderRadius: 'var(--ms-radius-md, 8px)',
  background: 'var(--ms-color-bg-subtle, rgba(127,127,127,0.06))',
  paddingBlock: '0.75rem',
};

const sizes = [
  { size: 'sm' as const, label: 'sm — 30rem' },
  { size: 'md' as const, label: 'md — 48rem' },
  { size: 'lg' as const, label: 'lg — 64rem(默认)' },
  { size: 'xl' as const, label: 'xl — 80rem' },
  { size: 'full' as const, label: 'full — 不限宽' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: '100%' }}>
      {sizes.map(({ size, label }) => (
        <Container key={size} size={size} padding={3} style={frame}>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>{label}</span>
        </Container>
      ))}
      <Container size="72ch" padding={3} style={frame}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>自定义长度 — 72ch(最佳阅读宽度)</span>
      </Container>
    </div>
  );
}
