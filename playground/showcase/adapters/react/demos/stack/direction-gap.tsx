import { Stack } from '@magic-scope/react';
import type { CSSProperties } from 'react';

// 占位色块:纯展示布局,不承载语义。
const box: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '3rem',
  minBlockSize: '2rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  background: 'color-mix(in oklab, var(--ms-color-accent, #7c5cff) 20%, transparent)',
  border: '1px solid color-mix(in oklab, var(--ms-color-accent, #7c5cff) 42%, transparent)',
};

const label: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ms-color-fg-muted, #888)',
};

/** 方向(纵/横)× 间距档(gap token):同一组子块换一个 prop 即换布局。 */
export default function Demo() {
  return (
    <Stack gap={6}>
      <span style={label}>direction=&quot;vertical&quot;(默认)· gap=2</span>
      <Stack direction="vertical" gap={2}>
        <div style={box}>壹</div>
        <div style={box}>贰</div>
        <div style={box}>叁</div>
      </Stack>

      <span style={label}>direction=&quot;horizontal&quot; · gap=4</span>
      <Stack direction="horizontal" gap={4}>
        <div style={box}>壹</div>
        <div style={box}>贰</div>
        <div style={box}>叁</div>
      </Stack>

      <span style={label}>direction=&quot;horizontal&quot; · gap=0(紧贴)</span>
      <Stack direction="horizontal" gap={0}>
        <div style={box}>壹</div>
        <div style={box}>贰</div>
        <div style={box}>叁</div>
      </Stack>
    </Stack>
  );
}
