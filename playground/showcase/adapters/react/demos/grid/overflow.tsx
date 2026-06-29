import { Grid } from '@magic-scope/react';

// 对抗性 demo:验证网格列在超长无空格串与巨量正文下不被撑破。
// columns={n} 用 minmax(0, 1fr) 防内容把列顶宽;单元格自身 minInlineSize: 0 + overflowWrap 收边。
function Cell({ title, children }: { title: string; children: string }) {
  return (
    <div
      style={{
        minInlineSize: 0,
        padding: '0.75rem 0.875rem',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        overflowWrap: 'anywhere',
      }}
    >
      <strong style={{ fontSize: '0.85rem' }}>{title}</strong>
      <p style={{ margin: '0.35rem 0 0', color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}>
        {children}
      </p>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(34rem, 100%)' }}>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        两列等宽网格塞入超长串与巨量正文,列宽不被撑破、内容在边界内换行。
      </p>
      <Grid columns={2} gap={3}>
        <Cell title="超长无空格串">
          httpsmagicscopeexamplecomverylongunbreakableurlwithoutanyspacesatallthatwouldotherwiseoverflowthegridtrack
        </Cell>
        <Cell title="巨量正文">
          这是一段用于压力测试的超长正文,会持续延伸,用来模拟真实业务中字段值或描述过长的情况。这段文本刻意写得很长,用来验证网格列在内容溢出时仍把正文换行收在轨道内,不会撑宽列、不会破坏另一列的等宽,也不会顶破容器边界。
        </Cell>
      </Grid>
    </div>
  );
}
