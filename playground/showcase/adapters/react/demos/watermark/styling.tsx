import { Watermark } from '@magic-scope/react';

const cellStyle = {
  borderRadius: 'var(--ms-radius-md)',
  border: '1px solid var(--ms-color-border)',
  background: 'var(--ms-color-surface)',
  overflow: 'hidden',
  blockSize: 150,
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
      <Watermark content="奥术紫" fontColor="rgba(124, 92, 255, 1)" opacity={0.3} style={cellStyle}>
        <p style={labelStyle}>主题色 + 高不透明度</p>
      </Watermark>

      <Watermark
        content="霜寒青"
        fontColor="rgba(56, 189, 248, 1)"
        opacity={0.18}
        style={cellStyle}
      >
        <p style={labelStyle}>自定义 fontColor</p>
      </Watermark>

      <Watermark
        content="CONFIDENTIAL"
        fontSize={20}
        fontColor="rgba(244, 63, 94, 1)"
        opacity={0.16}
        style={cellStyle}
      >
        <p style={labelStyle}>大字号 + 余烬品红</p>
      </Watermark>

      <Watermark
        content="衬线"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={22}
        opacity={0.22}
        style={cellStyle}
      >
        <p style={labelStyle}>自定义 fontFamily</p>
      </Watermark>
    </div>
  );
}
