import { Flex } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const box: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '2.75rem',
  minBlockSize: '2.25rem',
  paddingInline: 'var(--ms-space-3)',
  paddingBlock: 'var(--ms-space-2)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-accent-soft, rgba(124, 92, 255, 0.16))',
  color: 'var(--ms-color-fg)',
};

const frame: CSSProperties = {
  inlineSize: 'min(360px, 100%)',
  padding: 'var(--ms-space-3)',
  borderRadius: 'var(--ms-radius-lg)',
  border: '1px dashed var(--ms-color-border)',
};

export default function Demo() {
  return (
    <Flex direction="column" gap={4}>
      {/* 横向 + 居中对齐 + 两端分布 */}
      <Flex justify="between" align="center" gap={2} style={frame}>
        <div style={box}>壹</div>
        <div style={box}>贰</div>
        <div style={box}>叁</div>
      </Flex>
      {/* 纵向 + 交叉轴居中 */}
      <Flex direction="column" align="center" gap={2} style={frame}>
        <div style={box}>上</div>
        <div style={box}>中</div>
        <div style={box}>下</div>
      </Flex>
    </Flex>
  );
}
