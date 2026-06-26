import { Stack } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const box: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  background: 'color-mix(in oklab, var(--ms-color-accent, #7c5cff) 20%, transparent)',
  border: '1px solid color-mix(in oklab, var(--ms-color-accent, #7c5cff) 42%, transparent)',
};

const frame: CSSProperties = {
  blockSize: '4rem',
  padding: '0.5rem',
  borderRadius: '10px',
  border: '1px dashed color-mix(in oklab, var(--ms-color-fg, #888) 26%, transparent)',
};

const label: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ms-color-fg-muted, #888)',
};

/** 交叉轴对齐 align(高低不一的块如何对齐)与主轴分布 justify(剩余空间如何分配)。 */
export default function Demo() {
  return (
    <Stack gap={6}>
      <span style={label}>align:横向 Stack 控制竖直对齐(块高度不一)</span>
      <Stack direction="horizontal" gap={4} align="center" style={frame}>
        <div style={{ ...box, blockSize: '1.5rem' }}>矮</div>
        <div style={{ ...box, blockSize: '3rem' }}>高</div>
        <div style={{ ...box, blockSize: '2.25rem' }}>中</div>
      </Stack>

      <span style={label}>justify=&quot;between&quot;:两端对齐,中间均分</span>
      <Stack direction="horizontal" justify="between" align="center" style={frame}>
        <div style={box}>左</div>
        <div style={box}>中</div>
        <div style={box}>右</div>
      </Stack>

      <span style={label}>justify=&quot;center&quot; + align=&quot;center&quot;:整组居中</span>
      <Stack direction="horizontal" gap={3} justify="center" align="center" style={frame}>
        <div style={box}>壹</div>
        <div style={box}>贰</div>
      </Stack>
    </Stack>
  );
}
