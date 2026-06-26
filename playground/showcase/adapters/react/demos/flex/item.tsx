import { Flex } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const cell: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minBlockSize: '2.5rem',
  paddingInline: 'var(--ms-space-3)',
  paddingBlock: 'var(--ms-space-2)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-accent-soft, rgba(124, 92, 255, 0.16))',
  color: 'var(--ms-color-fg)',
};

const label: CSSProperties = {
  fontSize: 'var(--ms-font-size-sm)',
  color: 'var(--ms-color-fg-muted)',
};

export default function Demo() {
  return (
    <Flex direction="column" gap={4} style={{ inlineSize: 'min(380px, 100%)' }}>
      {/* grow:中间项吃掉剩余空间 */}
      <Flex direction="column" gap={1}>
        <span style={label}>中间项 grow(占满剩余)</span>
        <Flex gap={2}>
          <Flex.Item style={cell}>固定</Flex.Item>
          <Flex.Item grow style={cell}>
            grow
          </Flex.Item>
          <Flex.Item style={cell}>固定</Flex.Item>
        </Flex>
      </Flex>
      {/* basis + align-self + order:首项排到末尾、末项底部对齐 */}
      <Flex direction="column" gap={1}>
        <span style={label}>basis / order / align-self</span>
        <Flex align="start" gap={2} style={{ minBlockSize: '4rem' }}>
          <Flex.Item order={2} basis="40%" style={cell}>
            order=2
          </Flex.Item>
          <Flex.Item align="end" style={cell}>
            align-self=end
          </Flex.Item>
          <Flex.Item order={0} style={cell}>
            order=0
          </Flex.Item>
        </Flex>
      </Flex>
    </Flex>
  );
}
