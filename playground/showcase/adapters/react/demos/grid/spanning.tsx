import { Grid } from '@magic-scope/react';

// Grid.Item 子项定位:colSpan / rowSpan(数字 → span n)与 colStart 跨格,
// 拼出经典「头图 + 侧栏 + 内容」的不规则面板布局。autoRows 统一隐式行高。
function Cell({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        blockSize: '100%',
        minBlockSize: '2.75rem',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        color: 'var(--ms-color-fg-muted)',
        fontSize: '0.8rem',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(36rem, 100%)' }}>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        <code>Grid.Item</code> 的 <code>colSpan</code> / <code>rowSpan</code> /{' '}
        <code>colStart</code> 拼装不规则面板。
      </p>
      <Grid columns={4} gap={3} autoRows="4rem">
        <Grid.Item colSpan={4}>
          <Cell label="头图 colSpan={4}" />
        </Grid.Item>
        <Grid.Item rowSpan={2}>
          <Cell label="侧栏 rowSpan={2}" />
        </Grid.Item>
        <Grid.Item colSpan={3}>
          <Cell label="主内容 colSpan={3}" />
        </Grid.Item>
        <Grid.Item colSpan={2}>
          <Cell label="卡片 A colSpan={2}" />
        </Grid.Item>
        <Grid.Item colStart={4}>
          <Cell label="卡片 B colStart={4}" />
        </Grid.Item>
      </Grid>
    </div>
  );
}
