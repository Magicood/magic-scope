import { Center } from '@magic-scope/react';

const boxStyle = {
  inlineSize: 'min(240px, 100%)',
  minBlockSize: 96,
  border: '1px dashed var(--ms-color-border)',
  borderRadius: 'var(--ms-radius-md)',
} as const;

// 三种居中轴:both(双轴)/ horizontal(仅水平)/ vertical(仅垂直)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <Center axis="both" style={boxStyle}>
        <span>both ✦</span>
      </Center>
      <Center axis="horizontal" style={boxStyle}>
        <span>horizontal</span>
      </Center>
      <Center axis="vertical" style={boxStyle}>
        <span>vertical</span>
      </Center>
    </div>
  );
}
