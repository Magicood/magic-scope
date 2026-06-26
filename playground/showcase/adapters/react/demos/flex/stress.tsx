import { Flex } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const frame: CSSProperties = {
  inlineSize: 'min(360px, 100%)',
  padding: 'var(--ms-space-3)',
  borderRadius: 'var(--ms-radius-lg)',
  border: '1px dashed var(--ms-color-border)',
};

const chip: CSSProperties = {
  paddingInline: 'var(--ms-space-2)',
  paddingBlock: 'var(--ms-space-1)',
  borderRadius: 'var(--ms-radius-sm)',
  background: 'var(--ms-color-accent-soft, rgba(124, 92, 255, 0.16))',
  color: 'var(--ms-color-fg)',
  fontSize: 'var(--ms-font-size-sm)',
  whiteSpace: 'nowrap',
};

const longWord =
  'supercalifragilisticexpialidocious_这是一段没有空格的超长不可断字符串_用来验证flex子项不会把容器横向撑破';

const tags = Array.from({ length: 36 }, (_, i) => `标签 ${i + 1}`);

export default function Demo() {
  return (
    <Flex direction="column" gap={4}>
      {/* 对抗:超长无断点字符串 + 头像。grow 项设 minInlineSize:0 + 截断,容器宽度不被撑破 */}
      <Flex align="center" gap={3} style={frame}>
        <div
          style={{
            ...chip,
            inlineSize: '2.25rem',
            blockSize: '2.25rem',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        >
          ✦
        </div>
        <Flex.Item grow style={{ minInlineSize: 0 }}>
          <div
            style={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {longWord}
          </div>
          <div
            style={{
              color: 'var(--ms-color-fg-muted)',
              fontSize: 'var(--ms-font-size-sm)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {longWord}
          </div>
        </Flex.Item>
      </Flex>
      {/* 对抗:巨量子项 + wrap,平滑换行不溢出 */}
      <Flex wrap gap={2} style={frame}>
        {tags.map((t) => (
          <span key={t} style={chip}>
            {t}
          </span>
        ))}
      </Flex>
    </Flex>
  );
}
