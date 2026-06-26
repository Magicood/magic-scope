import { Stack } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const frame: CSSProperties = {
  inlineSize: 'min(360px, 100%)',
  padding: '0.75rem',
  borderRadius: '12px',
  border: '1px dashed color-mix(in oklab, var(--ms-color-fg, #888) 28%, transparent)',
};

const card: CSSProperties = {
  minInlineSize: 0,
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  background: 'color-mix(in oklab, var(--ms-color-accent, #7c5cff) 18%, transparent)',
  border: '1px solid color-mix(in oklab, var(--ms-color-accent, #7c5cff) 40%, transparent)',
  overflowWrap: 'anywhere',
};

const label: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ms-color-fg-muted, #888)',
};

const tag: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '2.25rem',
  minBlockSize: '2.25rem',
  paddingInline: '0.5rem',
  borderRadius: '6px',
  background: 'color-mix(in oklab, var(--ms-color-accent, #7c5cff) 18%, transparent)',
  border: '1px solid color-mix(in oklab, var(--ms-color-accent, #7c5cff) 38%, transparent)',
};

const LONG_WORD = 'Supercalifragilisticexpialidocious_欲穷千里目更上一层楼_0123456789ABCDEFGHIJ';

/**
 * 对抗性:Stack 作为容器承载极端用户内容,验证不撑破、不裁焦点环。
 * ① 超长无空格串靠子项 minInlineSize:0 + overflowWrap 换行,不把横向 Stack 顶出容器。
 * ② 巨量子项 + wrap 自然折行,不溢出。
 * ③ 可聚焦项的 focus-visible 焦点环不被相邻间距/容器裁掉。
 */
export default function Demo() {
  return (
    <Stack gap={6} style={frame}>
      <span style={label}>① 超长串:横向两栏 + min-width:0 让长串换行而非撑破</span>
      <Stack direction="horizontal" gap={3} align="start">
        <div style={card}>{LONG_WORD}</div>
        <div style={card}>短文</div>
      </Stack>

      <span style={label}>② 巨量子项 + wrap:30 个标签自动折行,不溢出</span>
      <Stack direction="horizontal" gap={2} wrap="wrap">
        {Array.from({ length: 30 }, (_, i) => `标签${i + 1}`).map((t, i) => (
          <div key={t} style={tag}>
            {i + 1}
          </div>
        ))}
      </Stack>

      <span style={label}>③ 焦点环:Tab 聚焦下方按钮,环不被裁切</span>
      <Stack direction="horizontal" gap={4} wrap="wrap">
        {['确定', '取消', '更多操作'].map((t) => (
          <button
            key={t}
            type="button"
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid color-mix(in oklab, var(--ms-color-fg, #888) 30%, transparent)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </Stack>
    </Stack>
  );
}
