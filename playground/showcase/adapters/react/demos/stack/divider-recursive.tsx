import { Stack } from '@magic-scope/react';
import type { CSSProperties } from 'react';

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

// 一根继承 Stack 方向的发丝分隔线(横向 Stack 自动竖直、纵向自动水平)。
const hair: CSSProperties = {
  alignSelf: 'stretch',
  background: 'color-mix(in oklab, var(--ms-color-fg, #888) 24%, transparent)',
};

/** divider 在相邻子项间插分隔元素;recursive 让子 Stack 自动取相反方向;asChild 把样式合进唯一子元素。 */
export default function Demo() {
  return (
    <Stack gap={6}>
      <span style={label}>divider:横向 Stack 在每两项之间插竖直发丝线</span>
      <Stack
        direction="horizontal"
        gap={4}
        align="center"
        divider={<span style={{ ...hair, inlineSize: '1px' }} />}
      >
        <div style={box}>首页</div>
        <div style={box}>文档</div>
        <div style={box}>关于</div>
      </Stack>

      <span style={label}>recursive:父纵向 → 直接子 Stack 自动横向(零配置交替)</span>
      <Stack direction="vertical" gap={3} recursive>
        <Stack gap={3}>
          <div style={box}>1A</div>
          <div style={box}>1B</div>
        </Stack>
        <Stack gap={3}>
          <div style={box}>2A</div>
          <div style={box}>2B</div>
        </Stack>
      </Stack>

      <span style={label}>asChild:不额外包 DOM,把 flex 布局直接合进 &lt;ul&gt;</span>
      <Stack asChild direction="horizontal" gap={3} align="center">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          <li style={box}>项一</li>
          <li style={box}>项二</li>
          <li style={box}>项三</li>
        </ul>
      </Stack>
    </Stack>
  );
}
