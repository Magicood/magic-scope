import { Grid } from '@magic-scope/react';

// 演示 columns 的两种形态:数字(等宽 repeat)与模板字符串(按比例/混合单位)。
function Cell({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minBlockSize: '2.75rem',
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
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(36rem, 100%)' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          <code>columns={'{4}'}</code> —— 等宽四列(repeat + minmax(0, 1fr),不被内容撑破)。
        </p>
        <Grid columns={4} gap={3}>
          <Cell>1</Cell>
          <Cell>2</Cell>
          <Cell>3</Cell>
          <Cell>4</Cell>
        </Grid>
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          <code>columns="1fr auto 2fr"</code> —— 模板字符串:侧栏定宽、主区按比例。
        </p>
        <Grid columns="1fr auto 2fr" gap={3}>
          <Cell>1fr</Cell>
          <Cell>auto</Cell>
          <Cell>2fr</Cell>
        </Grid>
      </div>
    </div>
  );
}
