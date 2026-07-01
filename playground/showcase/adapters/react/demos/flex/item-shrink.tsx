import { Flex } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const cell: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minBlockSize: '2.5rem',
  paddingInline: 'var(--ms-space-3)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-accent-soft, rgba(124, 92, 255, 0.16))',
  color: 'var(--ms-color-fg)',
  textAlign: 'center',
};

// shrink:flex-shrink;false=0(拒绝压缩,内容不被挤扁)/ true=1(允许被压)。
// 容器变窄时,shrink=false 的项保持原宽,压缩量由 shrink=true 的项吸收。
export default function Demo() {
  return (
    <Flex gap={2} style={{ inlineSize: 'min(360px, 100%)' }}>
      <Flex.Item shrink={false} style={cell}>
        不压缩 shrink=false
      </Flex.Item>
      <Flex.Item shrink style={cell}>
        可压缩 shrink
      </Flex.Item>
      <Flex.Item shrink style={cell}>
        可压缩 shrink
      </Flex.Item>
    </Flex>
  );
}
