import { Flex } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const box: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '2.5rem',
  minBlockSize: '2.25rem',
  paddingInline: 'var(--ms-space-2)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-accent-soft, rgba(124, 92, 255, 0.16))',
  color: 'var(--ms-color-fg)',
  fontVariantNumeric: 'tabular-nums',
};

const label: CSSProperties = {
  fontSize: 'var(--ms-font-size-sm)',
  color: 'var(--ms-color-fg-muted)',
};

export default function Demo() {
  return (
    <Flex direction="column" gap={5}>
      {/* gap 数字档映射 --ms-space-*:2 / 4 / 6 三档对比 */}
      {[2, 4, 6].map((g) => (
        <Flex key={g} direction="column" gap={1}>
          <span style={label}>gap={g}</span>
          <Flex gap={g}>
            <div style={box}>一</div>
            <div style={box}>二</div>
            <div style={box}>三</div>
          </Flex>
        </Flex>
      ))}
      {/* rowGap / columnGap 分别控制换行后的纵横间距 */}
      <Flex direction="column" gap={1}>
        <span style={label}>rowGap=4 / columnGap=2(换行)</span>
        <Flex wrap rowGap={4} columnGap={2} style={{ inlineSize: 'min(220px, 100%)' }}>
          {Array.from({ length: 8 }, (_, i) => `格 ${i + 1}`).map((cellLabel) => (
            <div key={cellLabel} style={box}>
              {cellLabel}
            </div>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
