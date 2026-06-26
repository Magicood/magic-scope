import { Watermark } from '@magic-scope/react';

const cellStyle = {
  borderRadius: 'var(--ms-radius-md)',
  border: '1px solid var(--ms-color-border)',
  background: 'var(--ms-color-surface)',
  overflow: 'hidden',
  blockSize: 160,
} as const;

const labelStyle = {
  padding: 'var(--ms-space-3)',
  margin: 0,
  fontSize: 'var(--ms-font-size-sm)',
  color: 'var(--ms-color-fg-muted)',
} as const;

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--ms-space-4)',
        inlineSize: '100%',
      }}
    >
      <Watermark content="紧密" gap={[60, 60]} rotate={-22} style={cellStyle}>
        <p style={labelStyle}>密集平铺 gap=[60,60]</p>
      </Watermark>

      <Watermark content="稀疏" gap={[160, 160]} rotate={-22} style={cellStyle}>
        <p style={labelStyle}>稀疏平铺 gap=[160,160]</p>
      </Watermark>

      <Watermark content="正交" gap={[100, 100]} rotate={0} style={cellStyle}>
        <p style={labelStyle}>不旋转 rotate=0</p>
      </Watermark>

      <Watermark content="错落" gap={[100, 100]} offset={[40, 30]} rotate={-30} style={cellStyle}>
        <p style={labelStyle}>偏移起点 offset=[40,30]</p>
      </Watermark>
    </div>
  );
}
