import { Grid } from '@magic-scope/react';

// 断点对象响应式:列数与间距随视口阶梯式增长(窄屏 1 列 → 宽屏 4 列)。
// 缩放浏览器宽度可见列数变化;断点对齐 tokens 视口断点(sm/md/lg)。
function Cell({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minBlockSize: '3rem',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        color: 'var(--ms-color-fg-muted)',
        fontSize: '0.85rem',
      }}
    >
      {children}
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(40rem, 100%)' }}>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        <code>columns={'{{ base: 1, sm: 2, md: 3, lg: 4 }}'}</code> 配
        <code>gap={'{{ base: 2, md: 4 }}'}</code> —— 缩放窗口宽度观察列数与间距跳档。
      </p>
      <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={{ base: 2, md: 4 }}>
        <Cell>奥术</Cell>
        <Cell>冰霜</Cell>
        <Cell>余烬</Cell>
        <Cell>虚空</Cell>
        <Cell>自然</Cell>
        <Cell>神圣</Cell>
        <Cell>暗影</Cell>
        <Cell>秘法</Cell>
      </Grid>
    </div>
  );
}
